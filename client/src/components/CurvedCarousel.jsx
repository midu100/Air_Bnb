import React, { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { HiOutlineArrowLeft, HiOutlineArrowRight } from 'react-icons/hi'

// ====== Cards laid along an arc.
// Distance from centre drives three things at once - how far the card turns,
// how far it sits from the camera, and how large it reads. Doing all three is
// what makes it curve rather than just slide.
const PRICE_BY_TYPE = {
  short: { field: 'pricePerNight', unit: 'night' },
  mid: { field: 'monthlyRate', unit: 'month' },
  long: { field: 'longTermRent', unit: 'month' },
}

const CurvedCarousel = ({ properties = [], rentalType = 'short' }) => {
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)
  const dragRef = useRef({ startX: 0, active: false })

  const count = properties.length
  const mode = PRICE_BY_TYPE[rentalType] || PRICE_BY_TYPE.short

  const step = useCallback(
    (direction) => {
      if (!count) return
      setActive((prev) => (prev + direction + count) % count)
    },
    [count]
  )

  // ====== Arrow keys work whenever the carousel has focus
  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  }

  // ====== Drag or swipe
  const onPointerDown = (event) => {
    dragRef.current = { startX: event.clientX, active: true }
  }

  const onPointerUp = (event) => {
    if (!dragRef.current.active) return
    const delta = event.clientX - dragRef.current.startX
    dragRef.current.active = false
    if (Math.abs(delta) > 60) step(delta > 0 ? -1 : 1)
  }

  if (!count) return null

  // Keep the active card in range if the list shrank under us, without an
  // effect that would render once with an index that no longer exists
  const current = active < count ? active : 0

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured homes"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { dragRef.current.active = false }}
        className="relative h-[430px] cursor-grab select-none active:cursor-grabbing focus:outline-none sm:h-[480px]"
        style={{ perspective: '1600px' }}
      >
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {properties.map((property, index) => {
            // Shortest way round, so the arc wraps instead of unwinding
            let offset = index - current
            if (offset > count / 2) offset -= count
            if (offset < -count / 2) offset += count

            const distance = Math.abs(offset)
            if (distance > 2.6) return null

            const price = property[mode.field] || property.pricePerNight || 0
            const isActive = offset === 0

            return (
              <div
                key={property._id || property.id}
                aria-hidden={!isActive}
                className="absolute left-1/2 top-1/2 w-[280px] sm:w-[330px]"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${offset * -26}deg) translateZ(${-distance * 190}px) translateX(${offset * 200}px) scale(${1 - distance * 0.08})`,
                  opacity: distance > 2 ? 0 : 1 - distance * 0.26,
                  zIndex: 10 - Math.round(distance),
                  transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms ease',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <Link
                  to={`/property/${property._id || property.id}`}
                  tabIndex={isActive ? 0 : -1}
                  className="group block overflow-hidden rounded-[28px] border border-espresso-line bg-linen transition-colors duration-500 hover:border-bronze/50"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={property.thumbnail}
                      alt={property.title}
                      draggable="false"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="eyebrow text-bronze">{property.city}</p>
                      <h3 className="mt-2 font-serif text-[24px] font-light leading-tight text-espresso">
                        {property.title}
                      </h3>
                      <p className="mt-2 text-[13px] text-espresso-soft/80">
                        <span className="text-espresso">${price.toLocaleString()}</span> / {mode.unit}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* ====== Controls ====== */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => step(-1)}
          aria-label="Previous home"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-espresso-line bg-transparent text-espresso-soft transition-all duration-300 hover:border-bronze hover:text-bronze"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {properties.map((property, index) => (
            <button
              key={property._id || property.id}
              onClick={() => setActive(index)}
              aria-label={`Go to ${property.title}`}
              aria-current={index === current}
              className={`h-1 cursor-pointer rounded-full border-none transition-all duration-500 ${
                index === current ? 'w-8 bg-bronze' : 'w-3 bg-espresso/20 hover:bg-ivory/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => step(1)}
          aria-label="Next home"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-espresso-line bg-transparent text-espresso-soft transition-all duration-300 hover:border-bronze hover:text-bronze"
        >
          <HiOutlineArrowRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-espresso-soft/45">
        Drag, swipe, or use the arrow keys
      </p>
    </div>
  )
}

export default CurvedCarousel
