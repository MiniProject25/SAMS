import { Server } from "socket.io";
import { Alert, AlertType, Telemetry } from "../generated/prisma/client.js";
import { getThresholds } from "../utils/thresholds.js";
import redisClient from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";

export const checkAlerts = async (
  io: Server,
  telemetry: Telemetry,
  ownerId: string,
) => {
  const assetId = telemetry.assetId;
  const thresholds = getThresholds(telemetry);

  for (const t of thresholds) {
    const cacheKey = `active_alert:${assetId}:${t.name}`;
    const activeLevel = await redisClient.get(cacheKey);

    let currentLevel: AlertType | null = null;

    const isCrit = t.isInverse
      ? t.value <= t.trigger1.val
      : t.value >= t.trigger1.val;
    const isWarn = t.isInverse
      ? t.value <= t.trigger2.val
      : t.value >= t.trigger2.val;
    const isRecovered = t.isInverse
      ? t.value >= t.recovery
      : t.value <= t.recovery;

    if (isCrit) currentLevel = "CRITICAL";
    else if (isWarn) currentLevel = "WARNING";

    if (currentLevel && currentLevel != activeLevel) {
      const msg = currentLevel === "CRITICAL" ? t.trigger1.msg : t.trigger2.msg;

      const alert = (await prisma.alert.create({
        data: {
          assetId,
          type: currentLevel,
          metric: t.name,
          message: `${msg}: ${t.value}${t.name == "CPU_TEMP" ? "°C" : "%"}`,
          eventTimestamp: telemetry.timestamp,
        },
      })) as Alert;

      await redisClient.set(cacheKey, currentLevel);

      io.to(`user_room_${ownerId}`).emit("new_alert", alert);
    } else if (isRecovered && activeLevel) {
      await prisma.alert.updateMany({
        where: { assetId, isResolved: false, metric: t.name },
        data: { isResolved: true },
      });

      await redisClient.del(cacheKey);
      io.to(`user_room_${ownerId}`).emit("resolved_alert", {
        assetId,
        metric: t.name,
      });
    }
  }
};
