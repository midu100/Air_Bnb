import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi'
import ScrollPanorama from './ScrollPanorama'
import { useGetFeaturedPropertiesQuery } from '../store/api/propertyApi'

const PANORAMA = '/panorama/lounge-360.jpg'
const FALLBACK_EXTERIOR =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2400&h=1600&fit=crop&q=85'

// Where the photograph sits before the scroll opens it out
const BAND_TOP = 46

// A 0..1 ramp between two points on the scroll, eased so nothing snaps
const ramp = (value, from, to) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

/**
 * The hero reads as a page first and a photograph second.
 *
 *   outside   the line on white, the home lying across the foot of the page
 *   entering  the photograph climbs the page and pushes toward you
 *   inside    it has covered everything and opened into the room behind it
 *
 * The photograph is opened by animating its clip-path, so the picture climbs
 * the page rather than the whole layer growing out from its own middle.
 *
 * Every opacity is written straight to the DOM. Driving opacity through
 * framer-motion on a pinned section leaves the value frozen while transforms
 * carry on updating.
 */
const HeroSection = () => {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const copyRef = useRef(null)
  const scrimRef = useRef(null)

  const [phase, setPhase] = useState('outside')

  const { data: featuredData } = useGetFeaturedPropertiesQuery()

  // A hero photograph wants the outside of a building, and an apartment is
  // almost always shot from within it - so prefer a house or a villa when the
  // platform has one to show
  const featured = featuredData?.properties || []
  const showcase = featured.find((home) => ['House', 'Villa'].includes(home.propertyType)) || featured[0] || null
  const exterior = showcase?.thumbnail || FALLBACK_EXTERIOR

  // ====== Scroll
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  const panoramaProgress = useRef(0)
  useEffect(() => {
    const apply = (value) => {
      panoramaProgress.current = Math.min(1, Math.max(0, (value - 0.48) / 0.44))

      if (copyRef.current) copyRef.current.style.opacity = String(1 - ramp(value, 0.02, 0.24))
      // The photograph only hands over to the room once it has pushed far
      // enough past you to have stopped reading as a photograph
      if (imageRef.current) imageRef.current.style.opacity = String(1 - ramp(value, 0.62, 0.86))
      // It also has to darken on the way in, or the room arrives out of nowhere
      if (scrimRef.current) scrimRef.current.style.opacity = String(ramp(value, 0.3, 0.75) * 0.55)

      setPhase(value > 0.82 ? 'inside' : value > 0.2 ? 'entering' : 'outside')
    }
    apply(scrollYProgress.get())
    return scrollYProgress.on('change', apply)
  }, [scrollYProgress])

  // The band of photograph climbs the page until it has covered the line
  const clipTop = useTransform(scrollYProgress, [0, 0.55], [`${BAND_TOP}%`, '0%'])
  const frameClip = useTransform(clipTop, (top) => `inset(${top} 0% 0% 0%)`)
  const imageScale = useTransform(scrollYProgress, [0, 0.86], [1.05, 2.9])
  const copyY = useTransform(scrollYProgress, [0, 0.3], [0, -80])

  const line = {
    hidden: { y: '110%' },
    show: (i) => ({
      y: '0%',
      transition: { duration: 1.05, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  const isOutside = phase === 'outside'
  const isInside = phase === 'inside'

  return (
    <section ref={sectionRef} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-linen">

        {/* ====== The room, waiting behind the photograph ====== */}
        <div className="absolute inset-0">
          <ScrollPanorama imageSrc={PANORAMA} progressRef={panoramaProgress} interactive={isInside} />
        </div>

        {/* ====== The home, climbing the page ====== */}
        <motion.div
          ref={imageRef}
          style={{ clipPath: frameClip }}
          className="absolute inset-0 will-change-[clip-path]"
        >
          <motion.img
            src={exterior}
            alt={showcase ? showcase.title : 'A home on the platform'}
            style={{ scale: imageScale }}
            className="h-full w-full object-cover will-change-transform"
          />
          <div ref={scrimRef} className="absolute inset-0 bg-espresso" style={{ opacity: 0 }} />
        </motion.div>

        {/* ====== The line, on the white ====== */}
        <motion.div
          ref={copyRef}
          style={{ y: copyY }}
          className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pt-32 will-change-transform sm:px-10 sm:pt-36 lg:pt-40"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-start lg:gap-16">
            <h1 className="max-w-[13ch] font-sans text-[46px] font-semibold leading-[0.94] tracking-[-0.035em] text-espresso sm:text-[70px] lg:text-[86px] xl:text-[96px]">
              {['Find somewhere', "you'll call home"].map((text, i) => (
                <span key={text} className="block overflow-hidden pb-[0.06em]">
                  <motion.span variants={line} custom={i} initial="hidden" animate="show" className="block">
                    {text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-espresso-soft/75 lg:pt-4">
              Not just somewhere to sleep. Homes you can take for three nights, three months or
              three years - visited by us before any of them reach this page.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 rounded-lg bg-espresso px-6 py-3.5 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft"
            >
              Browse homes
              <FiArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/admin/properties"
              className="inline-flex items-center gap-2.5 rounded-lg border border-espresso-line px-6 py-3.5 text-[13px] font-medium text-espresso transition-colors duration-300 hover:border-espresso"
            >
              Post a property
            </Link>
          </div>
        </motion.div>

        {/* ====== Inside ====== */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1400px] px-6 pb-14 transition-all duration-700 sm:px-10 ${
            isInside ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-5 rounded-2xl border border-linen/15 bg-espresso/50 p-7 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-bronze-soft">Drag to look around</p>
              <p className="mt-3 max-w-[30ch] font-sans text-[26px] font-semibold leading-tight tracking-[-0.02em] text-linen sm:text-[32px]">
                {showcase ? showcase.title : 'Every listing opens like this'}
              </p>
              {showcase && (
                <p className="mt-2 text-[13px] text-linen/60">
                  {showcase.city}, {showcase.country} · from ${showcase.pricePerNight}/night
                </p>
              )}
            </div>

            {showcase && (
              <Link
                to={`/property/${showcase._id}`}
                className="group inline-flex w-fit items-center gap-2.5 rounded-lg bg-linen px-6 py-3.5 text-[13px] font-medium text-espresso transition-colors duration-300 hover:bg-cream"
              >
                See this home
                <FiArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
          </div>
        </div>

        {/* ====== Scroll cue ====== */}
        <div
          className={`absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 ${
            isOutside ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="rounded-full bg-espresso/45 px-4 py-1.5 text-[9px] uppercase tracking-[0.4em] text-linen backdrop-blur-md">
            Scroll to step inside
          </span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-linen drop-shadow-[0_1px_4px_rgba(28,24,20,0.6)]"
          >
            <FiArrowDown size={14} />
          </motion.span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
