import { create } from "zustand";
import { type Asset } from "../types/Telemetry";
import type { Alert } from "../types/Alerts";

interface AssetStore {
  assets: Asset[];
  // Upsert logic that specifically merges the alert array
  upsertAlertingAssets: (incoming: Asset[]) => void;
  // Handle a single live alert coming in via WebSocket
  addLiveAlert: (alert: Alert) => void;
  // Handle alert resolution
  resolveAlert: (alertId: string) => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: [],

  upsertAlertingAssets: (incoming) =>
    set((state) => {
      const assetMap = new Map(state.assets.map((a) => [a.id, a]));

      incoming.forEach((asset) => {
        const existing = assetMap.get(asset.id);
        // Ensure we don't lose existing alerts when merging new data
        const mergedAlerts = [
          ...(existing?.activeAlerts || []),
          ...(asset.activeAlerts || []),
        ];
        // De-duplicate alerts by ID
        const uniqueAlerts = Array.from(
          new Map(mergedAlerts.map((a) => [a.id, a])).values(),
        );

        assetMap.set(asset.id, {
          ...existing,
          ...asset,
          activeAlerts: uniqueAlerts,
        });
      });

      return { assets: Array.from(assetMap.values()) };
    }),

  addLiveAlert: (newAlert: Alert) =>
    set((state) => ({
      assets: state.assets.map((asset) => {
        if (asset.id === newAlert.assetId) {
          // Check if alert already exists to prevent duplicates
          const exists = asset.activeAlerts?.some((a) => a.id === newAlert.id);
          if (exists) return asset;

          return {
            ...asset,
            activeAlerts: [...(asset.activeAlerts || []), newAlert],
          };
        }
        return asset;
      }),
    })),

  resolveAlert: (alertId) =>
    set((state) => ({
      assets: state.assets
        .map((asset) => ({
          ...asset,
          activeAlerts: asset.activeAlerts?.filter((a) => a.id !== alertId),
        }))
        .filter(
          (asset) =>
            (asset.activeAlerts?.length ?? 0) > 0 || asset.status === "OFFLINE",
        ),
    })),
}));
