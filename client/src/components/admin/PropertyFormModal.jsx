import React, { useState, useEffect } from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { MOCK_ADMIN_CATEGORIES, MOCK_ADMIN_AMENITIES } from '../../data/adminMockData';

const PropertyFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
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

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        propertyType: initialData.propertyType || 'Apartment',
        pricePerNight: initialData.pricePerNight || '',
        cleaningFee: initialData.cleaningFee || 0,
        serviceFee: initialData.serviceFee || 0,
        maxGuests: initialData.maxGuests || 2,
        bedrooms: initialData.bedrooms || 1,
        beds: initialData.beds || 1,
        bathrooms: initialData.bathrooms || 1,
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        zipCode: initialData.zipCode || '',
        category: initialData.category?._id || initialData.category || '',
        status: initialData.status || 'draft',
        amenities: initialData.amenities?.map(a => a._id || a) || []
      });
    } else {
      setFormData({
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
        category: MOCK_ADMIN_CATEGORIES[0]?._id || '',
        status: 'draft',
        amenities: []
      });
    }
    setThumbnailFile(null);
    setImagesFiles([]);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      {/* Modal contents */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded bg-white p-8 text-left shadow-xl transition-all border border-neutral-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-neutral-200">
            <h3 className="text-xl font-black uppercase tracking-tight text-black">
              {initialData ? 'Edit Property Listing' : 'List New Property'}
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-black cursor-pointer transition-colors font-bold text-lg">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar text-sm">
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
                  className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                rows="4"
                placeholder="Describe your beautiful home..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
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
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Cleaning Fee ($)</label>
                <input
                  type="number"
                  name="cleaningFee"
                  value={formData.cleaningFee}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Service Fee ($)</label>
                <input
                  type="number"
                  name="serviceFee"
                  value={formData.serviceFee}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Beds</label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                    className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                    className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                    className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                    className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                    className="w-full bg-white border border-neutral-300 text-black font-mono font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                >
                  {MOCK_ADMIN_CATEGORIES.map(cat => (
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
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                  className="w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer transition-all"
                />
              </div>
            </div>

            {/* Amenities select */}
            <div className="space-y-3">
              <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-5 border border-neutral-200 rounded">
                {MOCK_ADMIN_AMENITIES.map(amenity => {
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
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-neutral-300 text-black hover:bg-neutral-50 rounded font-black uppercase tracking-widest cursor-pointer transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 rounded font-black uppercase tracking-widest cursor-pointer transition-all text-xs shadow-sm"
              >
                {initialData ? 'Save Changes' : 'Publish Property'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default PropertyFormModal;
