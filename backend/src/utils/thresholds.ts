import { Telemetry } from "../generated/prisma/client.js";
import { AlertType, MetricType } from "../generated/prisma/enums.js";

interface Threshold {
  name: MetricType;
  value: number;
  trigger1: {
    level: AlertType;
    val: number;
    msg: string;
  };
  trigger2: {
    level: AlertType;
    val: number;
    msg: string;
  };
  recovery: number;
  isInverse?: boolean;
}

export const getThresholds = (telemetry: Telemetry): Threshold[] => {
  const thresholds: Threshold[] = [
    {
      name: "CPU_USAGE",
      value: telemetry.cpuTotalUsagePercent,
      trigger1: {
        level: "CRITICAL" as AlertType,
        val: 90,
        msg: "Critical CPU Usage",
      },
      trigger2: {
        level: "WARNING" as AlertType,
        val: 75,
        msg: "High CPU Usage",
      },
      recovery: 70,
    },
    {
      name: "CPU_TEMP",
      value: telemetry.cpuTemperature ?? 0,
      trigger1: {
        level: "CRITICAL" as AlertType,
        val: 95,
        msg: "CPU Overheating",
      },
      trigger2: {
        level: "WARNING" as AlertType,
        val: 80,
        msg: "CPU Temperature High",
      },
      recovery: 75,
    },
    {
      name: "MEM_USAGE",
      value: telemetry.memoryUsagePercent,
      trigger1: {
        level: "CRITICAL" as AlertType,
        val: 95,
        msg: "Memory Exhausted",
      },
      trigger2: {
        level: "WARNING" as AlertType,
        val: 85,
        msg: "Memory Usage High",
      },
      recovery: 80,
    },
    {
      name: "BATTERY",
      value: telemetry.batteryPercent ?? 100,
      trigger1: {
        level: "CRITICAL" as AlertType,
        val: 10,
        msg: "Battery Critical",
      },
      trigger2: { level: "WARNING" as AlertType, val: 20, msg: "Battery Low" },
      recovery: 25,
      isInverse: true,
    },
  ];

  return thresholds;
};
