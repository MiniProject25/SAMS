import React, { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { useAlertFilters } from "../../hooks/useAlertFilters";
import { useAlerts } from "../../hooks/queries/useAlert"; // Using the refactored TanStack hook
import { getAlertTheme, getAlertIcon, formatAlertLabel } from "../../utils/AlertHelpers"; // Your new utils

export default function Alerts() {
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');

  // 1. TanStack Query Hook replaces local state/useEffect
  const { data: alerts = [], isLoading, isError } = useAlerts();

  // 2. Apply custom filter hook
  const { activeAlerts, resolvedAlerts, sortBySeverity } = useAlertFilters(alerts);

  // 3. Determine which list to show
  const displayedAlerts = viewMode === 'ACTIVE'
    ? sortBySeverity(activeAlerts)
    : resolvedAlerts;

  // Format the ISO timestamp to a readable date
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full bg-(--color-card) border border-(--color-card-border) rounded-2xl shadow-xl overflow-hidden font-sans">

      {/* Table Header Section with View Toggle */}
      <div className="p-6 border-b border-(--color-card-border) flex justify-between items-center bg-gradient-to-b from-(--color-card) to-(--color-panel)/30">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">System Alerts</h2>
          <p className="text-sm text-gray-400 mt-1">Monitor automated hardware diagnostics across the network.</p>
        </div>

        {/* Active vs Resolved Toggle */}
        <div className="flex bg-(--color-panel) p-1 rounded-lg border border-(--color-card-border)">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'ACTIVE'
                ? 'bg-(--color-card) text-gray-100 shadow-sm border border-(--color-card-border)'
                : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setViewMode('RESOLVED')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'RESOLVED'
                ? 'bg-(--color-card) text-gray-100 shadow-sm border border-(--color-card-border)'
                : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Resolved ({resolvedAlerts.length})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-(--color-panel) border-b border-(--color-card-border)">
              <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Asset ID</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Warning Type</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Message</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-card-border)">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  Loading telemetry alerts...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-red-400 text-sm">
                  Failed to load alerts.
                </td>
              </tr>
            ) : displayedAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  No {viewMode.toLowerCase()} alerts found.
                </td>
              </tr>
            ) : (
              displayedAlerts.map((alert) => {
                const CategoryIcon = getAlertIcon(alert.category);

                return (
                  <tr key={alert.id} className="hover:bg-(--color-panel)/50 transition-colors">

                    <td className="py-4 px-6 text-sm font-medium text-gray-200">
                      <span className="font-mono text-xs text-gray-400">{alert.assetId.substring(0, 8)}...</span>
                    </td>

                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${getAlertTheme(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-300">
                      <div className="flex items-center gap-2 font-medium">
                        <CategoryIcon size={16} className="opacity-70" />
                        {formatAlertLabel(alert.type)}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-300">
                      {alert.message}
                    </td>

                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${!alert.isResolved
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        {!alert.isResolved ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {!alert.isResolved ? 'Active' : 'Resolved'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-400 text-right whitespace-nowrap">
                      {formatTime(alert.createdAt)}
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}