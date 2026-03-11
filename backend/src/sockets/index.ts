import { Server } from "socket.io";
import { setUpTelemetrySocket } from "./telemetry.socket.js";

export const initSockets = (io: Server) => {
  setUpTelemetrySocket(io);
};
