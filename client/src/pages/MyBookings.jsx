import React from "react";
import { useGetMyBookingsQuery, useCancelBookingMutation } from "../store/api/bookingApi";
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUser, HiOutlineCash, HiOutlineTrash } from "react-icons/hi";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { data, isLoading, error, refetch } = useGetMyBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const res = await cancelBooking(id).unwrap();
        toast.success(res.message || "Booking cancelled successfully", { position: "top-center" });
        refetch();
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "Failed to cancel booking.", { position: "top-center" });
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans min-h-[70vh]">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          My <span className="text-[#f0506e]">Reservations</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track and manage your upcoming and past bookings
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">
          LOADING RESERVATIONS...
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold border border-dashed border-gray-200 rounded-3xl">
          FAILED TO LOAD RESERVATIONS. PLEASE LOGIN OR TRY AGAIN.
        </div>
      ) : !data?.bookings || data.bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[#f0506e] mb-4">
            <HiOutlineCalendar className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">No Bookings Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            You don't have any stays booked. Explore properties to find your perfect destination.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.bookings.map((booking) => (
            <div key={booking._id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col sm:flex-row gap-5 text-left relative overflow-hidden">
              
              {/* Status Badge */}
              <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusClass(booking.bookingStatus)}`}>
                {booking.bookingStatus}
              </span>

              {/* Property Image */}
              <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border border-gray-50 shrink-0">
                <img 
                  src={booking.property?.thumbnail || "https://picsum.photos/400/300"} 
                  alt={booking.property?.title}
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Booking Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1 pr-20">
                    {booking.property?.title || "Deleted Property"}
                  </h3>
                  <p className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
                    <HiOutlineLocationMarker className="w-3.5 h-3.5 text-[#f0506e]" />
                    {booking.property ? `${booking.property.city}, ${booking.property.country}` : "Unknown location"}
                  </p>

                  {/* Dates */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
                    <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(booking.checkInDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})} - {new Date(booking.checkOutDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                    <span className="text-[10px] text-gray-400 font-extrabold">
                      ({booking.totalNights} night{booking.totalNights > 1 ? "s" : ""})
                    </span>
                  </div>

                  {/* Host info */}
                  {booking.host && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                      <HiOutlineUser className="w-4 h-4 text-gray-400" />
                      <span>Host: <span className="font-semibold text-gray-800">{booking.host.fullName}</span></span>
                    </div>
                  )}

                  {/* Pricing info */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                    <HiOutlineCash className="w-4 h-4 text-gray-400" />
                    <span>Total Paid: <span className="font-extrabold text-gray-950">${booking.totalAmount}</span></span>
                    <span className="text-[10px] text-gray-400 font-medium">(${booking.pricePerNight}/night)</span>
                  </div>
                </div>

                {/* Cancel Action */}
                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                  <div className="flex justify-end pt-4 sm:pt-0">
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={isCancelling}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      Cancel Stay
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
