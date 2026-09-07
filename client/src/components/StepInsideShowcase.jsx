import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiMaximize2, FiUsers, FiHome } from 'react-icons/fi'

// A 0..1 ramp between two points on the scroll, eased so nothing snaps
const ramp = (value, from, to) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

const RENTAL_LABEL = { short: 'By the night', mid: 'By the month', long: 'On a lease' }

// "1 bathrooms" reads as a bug to anyone looking at a listing
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

/**
 * StepInsideShowcase - the hero's move, applied to the catalogue.
 *
 * Each home holds the screen for one viewport of scroll. Over that stretch its
 * street photograph pushes toward you and hands over to the room behind it, so
 * scrolling reads as walking up to a door and through it. The detail panel
 * arrives once you are inside, which is the moment the numbers start to matter.
 *
 * Opacity is written to the DOM rather than driven through framer-motion:
 * on a pinned section motion values for opacity stay frozen while transforms
 * carry on updating.
 */
const StepInsideShowcase = ({ properties = [] }) => {
  const homes = properties.filter((property) => (property.images || []).length > 1).slice(0, 3)

  const sectionRef = useRef(null)
  const layerRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useEffect(() => {
    if (!homes.length) return

    const apply = (value) => {
      const span = 1 / homes.length
      const index = Math.min(homes.length - 1, Math.floor(value / span))
      setActiveIndex(index)

      homes.forEach((_, i) => {
        const layer = layerRefs.current[i]
        if (!layer) return

        // How far into this home's own stretch of scroll we are
        const local = Math.min(1, Math.max(0, (value - i * span) / span))

        // Each home is only on screen for its own stretch, and crossfades at
        // the seams so two photographs are never fighting for the same pixels
        const entering = i === 0 ? 1 : ramp(value, i * span - span * 0.12, i * span + span * 0.06)
        const leaving = i === homes.length - 1 ? 0 : ramp(value, (i + 1) * span - span * 0.06, (i + 1) * span + span * 0.12)
        layer.style.opacity = String(Math.max(0, entering - leaving))

        // Inside the stretch, the street view hands over to the room
        const outside = layer.querySelector('[data-layer="outside"]')
        const inside = layer.querySelector('[data-layer="inside"]')
        const detail = layer.querySelector('[data-layer="detail"]')
        if (outside) outside.style.opacity = String(1 - ramp(local, 0.36, 0.52))
        if (inside) inside.style.opacity = String(ramp(local, 0.34, 0.5))
        if (detail) detail.style.opacity = String(ramp(local, 0.46, 0.66))
      })
    }

    apply(scrollYProgress.get())
    return scrollYProgress.on('change', apply)
  }, [scrollYProgress, homes.length])

  if (!homes.length) return null

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${homes.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-espresso" style={{ perspective: '1400px' }}>
        {homes.map((home, index) => (
          <ShowcaseLayer
            key={home._id}
            home={home}
            index={index}
            total={homes.length}
            scrollYProgress={scrollYProgress}
            ref={(node) => { layerRefs.current[index] = node }}
          />
        ))}

        {/* ====== Which home you are standing in ====== */}
        <div className="pointer-events-none absolute left-1/2 top-24 z-20 flex -translate-x-1/2 items-center gap-3">
          {homes.map((home, index) => (
            <span
              key={home._id}
              className={`h-px transition-all duration-500 ${
                index === activeIndex ? 'w-10 bg-bronze' : 'w-5 bg-linen/30'
              }`}
            />
          ))}
        </div>

        <p className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 text-[9px] uppercase tracking-[0.4em] text-linen/45">
          Keep scrolling to step through
        </p>
      </div>
    </section>
  )
}

/**
 * One home: the street outside, the room inside, and the numbers that decide it.
 */
const ShowcaseLayer = React.forwardRef(({ home, index, total, scrollYProgress }, ref) => {
  const span = 1 / total
  const start = index * span
  const end = start + span

  // The photograph travels the whole way toward you across this home's stretch
  const outsideScale = useTransform(scrollYProgress, [start, end], [1.05, 2.4])
  const insideScale = useTransform(scrollYProgress, [start, end], [1.35, 1.02])
  const detailZ = useTransform(scrollYProgress, [start + span * 0.5, end], [140, 0])

  const rentals = (home.rentalTypes || []).map((type) => RENTAL_LABEL[type]).filter(Boolean)

  return (
    <div ref={ref} className="absolute inset-0" style={{ opacity: index === 0 ? 1 : 0 }}>
      {/* The room, revealed by the street view getting out of the way */}
      <motion.img
        data-layer="inside"
        src={home.images[1]}
        alt={`Inside ${home.title}`}
        style={{ scale: insideScale, opacity: 0 }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />

      {/* The street, pushing past you */}
      <motion.img
        data-layer="outside"
        src={home.images[0]}
        alt={home.title}
        style={{ scale: outsideScale }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/60 to-espresso/35" />

      {/* ====== The numbers that decide it ====== */}
      <motion.div
        data-layer="detail"
        style={{ z: detailZ, opacity: 0 }}
        className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-5 pb-16 will-change-transform sm:px-8 sm:pb-20"
      >
        <p className="eyebrow text-bronze-soft">
          {home.city}, {home.country}
        </p>

        <h3 className="mt-5 max-w-[18ch] font-serif text-[38px] font-light leading-[1.02] text-linen sm:text-[56px] lg:text-[68px]">
          {home.title}
        </h3>

        <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-linen/70">
            <span className="flex items-center gap-2">
              <FiUsers size={14} className="text-bronze-soft" />
              {plural(home.maxGuests, 'guest')}
            </span>
            <span className="flex items-center gap-2">
              <FiHome size={14} className="text-bronze-soft" />
              {plural(home.bedrooms, 'bedroom')}
            </span>
            <span className="flex items-center gap-2">
              <FiMaximize2 size={14} className="text-bronze-soft" />
              {plural(home.bathrooms, 'bathroom')}
            </span>
            {rentals.length > 0 && (
              <span className="text-linen/50">{rentals.join(' · ')}</span>
            )}
          </div>

          <div className="flex items-end gap-8">
            <div>
              <p className="font-serif text-[30px] font-light text-linen">${home.pricePerNight}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-linen/45">per night</p>
            </div>
            {home.monthlyRate > 0 && (
              <div>
                <p className="font-serif text-[30px] font-light text-linen">${home.monthlyRate}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-linen/45">per month</p>
              </div>
            )}
            <Link
              to={`/property/${home._id}`}
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-bronze px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-linen transition-colors duration-500 hover:bg-bronze-soft"
            >
              See this home
              <span className="h-px w-6 bg-linen transition-all duration-500 group-hover:w-9" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
})

ShowcaseLayer.displayName = 'ShowcaseLayer'

export default StepInsideShowcase
