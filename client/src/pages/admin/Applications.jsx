import React, { useState } from 'react';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetLandlordApplicationsQuery, useDecideApplicationMutation } from '../../store/api/applicationApi';
import { useCreateLeaseMutation } from '../../store/api/leaseApi';
import { HiOutlineDocumentText, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const STATUS_CLASS = {
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  screening: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-rose-50 text-rose-700 border-rose-200',
  withdrawn: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const Applications = () => {
  const { data, isLoading, refetch } = useGetLandlordApplicationsQuery();
  const [decideApplication, { isLoading: deciding }] = useDecideApplicationMutation();
  const [createLease, { isLoading: drafting }] = useCreateLeaseMutation();

  const applications = data?.applications || [];
  const [draftFor, setDraftFor] = useState(null);
  const [terms, setTerms] = useState({ startDate: '', termMonths: 12, monthlyRent: '', securityDeposit: '', rentDueDay: 1 });

  const handleDecide = async (id, decision) => {
    const declineReason = decision === 'declined' ? prompt('Reason for declining (shown to the applicant where the law requires it):') : undefined;
    if (decision === 'declined' && declineReason === null) return;

    try {
      await decideApplication({ id, decision, declineReason }).unwrap();
      toast.success(`Application ${decision}`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not record that decision');
    }
  };

  const openDraft = (application) => {
    setDraftFor(application);
    setTerms({
      startDate: application.desiredMoveIn ? application.desiredMoveIn.slice(0, 10) : '',
      termMonths: application.desiredTermMonths || 12,
      monthlyRent: application.property?.longTermRent || '',
      securityDeposit: application.property?.longTermRent || '',
      rentDueDay: 1,
    });
  };

  const handleDraftLease = async (e) => {
    e.preventDefault();
    if (!terms.startDate) return toast.error('Pick a start date');

    try {
      await createLease({
        propertyId: draftFor.property._id,
        tenantId: draftFor.applicant._id,
        applicationId: draftFor._id,
        startDate: terms.startDate,
        termMonths: Number(terms.termMonths),
        monthlyRent: Number(terms.monthlyRent),
        securityDeposit: Number(terms.securityDeposit),
        rentDueDay: Number(terms.rentDueDay),
      }).unwrap();
      toast.success('Lease drafted and sent for signature');
      setDraftFor(null);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not draft that lease');
    }
  };

  const inputClass = "w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2.5 focus:outline-none focus:border-black text-[13px]";
  const labelClass = "block font-black uppercase text-[10px] text-neutral-600 tracking-wider mb-1";

  return (
    <div className="space-y-6 text-black">
      <div className="border-b border-neutral-200 pb-4">
        <AdminCommonHead name="Rental Applications" des="Review applicants, approve them, and turn an approval into a lease" />
      </div>

      {isLoading ? (
        <p className="text-[13px] text-neutral-400 font-semibold">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded p-12 text-center shadow-xs">
          <HiOutlineDocumentText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="font-black uppercase text-xs tracking-wider">No applications yet</p>
          <p className="text-[13px] text-neutral-400 font-semibold mt-1">
            They appear here when someone applies to a listing offered on a long lease.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((item) => (
            <div key={item._id} className="bg-white border border-neutral-200 rounded p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded overflow-hidden bg-neutral-100 shrink-0">
                    <img src={item.property?.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-[13px]">{item.applicant?.fullName}</span>
                      <span className={`px-2 py-0.5 rounded border font-black uppercase text-[9px] tracking-wider ${STATUS_CLASS[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-neutral-500 font-semibold">{item.applicant?.email}</p>
                    <p className="text-[12px] text-neutral-700 font-semibold">{item.property?.title}</p>
                    <div className="text-[12px] text-neutral-600 pt-1 space-y-0.5">
                      <p>Income <b>${item.monthlyIncome?.toLocaleString()}</b>/month · {item.employmentStatus}{item.employer ? ` at ${item.employer}` : ''}</p>
                      <p>
                        Wants {item.desiredTermMonths} months from{' '}
                        {item.desiredMoveIn ? new Date(item.desiredMoveIn).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Screening {item.screening?.status?.replace('_', ' ')} · consent {item.screeningConsent?.given ? 'given' : 'not given'}
                        {item.coApplicants?.length ? ` · ${item.coApplicants.length} co-applicant` : ''}
                        {item.guarantor?.fullName ? ' · guarantor named' : ''}
                      </p>
                    </div>
                    {item.message && <p className="text-[12px] text-neutral-500 italic pt-1">"{item.message}"</p>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {['submitted', 'screening'].includes(item.status) && (
                    <>
                      <button onClick={() => handleDecide(item._id, 'approved')} disabled={deciding}
                        className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded font-black uppercase text-[10px] tracking-wider hover:bg-neutral-800 cursor-pointer disabled:opacity-50">
                        <HiOutlineCheck className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => handleDecide(item._id, 'declined')} disabled={deciding}
                        className="flex items-center gap-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded font-black uppercase text-[10px] tracking-wider hover:bg-neutral-50 cursor-pointer disabled:opacity-50">
                        <HiOutlineX className="w-4 h-4" /> Decline
                      </button>
                    </>
                  )}
                  {item.status === 'approved' && (
                    <button onClick={() => openDraft(item)}
                      className="px-4 py-2 bg-black text-white rounded font-black uppercase text-[10px] tracking-wider hover:bg-neutral-800 cursor-pointer">
                      Draft lease
                    </button>
                  )}
                </div>
              </div>

              {/* ====== Lease terms ====== */}
              {draftFor?._id === item._id && (
                <form onSubmit={handleDraftLease} className="mt-5 pt-5 border-t border-neutral-200 space-y-4">
                  <h4 className="font-black uppercase text-[11px] tracking-wider">Lease terms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className={labelClass}>Start</label>
                      <input type="date" value={terms.startDate} onChange={(e) => setTerms({ ...terms, startDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Months</label>
                      <input type="number" min="1" value={terms.termMonths} onChange={(e) => setTerms({ ...terms, termMonths: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Rent ($)</label>
                      <input type="number" min="0" value={terms.monthlyRent} onChange={(e) => setTerms({ ...terms, monthlyRent: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Deposit ($)</label>
                      <input type="number" min="0" value={terms.securityDeposit} onChange={(e) => setTerms({ ...terms, securityDeposit: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Rent due day</label>
                      <input type="number" min="1" max="28" value={terms.rentDueDay} onChange={(e) => setTerms({ ...terms, rentDueDay: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={drafting}
                      className="px-5 py-2.5 bg-black text-white rounded font-black uppercase text-[10px] tracking-wider hover:bg-neutral-800 cursor-pointer disabled:opacity-50">
                      {drafting ? 'Drafting...' : 'Send for signature'}
                    </button>
                    <button type="button" onClick={() => setDraftFor(null)}
                      className="px-5 py-2.5 border border-neutral-300 rounded font-black uppercase text-[10px] tracking-wider hover:bg-neutral-50 cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
