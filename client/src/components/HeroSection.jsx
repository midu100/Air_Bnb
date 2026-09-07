import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { useGetFeaturedPropertiesQuery } from '../store/api/propertyApi'

const FALLBACK_EXTERIOR =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2400&h=1600&fit=crop&q=85'

/**
 * The hero: the line, then the home, on one screen.
 *
 * The copy block takes whatever height it needs and the photograph takes the
 * rest, so the two can never land on top of each other however tall the
 * headline wraps or however short the window is.
 */
const HeroSection = () => {
  const { data: featuredData } = useGetFeaturedPropertiesQuery()

  // A hero photograph wants the outside of a building, and an apartment is
  // almost always shot from within it - so prefer a house or a villa when the
  // platform has one to show
  const featured = featuredData?.properties || []
  const showcase = featured.find((home) => ['House', 'Villa'].includes(home.propertyType)) || featured[0] || null
  const exterior = showcase?.thumbnail || FALLBACK_EXTERIOR

  const line = {
    hidden: { y: '110%' },
    show: (i) => ({
      y: '0%',
      transition: { duration: 1.05, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  return (
    <section className="flex min-h-screen flex-col bg-linen">

      {/* ====== The line ====== */}
      <div className="mx-auto w-full max-w-[1400px] shrink-0 px-6 pb-10 pt-28 sm:px-10 sm:pt-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,290px)] lg:items-start lg:gap-16">
          <h1 className="max-w-[13ch] font-sans text-[42px] font-semibold leading-[0.94] tracking-[-0.035em] text-espresso sm:text-[62px] lg:text-[76px] xl:text-[86px]">
            {['Find somewhere', "you'll call home"].map((text, i) => (
              <span key={text} className="block overflow-hidden pb-[0.06em]">
                <motion.span variants={line} custom={i} initial="hidden" animate="show" className="block">
                  {text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[36ch] text-[13.5px] leading-relaxed text-espresso-soft/75 lg:pt-3"
          >
            Not just somewhere to sleep. Homes you can take for three nights, three months or three
            years - visited by us before any of them reach this page.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/properties"
            className="group inline-flex items-center gap-2.5 rounded-lg bg-espresso px-6 py-3.5 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft"
          >
            Browse homes
            <FiArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>

          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2.5 rounded-lg border border-espresso-line bg-transparent px-6 py-3.5 text-[13px] font-medium text-espresso transition-colors duration-300 hover:border-espresso"
          >
            Post a property
          </Link>
        </motion.div>
      </div>

      {/* ====== The home ====== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
        className="relative min-h-[300px] w-full flex-1 overflow-hidden bg-cream sm:min-h-[380px]"
      >
        <img
          src={exterior}
          alt={showcase ? showcase.title : 'A home on the platform'}
          // Architectural photographs put the building above the middle of the
          // frame, so a centred crop fills the hero with paving
          style={{ objectPosition: 'center 38%' }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {showcase && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-espresso/75 via-espresso/30 to-transparent" />
            <Link
              to={`/property/${showcase._id}`}
              className="group absolute bottom-7 left-6 flex items-center gap-3 text-linen sm:bottom-9 sm:left-10"
            >
              <span>
                <span className="block text-[14px] font-medium">{showcase.title}</span>
                <span className="mt-0.5 block text-[12px] text-linen/80">
                  {showcase.city}, {showcase.country} · from ${showcase.pricePerNight}/night
                </span>
              </span>
              <FiArrowUpRight
                size={16}
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </>
        )}
      </motion.div>
    </section>
  )
}

export default HeroSection
