import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetAmenitiesQuery, useUpdateAmenityMutation } from '../../store/api/amenityApi';
import { toast } from 'react-hot-toast';

const EditAmenity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  });

  const { data: amenitiesData, isLoading: fetchLoading } = useGetAmenitiesQuery();
  const [updateAmenity, { isLoading: loading }] = useUpdateAmenityMutation();

  useEffect(() => {
    if (amenitiesData?.amenities) {
      const found = amenitiesData.amenities.find(a => a._id === id);
      if (found) {
        setFormData({ name: found.name || '', icon: found.icon || '' });
      } else {
        toast.error('Error: Amenity not found');
        navigate('/admin/amenities');
      }
    }
  }, [amenitiesData, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAmenity({ id, amenityData: formData }).unwrap();
      toast.success(`Success: Amenity "${formData.name}" has been updated!`);
      navigate('/admin/amenities');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update amenity.');
    }
  };

  return (
    <div className="space-y-6 text-black text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Edit Amenity"
          des={`Modify amenity: ${formData.name}`}
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
              placeholder="e.g. Swimming Pool, Free WiFi"
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
              placeholder="e.g. HiOutlineWifi"
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

export default EditAmenity;
