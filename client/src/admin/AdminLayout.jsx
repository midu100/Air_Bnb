import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar header */}
        <Topbar />

        {/* Dashboard page view outlet */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
