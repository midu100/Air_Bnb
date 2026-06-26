import React, { useRef } from 'react'
import PropertyCard from './PropertyCard'

const PropertyCarousel = ({ properties, title, subtitle }) => {
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 320
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {properties.map((property) => (
          <div key={property.id} className="snap-start min-w-[260px] sm:min-w-[290px] md:min-w-[310px] max-w-[340px] flex-shrink-0">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PropertyCarousel
