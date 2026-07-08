import React, { useState } from 'react';
import { HiOutlineCreditCard, HiOutlineSearch } from 'react-icons/hi';
import { MOCK_ADMIN_PAYMENTS } from '../../data/adminMockData';
import { useGetMyPaymentsQuery, useRefundPaymentMutation } from '../../store/api/paymentApi';
import { toast } from 'react-hot-toast';

const Payments = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch payments via RTK Query
  const { data: apiPaymentsData, isLoading } = useGetMyPaymentsQuery();
  const [refundPayment] = useRefundPaymentMutation();

  const apiPayments = apiPaymentsData?.payments || [];
  // Merge or fallback to mock payments if database is empty
  const payments = apiPayments.length > 0 ? apiPayments : MOCK_ADMIN_PAYMENTS;

  const handleRefund = async (id) => {
    if (confirm('Process refund? This will cancel the reservation and send credits back.')) {
      try {
        await refundPayment(id).unwrap();
        toast.success('Payment refunded successfully!');
      } catch (error) {
        console.error(error);
        toast.error(error?.data?.message || 'Failed to refund payment.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-green-50 border border-green-200 text-green-700 rounded-sm">PAID</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">PENDING</span>;
      case 'refunded':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-sm">REFUNDED</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-red-50 border border-red-200 text-red-700 rounded-sm">{status}</span>;
    }
  };

  const filteredPayments = payments.filter(p => {
    const txnId = p.transactionId || p._id || '';
    const userFullName = p.user?.fullName || '';
    const matchesSearch = 
      txnId.toLowerCase().includes(search.toLowerCase()) ||
      userFullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">Payment Ledger</h2>
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Process refunds, view transaction details, and log payment receipts</p>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-neutral-200 rounded p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by transaction ID or user..."
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
            <option value="All">All Transactions</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payment table */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
            <HiOutlineCreditCard className="w-4 h-4 text-neutral-400" />
            <span>Payments ledger ({payments.length})</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-sm font-bold text-neutral-400">LOADING TRANSACTIONS...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Logged Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs font-semibold text-black">
                {filteredPayments.map(payment => (
                <tr key={payment._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-neutral-500">
                    {payment.transactionId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-black">{payment.user?.fullName}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">{payment.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold uppercase text-neutral-500 text-[10px]">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    ${payment.amount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 text-neutral-500 font-semibold">
                    {payment.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'paid' ? (
                      <button
                        onClick={() => handleRefund(payment._id)}
                        className="px-2.5 py-1 bg-white border border-neutral-200 hover:bg-red-50 text-red-600 hover:border-red-200 text-[10px] font-bold rounded cursor-pointer transition-all"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-neutral-400 font-bold uppercase text-[9px]">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-400 font-semibold">
                    No transactions found
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

export default Payments;
