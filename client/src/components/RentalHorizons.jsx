import React, { useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { FiMoon, FiCalendar, FiKey } from 'react-icons/fi'

// Kept in step with MID_TERM_MIN_NIGHTS in server/sevices/pricingEngine.js
const MID_TERM_MIN_NIGHTS = 28

/**
 * The three ways to take a home on this platform. The terms below are the ones
 * the pricing engine actually applies - what is taken at checkout, what is
 * billed later, and what has to come back at the end.
 */
const HORIZONS = [
  {
    id: 'short',
    icon: FiMoon,
    eyebrow: 'Short stay',
    title: 'By the night',
    stay: '1 to 27 nights',
    blurb: 'A few nights in a city you are visiting, priced per night and settled before you arrive.',
    terms: [
      ['Paid', 'The whole stay, at checkout'],
      ['On top', 'Cleaning, service and local tax'],
      ['Deposit', 'None on most homes'],
      ['Cancelling', 'Refunded on the host’s policy'],
    ],
  },
  {
    id: 'mid',
    icon: FiCalendar,
    eyebrow: 'Mid stay',
    title: 'By the month',
    stay: `${MID_TERM_MIN_NIGHTS} nights and up`,
    blurb:
      'A contract, a relocation, a season somewhere else. Furnished, billed monthly, and no lease to sign.',
    terms: [
      ['Paid', 'First month at checkout'],
      ['Then', 'One charge a month, on schedule'],
      ['Part months', 'Prorated from the monthly rate'],
      ['Deposit', 'Held, returned after checkout'],
    ],
    featured: true,
  },
  {
    id: 'long',
    icon: FiKey,
    eyebrow: 'Long let',
    title: 'On a lease',
    stay: 'Six months and up',
    blurb: 'Somewhere to actually live, on a signed term, with the rent and the deposit set out in writing.',
    terms: [
      ['Paid', 'First month plus deposit'],
      ['Then', 'Rent monthly for the term'],
      ['Utilities', 'Included on some homes'],
      ['Ending', 'By the terms of the lease'],
    ],
  },
]

/**
 * RentalHorizons - the thing that makes this platform different, said plainly.
 *
 * A guest arriving here cannot tell that the same home can be taken for three
 * nights, three months or three years, because nothing on the page has ever
 * said so. The cards tilt toward the pointer so the row has some depth to it
 * without any of them moving far enough to be hard to read.
 */
const RentalHorizons = () => {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-120px' })

  return (
    <section ref={sectionRef} className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <p className="eyebrow text-bronze">One platform, three ways to stay</p>

        <h2 className="mt-6 max-w-[20ch] font-serif text-[38px] font-light leading-[1.04] text-espresso sm:text-[52px] lg:text-[62px]">
          Three nights or three years
        </h2>

        <p className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-espresso-soft sm:text-[17px]">
          The same home can be taken for a weekend, a season or a signed term. What changes is how
          it is billed and what you are held to - so here is all of it, before you start looking.
        </p>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {HORIZONS.map((horizon, index) => (
            <HorizonCard key={horizon.id} horizon={horizon} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * One horizon, on a card that leans toward wherever the pointer is.
 */
const HorizonCard = ({ horizon, index, inView }) => {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const Icon = horizon.icon

  const handlePointerMove = (event) => {
    const bounds = cardRef.current?.getBoundingClientRect()
    if (!bounds) return
    // Kept small on purpose: enough to read as depth, not enough to make the
    // terms underneath hard to follow
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    setTilt({ x: -y * 7, y: x * 7 })
  }

  const resetTilt = () => setTilt({ x: 0, y: 0 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className={`flex h-full flex-col rounded-[28px] border p-8 transition-[transform,box-shadow] duration-300 ease-out sm:p-9 ${
          horizon.featured
            ? 'border-bronze/35 bg-espresso shadow-[0_30px_70px_-45px_rgba(28,24,20,0.85)]'
            : 'border-espresso-line bg-linen shadow-[0_24px_60px_-48px_rgba(28,24,20,0.6)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full ${
              horizon.featured ? 'bg-bronze text-linen' : 'bg-cream text-bronze'
            }`}
          >
            <Icon size={17} />
          </span>
          <span
            className={`eyebrow ${horizon.featured ? 'text-bronze-soft' : 'text-espresso-soft/55'}`}
          >
            {horizon.eyebrow}
          </span>
        </div>

        <h3
          className={`mt-8 font-serif text-[32px] font-light leading-tight sm:text-[38px] ${
            horizon.featured ? 'text-linen' : 'text-espresso'
          }`}
        >
          {horizon.title}
        </h3>

        <p className={`mt-2 text-[13px] ${horizon.featured ? 'text-bronze-soft' : 'text-bronze'}`}>
          {horizon.stay}
        </p>

        <p
          className={`mt-5 text-[14px] leading-relaxed ${
            horizon.featured ? 'text-linen/70' : 'text-espresso-soft'
          }`}
        >
          {horizon.blurb}
        </p>

        <dl className="mt-8 space-y-3.5">
          {horizon.terms.map(([label, value]) => (
            <div
              key={label}
              className={`flex items-baseline justify-between gap-5 border-b pb-3.5 text-[13px] ${
                horizon.featured ? 'border-linen/12' : 'border-espresso-line'
              }`}
            >
              <dt
                className={`shrink-0 text-[10px] uppercase tracking-[0.16em] ${
                  horizon.featured ? 'text-linen/45' : 'text-espresso-soft/55'
                }`}
              >
                {label}
              </dt>
              <dd className={`text-right ${horizon.featured ? 'text-linen/85' : 'text-espresso'}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          to={`/properties?rentalType=${horizon.id}`}
          className={`group mt-9 inline-flex w-fit items-center gap-3 rounded-full px-7 py-4 text-[11px] uppercase tracking-[0.2em] transition-colors duration-500 ${
            horizon.featured
              ? 'bg-bronze text-linen hover:bg-bronze-soft'
              : 'border border-espresso-line text-espresso hover:border-bronze hover:text-bronze'
          }`}
        >
          See these homes
          <span
            className={`h-px w-5 transition-all duration-500 group-hover:w-8 ${
              horizon.featured ? 'bg-linen' : 'bg-bronze'
            }`}
          />
        </Link>
      </div>
    </motion.div>
  )
}

export default RentalHorizons
