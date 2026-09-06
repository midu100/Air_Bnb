import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowDown, FiSearch } from 'react-icons/fi'
import heroVdo from '../assets/videos/hero.mp4'
import ScrollPanorama from './ScrollPanorama'
import { useLocale } from '../i18n/LocaleContext'
import { useGetFeaturedPropertiesQuery } from '../store/api/propertyApi'

const PANORAMA = 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg'

const PHRASES = [
  'beachfront villas by the night',
  'furnished lofts by the month',
  'a home on a proper lease',
  'forest cabins for a long weekend',
]

/**
 * The hero walks you inside before you book.
 *
 *   outside   the footage, the headline, the search
 *   entering  the frame opens like a doorway and the room resolves behind it
 *   inside    you are in the room and can look around
 *
 * Transform and clip-path are driven by framer-motion, which updates them
 * reliably on a pinned section. Opacity is driven by a phase and CSS instead —
 * motion values for opacity stay frozen here, so they are not trusted with it.
 */
const HeroSection = () => {
  const navigate = useNavigate()
  const { t } = useLocale()
  const sectionRef = useRef(null)

  const [destination, setDestination] = useState('')
  const [guests, setGuests] = useState('1')
  const [phase, setPhase] = useState('outside')

  const { data: featuredData } = useGetFeaturedPropertiesQuery()
  const showcase = featuredData?.properties?.[0] || null

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
      panoramaProgress.current = Math.max(0, Math.min(1, (value - 0.24) / 0.5))
      setPhase(value > 0.6 ? 'inside' : value > 0.22 ? 'entering' : 'outside')
    }
    apply(scrollYProgress.get())
    return scrollYProgress.on('change', apply)
  }, [scrollYProgress])

  const videoScale = useTransform(scrollYProgress, [0, 0.6], [1.04, 2.7])
  const apertureInset = useTransform(scrollYProgress, [0.1, 0.58], ['0%', '48%'])
  const apertureRadius = useTransform(scrollYProgress, [0.1, 0.58], ['0px', '280px'])
  const doorway = useTransform(
    [apertureInset, apertureRadius],
    ([inset, radius]) => `inset(${inset} ${inset} ${inset} ${inset} round ${radius})`
  )
  const copyY = useTransform(scrollYProgress, [0, 0.3], [0, -120])

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
      <div className="sticky top-0 h-screen overflow-hidden bg-ink grain">

        {/* ====== The room, always behind ====== */}
        <div className="absolute inset-0">
          <ScrollPanorama imageSrc={PANORAMA} progressRef={panoramaProgress} interactive={isInside} />
        </div>

        {/* ====== The doorway ====== */}
        <motion.div
          style={{ scale: videoScale, clipPath: doorway }}
          className={`absolute inset-0 will-change-transform transition-opacity duration-700 ${
            isInside ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src={heroVdo} type="video/mp4" />
          </video>
          <div
            className={`absolute inset-0 bg-ink transition-opacity duration-700 ${
              isOutside ? 'opacity-40' : 'opacity-85'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" />
        </motion.div>

        {/* ====== Copy and search ====== */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24 lg:pb-28">
          <motion.div
            style={{ y: copyY }}
            className={`transition-opacity duration-500 ${isOutside ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="eyebrow text-brass">Nightly · Monthly · Long lease</p>

            <h1 className="mt-6 max-w-[16ch] font-serif text-[44px] font-light leading-[0.98] text-ivory sm:text-[68px] lg:text-[94px]">
              {['Step inside', 'before you book'].map((text, i) => (
                <span key={text} className="block overflow-hidden">
                  <motion.span variants={line} custom={i} initial="hidden" animate="show" className="block">
                    {text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <p className="mt-7 max-w-[52ch] text-[15px] leading-relaxed text-ivory/70 sm:text-[17px]">
              One platform for{' '}
              <span className="text-brass">
                {currentText}
                <span className="ml-0.5 inline-block w-px animate-pulse bg-brass align-middle" style={{ height: '1em' }} />
              </span>
            </p>
          </motion.div>

          {/* The search never leaves — someone who came to look for a home
              should not have to scroll through a film to reach it */}
          <div
            className={`pointer-events-auto mt-8 transition-opacity duration-500 ${
              phase === 'entering' ? 'opacity-25' : 'opacity-100'
            }`}
          >
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-2xl flex-col gap-px overflow-hidden rounded-2xl border border-ivory/15 bg-ink/50 backdrop-blur-md sm:flex-row"
            >
              <label className="flex-1 px-6 py-4">
                <span className="eyebrow block text-ivory/40">{t('explore.destination')}</span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t('explore.whereTo')}
                  className="mt-1.5 w-full bg-transparent text-[15px] text-ivory placeholder-ivory/30 focus:outline-none"
                />
              </label>

              <label className="px-6 py-4 sm:border-l sm:border-ivory/15">
                <span className="eyebrow block text-ivory/40">{t('explore.guests')}</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="mt-1.5 w-full cursor-pointer bg-transparent text-[15px] text-ivory focus:outline-none sm:w-20"
                >
                  {[1, 2, 4, 6, 8].map((count) => (
                    <option key={count} value={count} className="bg-ink text-ivory">
                      {count}{count === 8 ? '+' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="group flex items-center justify-center gap-3 bg-brass px-8 py-5 text-[12px] uppercase tracking-[0.22em] text-ink transition-colors duration-500 hover:bg-brass-soft"
              >
                <FiSearch size={15} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* ====== Inside ====== */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1400px] px-5 pb-14 transition-all duration-700 sm:px-8 ${
            isInside ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-brass">Drag to look around</p>
              <p className="mt-3 max-w-[30ch] font-serif text-[26px] font-light leading-tight text-ivory sm:text-[34px]">
                {showcase ? showcase.title : 'Every listing opens like this'}
              </p>
              {showcase && (
                <p className="mt-2 text-[13px] text-ivory/55">
                  {showcase.city}, {showcase.country} · from ${showcase.pricePerNight}/night
                </p>
              )}
            </div>

            {showcase && (
              <Link
                to={`/property/${showcase._id}`}
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-brass px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-ink transition-colors duration-500 hover:bg-brass-soft"
              >
                See this home
                <span className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-9" />
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
          <span className="text-[9px] uppercase tracking-[0.4em] text-ivory/40">Scroll to step inside</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-brass"
          >
            <FiArrowDown size={14} />
          </motion.span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
