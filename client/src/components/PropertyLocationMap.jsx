import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * PropertyLocationMap - where the home actually is.
 *
 * The listing page used to draw a decorative grid with a pin dropped in the
 * middle of it, which looked like a map without being one: it showed the same
 * picture for a flat in Barcelona and a loft in Brooklyn.
 */
const PropertyLocationMap = ({ latitude, longitude, label }) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    // CARTO now stamps "API KEY REQUIRED" across its free basemap, so the
    // map is drawn on OpenStreetMap's own tiles instead
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // A circle rather than a pin: the exact address is not published until a
    // stay is confirmed, and a pin would claim more precision than that
    L.circle([latitude, longitude], {
      radius: 400,
      color: '#a0682c',
      weight: 1.5,
      fillColor: '#a0682c',
      fillOpacity: 0.15,
    })
      .addTo(map)
      .bindTooltip(label || 'Approximate location', { direction: 'top' })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, label])

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-3xl border border-espresso-line/70 bg-cream text-[13px] text-espresso-soft/60">
        This host has not pinned the location yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-[350px] w-full overflow-hidden rounded-3xl border border-espresso-line/70"
      />
      <p className="text-[11.5px] text-espresso-soft/55">
        Approximate area. The exact address is shared once a stay is confirmed.
      </p>
    </div>
  )
}

export default PropertyLocationMap
