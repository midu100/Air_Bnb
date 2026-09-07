import React from 'react';
import { useNavigate } from 'react-router';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import {
  useGetAdminDestinationsQuery,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
} from '../../store/api/destinationApi';
import { toast } from 'react-hot-toast';

const Destinations = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAdminDestinationsQuery();
  const destinations = data?.destinations || [];

  const [updateDestination] = useUpdateDestinationMutation();
  const [deleteDestination] = useDeleteDestinationMutation();

  // Hiding a destination rather than deleting it keeps the picture and the
  // wording for the next time that city is worth pushing
  const handleToggle = async (destination) => {
    try {
      const fd = new FormData();
      fd.append('isActive', destination.isActive ? 'false' : 'true');
      await updateDestination({ id: destination._id, formData: fd }).unwrap();
      toast.success(destination.isActive ? `${destination.city} hidden from the home page` : `${destination.city} is live`);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update destination');
    }
  };

  const handleDelete = async (destination) => {
    if (!window.confirm(`Delete ${destination.city}? This cannot be undone.`)) return;
    try {
      await deleteDestination(destination._id).unwrap();
      toast.success(`${destination.city} deleted`);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to delete destination');
    }
  };

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Trending Destinations"
          des="Cities pushed on the home page. The first two take the large tiles."
        />
        <button
          onClick={() => navigate('/admin/destinations/add')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-xs"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>ADD DESTINATION</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm font-bold text-neutral-400">LOADING DESTINATIONS...</div>
      ) : destinations.length === 0 ? (
        <div className="py-10 text-center text-sm font-bold text-neutral-400">
          NO DESTINATIONS YET. THE HOME PAGE SECTION STAYS HIDDEN UNTIL YOU ADD ONE.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination._id}
              className={`bg-white border rounded overflow-hidden shadow-xs transition-all flex flex-col group ${
                destination.isActive ? 'border-neutral-200 hover:border-black' : 'border-dashed border-neutral-300 opacity-60'
              }`}
            >
              <div className="aspect-video bg-neutral-100 overflow-hidden relative">
                <img
                  src={destination.image}
                  alt={destination.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black text-white font-mono px-2 py-0.5 rounded text-[9px] font-bold">
                  #{destination.order}
                </div>
                {!destination.isActive && (
                  <div className="absolute top-2 right-2 bg-neutral-700 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                    Hidden
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-black">
                    {destination.city} {destination.flag}
                  </h4>
                  <p className="text-neutral-500 text-[11px]">{destination.country}</p>
                  <p className="text-[11px] font-bold text-black">
                    {destination.propertyCount} live {destination.propertyCount === 1 ? 'listing' : 'listings'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => navigate(`/admin/destinations/edit/${destination._id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <HiOutlinePencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(destination)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    {destination.isActive ? <HiOutlineEyeOff className="w-3.5 h-3.5" /> : <HiOutlineEye className="w-3.5 h-3.5" />}
                    {destination.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => handleDelete(destination)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 text-red-600 rounded text-[10px] font-black uppercase tracking-wider hover:bg-red-50 cursor-pointer transition-colors ml-auto"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Destinations;
