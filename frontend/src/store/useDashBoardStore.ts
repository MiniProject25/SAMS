import { create } from "zustand";

export type FilterMode =
  | "ALL"
  | "CONNECTIVITY"
  | "THERMAL"
  | "BATTERY"
  | "PERFORMANCE";

interface DashboardState {
  activeAlerts: number;
  searchQuery: string;
  filterMode: FilterMode;

  updateStats: (alerts: number) => void;
  setSearchQuery: (query: string) => void;
  setFilterMode: (mode: FilterMode) => void;
  resetDashboard: () => void; // Helper to clear UI state
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeAlerts: 0,
  searchQuery: "",
  filterMode: "ALL", 

  updateStats: (alerts) => set({ activeAlerts: alerts }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterMode: (mode) => set({ filterMode: mode }),

  resetDashboard: () =>
    set({
      searchQuery: "",
      filterMode: "ALL",
    }),
}));
