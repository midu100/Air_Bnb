import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCreditCard, 
  HiOutlineCalendar, 
  HiOutlineHome, 
  HiOutlineStar,
  HiOutlinePlus,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { useNavigate } from 'react-router';
import StatsCard from '../../components/admin/StatsCard';
import RevenueChart from '../../components/admin/RevenueChart';
import BookingsChart from '../../components/admin/BookingsChart';
import RecentBookingsTable from '../../components/admin/RecentBookingsTable';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { propertyServices, bookingServices } from '../../api';

import { 
  REVENUE_CHART_DATA, 
  BOOKINGS_CHART_DATA 
} from '../../data/adminMockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeListings: 0,
    averageRating: 0.0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        let propertiesList = [];
        try {
          const propRes = await propertyServices.getHostProperties();
          propertiesList = propRes?.properties || [];
        } catch (propErr) {
          const propRes = await propertyServices.getAll({ limit: 100 });
          propertiesList = propRes?.properties || [];
        }

        let bookingsList = [];
        try {
          const bookRes = await bookingServices.getHostBookings();
          bookingsList = bookRes?.bookings || [];
        } catch (bookErr) {
          const bookRes = await bookingServices.getMyBookings();
          bookingsList = bookRes?.bookings || [];
        }

        // Sum revenue
        const revenue = bookingsList.reduce((sum, b) => {
          if (b.bookingStatus !== 'cancelled') {
            return sum + (b.totalAmount || 0);
          }
          return sum;
        }, 0);

        // Average rating
        const ratedProperties = propertiesList.filter(p => p.averageRating !== undefined);
        const avgRating = ratedProperties.length > 0
          ? Number((ratedProperties.reduce((sum, p) => sum + (p.averageRating || p.rating || 0), 0) / ratedProperties.length).toFixed(2))
          : 0.0;

        setStats({
          totalRevenue: revenue,
          totalBookings: bookingsList.length,
          activeListings: propertiesList.length,
          averageRating: avgRating
        });
        setRecentBookings(bookingsList.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-4 border-b border-neutral-200">
        
        <AdminCommonHead
        name="Airbnb Admin Workspace"
        des="Welcome back, Julietta! Here is your listing portfolio overview."
        />
        
        {/* Quick action buttons */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/admin/properties/add')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
          <button
            onClick={() => navigate('/admin/categories/add')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black border border-neutral-200 hover:bg-neutral-50 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>New Category</span>
          </button>
          <button
            onClick={() => navigate('/admin/amenities/add')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black border border-neutral-200 hover:bg-neutral-50 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>New Amenity</span>
          </button>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          numericValue={stats.totalRevenue}
          prefix="$"
          icon={HiOutlineCreditCard}
          change="12.5%"
          changeType="increase"
        />
        <StatsCard
          title="Reservations"
          numericValue={stats.totalBookings}
          icon={HiOutlineCalendar}
          change="8.2%"
          changeType="increase"
        />
        <StatsCard
          title="Listed Properties"
          numericValue={stats.activeListings}
          icon={HiOutlineHome}
          change="4.1%"
          changeType="increase"
        />
        <StatsCard
          title="Average Rating"
          value={`★ ${stats.averageRating}`}
          icon={HiOutlineStar}
          change="0.05"
          changeType="increase"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={REVENUE_CHART_DATA} />
        <BookingsChart data={BOOKINGS_CHART_DATA} />
      </div>

      {/* Layout Bottom - Recent Table + Side content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings table */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-neutral-400">Loading recent reservations...</div>
          ) : (
            <RecentBookingsTable bookings={recentBookings} />
          )}
        </div>

        {/* Info card/best listings section */}
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider">Top-performing Units</h4>
            <div className="divide-y divide-neutral-100 text-xs">
              <div className="py-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=80&q=80" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="font-bold text-black line-clamp-1">Minimalist A-Frame Cabin</span>
                  <span className="text-[10px] text-neutral-400">Cascades, WA • 142 reviews</span>
                </div>
                <span className="font-bold text-black">$189/n</span>
              </div>

              <div className="py-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=80&q=80" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="font-bold text-black line-clamp-1">Modern Geometric Glass Oasis</span>
                  <span className="text-[10px] text-neutral-400">Los Angeles, CA • 58 reviews</span>
                </div>
                <span className="font-bold text-black">$990/n</span>
              </div>

              <div className="py-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=80&q=80" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="font-bold text-black line-clamp-1">Sunset Beachfront Villa</span>
                  <span className="text-[10px] text-neutral-400">Malibu, CA • 89 reviews</span>
                </div>
                <span className="font-bold text-black">$649/n</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <a href="/admin/properties" className="block text-center text-xs font-bold uppercase tracking-wider text-black border border-neutral-200 hover:bg-neutral-50 py-2 rounded transition-colors">
              Manage Inventory
            </a>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;
