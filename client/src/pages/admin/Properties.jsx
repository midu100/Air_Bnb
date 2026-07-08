import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import AdminPropertyCard from '../../components/admin/AdminPropertyCard';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetHostPropertiesQuery, useGetPropertiesQuery, useDeletePropertyMutation } from '../../store/api/propertyApi';
import toast from 'react-hot-toast';

const Properties = () => {
  const navigate = useNavigate();
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch using RTK Query
  const { data: hostPropData, isLoading: hostPropLoading } = useGetHostPropertiesQuery();
  const { data: fallbackPropData, isLoading: fallbackPropLoading } = useGetPropertiesQuery({ limit: 100 }, { skip: !!hostPropData?.properties?.length });
  const [deleteProperty] = useDeletePropertyMutation();

  const properties = hostPropData?.properties?.length ? hostPropData.properties : (fallbackPropData?.properties || []);
  const loading = hostPropData?.properties?.length ? hostPropLoading : (hostPropLoading || fallbackPropLoading);

  const handleEditClick = (property) => {
    const id = property._id || property.id;
    navigate(`/admin/properties/edit/${id}`);
  };

  const handleDelete = async (propertyId) => {
    if (confirm('Are you sure you want to delete this property from inventory?')) {
      try {
        await deleteProperty(propertyId).unwrap();
        toast.success('Property deleted successfully.');
      } catch (error) {
        console.error(error);
        toast.error(error?.data?.message || 'Failed to delete property.');
      }
    }
  };

  const handleView = (property) => {
    alert(`Property details:\n\nTitle: ${property.title}\nType: ${property.propertyType || 'N/A'}\nPrice: $${property.pricePerNight || property.price}/night\nLocation: ${property.city ? `${property.city}, ${property.country}` : property.location}\nStatus: ${property.status || 'published'}`);
  };

  // Filter listings
  const filteredProperties = properties.filter(p => {
    const searchLower = search.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchLower) || 
                          (p.location || '').toLowerCase().includes(searchLower) ||
                          (p.city || '').toLowerCase().includes(searchLower) ||
                          (p.country || '').toLowerCase().includes(searchLower);
    const matchesType = typeFilter === 'All' || p.propertyType === typeFilter;
    const matchesStatus = statusFilter === 'All' || (p.status || 'published') === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminCommonHead
          name="Property Inventory"
          des="Manage, publish, and edit property listings"
        />
        <button
          onClick={() => navigate('/admin/properties/add')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-xs self-start"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>ADD NEW PROPERTY</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by title, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-400 text-[13px] text-black rounded px-3 py-3 pl-9 focus:outline-none focus:border-neutral-600"
          />
          <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] uppercase text-neutral-400">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-neutral-200 text-xs font-semibold px-2 py-1.5 rounded focus:outline-none focus:border-black"
            >
              <option value="All">All Types</option>
              {['Apartment', 'House', 'Villa', 'Cabin', 'Hotel', 'Room'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] uppercase text-neutral-400">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-neutral-200 text-xs font-semibold px-2 py-1.5 rounded focus:outline-none focus:border-black"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="py-16 text-center text-neutral-400 font-bold border border-dashed border-neutral-200 rounded">
          LOADING PROPERTY INVENTORY...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map(property => (
            <AdminPropertyCard
              key={property.id || property._id}
              property={property}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
          {filteredProperties.length === 0 && (
            <div className="col-span-full py-16 text-center text-neutral-400 font-bold border border-dashed border-neutral-200 rounded">
              No properties matching filters
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;
