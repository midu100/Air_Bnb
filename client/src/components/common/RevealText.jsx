import React from 'react'
import { motion } from 'framer-motion'

// ====== Word by word mask reveal.
// The trigger lives on the wrapper: each word sits fully below its own
// overflow-hidden box, so an observer placed on the word itself would be
// clipped to zero area and never fire.
const wordVariants = {
  hidden: { y: '112%' },
  show: (i) => ({
    y: '0%',
    transition: { duration: 0.9, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] },
  }),
}

const RevealText = ({ text, className = '', delay = 0, once = true }) => {
  const words = String(text).split(' ')

  return (
    <motion.span
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-8% 0px' }}
      transition={{ delayChildren: delay }}
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span variants={wordVariants} custom={i} className="inline-block">
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

export default RevealText
