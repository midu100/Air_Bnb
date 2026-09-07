import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import PropertyCard from './PropertyCard'

/**
 * PropertyCarousel - a shelf of homes that can be dragged or stepped through.
 *
 * The arrows now go quiet at either end instead of staying lit against a track
 * that cannot move, and each card arrives as it comes into view.
 */
const PropertyCarousel = ({ properties = [], title, subtitle }) => {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const track = trackRef.current
    if (!track) return
    setCanScrollLeft(track.scrollLeft > 5)
    setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    const track = trackRef.current
    if (!track) return
    track.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      track.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [properties.length])

  const scrollBy = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * Math.round(track.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (!properties.length) return null

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          {title && (
            <h2 className="font-sans text-[24px] font-semibold tracking-[-0.02em] text-espresso sm:text-[28px]">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-2 text-[13px] text-espresso-soft/70">{subtitle}</p>}
        </div>

        <div className="hidden gap-2 sm:flex">
          <ScrollButton direction="left" disabled={!canScrollLeft} onClick={() => scrollBy(-1)} />
          <ScrollButton direction="right" disabled={!canScrollRight} onClick={() => scrollBy(1)} />
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property, index) => (
          <motion.div
            // API listings carry _id; only the mock ones ever had id, so the
            // whole shelf was rendering with key={undefined}
            key={property._id || property.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: Math.min(index, 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="w-[260px] shrink-0 snap-start sm:w-[290px] md:w-[310px]"
          >
            <PropertyCard property={property} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const ScrollButton = ({ direction, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === 'left' ? 'Previous homes' : 'Next homes'}
    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ${
      disabled
        ? 'cursor-not-allowed border-espresso-line/60 text-espresso-soft/25'
        : 'border-espresso-line text-espresso hover:border-espresso hover:bg-espresso hover:text-linen'
    }`}
  >
    {direction === 'left' ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
  </button>
)

export default PropertyCarousel
