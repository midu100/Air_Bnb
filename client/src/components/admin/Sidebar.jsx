import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { 
  HiOutlineViewGrid, 
  HiOutlineHome, 
  HiOutlineCalendar, 
  HiOutlineTag, 
  HiOutlineSparkles, 
  HiOutlineStar, 
  HiOutlineCreditCard, 
  HiOutlineUsers, 
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChatAlt,
  HiOutlinePresentationChartLine,
  HiOutlineCash
} from 'react-icons/hi';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: HiOutlineViewGrid, end: true },
    { name: 'Properties', path: '/admin/properties', icon: HiOutlineHome },
    { name: 'Bookings', path: '/admin/bookings', icon: HiOutlineCalendar },
    { name: 'Inbox Chat', path: '/admin/messages', icon: HiOutlineChatAlt },
    { name: 'Business Analytics', path: '/admin/analytics', icon: HiOutlinePresentationChartLine },
    { name: 'Categories', path: '/admin/categories', icon: HiOutlineTag },
    { name: 'Amenities', path: '/admin/amenities', icon: HiOutlineSparkles },
    { name: 'Reviews', path: '/admin/reviews', icon: HiOutlineStar },
    { name: 'Payments Ledger', path: '/admin/payments', icon: HiOutlineCreditCard },
    { name: 'Host Payouts', path: '/admin/payouts', icon: HiOutlineCash },
    { name: 'Coupons & Promos', path: '/admin/coupons', icon: HiOutlineTag },
    { name: 'User Directory', path: '/admin/guests', icon: HiOutlineUsers },
    { name: 'Workspace Settings', path: '/admin/settings', icon: HiOutlineCog },
  ];

  const handleLogout = () => {
    document.cookie = "X_AS-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    dispatch(logout());
    navigate('/login');
  };

  // Extract initials for the avatar if profile image is not present
  const getInitials = () => {
    if (!currentUser?.fullName) return 'AD';
    const names = currentUser.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return currentUser.fullName[0].toUpperCase();
  };

  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col justify-between border-r border-neutral-900 sticky top-0">
      {/* Upper part */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-900 gap-2 shrink-0">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black fill-black" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Easy<span className="text-neutral-400">Let</span> <span className="text-[10px] uppercase bg-white text-black px-1.5 py-0.5 rounded font-mono tracking-normal ml-1 font-bold">Admin</span>
          </span>
        </div>

        {/* Profile Info */}
        <div className="px-6 py-4 border-b border-neutral-900 flex items-center gap-3 shrink-0">
          {currentUser?.profileImg ? (
            <img 
              src={currentUser.profileImg} 
              alt={currentUser.fullName} 
              className="w-10 h-10 rounded-full object-cover border border-neutral-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white text-sm border border-neutral-700 uppercase">
              {getInitials()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-extrabold leading-none text-white truncate max-w-[150px]">
              {currentUser?.fullName || 'Guest Admin'}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 leading-none font-bold uppercase tracking-wider">
              {currentUser?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-[14px] font-bold uppercase tracking-wider rounded transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white border-l-2 border-white pl-2.5'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-neutral-900 shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-950 rounded transition-all cursor-pointer"
        >
          <HiOutlineLogout className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
