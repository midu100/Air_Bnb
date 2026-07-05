import React, { useState } from 'react';

const CategoryFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const update = { ...prev, [name]: value };
      // Auto-generate slug from name if user changes name
      if (name === 'name' && !prev.slug) {
        update.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return update;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!thumbnailFile) {
      alert('Category thumbnail is required');
      return;
    }
    onSubmit({
      ...formData,
      thumbnail: thumbnailFile
    });
    setFormData({ name: '', slug: '', description: '' });
    setThumbnailFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded bg-white p-6 text-left shadow-xl transition-all border border-neutral-200 text-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">Add New Category</h3>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black cursor-pointer transition-colors">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Category Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Cabins, Beachfront"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Slug</label>
              <input
                type="text"
                name="slug"
                required
                placeholder="e.g. cabins"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Description</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Brief description of the properties listed here..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black resize-none"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Category Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-[10px] file:font-bold file:bg-neutral-900 file:text-white hover:file:bg-black file:cursor-pointer"
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
                Create Category
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
