import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useSearchPropertiesQuery } from '../store/api/propertyApi'
import { useGetCategoriesQuery } from '../store/api/categoryApi'
import PropertyCard from '../components/PropertyCard'

const PAGE_SIZE = 12

// ====== The three rental horizons, each with its own price unit and sensible slider range
const HORIZONS = [
  { id: 'short', label: 'Short-term', hint: '1-29 nights',  unit: 'night', min: 50,  max: 1000,  step: 25 },
  { id: 'mid',   label: 'Mid-term',   hint: '1-11 months',  unit: 'month', min: 500, max: 12000, step: 250 },
  { id: 'long',  label: 'Long-term',  hint: '12+ months',   unit: 'month', min: 500, max: 12000, step: 250 },
]

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const destParam = searchParams.get('destination') || ''
  const guestParam = searchParams.get('guests') || '1'
  // A link can arrive asking for a horizon - the home page sends people
  // straight to monthly stays or to leases
  const rentalParam = HORIZONS.some((item) => item.id === searchParams.get('rentalType'))
    ? searchParams.get('rentalType')
    : 'short'

  const [destination, setDestination] = useState(destParam)
  const [guests, setGuests] = useState(guestParam)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [rentalType, setRentalType] = useState(rentalParam)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [page, setPage] = useState(1)

  const horizon = HORIZONS.find((item) => item.id === rentalType) || HORIZONS[0]

  // Sync inputs if URL params change - adjusted during render, not in an effect,
  // so it does not trigger a second cascading render
  const [urlParams, setUrlParams] = useState({ destParam, guestParam, rentalParam })
  if (
    urlParams.destParam !== destParam ||
    urlParams.guestParam !== guestParam ||
    urlParams.rentalParam !== rentalParam
  ) {
    setUrlParams({ destParam, guestParam, rentalParam })
    setDestination(destParam)
    setGuests(guestParam)
    setRentalType(rentalParam)
    setPage(1)
  }

  // ====== Debounce the text box so every keystroke is not a request
  const [debouncedDestination, setDebouncedDestination] = useState(destParam)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDestination(destination), 400)
    return () => clearTimeout(timer)
  }, [destination])

  // ====== Any filter change puts us back on the first page
  const handleDestinationChange = (value) => {
    setDestination(value)
    setPage(1)
  }

  const handleGuestsChange = (value) => {
    setGuests(value)
    setPage(1)
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    setPage(1)
  }

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value)
    setPage(1)
  }

  const handleHorizonChange = (id) => {
    const next = HORIZONS.find((item) => item.id === id) || HORIZONS[0]
    setRentalType(id)
    setMaxPrice(next.max)
    setPage(1)
  }

  // ====== Filtering now happens on the server instead of over a limit:100 dump
  const { data, isLoading, isFetching } = useSearchPropertiesQuery({
    page,
    limit: PAGE_SIZE,
    rentalType,
    maxPrice,
    ...(debouncedDestination ? { destination: debouncedDestination } : {}),
    ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
    ...(guests !== '1' ? { maxGuests: guests } : {}),
  })

  const properties = data?.properties || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const { data: catData } = useGetCategoriesQuery()
  const categoriesList = catData?.category || []

  const resetFilters = () => {
    setDestination('')
    setGuests('1')
    setSelectedCategory('all')
    setMaxPrice(horizon.max)
    setPage(1)
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
          {isLoading ? 'Searching stays...' : `Showing ${properties.length} of ${total} stays available for ${horizon.label.toLowerCase()} rental`}
        </p>

        {/* Rental horizon switcher */}
        <div className="flex flex-wrap gap-2 mt-6">
          {HORIZONS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleHorizonChange(item.id)}
              className={`px-4 py-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                rentalType === item.id
                  ? 'border-bronze bg-bronze/5 text-bronze'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="block text-xs font-bold">{item.label}</span>
              <span className="block text-[10px] opacity-70 font-medium">{item.hint}</span>
            </button>
          ))}
        </div>
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
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Guests Filter — only meaningful for stays, not tenancies */}
            {rentalType !== 'long' && (<>
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Minimum Guests
              </label>
              <select
                value={guests}
                onChange={(e) => handleGuestsChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-brand transition-colors cursor-pointer"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">4 Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>

            </>)}

            {/* Category Filter */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none focus:border-brand transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                <span>Max Price / {horizon.unit}</span>
                <span className="text-brand font-display">${maxPrice}</span>
              </div>
              <input
                type="range"
                min={horizon.min}
                max={horizon.max}
                step={horizon.step}
                value={maxPrice}
                onChange={(e) => handleMaxPriceChange(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[9px] text-gray-400">
                <span>${horizon.min}</span>
                <span>${horizon.max}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">
              LOADING STAYS...
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                {properties.map((prop) => (
                  <PropertyCard key={prop._id} property={prop} rentalType={rentalType} />
                ))}
              </div>

              {/* ====== Pagination ====== */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-bold text-gray-500 px-3">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
