import {
  AlertTriangle,
  BatteryWarning,
  Cpu,
  Activity,
  Info,
} from "lucide-react";
import {
  type AlertType,
  type AlertSeverity,
  type AlertCategory,
} from "../types/Alerts";

/**
 * Maps severity to Tailwind classes (Dark Theme Optimized)
 */
export const getAlertTheme = (severity: AlertSeverity) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "WARNING":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "INFO":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

/**
 * Returns the appropriate Lucide icon component for a category
 */
export const getAlertIcon = (category: AlertCategory) => {
  switch (category) {
    case "THERMAL":
      return AlertTriangle;
    case "PERFORMANCE":
      return Cpu;
    case "BATTERY":
      return BatteryWarning;
    case "CONNECTIVITY":
      return Activity;
    default:
      return Info;
  }
};

/**
 * Cleans up underscores and title-cases the alert types
 */
export const formatAlertLabel = (type: AlertType) => {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
