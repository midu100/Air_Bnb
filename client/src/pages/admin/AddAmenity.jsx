import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { amenityServices } from '../../api';

const AddAmenity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await amenityServices.create(formData);
      alert(`Success: Amenity "${formData.name}" has been created!`);
      navigate('/admin/amenities');
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to create amenity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-black text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Add New Amenity"
          des="Create a new amenity option for rental listings"
        />
        <button
          onClick={() => navigate('/admin/amenities')}
          className="px-4 py-2 border border-neutral-300 text-black hover:bg-neutral-50 rounded font-black uppercase tracking-wider text-xs cursor-pointer transition-colors"
        >
          Back to List
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-neutral-200 rounded p-8 shadow-xs max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Amenity Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Swimming Pool, Free WiFi, Air Conditioning"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Icon Component Class</label>
            <input
              type="text"
              name="icon"
              placeholder="e.g. HiOutlineWifi, HiOutlineHome"
              value={formData.icon}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-mono font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
            <p className="text-[10px] text-neutral-400 font-semibold">React Icons component name from react-icons/hi library</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              className="px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded font-black uppercase tracking-widest cursor-pointer transition-all text-xs shadow-sm"
            >
              Create Amenity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAmenity;
