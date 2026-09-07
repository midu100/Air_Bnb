import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { FiArrowUpRight, FiRotateCcw, FiUsers, FiHome, FiDroplet } from 'react-icons/fi'
import { useGetPropertiesQuery, useSearchPropertiesQuery } from '../store/api/propertyApi'

// The three horizons, and the price the slider is really talking about on each
const TABS = [
  {
    id: 'short',
    label: 'Nightly',
    unit: 'night',
    hint: 'One to 27 nights, paid in full at checkout',
    bands: [[0, 150], [150, 250], [250, 400], [400, 0]],
  },
  {
    id: 'mid',
    label: 'Monthly',
    unit: 'month',
    // 28 nights is MID_TERM_MIN_NIGHTS in server/sevices/pricingEngine.js
    hint: '28 nights minimum, first month at checkout',
    bands: [[0, 3000], [3000, 4500], [4500, 6500], [6500, 0]],
  },
  {
    id: 'long',
    label: 'Lease',
    unit: 'month',
    hint: 'Six months minimum, first month plus deposit',
    bands: [[0, 2500], [2500, 4000], [4000, 6000], [6000, 0]],
  },
]

const ANY = 'any'

const bandLabel = ([min, max]) => {
  if (!min) return `Under $${max.toLocaleString('en-US')}`
  if (!max) return `$${min.toLocaleString('en-US')}+`
  return `$${min.toLocaleString('en-US')} - $${max.toLocaleString('en-US')}`
}

/**
 * FindYourHome - the search a visitor came here to run, and the homes it finds.
 *
 * The tabs are the platform's three horizons rather than the buy/rent split a
 * sales site would use, because that is the choice that actually changes what
 * a home costs here. The button counts the result before you press it, so no
 * one lands on an empty page having picked four filters blind.
 */
