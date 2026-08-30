import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { useGetMyBookingsQuery, useCancelBookingMutation, useExtendBookingMutation } from "../store/api/bookingApi";
import { useCreateCheckoutSessionMutation } from "../store/api/paymentApi";
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUser, HiOutlineCash, HiOutlineTrash, HiOutlineCreditCard } from "react-icons/hi";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const { data, isLoading, error, refetch } = useGetMyBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [createCheckoutSession, { isLoading: isRedirecting }] = useCreateCheckoutSessionMutation();
  const [extendBooking, { isLoading: isExtending }] = useExtendBookingMutation();

  // Which booking is showing its extend field
  const [extendingId, setExtendingId] = useState(null);
  const [newCheckOut, setNewCheckOut] = useState("");

  // Stripe sends the guest back here when they abandon the hosted checkout page
  const [noticeShown, setNoticeShown] = useState(false);
  if (!noticeShown && searchParams.get("payment") === "cancelled") {
    setNoticeShown(true);
    toast("Payment cancelled. Your booking is still held for a short while.", { position: "top-center" });
  }

  const handlePayNow = async (id) => {
    try {
      const res = await createCheckoutSession(id).unwrap();
      // Hand the guest over to the Stripe hosted page
      window.location.assign(res.url);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err?.message || "Could not start checkout.", { position: "top-center" });
    }
  };

  const handleExtend = async (id) => {
    if (!newCheckOut) return toast.error("Pick a new check-out date", { position: "top-center" });
    try {
      const res = await extendBooking({ id, checkOutDate: newCheckOut }).unwrap();
      toast.success(res.message, { position: "top-center", duration: 5000 });
      setExtendingId(null);
      setNewCheckOut("");
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err?.message || "Could not change those dates.", { position: "top-center" });
    }
  };

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const res = await cancelBooking(id).unwrap();
        toast.success(res.message || "Booking cancelled successfully", { position: "top-center", duration: 6000 });
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
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {booking.rentalType === "mid" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-teal-50 text-teal-700 border-teal-200">
                    Monthly
                  </span>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusClass(booking.bookingStatus)}`}>
                  {booking.bookingStatus}
                </span>
              </div>

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

                {/* Extend / shorten - the defining mid-term behaviour */}
                {extendingId === booking._id && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">New check-out</label>
                      <input
                        type="date"
                        value={newCheckOut}
                        onChange={(e) => setNewCheckOut(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#f0506e]"
                      />
                    </div>
                    <button
                      onClick={() => handleExtend(booking._id)}
                      disabled={isExtending}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border-none active:scale-95 disabled:opacity-50 self-end sm:self-auto"
                    >
                      {isExtending ? "Updating..." : "Update stay"}
                    </button>
                  </div>
                )}

                {/* Payment & Cancel Actions */}
                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                  <div className="flex justify-end items-center gap-2 pt-4 sm:pt-0">
                    {booking.paymentStatus === "pending" && booking.bookingStatus === "pending" && (
                      <button
                        onClick={() => handlePayNow(booking._id)}
                        disabled={isRedirecting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#f0506e] hover:bg-[#d94560] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border-none active:scale-95"
                      >
                        <HiOutlineCreditCard className="w-4 h-4" />
                        Pay Now
                      </button>
                    )}
                    <button
                      onClick={() => { setExtendingId(extendingId === booking._id ? null : booking._id); setNewCheckOut(""); }}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
                    >
                      <HiOutlineCalendar className="w-4 h-4" />
                      Change dates
                    </button>
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
