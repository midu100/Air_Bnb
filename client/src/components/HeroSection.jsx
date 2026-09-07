import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi'
import { useGetFeaturedPropertiesQuery } from '../store/api/propertyApi'

const FALLBACK_EXTERIOR =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2400&h=1600&fit=crop&q=85'

// A listing's thumbnail is sized for a card. Filling a retina screen with it
// wants roughly twice that, and the width is a query parameter on these.
const atHeroResolution = (url) => {
  if (typeof url !== 'string' || !url.includes('images.unsplash.com')) return url
  return `${url.split('?')[0]}?w=3200&q=88&auto=format&fit=crop`
}

// A 0..1 ramp between two points on the scroll, eased so nothing snaps
const ramp = (value, from, to) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

/**
 * The hero is the home, full screen, and the scroll walks into it.
 *
 * The photograph holds the whole screen, the line sits on top of it, and
 * scrolling pushes the picture toward you until it opens out into the page
 * underneath. Nothing is pinned past that - one push in, and you are on the
 * search.
 *
 * Every opacity is written straight to the DOM. Driving opacity through
 * framer-motion on a pinned section leaves the value frozen while transforms
 * carry on updating.
 */
const HeroSection = () => {
  const sectionRef = useRef(null)
  const copyRef = useRef(null)
  const cueRef = useRef(null)

  const [atRest, setAtRest] = useState(true)

  const { data: featuredData } = useGetFeaturedPropertiesQuery()

  // A hero photograph wants the outside of a building, and an apartment is
  // almost always shot from within it - so prefer a house or a villa when the
  // platform has one to show
  const featured = featuredData?.properties || []
  const showcase = featured.find((home) => ['House', 'Villa'].includes(home.propertyType)) || featured[0] || null
  const exterior = atHeroResolution(showcase?.thumbnail || FALLBACK_EXTERIOR)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useEffect(() => {
    const apply = (value) => {
      if (copyRef.current) copyRef.current.style.opacity = String(1 - ramp(value, 0.04, 0.34))
      if (cueRef.current) cueRef.current.style.opacity = String(1 - ramp(value, 0.01, 0.12))
      setAtRest(value < 0.04)
    }
    apply(scrollYProgress.get())
    return scrollYProgress.on('change', apply)
  }, [scrollYProgress])

  // The push in
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 2.55])
  const copyY = useTransform(scrollYProgress, [0, 0.4], [0, -70])

  const line = {
    hidden: { y: '110%' },
    show: (i) => ({
      y: '0%',
      transition: { duration: 1.05, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  return (
    <section ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-linen">

        {/* ====== The home, the whole screen ====== */}
        <motion.img
          src={exterior}
          alt={showcase ? showcase.title : 'A home on the platform'}
          style={{ scale: imageScale, objectPosition: 'center 42%' }}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />

        {/* The bar needs a little cover at the top; the line needs a lot at the
            foot. The house in the middle is left alone. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-espresso/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-espresso/95 via-espresso/72 to-transparent" />

        {/* ====== The line ====== */}
        <motion.div
          ref={copyRef}
          style={{ y: copyY }}
          className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20 will-change-transform sm:px-10 sm:pb-24"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:items-end lg:gap-16">
            <h1 className="max-w-[13ch] font-sans text-[44px] font-semibold leading-[0.94] tracking-[-0.035em] text-linen sm:text-[66px] lg:text-[80px] xl:text-[92px]">
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
              className="max-w-[36ch] text-[13.5px] leading-relaxed text-linen/90 lg:pb-3"
            >
              Not just somewhere to sleep. Homes you can take for three nights, three months or
              three years - visited by us before any of them reach this page.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-10 flex flex-wrap items-center gap-3 ${atRest ? '' : 'pointer-events-none'}`}
          >
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 rounded-lg bg-linen px-6 py-3.5 text-[13px] font-medium text-espresso transition-colors duration-300 hover:bg-cream"
            >
              Browse homes
              <FiArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>

            <Link
              to="/admin/properties"
              className="inline-flex items-center gap-2.5 rounded-lg border border-linen/40 bg-transparent px-6 py-3.5 text-[13px] font-medium text-linen transition-colors duration-300 hover:border-linen"
            >
              Post a property
            </Link>
          </motion.div>
        </motion.div>

        {/* ====== What you are looking at ====== */}
        {showcase && (
          <Link
            to={`/property/${showcase._id}`}
            className={`group absolute bottom-8 right-28 z-10 hidden items-center gap-3 text-linen transition-opacity duration-500 lg:flex ${
              atRest ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <span className="text-right">
              <span className="block text-[13px] font-medium">{showcase.title}</span>
              <span className="mt-0.5 block text-[11.5px] text-linen/70">
                {showcase.city}, {showcase.country} · from ${showcase.pricePerNight}/night
              </span>
            </span>
            <FiArrowUpRight
              size={15}
              className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        )}

        {/* ====== Scroll cue ====== */}
        <div
          ref={cueRef}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-linen/60">Scroll</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-linen/80"
          >
            <FiArrowDown size={14} />
          </motion.span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
