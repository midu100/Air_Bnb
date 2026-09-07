import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiMapPin } from 'react-icons/fi'
import { useGetFeaturedPropertiesQuery } from '../../store/api/propertyApi'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=2000&fit=crop&q=85'

/**
 * AuthPanel - the half of an auth page that is not the form.
 *
 * It shows a real listing rather than stock photography, so someone signing in
 * is looking at the thing they came for. The pages used to run a slider of
 * placeholder images captioned "Elevate Your Wardrobe Today", left over from a
 * different project entirely.
 */
const AuthPanel = ({ eyebrow, title, blurb }) => {
  const { data } = useGetFeaturedPropertiesQuery()

  const featured = data?.properties || []
  const showcase = featured.find((home) => ['House', 'Villa'].includes(home.propertyType)) || featured[0] || null
  const image = showcase?.thumbnail || FALLBACK_IMAGE

  return (
    <div className="relative hidden overflow-hidden lg:block">
      <img
        src={image}
        alt={showcase ? showcase.title : 'A home on the platform'}
        style={{ objectPosition: 'center 42%' }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/70 to-espresso/35" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-linen/25 px-4 py-2.5 text-[12px] text-linen transition-colors duration-300 hover:border-linen"
        >
          <FiArrowLeft size={13} />
          Back to the site
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.32em] text-bronze-soft">{eyebrow}</p>

          <h2 className="mt-6 max-w-[14ch] whitespace-pre-line font-sans text-[42px] font-semibold leading-[0.98] tracking-[-0.03em] text-linen xl:text-[52px]">
            {title}
          </h2>

          <p className="mt-6 max-w-[42ch] text-[13.5px] leading-relaxed text-linen/70">{blurb}</p>

          {showcase && (
            <p className="mt-10 flex items-center gap-2 text-[12px] text-linen/55">
              <FiMapPin size={12} />
              {showcase.title} · {showcase.city}, {showcase.country}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPanel
