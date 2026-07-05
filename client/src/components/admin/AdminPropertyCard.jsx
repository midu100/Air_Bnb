import React from 'react';
import { HiOutlineTrash, HiOutlinePencil, HiOutlineEye, HiOutlineUserGroup } from 'react-icons/hi';

const AdminPropertyCard = ({ property, onEdit, onDelete, onView }) => {
  // Support both mock frontend data fields & backend schema fields
  const thumbnail = property.thumbnail || property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';
  const pricePerNight = property.pricePerNight || property.price || 0;
  const maxGuests = property.maxGuests || property.guests || 0;
  const avgRating = property.averageRating || property.rating || 0;
  const totalReviews = property.totalReviews || property.reviews || 0;
  const cityCountry = property.city && property.country
    ? `${property.city}, ${property.country}`
    : property.location || 'Unknown';
  const propertyType = property.propertyType || (property.tags && property.tags[1]) || 'Listing';
  const categoryName = property.category?.name || property.category || '';
  const status = property.status || 'published';

  const getStatusBadge = (st) => {
    switch (st) {
      case 'published':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-50 border border-green-200 text-green-700 rounded-sm">Published</span>;
      case 'draft':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-sm">Draft</span>;
      case 'unpublished':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 border border-red-200 text-red-700 rounded-sm">Unpublished</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-neutral-50 border border-neutral-200 text-neutral-600 rounded-sm">{st}</span>;
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs hover:border-black transition-all flex flex-col justify-between group">
      {/* Property Thumbnail */}
      <div className="relative aspect-video bg-neutral-100 overflow-hidden">
        <img
          src={thumbnail}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {getStatusBadge(status)}
          {property.isFeatured && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black text-white rounded-sm">Featured</span>
          )}
          {property.isGuestFavorite && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black text-white rounded-sm">★ Favorite</span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white px-2 py-1 rounded text-xs font-bold font-mono">
          ${pricePerNight} <span className="text-[10px] font-normal text-neutral-400">/ night</span>
        </div>
      </div>

      {/* Property Info */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              {propertyType} {categoryName && `• ${categoryName}`}
            </span>
            {avgRating > 0 && (
              <span className="text-xs font-bold text-black flex items-center gap-0.5">
                ★ {avgRating} <span className="text-[10px] text-neutral-400 font-normal">({totalReviews})</span>
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-black line-clamp-1 group-hover:underline">
            {property.title}
          </h4>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Specs & Address */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
          <span className="line-clamp-1">{cityCountry}</span>
          <div className="flex items-center gap-1.5 font-semibold text-black">
            <HiOutlineUserGroup className="w-3.5 h-3.5 text-neutral-400" />
            <span>{maxGuests} guests</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
        <button
          onClick={() => onView && onView(property)}
          className="text-neutral-500 hover:text-black p-1 hover:bg-neutral-200/50 rounded transition-all cursor-pointer"
          title="View Details"
        >
          <HiOutlineEye className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit && onEdit(property)}
            className="text-neutral-500 hover:text-black p-1 hover:bg-neutral-200/50 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Edit Property"
          >
            <HiOutlinePencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <div className="w-px h-3 bg-neutral-200"></div>
          <button
            onClick={() => onDelete && onDelete(property._id || property.id)}
            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Delete Property"
          >
            <HiOutlineTrash className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyCard;
