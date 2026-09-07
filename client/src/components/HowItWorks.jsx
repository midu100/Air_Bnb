import React from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiCalendar, FiKey } from 'react-icons/fi'

// The three steps are the same whichever horizon you are on. What changes is
// how long you hold the keys.
const STEPS = [
  {
    step: '01',
    icon: FiSearch,
    title: 'Pick how long',
    description:
      'A few nights, a furnished month, or a signed term. Choosing first is what sets the price and what is asked up front.',
  },
  {
    step: '02',
    icon: FiCalendar,
    title: 'Book the dates',
    description:
      'The calendar shows what is genuinely free - confirmed stays block themselves out, so nothing can be booked twice.',
  },
  {
    step: '03',
    icon: FiKey,
    title: 'Move in',
    description:
      'Message the host from the booking, get in, and stay. Deposits come back after checkout on the terms you agreed.',
  },
]

/**
 * HowItWorks - three steps, in the platform's own language.
 *
 * The section used to be headed "Why Choose Air-Bnb?" on a site called EasyLet,
 * and described a travel site rather than one that also does month-long stays
 * and year-long leases.
 */
const HowItWorks = () => (
  <section id="how-it-works" className="bg-linen py-24 sm:py-28">
    <div className="mx-auto max-w-[1400px] px-6 sm:px-10">

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:items-end lg:gap-16">
        <h2 className="max-w-[16ch] font-sans text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] text-espresso sm:text-[46px] lg:text-[54px]">
          Three steps, whichever way you stay
        </h2>
        <p className="max-w-[36ch] text-[13.5px] leading-relaxed text-espresso-soft/75">
          The same platform books a weekend and signs a year. Only the paperwork behind it changes.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {STEPS.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl border border-espresso-line/70 bg-white p-8 transition-all duration-500 hover:border-espresso-soft/40 hover:shadow-[0_28px_60px_-48px_rgba(28,24,20,0.5)]"
            >
              <span className="absolute right-7 top-7 font-sans text-[42px] font-semibold leading-none tracking-[-0.04em] text-espresso-line/70 transition-colors duration-500 group-hover:text-cream">
                {item.step}
              </span>

              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-bronze">
                <Icon size={18} />
              </span>

              <h3 className="mt-8 font-sans text-[20px] font-semibold tracking-[-0.02em] text-espresso">
                {item.title}
              </h3>

              <p className="mt-3 max-w-[38ch] text-[13.5px] leading-relaxed text-espresso-soft/80">
                {item.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  </section>
)

export default HowItWorks
