import DashboardStats from "./DashboardStats";
import InventoryView from "./InventoryView";

export default function DashBoard() {
  return (
    <div className="space-y-8">
      <DashboardStats />
      <InventoryView />
    </div>
  );
}
