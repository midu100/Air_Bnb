import React from 'react'

const DESTINATIONS = [
  {
    id: 1,
    city: 'Kuala Lumpur',
    flag: '🇲🇾',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop&q=80',
    properties: '1,240'
  },
  {
    id: 2,
    city: 'Dhaka',
    flag: '🇧🇩',
    image: 'https://images.unsplash.com/photo-1617817547332-e62e3a7b0861?w=800&h=500&fit=crop&q=80',
    properties: '980'
  },
  {
    id: 3,
    city: 'Bangkok',
    flag: '🇹🇭',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop&q=80',
    properties: '2,100'
  },
  {
    id: 4,
    city: 'Singapore',
    flag: '🇸🇬',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=500&fit=crop&q=80',
    properties: '1,560'
  },
  {
    id: 5,
    city: 'Dubai',
    flag: '🇦🇪',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
    properties: '1,890'
  },
  {
    id: 6,
    city: 'Istanbul',
    flag: '🇹🇷',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=500&fit=crop&q=80',
    properties: '1,340'
  }
]

const TrendingDestinations = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
          Trending destinations
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Most popular choices for travelers from Bangladesh
        </p>
      </div>

      {/* Destinations Grid — 2 large + 3 small like smartLET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {DESTINATIONS.slice(0, 2).map((dest) => (
          <div
            key={dest.id}
            className="group relative h-[260px] md:h-[300px] rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={dest.image}
              alt={dest.city}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300" />
            
            {/* City name with flag */}
            <div className="absolute top-5 left-5 z-10">
              <h3 className="text-xl md:text-2xl font-display font-bold text-white drop-shadow-lg flex items-center gap-2">
                {dest.city} <span className="text-xl">{dest.flag}</span>
              </h3>
            </div>

            {/* Property count badge */}
            <div className="absolute bottom-5 left-5 z-10">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                {dest.properties} properties
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: 3 smaller cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {DESTINATIONS.slice(2, 5).map((dest) => (
          <div
            key={dest.id}
            className="group relative h-[200px] md:h-[220px] rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={dest.image}
              alt={dest.city}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300" />
            
            {/* City name with flag */}
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-lg font-display font-bold text-white drop-shadow-lg flex items-center gap-2">
                {dest.city} <span className="text-base">{dest.flag}</span>
              </h3>
            </div>

            {/* Property count badge */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                {dest.properties} properties
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TrendingDestinations
