import React from 'react'
import { Link } from 'react-router'

// ====== Each horizon quotes a different number against a different unit
const PRICE_BY_TYPE = {
  short: { field: "pricePerNight", unit: "night" },
  mid: { field: "monthlyRate", unit: "month" },
  long: { field: "longTermRent", unit: "month" },
};

const PropertyCard = ({ property, rentalType = "short" }) => {
  const id = property._id || property.id;
  const title = property.title;
  const location = property.city && property.country ? `${property.city}, ${property.country}` : (property.location || "");

  const priceMode = PRICE_BY_TYPE[rentalType] || PRICE_BY_TYPE.short;
  const priceUnit = priceMode.unit;
  const price = property[priceMode.field] || property.pricePerNight || property.price || 0;
  const rating = property.averageRating !== undefined ? property.averageRating : (property.rating || 0);
  const reviews = property.totalReviews !== undefined ? property.totalReviews : (property.reviews || 0);
  const image = property.thumbnail || property.image || "https://picsum.photos/400/300";
  const beds = property.beds || 1;
  const baths = property.bathrooms || property.baths || 1;
  const guests = property.maxGuests || property.guests || 2;
  const isGuestFavorite = property.isGuestFavorite || property.isFeatured;

  return (
    <div className="group relative border border-ink-line bg-ink-soft transition-colors duration-500 hover:border-brass/40 overflow-hidden group relative flex flex-col h-full">
      {/* Favorite badge */}
      {isGuestFavorite && (
        <span className="absolute top-3 left-3 z-10 bg-ink/85 text-brass text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-brass stroke-brass" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Favorite
        </span>
      )}

      {/* Heart icon top-right (like smartLET) */}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-ink/80 hover:bg-ink-soft flex items-center justify-center shadow-sm transition-all group/heart cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ivory/40 group-hover/heart:text-brass transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Image */}
      <Link to={`/property/${id}`} className="block overflow-hidden relative aspect-[4/3] cursor-pointer">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Price Row */}
        <div className="flex justify-between items-baseline mb-1.5">
          <div>
            <span className="text-lg font-bold text-ivory">${price}</span>
            <span className="text-xs text-ivory/40 font-normal"> / {priceUnit}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-brass text-brass" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-gray-700">{rating}</span>
            <span className="text-[10px] text-ivory/40">({reviews})</span>
          </div>
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-ivory/55 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </p>

        {/* Title */}
        <Link to={`/property/${id}`} className="cursor-pointer">
          <h3 className="font-semibold text-ivory text-sm leading-snug group-hover:text-brass transition-colors line-clamp-1 mb-3">
            {title}
          </h3>
        </Link>

        {/* Specs (smartLET style — icon + text) */}
        <div className="flex gap-4 text-xs text-ivory/40 mt-auto pt-3 border-t border-ink-line">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {guests} Guests
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {beds} Beds
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {baths} Baths
          </span>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard
