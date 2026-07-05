import React from 'react';
import { useNavigate } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import PropertyForm from '../../components/admin/PropertyForm';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { propertyServices } from '../../api';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    if (!data.thumbnailFile) {
      toast.error("Thumbnail image is required!");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description);
      fd.append('propertyType', data.propertyType);
      fd.append('pricePerNight', data.pricePerNight);
      fd.append('cleaningFee', data.cleaningFee);
      fd.append('serviceFee', data.serviceFee);
      fd.append('maxGuests', data.maxGuests);
      fd.append('bedrooms', data.bedrooms);
      fd.append('beds', data.beds);
      fd.append('bathrooms', data.bathrooms);
      fd.append('address', data.address);
      fd.append('city', data.city);
      fd.append('state', data.state);
      fd.append('country', data.country);
      fd.append('zipCode', data.zipCode);
      fd.append('category', data.category);
      fd.append('status', data.status);
      fd.append('amenities', JSON.stringify(data.amenities));
      
      // Files
      fd.append('thumbnail', data.thumbnailFile);
      if (data.imagesFiles && data.imagesFiles.length > 0) {
        for (const img of data.imagesFiles) {
          fd.append('images', img);
        }
      }

      await propertyServices.create(fd);
      toast.success("Listing created successfully!");
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Failed to publish property listing.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Add New Property"
          des="Create a new rental listing in the properties directory"
        />
        <button
          onClick={() => navigate('/admin/properties')}
          className="px-4 py-2 border border-neutral-300 text-black hover:bg-neutral-50 rounded font-black uppercase tracking-wider text-xs cursor-pointer transition-colors"
        >
          Back to List
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-neutral-200 rounded p-8 shadow-xs">
        <PropertyForm onSubmit={handleSubmit} buttonText={loading ? "Publishing..." : "Publish Property Listing"} />
      </div>
    </div>
  );
};

export default AddProperty;
