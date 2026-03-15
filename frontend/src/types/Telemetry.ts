import type { Alert } from "./Alerts";

export type AssetStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type Stats = {
  totalAssets: number;
  onlineAssets: number;
  offlineAssets: number;
  activeAlerts: number;
};

export interface TelemetryData {
  cpuTotalUsagePercent: number;
  cpuTemperature: number;
  memmoryUsagePercent: number;
  batteryPercent: number;
  batteryPowerPlugged: boolean;
  timeStamp: string;
}

export interface Asset {
  id: string;
  name: string;
  macAddr: string;
  status: AssetStatus;
  activeAlerts: Alert[];
  latestTelemetry?: TelemetryData;
}
