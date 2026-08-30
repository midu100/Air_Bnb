import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../store/slices/authSlice";
import { useGetMyLeasesQuery, useGetLeaseLedgerQuery, useSignLeaseMutation, useGiveNoticeMutation } from "../store/api/leaseApi";
import { HiOutlineKey, HiOutlinePencilAlt, HiOutlineBell } from "react-icons/hi";

const STATUS_CLASS = {
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  pending_signature: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-green-50 text-green-700 border-green-200",
  notice_given: "bg-orange-50 text-orange-700 border-orange-200",
  ended: "bg-gray-50 text-gray-500 border-gray-200",
};

const INVOICE_CLASS = {
  upcoming: "text-gray-400",
  due: "text-amber-600",
  paid: "text-green-600",
  partial: "text-amber-600",
  overdue: "text-rose-600",
};

const LeaseLedger = ({ leaseId }) => {
  const { data, isLoading } = useGetLeaseLedgerQuery(leaseId);
  const invoices = data?.invoices || [];

  if (isLoading) return <p className="text-[11px] text-gray-400 font-semibold py-3">Loading ledger...</p>;
  if (!invoices.length) return <p className="text-[11px] text-gray-400 font-semibold py-3">The ledger is created when the lease goes active.</p>;

  const paid = invoices.filter((item) => item.status === "paid").length;

  return (
    <div className="pt-3 mt-3 border-t border-gray-100 space-y-1.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        Rent ledger — {paid} of {invoices.length} paid
      </p>
      <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
        {invoices.map((item) => (
          <div key={item._id} className="flex justify-between text-[11px]">
            <span className="text-gray-500">
              {new Date(item.dueDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">${item.amount.toLocaleString()}</span>
              <span className={`font-bold uppercase text-[9px] tracking-wider ${INVOICE_CLASS[item.status]}`}>{item.status}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MyLeases = () => {
  const currentUser = useSelector(selectCurrentUser);
  const { data, isLoading, error, refetch } = useGetMyLeasesQuery();
  const [signLease, { isLoading: isSigning }] = useSignLeaseMutation();
  const [giveNotice, { isLoading: isNoticing }] = useGiveNoticeMutation();
  const [openLedger, setOpenLedger] = useState(null);

  const leases = data?.leases || [];

  const handleSign = async (id) => {
    try {
      const res = await signLease(id).unwrap();
      toast.success(res.message, { position: "top-center", duration: 5000 });
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err?.message || "Could not sign that lease");
    }
  };

  const handleNotice = async (id) => {
    if (!confirm("Give notice to end this tenancy?")) return;
    try {
      const res = await giveNotice(id).unwrap();
      toast.success(res.message, { position: "top-center", duration: 7000 });
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err?.message || "Could not record that notice");
    }
  };

  const hasSigned = (lease) =>
    lease.signatures?.some((item) => String(item.user) === String(currentUser?._id));

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans min-h-[70vh]">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          My <span className="text-[#f0506e]">Leases</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Sign your tenancy, follow the rent ledger, and give notice when the time comes</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">LOADING LEASES...</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold border border-dashed border-gray-200 rounded-3xl">FAILED TO LOAD. PLEASE LOGIN OR TRY AGAIN.</div>
      ) : leases.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[#f0506e] mb-4">
            <HiOutlineKey className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">No Leases Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Once a landlord approves your application and drafts a lease, it appears here for you to sign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leases.map((lease) => (
            <div key={lease._id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 relative">
              <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_CLASS[lease.status]}`}>
                {lease.status.replace("_", " ")}
              </span>

              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={lease.property?.thumbnail} alt={lease.property?.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1 pr-24">{lease.property?.title}</h3>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
                    {lease.property?.city}, {lease.property?.country}
                  </p>

                  <div className="text-xs text-gray-600 mt-2.5 space-y-1">
                    <p>Rent <span className="font-extrabold text-gray-950">${lease.monthlyRent.toLocaleString()}</span> / month, due on day {lease.rentDueDay}</p>
                    <p>
                      {new Date(lease.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      {" → "}
                      {new Date(lease.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      <span className="text-[10px] text-gray-400 font-bold"> ({lease.termMonths} mo)</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Deposit ${lease.securityDeposit.toLocaleString()} · {lease.depositStatus} ·
                      {" "}{lease.signatures?.length || 0}/{(lease.tenants?.length || 1) + 1} signed
                    </p>
                  </div>
                </div>
              </div>

              {openLedger === lease._id && <LeaseLedger leaseId={lease._id} />}

              <div className="flex flex-wrap justify-end gap-2 pt-4">
                <button
                  onClick={() => setOpenLedger(openLedger === lease._id ? null : lease._id)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
                >
                  {openLedger === lease._id ? "Hide ledger" : "Rent ledger"}
                </button>

                {lease.status === "pending_signature" && !hasSigned(lease) && (
                  <button
                    onClick={() => handleSign(lease._id)}
                    disabled={isSigning}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#f0506e] hover:bg-[#d94560] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border-none active:scale-95 disabled:opacity-50"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" /> Sign lease
                  </button>
                )}

                {lease.status === "active" && (
                  <button
                    onClick={() => handleNotice(lease._id)}
                    disabled={isNoticing}
                    className="flex items-center gap-1 px-3 py-1.5 border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
                  >
                    <HiOutlineBell className="w-4 h-4" /> Give notice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeases;
