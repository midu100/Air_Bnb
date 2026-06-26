import React from 'react'
import { Link } from 'react-router'

const PropertyCard = ({ property }) => {
  const {
    id,
    title,
    location,
    price,
    rating,
    reviews,
    image,
    category,
    beds,
    baths,
    guests,
    isGuestFavorite
  } = property

  return (
    <div className="card-clean overflow-hidden group relative flex flex-col h-full">
      {/* Favorite badge */}
      {isGuestFavorite && (
        <span className="absolute top-3 left-3 z-10 bg-white/90 text-[#f0506e] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-[#f0506e] stroke-[#f0506e]" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Favorite
        </span>
      )}

      {/* Heart icon top-right (like smartLET) */}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-all group/heart cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover/heart:text-[#f0506e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="text-lg font-bold text-gray-900">${price}</span>
            <span className="text-xs text-gray-400 font-normal"> / night</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-gray-700">{rating}</span>
            <span className="text-[10px] text-gray-400">({reviews})</span>
          </div>
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#f0506e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </p>

        {/* Title */}
        <Link to={`/property/${id}`} className="cursor-pointer">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-[#f0506e] transition-colors line-clamp-1 mb-3">
            {title}
          </h3>
        </Link>

        {/* Specs (smartLET style — icon + text) */}
        <div className="flex gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
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
