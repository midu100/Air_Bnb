import React from "react";
import { useGetMyPaymentsQuery, useRefundPaymentMutation } from "../store/api/paymentApi";
import { HiOutlineCreditCard, HiOutlineRefresh, HiOutlineCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";

const MyPayments = () => {
  const { data, isLoading, error, refetch } = useGetMyPaymentsQuery();
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();

  const handleRefund = async (id) => {
    if (confirm("Are you sure you want to request a refund for this payment? This will also cancel your booking.")) {
      try {
        const res = await refundPayment(id).unwrap();
        toast.success(res.message || "Refund processed successfully", { position: "top-center" });
        refetch();
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "Failed to process refund.", { position: "top-center" });
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "refunded":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans min-h-[70vh]">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          Payment <span className="text-[#f0506e]">History</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review all payments made for your stay reservations
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">
          LOADING PAYMENTS...
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold border border-dashed border-gray-200 rounded-3xl">
          FAILED TO LOAD PAYMENT TRANSACTIONS. PLEASE LOGIN OR TRY AGAIN.
        </div>
      ) : !data?.payments || data.payments.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[#f0506e] mb-4">
            <HiOutlineCreditCard className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">No Transactions</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            You haven't made any booking payments yet. Stays checking out from your cart will appear here after payment.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-700">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Transaction ID / Method</th>
                  <th className="px-6 py-4">Booking Dates</th>
                  <th className="px-6 py-4">Paid Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {data.payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Transaction Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-gray-900">{payment.transactionId || "N/A"}</span>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{payment.paymentMethod || "Stripe"}</span>
                      </div>
                    </td>

                    {/* Booking Dates */}
                    <td className="px-6 py-4">
                      {payment.booking ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {new Date(payment.booking.checkInDate).toLocaleDateString()} - {new Date(payment.booking.checkOutDate).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">Booking Status: {payment.booking.bookingStatus}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Deleted Booking</span>
                      )}
                    </td>

                    {/* Paid Amount */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-gray-950">${payment.amount}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>

                    {/* Actions (Refund) */}
                    <td className="px-6 py-4 text-right">
                      {payment.status === "paid" && (
                        <button
                          onClick={() => handleRefund(payment._id)}
                          disabled={isRefunding}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
                        >
                          <HiOutlineRefresh className="w-3.5 h-3.5" />
                          Refund
                        </button>
                      )}
                      {payment.status === "refunded" && (
                        <span className="inline-flex items-center gap-1 text-gray-400 font-semibold text-[10px]">
                          <HiOutlineCheckCircle className="w-4 h-4 text-gray-300" />
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
