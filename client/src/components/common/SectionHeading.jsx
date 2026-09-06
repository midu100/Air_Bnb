import React from 'react'
import { motion } from 'framer-motion'
import RevealText from './RevealText'

// ====== Rule, eyebrow, then a serif headline. The rule draws itself in, which
// is what makes a heading feel composed rather than dropped in.
const SectionHeading = ({ eyebrow, title, tone = 'light', className = '', titleClassName = '' }) => {
  const isDark = tone === 'dark'

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <motion.span
          className={`block h-px w-12 origin-left ${isDark ? 'bg-bronze/60' : 'bg-espresso/25'}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className={`eyebrow whitespace-nowrap ${isDark ? 'text-bronze' : 'text-bronze'}`}>{eyebrow}</span>
      </div>

      <h2
        className={`mt-6 font-serif font-light leading-[1.06] text-[34px] sm:text-[46px] lg:text-[58px] ${
          isDark ? 'text-linen' : 'text-espresso'
        } ${titleClassName}`}
      >
        <RevealText text={title} />
      </h2>
    </div>
  )
}

export default SectionHeading
