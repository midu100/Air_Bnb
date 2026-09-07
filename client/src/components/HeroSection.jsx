import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowDown, FiSearch, FiStar, FiMapPin } from 'react-icons/fi'
import ScrollPanorama from './ScrollPanorama'
import { useLocale } from '../i18n/LocaleContext'
import { useGetFeaturedPropertiesQuery } from '../store/api/propertyApi'

const PANORAMA = '/panorama/lounge-360.jpg'
const FALLBACK_EXTERIOR =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2400&h=1600&fit=crop&q=85'

const PHRASES = [
  'beachfront villas by the night',
  'furnished lofts by the month',
  'a home on a proper lease',
  'forest cabins for a long weekend',
]

// A 0..1 ramp between two points on the scroll, eased so nothing snaps
const ramp = (value, from, to) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

/**
 * The hero walks you into a real listing.
 *
 *   outside   the home full screen, the copy standing in front of it
 *   entering  the photograph pushes past you and the copy flies over your head
 *   inside    the room, in WebGL, yours to look around
 *
 * Depth is real here rather than implied: the section carries a perspective and
 * the copy travels along Z, so it passes the camera instead of merely fading.
 *
 * Every opacity is written straight to the DOM. Driving opacity through
 * framer-motion on a pinned section leaves the value frozen while transforms
 * carry on updating, which is what stranded this hero on a blank screen before.
 */
