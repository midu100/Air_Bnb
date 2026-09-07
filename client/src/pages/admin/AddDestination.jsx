import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useCreateDestinationMutation } from '../../store/api/destinationApi';
import { toast } from 'react-hot-toast';

const AddDestination = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    flag: '',
    slug: '',
    order: '0',
  });
  const [imageFile, setImageFile] = useState(null);
  const [createDestination, { isLoading: loading }] = useCreateDestinationMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const update = { ...prev, [name]: value };
      if (name === 'city' && !prev.slug) {
        update.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return update;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Destination image is required');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('city', formData.city);
      fd.append('country', formData.country);
      fd.append('flag', formData.flag);
      fd.append('slug', formData.slug);
      fd.append('order', formData.order);
      fd.append('image', imageFile);

      await createDestination(fd).unwrap();
      toast.success(`${formData.city} is now on the home page`);
      navigate('/admin/destinations');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to create destination.');
    }
  };

  return (
    <div className="space-y-6 text-black text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Add Destination"
          des="Push a city on the home page. It appears there the moment you save."
        />
        <button
          onClick={() => navigate('/admin/destinations')}
          className="px-4 py-2 border border-neutral-300 text-black hover:bg-neutral-50 rounded font-black uppercase tracking-wider text-xs cursor-pointer transition-colors"
        >
          Back to List
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-neutral-200 rounded p-8 shadow-xs max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">City</label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Dhaka"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
              />
              <p className="text-[10px] text-neutral-500">
                Must match the city on the listings, or the card will show no homes.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Country</label>
              <input
                type="text"
                name="country"
                required
                placeholder="e.g. Bangladesh"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Flag Emoji</label>
              <input
                type="text"
                name="flag"
                placeholder="🇧🇩"
                value={formData.flag}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Slug Path</label>
              <input
                type="text"
                name="slug"
                required
                placeholder="e.g. dhaka"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-mono font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
              />
              <p className="text-[10px] text-neutral-500">Lowest two get the large tiles.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Destination Photograph</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer transition-all text-[13px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded font-black uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed transition-all text-xs shadow-sm"
            >
              {loading ? 'Publishing...' : 'Publish Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDestination;
