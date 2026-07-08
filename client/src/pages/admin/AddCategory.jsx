import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useCreateCategoryMutation } from '../../store/api/categoryApi';
import { toast } from 'react-hot-toast';

const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [createCategory, { isLoading: loading }] = useCreateCategoryMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const update = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        update.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return update;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!thumbnailFile) {
      toast.error('Category thumbnail is required');
      return;
    }
    
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('slug', formData.slug);
      fd.append('description', formData.description);
      fd.append('thumbnail', thumbnailFile);

      await createCategory(fd).unwrap();
      toast.success(`Category "${formData.name}" has been created!`);
      navigate('/admin/categories');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to create category. Please check your details.');
    }
  };

  return (
    <div className="space-y-6 text-black text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Add New Category"
          des="Create a new listing category to organize rental property inventory"
        />
        <button
          onClick={() => navigate('/admin/categories')}
          className="px-4 py-2 border border-neutral-300 text-black hover:bg-neutral-50 rounded font-black uppercase tracking-wider text-xs cursor-pointer transition-colors"
        >
          Back to List
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-neutral-200 rounded p-8 shadow-xs max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Category Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Cabins, Beachfront, Villas"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Slug Path</label>
            <input
              type="text"
              name="slug"
              required
              placeholder="e.g. cabins"
              value={formData.slug}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-mono font-bold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Describe what kind of homes belong in this category..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-3 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none text-[13px]"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[11px] text-neutral-800 tracking-wider">Category Image Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer transition-all text-[13px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded font-black uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed transition-all text-xs shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Category Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
