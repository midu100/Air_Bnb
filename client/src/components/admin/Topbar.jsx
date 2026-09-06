import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { HiOutlineBell, HiOutlineSearch, HiOutlineSparkles } from 'react-icons/hi';
import { selectCurrentUser } from '../../store/slices/authSlice';
import AssistantPanel from './AssistantPanel';

const Topbar = () => {
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Get human readable path name
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    const segment = path.split('/').pop();
    if (!segment) return 'Admin';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // Initials from whoever is actually signed in
  const initials = (currentUser?.fullName || 'Host')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-bold text-black tracking-tight">{getPageTitle()}</h1>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-56 hidden lg:block">
            <input
              type="text"
              placeholder="Search inventory, guests..."
              className="w-full bg-neutral-50 border border-neutral-200 text-xs text-black placeholder-neutral-400 rounded px-3 py-2 pl-9 focus:outline-none focus:border-black transition-colors"
            />
            <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          {/* ====== Ask AI — reachable from every admin page ====== */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            title="Ask the assistant"
            className="flex items-center gap-2 px-3.5 py-2 bg-black text-white rounded font-black uppercase text-[10px] tracking-wider cursor-pointer hover:bg-neutral-800 transition-colors border-none"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-all cursor-pointer">
            <HiOutlineBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
          </button>

          <div className="h-6 w-px bg-neutral-200"></div>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold text-black leading-none">
                {currentUser?.fullName || 'Host'}
              </span>
              <span className="text-[10px] text-neutral-400 mt-1 leading-none">
                {currentUser?.email || ''}
              </span>
            </div>
            {currentUser?.profileImg ? (
              <img
                src={currentUser.profileImg}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover border border-neutral-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center border border-neutral-300">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      <AssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
};

export default Topbar;
