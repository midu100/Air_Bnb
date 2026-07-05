import React, { useState, useEffect } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import RecentBookingsTable from '../../components/admin/RecentBookingsTable';
import { bookingServices } from '../../api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await bookingServices.getHostBookings();
      } catch (err) {
        res = await bookingServices.getMyBookings();
      }
      if (res?.bookings) {
        setBookings(res.bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'confirm') {
        await bookingServices.confirm(bookingId);
      } else if (action === 'complete') {
        await bookingServices.complete(bookingId);
      } else if (action === 'cancel') {
        await bookingServices.cancel(bookingId);
      }
      alert(`Reservation status updated successfully! Action: ${action}`);
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to update reservation status.');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const guestName = b.guest?.fullName || '';
    const propertyTitle = b.property?.title || '';
    const bId = b._id || b.id || '';

    const matchesSearch = 
      guestName.toLowerCase().includes(search.toLowerCase()) ||
      propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
      bId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">Reservation Bookings</h2>
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Confirm, complete, or cancel booking reservations</p>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-neutral-200 rounded p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by guest name, property, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-xs text-black rounded px-3 py-2 pl-9 focus:outline-none focus:border-black"
          />
          <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="font-bold text-[10px] uppercase text-neutral-400">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-neutral-200 text-xs font-semibold px-2 py-1.5 rounded focus:outline-none focus:border-black"
          >
            <option value="All">All Reservations</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table list */}
      {loading ? (
        <div className="py-12 text-center text-sm font-bold text-neutral-400">LOADING RESERVATION BOOKINGS...</div>
      ) : (
        <RecentBookingsTable 
          bookings={filteredBookings} 
          onAction={handleBookingAction} 
          showActions={true} 
        />
      )}
    </div>
  );
};

export default Bookings;