const HeroSection = () => {
  const navigate = useNavigate()
  const { t } = useLocale()
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const copyRef = useRef(null)
  const chipRef = useRef(null)

  const [destination, setDestination] = useState('')
  const [guests, setGuests] = useState('1')
  const [phase, setPhase] = useState('outside')

  const { data: featuredData } = useGetFeaturedPropertiesQuery()
  const showcase = featuredData?.properties?.[0] || null
  const exterior = showcase?.thumbnail || FALLBACK_EXTERIOR

  // ====== Typewriter
  const [currentText, setCurrentText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[phraseIndex]
    const atEnd = !isDeleting && currentText === phrase
    const atStart = isDeleting && currentText === ''

    const timer = setTimeout(() => {
      if (atEnd) return setIsDeleting(true)
      if (atStart) {
        setIsDeleting(false)
        return setPhraseIndex((prev) => (prev + 1) % PHRASES.length)
      }
      setCurrentText(
        isDeleting ? phrase.substring(0, currentText.length - 1) : phrase.substring(0, currentText.length + 1)
      )
    }, atEnd ? 2100 : isDeleting ? 34 : 62)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, phraseIndex])

  // ====== Scroll
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  const panoramaProgress = useRef(0)
  useEffect(() => {
    const apply = (value) => {
      panoramaProgress.current = Math.min(1, Math.max(0, (value - 0.26) / 0.52))

      // The photograph hands over to the room only once it has pushed far
      // enough past you to have stopped reading as a photograph
      if (imageRef.current) imageRef.current.style.opacity = String(1 - ramp(value, 0.52, 0.8))
      if (copyRef.current) copyRef.current.style.opacity = String(1 - ramp(value, 0.04, 0.26))
      if (chipRef.current) chipRef.current.style.opacity = String(1 - ramp(value, 0.02, 0.18))

      setPhase(value > 0.74 ? 'inside' : value > 0.24 ? 'entering' : 'outside')
    }
    apply(scrollYProgress.get())
    return scrollYProgress.on('change', apply)
  }, [scrollYProgress])

  // The photograph comes at you; the copy passes over your shoulder
  const imageScale = useTransform(scrollYProgress, [0, 0.8], [1.04, 3.6])
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], [1.2, 0])
  const copyZ = useTransform(scrollYProgress, [0, 0.34], [0, 420])
  const copyY = useTransform(scrollYProgress, [0, 0.34], [0, -60])
  const chipZ = useTransform(scrollYProgress, [0, 0.3], [0, 300])

  const line = {
    hidden: { y: '112%' },
    show: (i) => ({
      y: '0%',
      transition: { duration: 1.15, delay: 0.35 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/properties?destination=${destination}&guests=${guests}`)
  }

  const isOutside = phase === 'outside'
  const isInside = phase === 'inside'

  return (
    <section ref={sectionRef} className="relative h-[240vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-cream" style={{ perspective: '1200px' }}>

        {/* ====== The room, waiting behind the photograph ====== */}
        <div className="absolute inset-0">
          <ScrollPanorama imageSrc={PANORAMA} progressRef={panoramaProgress} interactive={isInside} />
        </div>

        {/* ====== The home, full screen, coming toward you ====== */}
        <motion.div
          ref={imageRef}
          style={{ scale: imageScale, rotateX: imageRotate }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={exterior}
            alt={showcase ? showcase.title : 'A home on the platform'}
            className="h-full w-full object-cover"
          />
          {/* Dark enough at the foot for the copy to sit on, clear at the top
              so the home is still the thing you are looking at */}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/88 via-espresso/45 to-espresso/50" />
        </motion.div>

        {/* ====== The listing the photograph is showing ====== */}
        {showcase && (
          <motion.div
            ref={chipRef}
            style={{ z: chipZ }}
            className="pointer-events-none absolute right-6 top-28 z-10 hidden lg:block"
          >
            <div className="flex items-center gap-4 rounded-2xl border border-linen/20 bg-espresso/45 px-5 py-3.5 backdrop-blur-xl">
              <div>
                <p className="text-[13px] text-linen">{showcase.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-linen/60">
                  <FiMapPin size={11} />
                  {showcase.city}, {showcase.country}
                </p>
              </div>
              <span className="h-8 w-px bg-linen/20" />
              <div className="text-right">
                <p className="text-[13px] text-linen">${showcase.pricePerNight}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-linen/50">per night</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ====== Copy and search ====== */}
        <motion.div
          ref={copyRef}
          style={{ z: copyZ, y: copyY }}
          className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-16 will-change-transform sm:px-8 sm:pb-20"
        >
          <p className="eyebrow text-bronze-soft">Nightly · Monthly · Long lease</p>

          <h1 className="mt-6 max-w-[16ch] font-serif text-[46px] font-light leading-[0.96] text-linen sm:text-[70px] lg:text-[92px]">
            {['Step inside', 'before you book'].map((text, i) => (
              <span key={text} className="block overflow-hidden">
                <motion.span variants={line} custom={i} initial="hidden" animate="show" className="block">
                  {text}
                </motion.span>
              </span>
            ))}
          </h1>

          <p className="mt-7 max-w-[52ch] text-[15px] leading-relaxed text-linen/75 sm:text-[17px]">
            One platform for{' '}
            <span className="text-bronze-soft">
              {currentText}
              <span
                className="ml-0.5 inline-block w-px animate-pulse bg-bronze-soft align-middle"
                style={{ height: '1em' }}
              />
            </span>
          </p>

          {/* Someone here to find a home should never have to scroll to search */}
          <div className={`mt-9 ${isOutside ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-2xl flex-col gap-px overflow-hidden rounded-[22px] border border-linen/25 bg-espresso/35 backdrop-blur-xl sm:flex-row"
            >
              <label className="flex-1 px-6 py-4">
                <span className="eyebrow block text-linen/50">{t('explore.destination')}</span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t('explore.whereTo')}
                  className="mt-1.5 w-full bg-transparent text-[15px] text-linen placeholder-linen/40 focus:outline-none"
                />
              </label>

              <label className="px-6 py-4 sm:border-l sm:border-linen/20">
                <span className="eyebrow block text-linen/50">{t('explore.guests')}</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="mt-1.5 w-full cursor-pointer bg-transparent text-[15px] text-linen focus:outline-none sm:w-20"
                >
                  {[1, 2, 4, 6, 8].map((count) => (
                    <option key={count} value={count} className="bg-espresso text-linen">
                      {count}{count === 8 ? '+' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="group flex items-center justify-center gap-3 bg-bronze px-8 py-5 text-[12px] uppercase tracking-[0.22em] text-linen transition-colors duration-500 hover:bg-bronze-soft"
              >
                <FiSearch size={15} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* What a renter wants to know before typing anything */}
            <div className="mt-7 hidden items-center gap-7 text-[12px] text-linen/60 lg:flex">
              <span className="flex items-center gap-2">
                <FiStar size={13} className="text-bronze-soft" />
                Every home visited before it is listed
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-bronze-soft" />
                Free cancellation on most stays
              </span>
            </div>
          </div>
        </motion.div>

        {/* ====== Inside ====== */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1400px] px-5 pb-14 transition-all duration-700 sm:px-8 ${
            isInside ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-5 rounded-[28px] border border-linen/15 bg-espresso/45 p-7 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-bronze-soft">Drag to look around</p>
              <p className="mt-3 max-w-[30ch] font-serif text-[27px] font-light leading-tight text-linen sm:text-[34px]">
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
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-bronze px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-linen transition-colors duration-500 hover:bg-bronze-soft"
              >
                See this home
                <span className="h-px w-6 bg-linen transition-all duration-500 group-hover:w-9" />
              </Link>
            )}
          </div>
        </div>

        {/* ====== Scroll cue ====== */}
        <div
          className={`absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 ${
            isOutside ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-linen/50">Scroll to step inside</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-bronze-soft"
          >
            <FiArrowDown size={14} />
          </motion.span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