const FindYourHome = () => {
  const navigate = useNavigate()

  const [rentalType, setRentalType] = useState('short')
  const [country, setCountry] = useState(ANY)
  const [propertyType, setPropertyType] = useState(ANY)
  const [band, setBand] = useState(ANY)
  const [bedrooms, setBedrooms] = useState(ANY)

  const tab = TABS.find((item) => item.id === rentalType) || TABS[0]

  // ====== Everything on the platform, so the dropdowns can only offer
  // somewhere that actually has homes in it
  const { data: allData } = useGetPropertiesQuery({ limit: 100 })
  const properties = allData?.properties || []

  const countries = useMemo(
    () => [...new Set(properties.map((property) => property.country).filter(Boolean))].sort(),
    [properties]
  )
  const propertyTypes = useMemo(
    () => [...new Set(properties.map((property) => property.propertyType).filter(Boolean))].sort(),
    [properties]
  )

  // ====== The filters as the API wants them
  const query = useMemo(() => {
    const params = { rentalType, limit: 3 }
    if (country !== ANY) params.country = country
    if (propertyType !== ANY) params.propertyType = propertyType
    if (bedrooms !== ANY) params.bedrooms = bedrooms
    if (band !== ANY) {
      const [min, max] = tab.bands[Number(band)]
      if (min) params.minPrice = min
      if (max) params.maxPrice = max
    }
    return params
  }, [rentalType, country, propertyType, bedrooms, band, tab])

  const { data: resultData, isFetching } = useSearchPropertiesQuery(query)
  const results = resultData?.properties || []
  const total = resultData?.total ?? results.length

  const isTouched =
    country !== ANY || propertyType !== ANY || band !== ANY || bedrooms !== ANY

  const clearFilters = () => {
    setCountry(ANY)
    setPropertyType(ANY)
    setBand(ANY)
    setBedrooms(ANY)
  }

  const showProperties = () => {
    const params = new URLSearchParams()
    params.set('rentalType', rentalType)
    if (country !== ANY) params.set('country', country)
    if (propertyType !== ANY) params.set('propertyType', propertyType)
    if (bedrooms !== ANY) params.set('bedrooms', bedrooms)
    // Carry the price band over too, or the count shown here and the page they
    // land on disagree
    if (band !== ANY) {
      const [min, max] = tab.bands[Number(band)]
      if (min) params.set('minPrice', min)
      if (max) params.set('maxPrice', max)
    }
    navigate(`/properties?${params.toString()}`)
  }

  // A tab change can leave a price band pointing at the wrong scale entirely
  const handleTabChange = (id) => {
    setRentalType(id)
    setBand(ANY)
  }

  return (
    <section className="bg-linen py-24 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">

        {/* ====== The line ====== */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-start lg:gap-16">
          <h2 className="max-w-[15ch] font-sans text-[38px] font-semibold leading-[0.98] tracking-[-0.03em] text-espresso sm:text-[54px] lg:text-[62px]">
            We help you find the home that fits
          </h2>
          <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-espresso-soft/75 lg:pt-3">
            Pick how long you want it for first. It changes the price, what is asked up front and
            what you are held to at the end.
          </p>
        </div>

        {/* ====== The search ====== */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-espresso-line/70 bg-white shadow-[0_30px_70px_-55px_rgba(28,24,20,0.5)]">

          {/* Horizon tabs */}
          <div className="flex items-stretch border-b border-espresso-line/60">
            <div className="flex overflow-x-auto">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                aria-pressed={rentalType === item.id}
                className={`relative shrink-0 cursor-pointer border-none px-8 py-4 text-[13px] font-medium transition-colors duration-300 sm:px-11 ${
                  rentalType === item.id
                    ? 'bg-white text-espresso'
                    : 'bg-cream/60 text-espresso-soft/65 hover:text-espresso'
                }`}
              >
                {item.label}
                {rentalType === item.id && (
                  <motion.span
                    layoutId="horizon-tab"
                    className="absolute inset-x-0 -bottom-px h-[2px] bg-espresso"
                  />
                )}
              </button>
            ))}
            </div>

            <p className="hidden flex-1 items-center justify-end bg-cream/60 px-6 text-[12px] text-espresso-soft/60 md:flex">
              {tab.hint}
            </p>
          </div>

          {/* Filters */}
          <div className="grid gap-3 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Country" value={country} onChange={setCountry}>
              <option value={ANY}>All countries</option>
              {countries.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Field>

            <Field label="Property type" value={propertyType} onChange={setPropertyType}>
              <option value={ANY}>Any property</option>
              {propertyTypes.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Field>

            <Field label={`Price per ${tab.unit}`} value={band} onChange={setBand}>
              <option value={ANY}>Any price</option>
              {tab.bands.map((range, index) => (
                <option key={bandLabel(range)} value={index}>{bandLabel(range)}</option>
              ))}
            </Field>

            <Field label="Bedrooms" value={bedrooms} onChange={setBedrooms}>
              <option value={ANY}>Any size</option>
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>{count}+ bedrooms</option>
              ))}
            </Field>
          </div>

          {/* What the filters found */}
          <div className="flex flex-col gap-4 border-t border-espresso-line/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[12.5px] text-espresso-soft/70">
              {isFetching
                ? 'Counting homes...'
                : total > 0
                ? `${total} ${total === 1 ? 'home' : 'homes'} match`
                : 'Nothing matches all four - try widening one'}
            </p>

            <div className="flex items-center gap-2">
              {isTouched && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-4 py-3 text-[12.5px] text-espresso-soft/70 transition-colors duration-300 hover:text-espresso"
                >
                  <FiRotateCcw size={13} />
                  Clear filters
                </button>
              )}

              <button
                type="button"
                onClick={showProperties}
                disabled={total === 0}
                className="group inline-flex cursor-pointer items-center gap-2.5 rounded-lg border-none bg-espresso px-7 py-3.5 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft disabled:cursor-not-allowed disabled:bg-espresso/35"
              >
                Show homes
                <FiArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </div>
        </div>

        {/* ====== What it found ====== */}
        {results.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between gap-6">
              <h3 className="font-sans text-[24px] font-semibold tracking-[-0.02em] text-espresso sm:text-[28px]">
                {isTouched ? 'Matching homes' : 'New on the platform'}
              </h3>
              <Link
                to={`/properties?rentalType=${rentalType}`}
                className="group inline-flex items-center gap-2 text-[13px] font-medium text-espresso-soft transition-colors duration-300 hover:text-espresso"
              >
                See all
                <FiArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((property, index) => (
                <ResultCard key={property._id} property={property} index={index} tab={tab} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * One labelled dropdown. The label sits inside the control so the row stays a
 * single line of boxes rather than a stack of headings and boxes.
 */
const Field = ({ label, value, onChange, children }) => (
  <label className="group flex cursor-pointer flex-col rounded-xl border border-espresso-line/70 px-4 py-2.5 transition-colors duration-300 focus-within:border-espresso hover:border-espresso-soft/50">
    <span className="text-[10px] uppercase tracking-[0.16em] text-espresso-soft/50">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-0.5 w-full cursor-pointer border-none bg-transparent text-[13.5px] text-espresso focus:outline-none"
    >
      {children}
    </select>
  </label>
)

/**
 * One home, priced on whichever horizon the tabs are currently showing.
 */
const ResultCard = ({ property, index, tab }) => {
  const price = tab.id === 'short' ? property.pricePerNight : property.monthlyRate || property.pricePerNight * 30
  const specs = [
    [FiUsers, property.maxGuests, 'guest'],
    [FiHome, property.bedrooms, 'bed'],
    [FiDroplet, property.bathrooms, 'bath'],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/property/${property._id}`}
        className="group block overflow-hidden rounded-2xl border border-espresso-line/60 bg-white transition-all duration-500 hover:border-espresso-soft/40 hover:shadow-[0_28px_60px_-45px_rgba(28,24,20,0.55)]"
      >
        <div className="aspect-[4/3] overflow-hidden bg-cream">
          <img
            src={property.thumbnail}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[14.5px] font-medium leading-snug text-espresso">{property.title}</p>
            <p className="shrink-0 text-[14.5px] font-semibold text-espresso">
              ${price.toLocaleString('en-US')}
              <span className="text-[11px] font-normal text-espresso-soft/55">/{tab.unit}</span>
            </p>
          </div>

          <p className="mt-1.5 text-[12.5px] text-espresso-soft/65">
            {property.city}, {property.country}
          </p>

          <div className="mt-4 flex items-center gap-5 border-t border-espresso-line/60 pt-3.5">
            {specs.map(([Icon, count, word]) => (
              <span key={word} className="flex items-center gap-1.5 text-[12px] text-espresso-soft/70">
                <Icon size={13} className="text-espresso-soft/45" />
                {count} {word}{count === 1 ? '' : 's'}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default FindYourHome
