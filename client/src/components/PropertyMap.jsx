import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './PropertyMap.css'

// ====== Each horizon prices against a different field and unit
const PRICE_BY_TYPE = {
  short: { field: 'pricePerNight', unit: 'night' },
  mid: { field: 'monthlyRate', unit: 'month' },
  long: { field: 'longTermRent', unit: 'month' },
}

// Compact money so a pin stays a pin, not a paragraph
const shortMoney = (value) => (value >= 1000 ? `${Math.round(value / 100) / 10}k` : `${value}`)

const PropertyMap = ({ properties = [], rentalType = 'short', loading = false }) => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const [activeProperty, setActiveProperty] = useState(null)

  const mode = PRICE_BY_TYPE[rentalType] || PRICE_BY_TYPE.short

  // ====== Create the map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [25, 20],
      zoom: 2,
      zoomControl: false,
      scrollWheelZoom: false,
      worldCopyJump: true,
    })

    // CARTO now stamps "API KEY REQUIRED" across its free basemap, so the
    // map is drawn on OpenStreetMap's own tiles instead
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ====== Redraw pins whenever the list or the horizon changes
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    setActiveProperty(null)

    const located = properties.filter(
      (item) => item.coordinates?.latitude && item.coordinates?.longitude
    )
    if (!located.length) return

    located.forEach((property, index) => {
      const price = property[mode.field] || property.pricePerNight || 0

      // Pins drop in one after another so the map assembles itself
      const icon = L.divIcon({
        className: 'pm-pin-wrap',
        html: `
          <div class="pm-pin" style="animation-delay:${Math.min(index * 70, 900)}ms">
            <span class="pm-pin-price">$${shortMoney(price)}</span>
            <span class="pm-pin-unit">/${mode.unit === 'night' ? 'n' : 'mo'}</span>
          </div>`,
        iconSize: [1, 1],
        iconAnchor: [0, 0],
      })

      const marker = L.marker([property.coordinates.latitude, property.coordinates.longitude], {
        icon,
        riseOnHover: true,
      })

      marker.on('click', () => {
        setActiveProperty(property)
        map.flyTo([property.coordinates.latitude, property.coordinates.longitude], 11, {
          duration: 1.1,
        })
      })

      marker.addTo(layer)
    })

    // Frame every pin, then let the drop animation play over it
    const bounds = L.latLngBounds(
      located.map((item) => [item.coordinates.latitude, item.coordinates.longitude])
    )
    map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 6, duration: 1.4 })
  }, [properties, mode.field, mode.unit])

  const handleOpen = () => {
    if (activeProperty) navigate(`/property/${activeProperty._id}`)
  }

  const handleResetView = () => {
    const map = mapRef.current
    const located = properties.filter((item) => item.coordinates?.latitude)
    if (!map || !located.length) return
    setActiveProperty(null)
    map.flyToBounds(
      L.latLngBounds(located.map((item) => [item.coordinates.latitude, item.coordinates.longitude])),
      { padding: [70, 70], maxZoom: 6, duration: 1.2 }
    )
  }

  const activePrice = activeProperty
    ? activeProperty[mode.field] || activeProperty.pricePerNight || 0
    : 0

  return (
    <div className="relative w-full h-[560px] rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-gray-50">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mapping stays...</span>
        </div>
      )}

      {/* ====== Selected property card ====== */}
      {activeProperty && (
        <div className="pm-card absolute bottom-5 left-5 z-20 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setActiveProperty(null)}
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/95 text-gray-600 hover:text-gray-900 flex items-center justify-center shadow-md cursor-pointer border-none"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={activeProperty.thumbnail}
            alt={activeProperty.title}
            className="w-full h-36 object-cover"
          />

          <div className="p-4 space-y-1.5">
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{activeProperty.title}</h4>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
              {activeProperty.city}, {activeProperty.country}
            </p>

            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-lg font-extrabold text-gray-900">${activePrice.toLocaleString()}</span>
              <span className="text-[11px] text-gray-400 font-semibold">/ {mode.unit}</span>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {(activeProperty.rentalTypes || []).map((type) => (
                <span key={type} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-150 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                  {type === 'short' ? 'Nightly' : type === 'mid' ? 'Monthly' : 'Lease'}
                </span>
              ))}
            </div>

            <button
              onClick={handleOpen}
              className="w-full mt-2.5 bg-[#f0506e] hover:bg-[#d94560] text-white rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none active:scale-[0.98]"
            >
              View this stay
            </button>
          </div>
        </div>
      )}

      {/* ====== Reset view ====== */}
      <button
        onClick={handleResetView}
        className="absolute top-5 right-5 z-20 bg-white/95 hover:bg-white text-gray-700 rounded-xl px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider shadow-md cursor-pointer border border-gray-100 transition-all"
      >
        Reset view
      </button>

      {/* ====== Count ====== */}
      <div className="absolute top-5 left-5 z-20 bg-white/95 rounded-xl px-3.5 py-2 shadow-md border border-gray-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {properties.filter((item) => item.coordinates?.latitude).length} stays on the map
        </span>
      </div>
    </div>
  )
}

export default PropertyMap
