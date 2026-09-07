import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { useGetDestinationsQuery } from '../store/api/destinationApi'

// A destination that loses its photograph should still look like a place worth
// going, not an empty grey panel in the middle of the grid
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop&q=80'

const handleImageError = (event) => {
  if (event.target.src === FALLBACK_IMAGE) return
  event.target.src = FALLBACK_IMAGE
}

/**
 * TrendingDestinations - the cities an editor has chosen to push, from the
 * database rather than from a list baked into this file.
 *
 * The count on each card is the number of published homes that city actually
 * has. The hard-coded version advertised "1,240 properties" for a city with
 * none, which is the sort of thing a visitor finds out one click later.
 */
const TrendingDestinations = () => {
  const { data, isLoading } = useGetDestinationsQuery()
  const destinations = data?.destinations || []

  if (isLoading) {
    return (
      <section className="bg-linen py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="h-8 w-64 animate-pulse rounded bg-cream" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="h-[300px] animate-pulse rounded-2xl bg-cream" />
            <div className="h-[300px] animate-pulse rounded-2xl bg-cream" />
          </div>
        </div>
      </section>
    )
  }

  // Nothing to push is a legitimate state - an editor has simply not set any up
  if (!destinations.length) return null

  const [first, second, ...rest] = destinations

  return (
    <section className="bg-linen py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">

        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-sans text-[28px] font-semibold tracking-[-0.025em] text-espresso sm:text-[36px]">
              Trending destinations
            </h2>
            <p className="mt-2 text-[13.5px] text-espresso-soft/70">
              Cities people are booking most on the platform right now
            </p>
          </div>

          <Link
            to="/properties"
            className="group hidden items-center gap-2 text-[13px] font-medium text-espresso-soft transition-colors duration-300 hover:text-espresso sm:inline-flex"
          >
            See all
            <FiArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* The first two get the large tiles, which is what the order field is for */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[first, second].filter(Boolean).map((destination, index) => (
            <DestinationCard key={destination._id} destination={destination} index={index} tall />
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((destination, index) => (
              <DestinationCard key={destination._id} destination={destination} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * One city. Clicking it runs the search rather than going to a page that would
 * only have to ask the same question again.
 */
const DestinationCard = ({ destination, index, tall = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 26 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
  >
    <Link
      to={`/properties?destination=${encodeURIComponent(destination.city)}`}
      className={`group relative block overflow-hidden rounded-2xl ${tall ? 'h-[300px] sm:h-[340px]' : 'h-[220px]'}`}
    >
      <img
        src={destination.image}
        alt={`${destination.city}, ${destination.country}`}
        onError={handleImageError}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/15 to-espresso/10" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className={`font-sans font-semibold tracking-[-0.02em] text-linen ${tall ? 'text-[22px]' : 'text-[17px]'}`}>
            {destination.city} {destination.flag}
          </p>
          <p className="mt-1 text-[12px] text-linen/70">
            {destination.propertyCount} {destination.propertyCount === 1 ? 'home' : 'homes'} · {destination.country}
          </p>
        </div>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linen/15 text-linen backdrop-blur-md transition-colors duration-300 group-hover:bg-linen group-hover:text-espresso">
          <FiArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  </motion.div>
)

export default TrendingDestinations
