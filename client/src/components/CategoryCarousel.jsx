import React, { useRef, useState, useEffect } from 'react'
import CategoryCard from './CategoryCard'

const CATEGORIES = [
  {
    id: 'cabins',
    name: 'Hotels',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=450&fit=crop&q=80',
    count: '2,340',
    description: 'Premium hotel stays'
  },
  {
    id: 'beachfront',
    name: 'Apartments',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=450&fit=crop&q=80',
    count: '1,820',
    description: 'Modern apartments'
  },
  {
    id: 'mansions',
    name: 'Resorts',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=450&fit=crop&q=80',
    count: '980',
    description: 'Luxury resorts'
  },
  {
    id: 'pools',
    name: 'Villas',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=450&fit=crop&q=80',
    count: '1,560',
    description: 'Private villas'
  },
  {
    id: 'off-grid',
    name: 'Cottages',
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&h=450&fit=crop&q=80',
    count: '640',
    description: 'Cozy cottages'
  },
  {
    id: 'design',
    name: 'Guest Houses',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=450&fit=crop&q=80',
    count: '1,120',
    description: 'Charming guest houses'
  },
  {
    id: 'lofts',
    name: 'Hostels',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=450&fit=crop&q=80',
    count: '890',
    description: 'Budget hostels'
  },
  {
    id: 'castles',
    name: 'Cabins',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=450&fit=crop&q=80',
    count: '420',
    description: 'Rustic cabins'
  }
]

const CategoryCarousel = ({ activeCategory, onSelectCategory }) => {
  const containerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [])

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
            Browse by property type
          </h2>
          <p className="text-sm text-gray-400 mt-1">Find the perfect place to stay for your next trip</p>
        </div>

        {/* Arrow Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              canScrollLeft
                ? 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-md'
                : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              canScrollRight
                ? 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-md'
                : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Carousel */}
      <div className="relative">
        {/* Left Fade Gradient */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto py-1 no-scrollbar scroll-smooth"
        >
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isActive={activeCategory === cat.id}
              onClick={() => onSelectCategory(cat.id)}
            />
          ))}
        </div>

        {/* Right Fade Gradient */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}

export default CategoryCarousel
export { CATEGORIES }
