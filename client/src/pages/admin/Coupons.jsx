import React, { useState } from 'react';
import { HiOutlinePlus, HiOutlineTag, HiOutlineTrash } from 'react-icons/hi';

const Coupons = () => {
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WELCOME10', discount: 10, type: 'Percentage', maxUses: 100, used: 42, expiry: '2026-12-31', status: 'active' },
    { id: 2, code: 'SUMMER20', discount: 20, type: 'Percentage', maxUses: 50, used: 15, expiry: '2026-08-31', status: 'active' },
    { id: 3, code: 'STAYLONG50', discount: 50, type: 'Fixed Amount ($)', maxUses: 200, used: 200, expiry: '2026-06-30', status: 'expired' }
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'Percentage',
    maxUses: '',
    expiry: ''
  });

  const handleDelete = (id) => {
    if (confirm('Delete this coupon code? It will no longer be valid for checkouts.')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newCoupon = {
      id: Date.now(),
      code: formData.code.toUpperCase(),
      discount: Number(formData.discount),
      type: formData.type,
      maxUses: Number(formData.maxUses) || 100,
      used: 0,
      expiry: formData.expiry || '2026-12-31',
      status: 'active'
    };
    setCoupons(prev => [...prev, newCoupon]);
    setIsOpen(false);
    setFormData({ code: '', discount: '', type: 'Percentage', maxUses: '', expiry: '' });
  };

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Promo & Coupon Codes</h2>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Configure discount promo codes to boost rentals bookings</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-neutral-800 rounded font-bold transition-all cursor-pointer shadow-xs"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>CREATE PROMO CODE</span>
        </button>
      </div>

      {/* Coupons table */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
            <HiOutlineTag className="w-4 h-4 text-neutral-400" />
            <span>Active Discount Codes ({coupons.length})</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-6 py-3">Promo Code</th>
                <th className="px-6 py-3">Discount value</th>
                <th className="px-6 py-3">Discount Type</th>
                <th className="px-6 py-3 text-center">Uses logged</th>
                <th className="px-6 py-3">Valid Until</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs font-semibold text-black">
              {coupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-extrabold text-black text-sm">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 font-extrabold">
                    {coupon.type === 'Percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-500 uppercase text-[10px]">
                    {coupon.type}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    {coupon.used} / {coupon.maxUses}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-400">
                    {coupon.expiry}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-xs ${
                      coupon.status === 'active' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-all cursor-pointer"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsOpen(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <form onSubmit={handleCreate} className="relative w-full max-w-sm bg-white border border-neutral-200 rounded p-6 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h4 className="font-extrabold text-sm uppercase text-black">Create Promo Code</h4>
                <button type="button" onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-black cursor-pointer">✕</button>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXTRA15"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-mono font-extrabold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-[9px] text-neutral-500">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                  >
                    <option>Percentage</option>
                    <option>Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-[9px] text-neutral-500">Value</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-[9px] text-neutral-500">Max Uses</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-[9px] text-neutral-500">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 border border-neutral-200 text-black hover:bg-neutral-50 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 rounded font-bold cursor-pointer"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
