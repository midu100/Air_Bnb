import React, { useState, useEffect } from 'react';

const AmenityFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'FaWifi'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        icon: initialData.icon || 'FaWifi'
      });
    } else {
      setFormData({
        name: '',
        icon: 'FaWifi'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm transform overflow-hidden rounded bg-white p-6 text-left shadow-xl transition-all border border-neutral-200 text-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
              {initialData ? 'Edit Amenity' : 'Add New Amenity'}
            </h3>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black cursor-pointer transition-colors">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Amenity Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Wifi, Swimming Pool, Parking"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Icon CSS/React class</label>
              <input
                type="text"
                name="icon"
                required
                placeholder="e.g. FaWifi, FaCar"
                value={formData.icon}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-mono font-semibold"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-neutral-200 text-black hover:bg-neutral-50 rounded font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 rounded font-bold cursor-pointer"
              >
                {initialData ? 'Save Changes' : 'Create Amenity'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AmenityFormModal;
