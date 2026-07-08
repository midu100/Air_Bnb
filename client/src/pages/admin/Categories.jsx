import React from 'react';
import { useNavigate } from 'react-router';
import { HiOutlinePlus } from 'react-icons/hi';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetCategoriesQuery } from '../../store/api/categoryApi';

const Categories = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCategoriesQuery();
  const categories = data?.category || [];
  const loading = isLoading;

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Categories"
          des="Configure listing property categories"
        />
        <button
          onClick={() => navigate('/admin/categories/add')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded font-black tracking-wider uppercase transition-all cursor-pointer shadow-xs"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>ADD CATEGORY</span>
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm font-bold text-neutral-400">LOADING CATEGORIES...</div>
      ) : categories.length === 0 ? (
        <div className="py-10 text-center text-sm font-bold text-neutral-400">NO CATEGORIES FOUND.</div>
      ) : (
        /* Grid List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <div key={category._id} className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs hover:border-black transition-all flex flex-col justify-between group">
              <div className="aspect-video bg-neutral-100 overflow-hidden relative">
                <img
                  src={category.thumbnail}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black text-white font-mono px-2 py-0.5 rounded text-[9px] font-bold">
                  /{category.slug}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-black">{category.name}</h4>
                  <p className="text-neutral-500 leading-relaxed text-[11px]">
                    {category.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
