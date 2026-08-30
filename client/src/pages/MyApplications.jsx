import React from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from "../store/api/applicationApi";
import { HiOutlineDocumentText, HiOutlineX } from "react-icons/hi";

const STATUS_CLASS = {
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  screening: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-rose-50 text-rose-700 border-rose-200",
  withdrawn: "bg-gray-50 text-gray-600 border-gray-200",
};

const MyApplications = () => {
  const { data, isLoading, error, refetch } = useGetMyApplicationsQuery();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const applications = data?.applications || [];

  const handleWithdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      await withdrawApplication(id).unwrap();
      toast.success("Application withdrawn", { position: "top-center" });
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err?.message || "Could not withdraw it");
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans min-h-[70vh]">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          My <span className="text-[#f0506e]">Applications</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Track every long-term rental you have applied for</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">
          LOADING APPLICATIONS...
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold border border-dashed border-gray-200 rounded-3xl">
          FAILED TO LOAD. PLEASE LOGIN OR TRY AGAIN.
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[#f0506e] mb-4">
            <HiOutlineDocumentText className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">No Applications Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            Find a home offered on a long lease and apply. Your details are reused for every application.
          </p>
          <Link to="/properties" className="btn-brand text-xs rounded-xl px-5 py-2">Browse homes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((item) => (
            <div key={item._id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all p-5 flex gap-5 relative">
              <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_CLASS[item.status]}`}>
                {item.status}
              </span>

              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <img src={item.property?.thumbnail} alt={item.property?.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1 pr-20">
                    {item.property?.title || "Deleted property"}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
                    {item.property ? `${item.property.city}, ${item.property.country}` : "Unknown"}
                  </p>

                  <div className="text-xs text-gray-600 mt-3 space-y-1">
                    <p>Rent <span className="font-extrabold text-gray-950">${item.property?.longTermRent?.toLocaleString() || "—"}</span> / month</p>
                    <p>Move-in <span className="font-semibold">{new Date(item.desiredMoveIn).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span> · {item.desiredTermMonths} months</p>
                    <p className="text-[11px] text-gray-400">
                      Screening: <span className="font-semibold">{item.screening?.status?.replace("_", " ") || "not started"}</span>
                    </p>
                  </div>

                  {item.status === "declined" && item.declineReason && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-2">Reason: {item.declineReason}</p>
                  )}
                </div>

                {["submitted", "screening"].includes(item.status) && (
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => handleWithdraw(item._id)}
                      disabled={isWithdrawing}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
                    >
                      <HiOutlineX className="w-3.5 h-3.5" /> Withdraw
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

export default MyApplications;
