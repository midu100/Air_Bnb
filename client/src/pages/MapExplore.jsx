import React, { useState } from 'react'
import { useSearchPropertiesQuery } from '../store/api/propertyApi'
import PropertyMap from '../components/PropertyMap'

const HORIZONS = [
  { id: 'short', label: 'Nightly', hint: '1-29 nights' },
  { id: 'mid', label: 'Monthly', hint: '1-11 months' },
  { id: 'long', label: 'Long lease', hint: '12+ months' },
]

const MapExplore = () => {
  const [rentalType, setRentalType] = useState('short')

  const { data, isLoading, isFetching } = useSearchPropertiesQuery({ rentalType, limit: 100 })
  const properties = data?.properties || []

  // Cities give the reader a sense of reach before they touch the map
  const cities = [...new Set(properties.map((item) => item.city).filter(Boolean))]
  const countries = [...new Set(properties.map((item) => item.country).filter(Boolean))]

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          Explore <span className="text-gradient-brand">by Map</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {isLoading
            ? 'Locating stays...'
            : `${properties.length} stays across ${cities.length} cities in ${countries.length} countries`}
        </p>

        {/* Rental horizon switcher — the pins re-price and re-drop */}
        <div className="flex flex-wrap gap-2 mt-6">
          {HORIZONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setRentalType(item.id)}
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

      <PropertyMap properties={properties} rentalType={rentalType} loading={isLoading || isFetching} />

      {/* Cities covered */}
      {cities.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {cities.map((city) => (
            <span
              key={city}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-150 text-[11px] font-semibold text-gray-600 shadow-xs"
            >
              {city}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default MapExplore
