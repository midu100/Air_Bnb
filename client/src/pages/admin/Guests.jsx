import React, { useState, useMemo } from 'react';
import { HiOutlineUsers, HiOutlineSearch } from 'react-icons/hi';
import { useGetHostBookingsQuery } from '../../store/api/bookingApi';

const Guests = () => {
  const [search, setSearch] = useState('');
  const { data: bookingsData, isLoading } = useGetHostBookingsQuery();

  const guests = useMemo(() => {
    const bookings = bookingsData?.bookings || [];
    const guestsMap = {};
    bookings.forEach(b => {
      if (b.guest) {
        const id = b.guest._id || b.guest.email;
        if (!guestsMap[id]) {
          guestsMap[id] = {
            fullName: b.guest.fullName,
            email: b.guest.email,
            phone: b.guest.phoneNumber || 'N/A',
            totalBookings: 0,
            joinDate: b.guest.createdAt ? new Date(b.guest.createdAt).toLocaleDateString() : 'N/A'
          };
        }
        guestsMap[id].totalBookings += 1;
      }
    });
    return Object.values(guestsMap);
  }, [bookingsData]);

  const filteredGuests = guests.filter(g => 
    g.fullName.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">User Directory</h2>
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Analyze customer bookings volume and accounts</p>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-neutral-200 rounded p-4 shadow-xs">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search directory by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-xs text-black rounded px-3 py-2 pl-9 focus:outline-none focus:border-black"
          />
          <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Guests table */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
            <HiOutlineUsers className="w-4 h-4 text-neutral-400" />
            <span>Active Customers ({guests.length})</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-sm font-bold text-neutral-400">LOADING GUEST DIRECTORY...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3">Guest Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Phone Line</th>
                  <th className="px-6 py-3 text-center">Total Bookings</th>
                  <th className="px-6 py-3">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs font-semibold text-black">
                {filteredGuests.map((guest, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center uppercase">
                        {guest.fullName.slice(0, 2)}
                      </div>
                      <span className="font-bold text-black">{guest.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 font-normal">
                    {guest.email}
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-500">
                    {guest.phone}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-black">
                    {guest.totalBookings}
                  </td>
                  <td className="px-6 py-4 text-neutral-400 font-normal">
                    {guest.joinDate}
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-400 font-semibold">
                    No guests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Guests;
