import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowDown, FiSearch } from 'react-icons/fi'
import heroVdo from '../assets/videos/hero.mp4'
import { useLocale } from '../i18n/LocaleContext'

// What the platform actually offers, cycled one at a time
const PHRASES = [
  'beachfront villas by the night',
  'furnished lofts by the month',
  'a home on a proper lease',
  'forest cabins for a long weekend',
]

const HeroSection = () => {
  const navigate = useNavigate()
  const { t } = useLocale()

  const [destination, setDestination] = useState('')
  const [guests, setGuests] = useState('1')

  // ====== Typewriter
  const [currentText, setCurrentText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex]
    const atEnd = !isDeleting && currentText === currentPhrase
    const atStart = isDeleting && currentText === ''

    // Every state change happens in the timer callback, never in the effect
    // body, so one keystroke cannot cascade into a second render pass
    const delay = atEnd ? 2100 : isDeleting ? 34 : 62

    const timer = setTimeout(() => {
      if (atEnd) {
        setIsDeleting(true)
        return
      }
      if (atStart) {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length)
        return
      }
      setCurrentText(
        isDeleting
          ? currentPhrase.substring(0, currentText.length - 1)
          : currentPhrase.substring(0, currentText.length + 1)
      )
    }, delay)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, phraseIndex])

  // ====== The hero sits at the top of the document, so plain scrollY is the
  // most reliable driver for the pinned section beneath it.
  const [vh, setVh] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight))
  const { scrollY } = useScroll()

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // The footage keeps pushing in while the copy lifts away
  const videoScale = useTransform(scrollY, [0, vh * 1.5], [1.04, 1.42])
  const veil = useTransform(scrollY, [0, vh * 1.3], [0.42, 0.96])
  const copyOpacity = useTransform(scrollY, [0, vh * 0.6], [1, 0])
  const copyY = useTransform(scrollY, [0, vh * 0.85], [0, -130])
  const cueOpacity = useTransform(scrollY, [0, vh * 0.28], [1, 0])

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

  return (
    <section className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden grain">
        {/* ====== Footage ====== */}
        <motion.div style={{ scale: videoScale }} className="absolute inset-0 will-change-transform">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src={heroVdo} type="video/mp4" />
          </video>
        </motion.div>

        {/* ====== Veils ====== */}
        <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/65" />

        {/* ====== Copy ====== */}
        <motion.div
          style={{ opacity: copyOpacity, y: copyY }}
          className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24 lg:pb-28"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="eyebrow text-brass"
          >
            Nightly · Monthly · Long lease
          </motion.p>

          <h1 className="mt-6 max-w-[16ch] font-serif text-[44px] font-light leading-[0.98] text-ivory sm:text-[68px] lg:text-[94px]">
            {['Stay a night,', 'or stay for good'].map((text, i) => (
              <span key={text} className="block overflow-hidden">
                <motion.span variants={line} custom={i} initial="hidden" animate="show" className="block">
                  {text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 space-y-8"
          >
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-ivory/70 sm:text-[17px]">
              One platform for{' '}
              <span className="text-brass">
                {currentText}
                <span className="ml-0.5 inline-block w-px animate-pulse bg-brass align-middle" style={{ height: '1em' }} />
              </span>
            </p>

            {/* ====== Search ====== */}
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-2xl flex-col gap-px overflow-hidden border border-ivory/15 bg-ink/40 backdrop-blur-md sm:flex-row"
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
                  className="mt-1.5 w-full cursor-pointer bg-transparent text-[15px] text-ivory focus:outline-none sm:w-24"
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
          </motion.div>
        </motion.div>

        {/* ====== Scroll cue ====== */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-ivory/40">Scroll</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-brass"
          >
            <FiArrowDown size={14} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
