import { useLocation } from 'react-router-dom';
import { User, Bell, Search } from 'lucide-react';

export default function Header() {
  const { pathname } = useLocation();

  // Map paths to friendly titles
  const getPageTitle = (path: string) => {
    if (path.includes('/dashboard/')) return 'Asset Details';
    switch (path) {
      case '/dashboard': return 'System Overview';
      case '/inventory': return 'Hardware Inventory';
      case '/alerts': return 'Security & Health Alerts';
      case '/reports': return 'Fleet Analytics';
      default: return 'Blera SAMS';
    }
  };

  return (
    <header className="h-16 border-b border-(--color-card-border) bg-(--color-card) px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">

      {/* 1. Left Section: Title & Breadcrumb logic */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-gray-200 leading-none">
          {getPageTitle(pathname)}
        </h1>
        <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 tracking-wider">
          Management Console
        </p>
      </div>

      {/* 2. Middle Section: Search (Functional Unit) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-(--color-primary) transition-colors" />
          {/* TODO: Search by what */}
          <input
            type="text"
            placeholder="Search assets by hostname or IP or AssetId"
            className="w-full bg-(--color-panel) border border-(--color-card-border) rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-(--color-primary) transition-all"
          />
        </div>
      </div>

      {/* 3. Right Section: Notifications & Profile */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:bg-(--color-panel) rounded-full transition-colors relative">
          <Bell size={20} />
          {/* when critical alerts */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-(--color-card-border) mx-1" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            {/* TODO: Dynamically add name of admin */}
            <p className="text-sm font-semibold text-gray-400 group-hover:text-gray-300 transition-colors">Admin</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">System Mgr</p>
          </div>
          {/* placeholder profile pic */}
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-(--color-sec) to-(--color-primary) flex items-center justify-center text-white shadow-sm ring-1 ring-white">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}