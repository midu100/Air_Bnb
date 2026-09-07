import React from 'react'
import { motion } from 'framer-motion'
import { FiCreditCard, FiShield, FiCalendar, FiFileText } from 'react-icons/fi'

// Every line here is something the platform actually does. The section this
// replaced carried three invented guests praising the "property carousels",
// which is fabricated social proof on a site with no reviews in it yet.
const ASSURANCES = [
  {
    icon: FiCreditCard,
    title: 'Payment never touches us',
    description:
      'Card details go straight to Stripe. We are told a payment succeeded and nothing more, and the confirmation comes from a signed message we verify.',
  },
  {
    icon: FiShield,
    title: 'Deposits come back',
    description:
      'A deposit is held separately from the rent and returned after checkout. Cancelling a stay returns it in full, whatever the cancellation policy says about the rest.',
  },
  {
    icon: FiCalendar,
    title: 'The calendar cannot lie',
    description:
      'A confirmed stay blocks its own dates the moment it is paid, so two people cannot book the same home for the same night.',
  },
  {
    icon: FiFileText,
    title: 'The price before you pay',
    description:
      'Every stay is quoted in full first - rent, cleaning, service, tax, deposit and any discount - so nothing appears on the bill that was not on the quote.',
  },
]

/**
 * GuestAssurances - what a guest is actually covered by.
 */
const GuestAssurances = () => (
  <section className="bg-cream py-24 sm:py-28">
    <div className="mx-auto max-w-[1400px] px-6 sm:px-10">

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:items-end lg:gap-16">
        <h2 className="max-w-[16ch] font-sans text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] text-espresso sm:text-[46px] lg:text-[54px]">
          What you are covered by
        </h2>
        <p className="max-w-[36ch] text-[13.5px] leading-relaxed text-espresso-soft/75">
          Booking somewhere to live is not the same as buying a jumper. Here is what happens to
          your money and your dates.
        </p>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-espresso-line/70 bg-espresso-line/70 sm:grid-cols-2">
        {ASSURANCES.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-linen p-8 sm:p-10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-bronze">
                <Icon size={17} />
              </span>

              <h3 className="mt-7 font-sans text-[19px] font-semibold tracking-[-0.02em] text-espresso">
                {item.title}
              </h3>

              <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-espresso-soft/80">
                {item.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  </section>
)

export default GuestAssurances
