import { Server } from "socket.io";
import { Telemetry, AlertType } from "../generated/prisma/client.js";

export const checkAlerts = (
  io: Server,
  telemetry: Telemetry,
  ownerId: string,
) => {
  const alerts: { type: AlertType; assetId: string; message: string }[] = [];

  
};
