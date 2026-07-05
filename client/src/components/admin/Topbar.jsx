import React from 'react';
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
import { useLocation } from 'react-router';

const Topbar = () => {
  const location = useLocation();

  // Get human readable path name
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    const segment = path.split('/').pop();
    if (!segment) return 'Admin';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-black tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-64 hidden sm:block">
          <input
            type="text"
            placeholder="Search inventory, guests..."
            className="w-full bg-neutral-50 border border-neutral-200 text-xs text-black placeholder-neutral-400 rounded px-3 py-2 pl-9 focus:outline-none focus:border-black transition-colors"
          />
          <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-all cursor-pointer">
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-neutral-200"></div>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-black leading-none">Julietta Swan</span>
            <span className="text-[10px] text-neutral-400 mt-1 leading-none">Julietta@example.com</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center border border-neutral-300">
            JS
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
