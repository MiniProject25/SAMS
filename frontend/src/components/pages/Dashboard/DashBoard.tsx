import { useEffect } from "react";
import DashboardStats from "./DashboardStats";
import InventoryView from "./InventoryView";
import { useAssetStore } from "../../../store/useAssetStore";

function DashBoard() {
  const upsertAlertingAssets = useAssetStore((state) => state.upsertAlertingAssets);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // 1. Initial REST call to get currently unresolved alerts
        // const response = await api.get("/alerts/unresolved"); 
        // upsertAlertingAssets(response.data);

        // 2. Mocking the initial data for now so you can see it
        const initialData = [
          {
            id: "3e2a7b8c-5d1e-4f9a-8b2c-1d0e9f8a7b6c",
            status: "ONLINE",
            latestTelemetry: {
              cpuTotalUsagePercent: 94,
              cpuTemperature: 82,
              memmoryUsagePercent: 88,
              batteryPercent: 45,
            },
            activeAlerts: [
              { id: "al-1", category: "PERFORMANCE", type: "CPU_USAGE_HIGH", severity: "CRITICAL", message: "CPU sustained at 94%", isResolved: false, assetId: "3e2a7b8c-5d1e-4f9a-8b2c-1d0e9f8a7b6c" },
            ]
          }
        ];
        upsertAlertingAssets(initialData as any);
      } catch (error) {
        console.error("Dashboard hydration failed:", error);
      }
    };

    initializeDashboard();

    // 3. OPTIONAL: Setup WebSocket listener here if not done globally
    // socket.on('new_alert', (alert) => addLiveAlert(alert));
    // return () => socket.off('new_alert');

  }, [upsertAlertingAssets]);

  return (
    <div className="space-y-8">
      <DashboardStats />
      <InventoryView />
    </div>
  );
}

export default DashBoard;