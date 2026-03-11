import { prisma } from "../../db/prisma.js";
import { Server, Socket } from "socket.io";
import redisClient from "../../lib/redis.js";
import { ISystemTelemetryPayload } from "../types.js";
import { IAsset } from "../../types/asset.type.js";
import { ITelemetry } from "../../types/telemetry.type.js";

export const setUpTelemetrySocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`New connection established: ${socket.id}`);

    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user_room_${userId}`);
    }

    socket.on("telemetry_stream", async (payload: ISystemTelemetryPayload) => {
      try {
        const { mac_address, cpu, memory, battery, timestamp } = payload;
        if (!mac_address) return;

        // store the mac addr in the socket
        if (!socket.data.mac_address) {
          socket.data.mac_address = mac_address;
        }

        // check the redis store for assetId
        const cacheKey = `mac_to_asset_id:${mac_address}`;
        let assetId = await redisClient.get(cacheKey);

        // if no assetId then get from db
        if (!assetId) {
          const asset = await prisma.asset.findUnique({
            where: { macAddr: mac_address },
            select: { id: true },
          });

          if (!asset) {
            console.warn(`Unauthorized device: ${mac_address}`);
            return;
          }

          // cache the assetId mapped to the mac_addr
          assetId = asset.id as string;
          await redisClient.set(cacheKey, assetId, {
            expiration: {
              type: "EX",
              value: 3600,
            },
          });
        }

        const [updatedAsset, telemetryRecord] = (await prisma.$transaction([
          prisma.asset.update({
            where: { id: assetId },
            data: { status: "ONLINE" },
          }),
          prisma.telemetry.create({
            data: {
              assetId: assetId,
              cpuName: cpu.cpu_name,
              cpuTotalUsagePercent: cpu.total_usage_percent,
              cpuPerCoreUsage: cpu.per_core_usage_percent,
              cpuFrequency: cpu.frequency,
              cpuTemperature: cpu.temperature,
              memoryTotal: memory.total,
              memoryAvailable: memory.available,
              memoryUsed: memory.used,
              memoryUsagePercent: memory.usage_percent,
              batteryPercent: battery.percent,
              batteryPowerPlugged: battery.power_plugged,
              batterySecondsLeft: battery.seconds_left,
              timestamp: new Date(timestamp * 1000),
            },
          }),
        ])) as [IAsset, ITelemetry];

        if (updatedAsset.ownerId) {
          io.to(`user_room_${userId}`).emit("dashboard_update", {
            mac_address,
            latestTelemetry: telemetryRecord,
          });
        }
      } catch (error) {
        console.error("Error processing telemetry stream:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);

      const disconnectedMac = socket.data.mac_address;
      console.log(disconnectedMac);
      if (disconnectedMac) {
        try {
          await prisma.asset.update({
            where: { macAddr: disconnectedMac },
            data: { status: "OFFLINE" },
          });

          console.log(`Asset ${disconnectedMac} marked as offline`);

          io.emit("asset_status_change", {
            macAddr: disconnectedMac,
            status: "OFFLINE",
          });
        } catch (error) {
          console.error(
            `Failed to update offline status for ${disconnectedMac}`,
          );
        }
      }
    });
  });
};
