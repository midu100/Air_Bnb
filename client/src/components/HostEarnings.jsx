import React, { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { FiTrendingUp } from 'react-icons/fi'

// Both ratios are measured across the homes already listed on the platform:
// a monthly rate settles near two thirds of thirty nights, and a lease near
// half. Hosts trade rate for certainty, and these are the terms they trade at.
const MONTHLY_RATIO = 0.66
const LEASE_RATIO = 0.5

const money = (value) => `$${Math.round(value).toLocaleString('en-US')}`

/**
 * HostEarnings - what the same home earns on each of the three horizons.
 *
 * This is the question a host actually arrives with, and the answer is the
 * argument for the whole platform: nightly pays most when the calendar is
 * full, a lease pays least but pays every month regardless. Nowhere else on
 * the site puts those side by side.
 */
const HostEarnings = () => {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-120px' })

  const [nightlyRate, setNightlyRate] = useState(180)
  const [occupancy, setOccupancy] = useState(68)

  const rows = useMemo(() => {
    const thirtyNights = nightlyRate * 30
    const nightly = thirtyNights * (occupancy / 100)
    const monthly = thirtyNights * MONTHLY_RATIO
    const lease = thirtyNights * LEASE_RATIO
    const ceiling = Math.max(nightly, monthly, lease, 1)

    return [
      {
        id: 'short',
        label: 'By the night',
        amount: nightly,
        note: `${occupancy}% of the month booked`,
        share: nightly / ceiling,
      },
      {
        id: 'mid',
        label: 'By the month',
        amount: monthly,
        note: 'One tenant, one charge a month',
        share: monthly / ceiling,
      },
      {
        id: 'long',
        label: 'On a lease',
        amount: lease,
        note: 'Signed term, paid whether or not anyone visits',
        share: lease / ceiling,
      },
    ]
  }, [nightlyRate, occupancy])

  const best = rows.reduce((winner, row) => (row.amount > winner.amount ? row : winner), rows[0])

  return (
    <section ref={sectionRef} className="bg-espresso py-24 text-linen sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">

          {/* ====== The question ====== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow text-bronze-soft">For hosts</p>

            <h2 className="mt-6 max-w-[16ch] font-serif text-[38px] font-light leading-[1.04] sm:text-[52px] lg:text-[60px]">
              What could your place earn?
            </h2>

            <p className="mt-6 max-w-[50ch] text-[15px] leading-relaxed text-linen/65 sm:text-[16px]">
              The same home earns differently depending on how long you let it for. Nightly pays
              most when the calendar stays full. A lease pays least, and pays every month whether
              or not anyone comes. Move the sliders and see the trade.
            </p>

            {/* ====== The two things a host actually knows ====== */}
            <div className="mt-12 space-y-9">
              <Slider
                label="Nightly rate"
                value={nightlyRate}
                display={money(nightlyRate)}
                min={40}
                max={600}
                step={5}
                onChange={setNightlyRate}
              />
              <Slider
                label="Nights booked"
                value={occupancy}
                display={`${occupancy}%`}
                min={20}
                max={95}
                step={1}
                onChange={setOccupancy}
              />
            </div>

            <Link
              to="/admin/properties"
              className="group mt-12 inline-flex w-fit items-center gap-3 rounded-full bg-bronze px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-linen transition-colors duration-500 hover:bg-bronze-soft"
            >
              List your home
              <span className="h-px w-5 bg-linen transition-all duration-500 group-hover:w-8" />
            </Link>
          </motion.div>

          {/* ====== The answer ====== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] border border-linen/12 bg-linen/[0.04] p-8 backdrop-blur-sm sm:p-10"
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow text-linen/45">A month, before fees and tax</p>
              <FiTrendingUp size={15} className="text-bronze-soft" />
            </div>

            <div className="mt-10 space-y-9">
              {rows.map((row) => (
                <div key={row.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[13px] text-linen/80">{row.label}</p>
                    <p className="font-serif text-[30px] font-light sm:text-[34px]">
                      {money(row.amount)}
                    </p>
                  </div>

                  <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-linen/10">
                    <motion.div
                      animate={{ width: `${row.share * 100}%` }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${
                        row.id === best.id ? 'bg-bronze' : 'bg-linen/30'
                      }`}
                    />
                  </div>

                  <p className="mt-2.5 text-[12px] text-linen/45">{row.note}</p>
                </div>
              ))}
            </div>

            <p className="mt-10 border-t border-linen/12 pt-6 text-[12px] leading-relaxed text-linen/45">
              Monthly and lease rates are modelled on what homes already listed here charge -
              about two thirds of thirty nights for a month, about half for a lease. Your own
              rates are yours to set.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/**
 * A slider that shows the number it is setting, because a host reading this is
 * checking it against a figure they already have in their head.
 */
const Slider = ({ label, value, display, min, max, step, onChange }) => (
  <label className="block">
    <div className="flex items-baseline justify-between">
      <span className="eyebrow text-linen/45">{label}</span>
      <span className="font-serif text-[24px] font-light text-linen">{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label={label}
      className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-linen/15 accent-bronze"
    />
  </label>
)

export default HostEarnings
