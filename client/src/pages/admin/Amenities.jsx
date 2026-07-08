import React from 'react';
import { useNavigate } from 'react-router';
import { HiOutlinePlus, HiOutlineSparkles, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetAmenitiesQuery, useDeleteAmenityMutation } from '../../store/api/amenityApi';
import { toast } from 'react-hot-toast';

const Amenities = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAmenitiesQuery();
  const [deleteAmenity] = useDeleteAmenityMutation();

  const amenities = data?.amenities || [];
  const loading = isLoading;

  const handleDelete = async (id) => {
    if (confirm('Delete this amenity? This will remove it from all listings.')) {
      try {
        await deleteAmenity(id).unwrap();
        toast.success('Amenity deleted successfully.');
      } catch (error) {
        console.error(error);
        toast.error(error?.data?.message || 'Failed to delete amenity.');
      }
    }
  };

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Property Amenities"
          des="Configure listing amenities and icons"
        />
        <button
          onClick={() => navigate('/admin/amenities/add')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-xs"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>ADD AMENITY</span>
        </button>
      </div>

      {/* Table view */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
            <HiOutlineSparkles className="w-4 h-4 text-neutral-400" />
            <span>Amenity Directory</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-sm font-bold text-neutral-400">LOADING AMENITIES...</div>
          ) : amenities.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-neutral-400">NO AMENITIES FOUND.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Amenity Name</th>
                  <th className="px-6 py-3">Icon Component Class</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs font-semibold">
                {amenities.map(amenity => (
                  <tr key={amenity._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-neutral-400 text-[10px]">
                      {amenity._id}
                    </td>
                    <td className="px-6 py-4 text-black">
                      {amenity.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500 text-[10px]">
                      {amenity.icon}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/amenities/edit/${amenity._id}`)}
                          className="text-neutral-500 hover:text-black p-1 hover:bg-neutral-100 rounded transition-all cursor-pointer flex items-center gap-1"
                        >
                          <HiOutlinePencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <div className="w-px h-3 bg-neutral-200"></div>
                        <button
                          onClick={() => handleDelete(amenity._id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all cursor-pointer flex items-center gap-1"
                        >
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Amenities;
