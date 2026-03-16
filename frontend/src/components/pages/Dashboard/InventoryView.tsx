import {
  Search,
  AlertCircle,
  Thermometer,
  Battery,
  Cpu,
  LayoutGrid,
  Zap,
  CheckCircle2,
  ExternalLink,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MetricItem from "../../ui/MetricItem";
import { useWarRoom } from "../../../hooks/queries/useWarRoom";
import { useResolveAlerts } from "../../../hooks/mutations/userResolveAlerts";

export default function InventoryView() {
  const navigate = useNavigate();
  
  // Local state for Search and Pagination since the backend handles it now
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("ALL");
  const [page, setPage] = useState(1);

  // 1. Fetch live grouped data
  // Assuming your hook is updated to accept the search and filter params
  const { data, isLoading, isError } = useWarRoom(page, 10, searchQuery, filterMode);
  
  // 2. Initialize the resolve mutation
  const resolveMutation = useResolveAlerts();

  const alertingAssets = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Handle the "Resolve" button click
  const handleResolve = (assetId: string) => {
    if (window.confirm("Are you sure you want to resolve all alerts for this asset?")) {
      resolveMutation.mutate(assetId);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* --- SEARCH & CATEGORY TOGGLES --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
            placeholder="Search by Asset ID..."
            className="w-full bg-[#111827] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-blue-500/50 text-gray-200 outline-none transition-all"
          />
        </div>

        <div className="flex bg-[#111827] p-1 rounded-xl border border-gray-800 overflow-x-auto no-scrollbar shadow-inner">
          {[
            { id: "ALL", label: "All", icon: <AlertCircle size={14} /> },
            {
              id: "THERMAL",
              label: "Thermal",
              icon: <Thermometer size={14} />,
            },
            { id: "BATTERY", label: "Battery", icon: <Battery size={14} /> },
            {
              id: "CPU",
              label: "Performance",
              icon: <Cpu size={14} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterMode(tab.id);
                setPage(1); // Reset to page 1 on filter change
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterMode === tab.id ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- ALERT-CENTRIC TABLE --- */}
      <div className="bg-[#0b0f1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827]/50 border-b border-gray-800 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              <th className="py-4 px-6 w-[25%]">Source Asset ID</th>
              <th className="py-4 px-6 text-center w-[50%]">Hardware Metrics</th>
              <th className="py-4 px-6 text-right pr-10 w-[25%]">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-800/40">
            {isLoading ? (
              <tr><td colSpan={3} className="py-12 text-center text-gray-500">Scanning telemetry...</td></tr>
            ) : isError ? (
              <tr><td colSpan={3} className="py-12 text-center text-red-500">Failed to load live data.</td></tr>
            ) : alertingAssets.length === 0 ? (
              <NoAlertsState navigate={navigate} />
            ) : (
              alertingAssets.map((asset: any) => {
                // Ensure activeAlerts exists to prevent crashes
                const unresolved = asset.activeAlerts || [];
                const tel = asset.latestTelemetry;

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-blue-500/[0.02] transition-all group"
                  >
                    <td className="py-5 px-6">
                        <span className="text-[11px] font-mono font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                          {asset.macAddr || asset.id.substring(0, 8) + '...'}
                        </span>                       
                    </td>

                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center gap-6">
                        <MetricItem icon={<Cpu size={14} />} value={tel?.cpuTotalUsagePercent} label="CPU" isAlert={unresolved.some((a: any) => a.category === 'PERFORMANCE')} />
                        <MetricItem icon={<Thermometer size={14} />} value={tel?.cpuTemperature} label="Temp" unit="°" isAlert={unresolved.some((a: any) => a.category === 'THERMAL')} />
                        <MetricItem icon={<Battery size={14} />} value={tel?.batteryPercent} label="Batt" isAlert={unresolved.some((a: any) => a.category === 'BATTERY')} />
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleResolve(asset.id)}
                          disabled={resolveMutation.isPending && resolveMutation.variables === asset.id}
                          className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500/50 hover:text-emerald-400 uppercase tracking-tighter cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 size={12} /> {resolveMutation.isPending && resolveMutation.variables === asset.id ? 'Resolving...' : 'Resolve'}
                        </button>
                        
                        <div className="w-[1px] h-4 bg-gray-800 mx-1" />
                        
                        <button
                          onClick={() => navigate(`/inventory/${asset.id}`)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 transition-all cursor-pointer"
                        >
                          Details <ExternalLink size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* --- PAGINATION FOOTER --- */}
        {alertingAssets.length > 0 && (
          <div className="bg-[#111827]/50 border-t border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Page {page} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-700"
              >
                Previous
              </button>
              
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Extracted Empty State Component
function NoAlertsState({ navigate }: any) {
  return (
    <tr>
      <td colSpan={3} className="py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-emerald-500/5 rounded-full">
            <Zap size={40} className="text-emerald-500 opacity-20" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold text-gray-300 tracking-tight">
              Fleet Clear
            </p>
            <p className="text-[11px] text-gray-500 italic">
              No unresolved hardware exceptions currently active.
            </p>
          </div>
          <button
            onClick={() => navigate("/inventory")}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-800 text-[10px] font-bold rounded-lg border border-gray-700 hover:bg-gray-700 text-gray-300 transition-all cursor-pointer"
          >
            <LayoutGrid size={12} /> View Full Registry
          </button>
        </div>
      </td>
    </tr>
  );
}
