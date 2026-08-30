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
    status: 'published',
    amenities: [],
    // ====== Rental horizons this listing is offered on
    rentalTypes: ['short'],
    monthlyRate: '',
    longTermRent: '',
    minStayNights: 1,
    maxStayNights: 29,
    minTermMonths: 12,
    securityDeposit: 0,
    utilitiesIncluded: false,
    furnished: 'furnished',
    discountWeekly: 0,
    discountMonthly: 0,
    cancellationPolicy: 'moderate',
    taxRatePercent: 0,
    currency: 'USD',
    dedicatedDesk: false,
    monitor: false,
    internetSpeedMbps: '',
    laundryInUnit: false
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
        rentalTypes: initialData.rentalTypes?.length ? initialData.rentalTypes : ['short'],
        monthlyRate: initialData.monthlyRate || '',
        longTermRent: initialData.longTermRent || '',
        minStayNights: initialData.minStayNights ?? 1,
        maxStayNights: initialData.maxStayNights ?? 29,
        minTermMonths: initialData.minTermMonths ?? 12,
        securityDeposit: initialData.securityDeposit ?? 0,
        utilitiesIncluded: initialData.utilitiesIncluded ?? false,
        furnished: initialData.furnished || 'furnished',
        discountWeekly: initialData.discounts?.weekly ?? 0,
        discountMonthly: initialData.discounts?.monthly ?? 0,
        cancellationPolicy: initialData.cancellationPolicy || 'moderate',
        taxRatePercent: initialData.taxRatePercent ?? 0,
        currency: initialData.currency || 'USD',
        dedicatedDesk: initialData.workspace?.dedicatedDesk ?? false,
        monitor: initialData.workspace?.monitor ?? false,
        internetSpeedMbps: initialData.workspace?.internetSpeedMbps || '',
        laundryInUnit: initialData.workspace?.laundryInUnit ?? false,
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

  const handleRentalTypeToggle = (type) => {
    setFormData(prev => {
      const active = prev.rentalTypes.includes(type);
      // A listing must always keep at least one horizon
      if (active && prev.rentalTypes.length === 1) return prev;
      return {
        ...prev,
        rentalTypes: active
          ? prev.rentalTypes.filter(item => item !== type)
          : [...prev.rentalTypes, type]
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

      {/* ====== Rental Horizons ====== */}
      <div className="space-y-4 border border-neutral-200 rounded p-5 bg-neutral-50/50">
        <div>
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Rental Horizons</label>
          <p className="text-[11px] text-neutral-500 font-semibold mt-1">Pick every term this property is offered on. Each one needs its own rate below.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'short', label: 'Short-term', hint: '1-29 nights' },
            { id: 'mid', label: 'Mid-term', hint: '1-11 months' },
            { id: 'long', label: 'Long-term', hint: '12+ months' },
          ].map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleRentalTypeToggle(item.id)}
              className={`px-4 py-3 rounded border text-left transition-all cursor-pointer ${
                formData.rentalTypes.includes(item.id)
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
              }`}
            >
              <span className="block font-black uppercase text-[11px] tracking-wider">{item.label}</span>
              <span className="block text-[10px] opacity-70 font-bold">{item.hint}</span>
            </button>
          ))}
        </div>

        {formData.rentalTypes.includes('short') && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Min Nights</label>
              <input type="number" name="minStayNights" min="1" value={formData.minStayNights} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Max Nights</label>
              <input type="number" name="maxStayNights" min="1" value={formData.maxStayNights} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Weekly Disc %</label>
              <input type="number" name="discountWeekly" min="0" max="90" value={formData.discountWeekly} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Monthly Disc %</label>
              <input type="number" name="discountMonthly" min="0" max="90" value={formData.discountMonthly} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
          </div>
        )}

        {formData.rentalTypes.includes('mid') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Monthly Rate ($) *</label>
              <input type="number" name="monthlyRate" min="0" value={formData.monthlyRate} onChange={handleChange} placeholder="e.g. 3200"
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Security Deposit ($)</label>
              <input type="number" name="securityDeposit" min="0" value={formData.securityDeposit} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
          </div>
        )}

        {formData.rentalTypes.includes('long') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Monthly Rent ($) *</label>
              <input type="number" name="longTermRent" min="0" value={formData.longTermRent} onChange={handleChange} placeholder="e.g. 2400"
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Min Term (months)</label>
              <input type="number" name="minTermMonths" min="1" value={formData.minTermMonths} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
          </div>
        )}

        {(formData.rentalTypes.includes('mid') || formData.rentalTypes.includes('long')) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Furnishing</label>
              <select name="furnished" value={formData.furnished} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]">
                <option value="furnished">Furnished</option>
                <option value="semi">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="utilitiesIncluded" checked={formData.utilitiesIncluded}
                  onChange={(e) => setFormData(prev => ({ ...prev, utilitiesIncluded: e.target.checked }))}
                  className="w-4 h-4 accent-black cursor-pointer" />
                <span className="font-black uppercase text-[10px] text-neutral-600 tracking-wider">Utilities included</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ====== Policy, tax and currency ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Cancellation Policy</label>
          <select name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black text-[13px]">
            <option value="flexible">Flexible - full refund up to 1 day before</option>
            <option value="moderate">Moderate - full refund up to 5 days before</option>
            <option value="strict">Strict - full refund up to 14 days before</option>
            <option value="non_refundable">Non-refundable</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Occupancy Tax %</label>
          <input type="number" name="taxRatePercent" min="0" max="50" step="0.5" value={formData.taxRatePercent} onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black text-[13px]" />
        </div>
        <div className="space-y-2">
          <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Currency</label>
          <select name="currency" value={formData.currency} onChange={handleChange}
            className="w-full bg-white border border-neutral-300 text-black font-bold rounded px-4 py-3 focus:outline-none focus:border-black text-[13px]">
            {['USD','EUR','GBP','BDT','AED','INR','CAD','AUD','SGD','JPY'].map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ====== Workspace - what decides a multi month stay ====== */}
      {(formData.rentalTypes.includes('mid') || formData.rentalTypes.includes('long')) && (
        <div className="space-y-4 border border-neutral-200 rounded p-5 bg-neutral-50/50">
          <div>
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Workspace</label>
            <p className="text-[11px] text-neutral-500 font-semibold mt-1">Remote workers filter on these before anything else.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'dedicatedDesk', label: 'Dedicated desk' },
              { name: 'monitor', label: 'Monitor' },
              { name: 'laundryInUnit', label: 'Laundry in unit' },
            ].map(item => (
              <label key={item.name} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData[item.name]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [item.name]: e.target.checked }))}
                  className="w-4 h-4 accent-black cursor-pointer" />
                <span className="font-black uppercase text-[10px] text-neutral-600 tracking-wider">{item.label}</span>
              </label>
            ))}
            <div className="space-y-1.5">
              <label className="block font-black uppercase text-[10px] text-neutral-600 tracking-wider">Wifi Mbps</label>
              <input type="number" name="internetSpeedMbps" min="0" value={formData.internetSpeedMbps} onChange={handleChange}
                className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2 focus:outline-none focus:border-black text-[13px]" />
            </div>
          </div>
        </div>
      )}

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
