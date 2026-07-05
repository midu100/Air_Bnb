import React from 'react';

const RecentBookingsTable = ({ bookings, onAction, showActions = false }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 border border-green-200 text-green-700 rounded-sm">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">Pending</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-sm">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 border border-red-200 text-red-700 rounded-sm">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-50 border border-neutral-200 text-neutral-600 rounded-sm">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide bg-neutral-900 text-white rounded-xs">PAID</span>;
      case 'pending':
        return <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-xs">UNPAID</span>;
      case 'refunded':
        return <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide bg-neutral-200 text-neutral-700 rounded-xs">REFUNDED</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide bg-neutral-50 text-neutral-500 rounded-xs">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h4 className="text-sm font-bold text-black">Recent Bookings</h4>
        <span className="text-xs text-neutral-400 font-semibold">{bookings.length} reservations</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="px-6 py-3">Booking ID</th>
              <th className="px-6 py-3">Guest</th>
              <th className="px-6 py-3">Listing</th>
              <th className="px-6 py-3">Dates</th>
              <th className="px-6 py-3">Nights</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Payment</th>
              {showActions && <th className="px-6 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-xs text-black">
            {bookings.map((booking) => (
              <tr key={booking.id || booking._id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-neutral-500">
                  {booking.id || (booking._id && booking._id.slice(-6).toUpperCase()) || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center uppercase">
                      {booking.guest?.avatar || (booking.guest?.fullName && booking.guest.fullName.slice(0, 2)) || 'G'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{booking.guest?.fullName || 'Guest'}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">{booking.guest?.email || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">
                  {booking.property?.title || booking.property || 'Airbnb Listing'}
                </td>
                <td className="px-6 py-4 font-medium text-neutral-600">
                  {new Date(booking.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(booking.checkOutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 font-medium text-neutral-500 text-center">
                  {booking.totalNights} nights
                </td>
                <td className="px-6 py-4 font-bold text-right">
                  ${booking.totalAmount}
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(booking.bookingStatus)}
                </td>
                <td className="px-6 py-4 text-center">
                  {getPaymentBadge(booking.paymentStatus)}
                </td>
                {showActions && onAction && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {booking.bookingStatus === 'pending' && (
                        <button
                          onClick={() => onAction(booking._id || booking.id, 'confirm')}
                          className="px-2 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold rounded-xs cursor-pointer transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => onAction(booking._id || booking.id, 'complete')}
                          className="px-2 py-1 bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] font-bold rounded-xs cursor-pointer transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.bookingStatus === 'pending' || booking.bookingStatus === 'confirmed') && (
                        <button
                          onClick={() => onAction(booking._id || booking.id, 'cancel')}
                          className="px-2 py-1 bg-white text-red-600 hover:bg-red-50 border border-neutral-200 text-[10px] font-bold rounded-xs cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={showActions ? 9 : 8} className="px-6 py-8 text-center text-neutral-400 font-medium">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentBookingsTable;
