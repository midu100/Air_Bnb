import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useGetCategoriesQuery } from '../store/api/categoryApi'
import { useGetPropertiesQuery } from '../store/api/propertyApi'

/**
 * CategoryCarousel - the property types on the platform, from the database.
 *
 * This used to merge the real categories with eight hard-coded ones so the row
 * looked full. Picking one of the invented ones searched for something that did
 * not exist, and every category without a picture of its own fell back to the
 * same photograph, so the row showed one hotel bedroom several times over.
 */
const CategoryCarousel = ({ activeCategory, onSelectCategory }) => {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { data: categoryData, isLoading } = useGetCategoriesQuery()
  const categories = categoryData?.category || []

  // Already in the cache - the home page asks for the same list
  const { data: propertyData } = useGetPropertiesQuery({ limit: 100 })
  const properties = propertyData?.properties || []

  // How many homes each category actually holds, so a visitor is never sent to
  // an empty shelf
  const countByCategory = useMemo(() => {
    const counts = new Map()
    properties.forEach((property) => {
      const id = property.category?._id || property.category
      if (id) counts.set(String(id), (counts.get(String(id)) || 0) + 1)
    })
    return counts
  }, [properties])

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
  }, [categories.length])

  const scrollBy = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * Math.round(track.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section className="bg-linen py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="h-8 w-56 animate-pulse rounded bg-cream" />
          <div className="mt-10 flex gap-5">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="h-[220px] flex-1 animate-pulse rounded-2xl bg-cream" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) return null

  return (
    <section className="bg-linen py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">

        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-sans text-[28px] font-semibold tracking-[-0.025em] text-espresso sm:text-[36px]">
              Browse by property type
            </h2>
            <p className="mt-2 text-[13.5px] text-espresso-soft/70">
              Pick the kind of place you want to be in
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <ScrollButton direction="left" disabled={!canScrollLeft} onClick={() => scrollBy(-1)} />
            <ScrollButton direction="right" disabled={!canScrollRight} onClick={() => scrollBy(1)} />
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category, index) => {
            const count = countByCategory.get(String(category._id)) || 0
            const isActive = activeCategory === category._id

            return (
              <motion.button
                key={category._id}
                type="button"
                onClick={() => onSelectCategory(category._id)}
                aria-pressed={isActive}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group w-[210px] shrink-0 cursor-pointer snap-start border-none bg-transparent p-0 text-left sm:w-[240px]"
              >
                <span
                  className={`relative block h-[170px] overflow-hidden rounded-2xl transition-all duration-500 sm:h-[190px] ${
                    isActive ? 'ring-2 ring-espresso ring-offset-4 ring-offset-linen' : ''
                  }`}
                >
                  <img
                    src={category.thumbnail}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 right-4 block">
                    <span className="block text-[15px] font-semibold text-linen">{category.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-linen/70">
                      {count} {count === 1 ? 'home' : 'homes'}
                    </span>
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const ScrollButton = ({ direction, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === 'left' ? 'Previous categories' : 'Next categories'}
    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ${
      disabled
        ? 'cursor-not-allowed border-espresso-line/60 text-espresso-soft/25'
        : 'border-espresso-line text-espresso hover:border-espresso hover:bg-espresso hover:text-linen'
    }`}
  >
    {direction === 'left' ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
  </button>
)

export default CategoryCarousel
