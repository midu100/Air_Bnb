import React from 'react';
import { useNavigate, useParams } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import PropertyForm from '../../components/admin/PropertyForm';
import { toast } from 'react-hot-toast';
import { useGetPropertyByIdQuery, useUpdatePropertyMutation } from '../../store/api/propertyApi';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch using RTK Query
  const { data: propertyData, isLoading: fetchLoading } = useGetPropertyByIdQuery(id);
  const [updateProperty, { isLoading: updateLoading }] = useUpdatePropertyMutation();
  const property = propertyData?.property;

  const handleSubmit = async (data) => {
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
      
      // Files (only if newly uploaded)
      if (data.thumbnailFile) {
        fd.append('thumbnail', data.thumbnailFile);
      }
      if (data.imagesFiles && data.imagesFiles.length > 0) {
        for (const img of data.imagesFiles) {
          fd.append('images', img);
        }
      }

      await updateProperty({ id, formData: fd }).unwrap();
      toast.success("Listing updated successfully!");
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error?.data?.message || "Failed to update property listing.";
      toast.error(msg);
    }
  };

  if (fetchLoading) {
    return (
      <div className="py-12 text-center text-neutral-400 font-bold">
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-12 text-center text-neutral-400 font-bold">
        Property not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Edit Property Listing"
          des={`Modify listing details for: ${property.title}`}
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
        <PropertyForm 
          initialData={property} 
          onSubmit={handleSubmit} 
          buttonText={updateLoading ? "Saving Details..." : "Save Property Details"} 
        />
      </div>
    </div>
  );
};

export default EditProperty;
