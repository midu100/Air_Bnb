import React from 'react';
import { useSearchParams } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import {
  useGetPayoutStatusQuery,
  useGetMyPayoutsQuery,
  useCreateOnboardingLinkMutation,
} from '../../store/api/payoutApi';
import { HiOutlineCash, HiOutlineShieldCheck, HiOutlineExclamation } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const STATUS_STYLES = {
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  released: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  reversed: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const Payouts = () => {
  const [searchParams] = useSearchParams();
  const { data: statusData, isLoading: statusLoading, error: statusError } = useGetPayoutStatusQuery();
  const { data: payoutData, isLoading: payoutsLoading } = useGetMyPayoutsQuery();
  const [createOnboardingLink, { isLoading: linking }] = useCreateOnboardingLinkMutation();

  const status = statusData?.status;
  const payouts = payoutData?.payouts || [];
  const summary = payoutData?.summary || { paid: 0, pending: 0 };

  const gatewayDown = statusError?.status === 503;

  const handleOnboard = async () => {
    try {
      const res = await createOnboardingLink().unwrap();
      window.location.assign(res.url);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not start onboarding');
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div className="border-b border-neutral-200 pb-4">
        <AdminCommonHead name="Payouts" des="Verify your identity once, then track every transfer to your bank" />
      </div>

      {searchParams.get('onboarding') === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-[13px] font-semibold text-green-800">
          Onboarding submitted. Stripe may take a few minutes to finish verifying you.
        </div>
      )}

      {/* ====== Account status ====== */}
      <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs">
        {gatewayDown ? (
          <div className="flex items-start gap-3">
            <HiOutlineExclamation className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black uppercase text-xs tracking-wider">Payment gateway not configured</h3>
              <p className="text-[13px] text-neutral-500 font-semibold mt-1">
                Add STRIPE_SECRET_KEY to the server environment to enable payouts.
              </p>
            </div>
          </div>
        ) : statusLoading ? (
          <p className="text-[13px] text-neutral-400 font-semibold">Checking your payout account...</p>
        ) : status?.payoutsEnabled ? (
          <div className="flex items-start gap-3">
            <HiOutlineShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black uppercase text-xs tracking-wider">Verified and ready</h3>
              <p className="text-[13px] text-neutral-500 font-semibold mt-1">
                Earnings are released one day after each check-in and transferred to your bank.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HiOutlineExclamation className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider">
                  {status?.connected ? 'Verification incomplete' : 'Set up payouts'}
                </h3>
                <p className="text-[13px] text-neutral-500 font-semibold mt-1">
                  {status?.connected
                    ? 'Stripe still needs a few details before you can be paid.'
                    : 'Identity and bank verification is required by law before a platform can pay you.'}
                </p>
                {status?.requirements?.length > 0 && (
                  <p className="text-[11px] text-neutral-400 font-semibold mt-1">
                    Outstanding: {status.requirements.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            </div>
            <button onClick={handleOnboard} disabled={linking}
              className="bg-black hover:bg-neutral-800 text-white rounded px-6 py-3 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap">
              {linking ? 'Opening...' : status?.connected ? 'Finish verification' : 'Start verification'}
            </button>
          </div>
        )}
      </div>

      {/* ====== Balances ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs">
          <span className="font-black uppercase text-[10px] text-neutral-500 tracking-wider">Paid out</span>
          <p className="text-3xl font-black mt-2 tabular-nums">${summary.paid.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs">
          <span className="font-black uppercase text-[10px] text-neutral-500 tracking-wider">Pending release</span>
          <p className="text-3xl font-black mt-2 tabular-nums">${summary.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* ====== History ====== */}
      <div className="bg-white border border-neutral-200 rounded shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
          <HiOutlineCash className="w-4 h-4 text-neutral-500" />
          <h3 className="font-black uppercase text-xs tracking-wider">Transfers</h3>
        </div>

        {payoutsLoading ? (
          <p className="p-6 text-[13px] text-neutral-400 font-semibold">Loading transfers...</p>
        ) : payouts.length === 0 ? (
          <p className="p-6 text-[13px] text-neutral-400 font-semibold">
            No payouts yet. One is scheduled automatically each time a guest pays.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[620px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  {['Release date', 'Gross', 'Platform fee', 'Net', 'Status'].map(head => (
                    <th key={head} className="text-left px-6 py-3 font-black uppercase text-[10px] tracking-wider text-neutral-500">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payouts.map(item => (
                  <tr key={item._id}>
                    <td className="px-6 py-3.5 font-semibold">
                      {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 tabular-nums">${item.grossAmount.toLocaleString()}</td>
                    <td className="px-6 py-3.5 tabular-nums text-neutral-500">-${item.platformFee.toLocaleString()}</td>
                    <td className="px-6 py-3.5 tabular-nums font-black">${item.netAmount.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded border font-black uppercase text-[9px] tracking-wider ${STATUS_STYLES[item.status] || STATUS_STYLES.reversed}`}>
                        {item.status}
                      </span>
                      {item.failureReason && (
                        <p className="text-[10px] text-neutral-400 font-semibold mt-1">{item.failureReason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payouts;
