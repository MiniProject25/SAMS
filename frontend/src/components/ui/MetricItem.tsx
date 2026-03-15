import React from 'react';

interface MetricItemProps {
  icon: React.ReactNode;
  value: number | undefined;
  label: string;
  unit?: string;
  isOffline?: boolean;
  isAlert?: boolean;
  isPlugged?: boolean;
}

export default function MetricItem({
  icon,
  value,
  label,
  unit = "%",
  isOffline,
  isAlert,
  isPlugged
}: MetricItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 group/item relative">
      <div className={`${isAlert ? 'text-red-400' : isPlugged ? 'text-emerald-400' : 'text-gray-500'}`}>
        {icon}
      </div>
      <span className="text-xs text-gray-300 font-medium">
        {isOffline || value === undefined ? '--' : `${value}${unit}`}
      </span>
      <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-[9px] text-white rounded opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </span>
    </div>
  );
}