import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetAdminDestinationsQuery, useUpdateDestinationMutation } from '../../store/api/destinationApi';
import { toast } from 'react-hot-toast';

const EditDestination = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading: fetching } = useGetAdminDestinationsQuery();
  const destination = (data?.destinations || []).find(item => item._id === id);

  const [formData, setFormData] = useState({
    city: '',
    country: '',
    flag: '',
    slug: '',
    order: '0',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [updateDestination, { isLoading: loading }] = useUpdateDestinationMutation();

  // The list arrives after the first render, so the form fills itself in once
  useEffect(() => {
    if (!destination) return;
    setFormData({
      city: destination.city || '',
      country: destination.country || '',
      flag: destination.flag || '',
      slug: destination.slug || '',
      order: String(destination.order ?? 0),
      isActive: destination.isActive,
    });
  }, [destination]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('city', formData.city);
      fd.append('country', formData.country);
      fd.append('flag', formData.flag);
      fd.append('slug', formData.slug);
      fd.append('order', formData.order);
      fd.append('isActive', formData.isActive ? 'true' : 'false');
      // Only send a picture when one was actually picked, so saving a name
      // change does not cost another upload
      if (imageFile) fd.append('image', imageFile);

      await updateDestination({ id, formData: fd }).unwrap();
      toast.success(`${formData.city} updated`);
      navigate('/admin/destinations');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update destination.');
    }
  };

  if (fetching) {
    return <div className="py-10 text-center text-sm font-bold text-neutral-400">LOADING DESTINATION...</div>;
  }

  if (!destination) {
    return <div className="py-10 text-center text-sm font-bold text-neutral-400">DESTINATION NOT FOUND.</div>;
  }

  return (
    <div className="space-y-6 text-black text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name={`Edit ${destination.city}`}
          des="Changes reach the home page as soon as you save"
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
          <div className="flex items-center gap-4">
            <img src={destination.image} alt={destination.city} className="h-20 w-32 object-cover rounded border border-neutral-200" />
            <div className="text-[11px] text-neutral-500">
              <p className="font-black uppercase tracking-wider text-neutral-800">Current photograph</p>
              <p className="mt-1">{destination.propertyCount} live {destination.propertyCount === 1 ? 'listing' : 'listings'} in this city</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">City</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Country</label>
              <input
                type="text"
                name="country"
                required
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
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Replace Photograph</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer transition-all text-[13px]"
            />
            <p className="text-[10px] text-neutral-500">Leave empty to keep the current one.</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 cursor-pointer accent-black"
            />
            <span className="font-black uppercase text-[11px] text-neutral-800 tracking-wider">
              Show on the home page
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded font-black uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed transition-all text-xs shadow-sm"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDestination;
