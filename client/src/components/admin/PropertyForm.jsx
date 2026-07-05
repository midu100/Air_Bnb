import React, { useState, useEffect } from 'react';
import { categoryServices, amenityServices } from '../../api';

const PropertyForm = ({ initialData, onSubmit, buttonText = 'Publish Property' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'Apartment',
    pricePerNight: '',
    cleaningFee: 0,
    serviceFee: 0,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    category: '',
    status: 'draft',
    amenities: []
  });

  const [categories, setCategories] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await categoryServices.getAll();
        if (catRes?.category) {
          setCategories(catRes.category);
          if (catRes.category.length > 0 && !formData.category && !initialData) {
            setFormData(prev => ({ ...prev, category: catRes.category[0]._id }));
          }
        }
        const amRes = await amenityServices.getAll();
        if (amRes?.amenities) {
          setAllAmenities(amRes.amenities);
        }
      } catch (err) {
        console.error("Error loading form dependencies:", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        propertyType: initialData.propertyType || 'Apartment',
        pricePerNight: initialData.pricePerNight || initialData.price || '',
        cleaningFee: initialData.cleaningFee || 0,
        serviceFee: initialData.serviceFee || 0,
        maxGuests: initialData.maxGuests || initialData.guests || 2,
        bedrooms: initialData.bedrooms || 1,
        beds: initialData.beds || 1,
        bathrooms: initialData.bathrooms || 1,
        address: initialData.address || '',
        city: initialData.city || initialData.location?.split(',')[0]?.trim() || '',
        state: initialData.state || '',
        country: initialData.country || initialData.location?.split(',')[1]?.trim() || '',
        zipCode: initialData.zipCode || '',
        category: initialData.category?._id || initialData.category || '',
        status: initialData.status || 'published',
        amenities: initialData.amenities?.map(a => a._id || a) || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => {
      const active = prev.amenities.includes(amenityId);
      return {
        ...prev,
        amenities: active 
          ? prev.amenities.filter(id => id !== amenityId)
          : [...prev.amenities, amenityId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      thumbnailFile,
      imagesFiles
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-sm">
      {/* Title & Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Property Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Minimalist A-Frame Cabin with Views"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Property Type</label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          >
            {['Apartment', 'House', 'Villa', 'Cabin', 'Hotel', 'Room'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Description</label>
        <textarea
          name="description"
          required
          rows="5"
          placeholder="Describe your beautiful home..."
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none text-[13px]"
        ></textarea>
      </div>

      {/* Price & Fees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Price / Night ($)</label>
          <input
            type="number"
            name="pricePerNight"
            required
            placeholder="120"
            value={formData.pricePerNight}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Cleaning Fee ($)</label>
          <input
            type="number"
            name="cleaningFee"
            value={formData.cleaningFee}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Service Fee ($)</label>
          <input
            type="number"
            name="serviceFee"
            value={formData.serviceFee}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
      </div>

      {/* Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Max Guests</label>
          <input
            type="number"
            name="maxGuests"
            value={formData.maxGuests}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Beds</label>
          <input
            type="number"
            name="beds"
            value={formData.beds}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          />
        </div>
      </div>

      {/* Location details */}
      <div className="space-y-4">
        <h4 className="font-black uppercase tracking-wider text-black border-b border-neutral-200 pb-2">Address & Location</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Street Address</label>
            <input
              type="text"
              name="address"
              required
              placeholder="123 Ocean Blvd"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">City</label>
            <input
              type="text"
              name="city"
              required
              placeholder="Malibu"
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">State / Province</label>
            <input
              type="text"
              name="state"
              placeholder="California"
              value={formData.state}
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
              placeholder="United States"
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Zip / Postal Code</label>
            <input
              type="text"
              name="zipCode"
              placeholder="90265"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-mono font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Category, Status & File uploads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          >
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Listing Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            className="w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer transition-all text-[13px]"
          />
        </div>
      </div>

      {/* Amenities select */}
      <div className="space-y-3">
        <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Amenities</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-5 border border-neutral-200 rounded">
          {allAmenities.map(amenity => {
            const active = formData.amenities.includes(amenity._id);
            return (
              <label
                key={amenity._id}
                className={`flex items-center gap-2.5 px-4 py-3.5 border rounded cursor-pointer transition-all ${
                  active 
                    ? 'border-black bg-black text-white font-black' 
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 font-bold'
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleAmenityToggle(amenity._id)}
                  className="hidden"
                />
                <span className="text-[11px] uppercase tracking-wider select-none">{amenity.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
        <button
          type="submit"
          className="px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded font-black uppercase tracking-widest cursor-pointer transition-all text-xs shadow-sm"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
