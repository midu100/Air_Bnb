import React, { useState } from 'react';
import { HiOutlineCash, HiOutlineCheckCircle } from 'react-icons/hi';

const Payouts = () => {
  const [payouts, setPayouts] = useState([
    { id: 'PAY-40912', host: 'Marcus Vance', amount: 8200, status: 'completed', date: '2026-06-30', method: 'Direct Deposit' },
    { id: 'PAY-40913', host: 'Clara Oswald', amount: 3450, status: 'pending', date: '2026-07-05', method: 'Stripe Account' },
    { id: 'PAY-40914', host: 'John Watson', amount: 1540, status: 'completed', date: '2026-06-25', method: 'Paypal Transfer' }
  ]);

  const handleProcess = (id) => {
    if (confirm('Approve and process this host payout transfer?')) {
      setPayouts(prev => 
        prev.map(p => p.id === id ? { ...p, status: 'completed', date: new Date().toISOString().split('T')[0] } : p)
      );
      alert('Payout processed successfully!');
    }
  };

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Host Payouts & Earnings</h2>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Configure host payout transfers, review pending withdrawals, and logs payments</p>
      </div>

      {/* Payouts ledger list */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
            <HiOutlineCash className="w-4 h-4 text-neutral-400" />
            <span>Payout Ledger ({payouts.length})</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-6 py-3">Payout ID</th>
                <th className="px-6 py-3">Host Account</th>
                <th className="px-6 py-3">Payout Method</th>
                <th className="px-6 py-3 text-right">Transfer Amount</th>
                <th className="px-6 py-3">Processed Date</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs font-semibold text-black">
              {payouts.map(payout => (
                <tr key={payout.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-neutral-500">
                    {payout.id}
                  </td>
                  <td className="px-6 py-4 font-extrabold">
                    {payout.host}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-400 uppercase text-[10px]">
                    {payout.method}
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-black">
                    ${payout.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-400">
                    {payout.date || 'Pending Processing'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-xs ${
                      payout.status === 'completed' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payout.status === 'pending' ? (
                      <button
                        onClick={() => handleProcess(payout.id)}
                        className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold rounded cursor-pointer transition-all uppercase tracking-wider"
                      >
                        Approve Payout
                      </button>
                    ) : (
                      <span className="text-neutral-400 font-bold uppercase text-[9px] flex items-center justify-end gap-1.5">
                        <HiOutlineCheckCircle className="w-4 h-4 text-green-600" />
                        Released
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payouts;
