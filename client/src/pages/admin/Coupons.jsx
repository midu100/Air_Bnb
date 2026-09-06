import React, { useState } from 'react';
import { HiOutlinePlus, HiOutlineTag, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import {
  useGetMyCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '../../store/api/couponApi';
import { useGetHostPropertiesQuery } from '../../store/api/propertyApi';

const HORIZONS = [
  { id: 'short', label: 'Nightly' },
  { id: 'mid', label: 'Monthly' },
  { id: 'long', label: 'Lease' },
];

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  value: '',
  maxDiscount: '',
  minNights: 0,
  minAmount: 0,
  validFrom: '',
  validUntil: '',
  maxUses: 0,
  maxUsesPerUser: 1,
  rentalTypes: [],
  properties: [],
};

const Coupons = () => {
  const { data, isLoading } = useGetMyCouponsQuery();
  const { data: propData } = useGetHostPropertiesQuery();
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const coupons = data?.coupons || [];
  const properties = propData?.properties || [];

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInList = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return toast.error('A code is required');
    if (!formData.value) return toast.error('A discount value is required');

    try {
      await createCoupon({
        ...formData,
        value: Number(formData.value),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        minNights: Number(formData.minNights) || 0,
        minAmount: Number(formData.minAmount) || 0,
        maxUses: Number(formData.maxUses) || 0,
        maxUsesPerUser: Number(formData.maxUsesPerUser),
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
      }).unwrap();
      toast.success('Coupon created');
      setFormData(emptyForm);
      setIsOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not create that coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await updateCoupon({ id: coupon._id, couponData: { isActive: !coupon.isActive } }).unwrap();
      toast.success(coupon.isActive ? 'Coupon paused' : 'Coupon activated');
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not update that coupon');
    }
  };

  const handleDelete = async (coupon) => {
    if (!confirm(`Delete ${coupon.code}? Bookings that already used it keep their discount.`)) return;
    try {
      await deleteCoupon(coupon._id).unwrap();
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not delete that coupon');
    }
  };

  const inputClass = 'w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2.5 focus:outline-none focus:border-black text-[13px]';
  const labelClass = 'block font-black uppercase text-[10px] text-neutral-600 tracking-wider mb-1';

  const usage = (coupon) => (coupon.maxUses > 0 ? `${coupon.usedCount}/${coupon.maxUses}` : `${coupon.usedCount}/∞`);

  const isExpired = (coupon) => coupon.validUntil && new Date(coupon.validUntil) < new Date();

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead name="Coupons" des="Discount codes guests can apply at checkout" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded font-black uppercase tracking-wider text-xs cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" /> {isOpen ? 'Close' : 'New coupon'}
        </button>
      </div>

      {/* ====== Create ====== */}
      {isOpen && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Code *</label>
              <input name="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="WELCOME20" className={`${inputClass} uppercase`} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange} className={inputClass}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value *</label>
              <input type="number" name="value" min="0" value={formData.value} onChange={handleChange} placeholder={formData.discountType === 'percentage' ? '20' : '50'} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max discount ($)</label>
              <input type="number" name="maxDiscount" min="0" value={formData.maxDiscount} onChange={handleChange} placeholder="Cap" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <input name="description" value={formData.description} onChange={handleChange} placeholder="20% off your first stay" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className={labelClass}>Min nights</label>
              <input type="number" name="minNights" min="0" value={formData.minNights} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Min spend ($)</label>
              <input type="number" name="minAmount" min="0" value={formData.minAmount} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valid from</label>
              <input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valid until</label>
              <input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Total uses</label>
              <input type="number" name="maxUses" min="0" value={formData.maxUses} onChange={handleChange} placeholder="0 = ∞" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Per guest</label>
              <input type="number" name="maxUsesPerUser" min="0" value={formData.maxUsesPerUser} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Applies to (leave empty for all)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {HORIZONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleInList('rentalTypes', item.id)}
                  className={`px-3 py-1.5 rounded border font-black uppercase text-[10px] tracking-wider cursor-pointer transition-all ${
                    formData.rentalTypes.includes(item.id)
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {properties.length > 0 && (
            <div>
              <label className={labelClass}>Limit to properties (leave empty for all)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {properties.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => toggleInList('properties', item._id)}
                    className={`px-3 py-1.5 rounded border font-bold text-[11px] cursor-pointer transition-all ${
                      formData.properties.includes(item._id)
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 bg-black text-white rounded font-black uppercase tracking-wider text-[11px] cursor-pointer hover:bg-neutral-800 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create coupon'}
          </button>
        </form>
      )}

      {/* ====== List ====== */}
      {isLoading ? (
        <p className="text-[13px] text-neutral-400 font-semibold">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded p-12 text-center shadow-xs">
          <HiOutlineTag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="font-black uppercase text-xs tracking-wider">No coupons yet</p>
          <p className="text-[13px] text-neutral-400 font-semibold mt-1">
            Create one and guests can apply it on the booking page.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-[13px] min-width-full" style={{ minWidth: 760 }}>
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {['Code', 'Discount', 'Conditions', 'Used', 'Valid', 'Status', ''].map((h) => (
                  <th key={h} className="text-left font-black uppercase text-[10px] tracking-wider text-neutral-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-black">{coupon.code}</span>
                    {coupon.description && <p className="text-[11px] text-neutral-400 font-semibold">{coupon.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {coupon.discountType === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                    {coupon.maxDiscount > 0 && <span className="text-[11px] text-neutral-400 font-semibold"> max ${coupon.maxDiscount}</span>}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-neutral-500 font-semibold">
                    {coupon.minNights > 0 && <span>{coupon.minNights}+ nights </span>}
                    {coupon.minAmount > 0 && <span>${coupon.minAmount}+ spend </span>}
                    {coupon.rentalTypes?.length > 0 && <span>{coupon.rentalTypes.join(', ')} </span>}
                    {coupon.properties?.length > 0 && <span>{coupon.properties.length} propert{coupon.properties.length === 1 ? 'y' : 'ies'}</span>}
                    {!coupon.minNights && !coupon.minAmount && !coupon.rentalTypes?.length && !coupon.properties?.length && <span>Any stay</span>}
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums">{usage(coupon)}</td>
                  <td className="px-4 py-3 text-[11px] text-neutral-500 font-semibold">
                    {coupon.validUntil ? `until ${new Date(coupon.validUntil).toLocaleDateString()}` : 'no end date'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-2.5 py-1 rounded border font-black uppercase text-[9px] tracking-wider cursor-pointer transition-all ${
                        isExpired(coupon)
                          ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          : coupon.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isExpired(coupon) ? 'expired' : coupon.isActive ? 'active' : 'paused'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="text-neutral-400 hover:text-red-600 cursor-pointer bg-transparent border-none transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Coupons;
