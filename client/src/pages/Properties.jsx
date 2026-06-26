import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { MOCK_PROPERTIES } from '../data/mockProperties'
import PropertyCard from '../components/PropertyCard'
import { CATEGORIES } from '../components/CategoryCarousel'

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const destParam = searchParams.get('destination') || ''
  const guestParam = searchParams.get('guests') || '1'

  const [destination, setDestination] = useState(destParam)
  const [guests, setGuests] = useState(guestParam)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [maxPrice, setMaxPrice] = useState(1000)

  // Sync inputs if URL params change
  useEffect(() => {
    setDestination(destParam)
    setGuests(guestParam)
  }, [destParam, guestParam])

  // Filter properties
  const filteredProperties = MOCK_PROPERTIES.filter((prop) => {
    // Destination filter (case insensitive substring)
    const matchesDest =
      !destination ||
      prop.location.toLowerCase().includes(destination.toLowerCase()) ||
      prop.title.toLowerCase().includes(destination.toLowerCase())

    // Guest filter
    const matchesGuests = prop.guests >= parseInt(guests, 10)

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || prop.category === selectedCategory

    // Price filter
    const matchesPrice = prop.price <= maxPrice

    return matchesDest && matchesGuests && matchesCategory && matchesPrice
  })

  const resetFilters = () => {
    setDestination('')
    setGuests('1')
    setSelectedCategory('all')
    setMaxPrice(1000)
    setSearchParams({})
  }

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          Explore <span className="text-gradient-brand">Premium Stays</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Showing {filteredProperties.length} stunning properties ready for booking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-sm">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-[10px] font-semibold text-brand hover:text-brand-dark transition-colors uppercase tracking-wider cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Destination Search */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Guests Filter */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Minimum Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-brand transition-colors cursor-pointer"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">4 Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none focus:border-brand transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                <span>Max Nightly Price</span>
                <span className="text-brand font-display">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[9px] text-gray-400">
                <span>$100</span>
                <span>$1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="lg:col-span-3">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-brand mb-4 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">No Stays Found</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                We couldn't find any stays matching your filters. Try resetting the filters or modifying your destination query.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 btn-brand text-xs rounded-xl px-5 py-2"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Properties
