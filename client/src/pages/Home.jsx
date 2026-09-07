import React, { useMemo, useState } from 'react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/common/SectionHeading'
import CurvedCarousel from '../components/CurvedCarousel'
import CategoryCarousel from '../components/CategoryCarousel'
import TrendingDestinations from '../components/TrendingDestinations'
import PropertyCarousel from '../components/PropertyCarousel'
import StepInsideShowcase from '../components/StepInsideShowcase'
import RentalHorizons from '../components/RentalHorizons'
import HostEarnings from '../components/HostEarnings'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'

import { useGetPropertiesQuery } from '../store/api/propertyApi'

const Home = () => {
  const [chosenCategory, setChosenCategory] = useState(null)

  const { data, isLoading: loading } = useGetPropertiesQuery({ limit: 100 })
  const properties = data?.properties || []

  // ====== Which category to open on
  // This used to be hard-coded to 'hotels', which happens to be the thinnest
  // category on the platform - so the first shelf a visitor saw held a single
  // card adrift in an empty row. Open on whichever category actually has homes
  // in it, until the visitor picks one for themselves.
  const busiestCategory = useMemo(() => {
    const counts = new Map()
    properties.forEach((prop) => {
      const id = prop.category?._id || prop.category
      if (id) counts.set(id, (counts.get(id) || 0) + 1)
    })

    let busiest = null
    counts.forEach((count, id) => {
      if (!busiest || count > busiest.count) busiest = { id, count }
    })
    return busiest?.id || null
  }, [properties])

  const activeCategory = chosenCategory || busiestCategory || ''

  // The heading needs the category's name, not the id the carousel hands back
  const activeCategoryName =
    properties.find((prop) => (prop.category?._id || prop.category) === activeCategory)?.category?.name ||
    'stays'


  // Filter properties based on active category name/slug/type or _id
  const filteredProperties = properties.filter((prop) => {
    const propCatId = prop.category?._id || prop.category
    const catName = (prop.category?.name || "").toLowerCase()
    const catSlug = (prop.category?.slug || "").toLowerCase()
    const propType = (prop.propertyType || "").toLowerCase()
    const active = String(activeCategory).toLowerCase()

    return (
      propCatId === activeCategory ||
      catName.includes(active) ||
      catSlug.includes(active) ||
      propType.includes(active)
    )
  })

  // Get other popular properties for a secondary carousel
  const otherPopularProperties = properties.filter((prop) => {
    const propCatId = prop.category?._id || prop.category
    const catName = (prop.category?.name || "").toLowerCase()
    const catSlug = (prop.category?.slug || "").toLowerCase()
    const active = String(activeCategory).toLowerCase()
    const isMatched = propCatId === activeCategory || catName.includes(active) || catSlug.includes(active)

    return !isMatched && (prop.isFeatured || prop.averageRating >= 4.5)
  })

  const handleSelectCategory = (catId) => {
    setChosenCategory(catId)
  }

  return (
    <div className="w-full bg-cream">
      {/* Dynamic Video Hero */}
      <HeroSection />

      {/* Walk through three real homes the way the hero walked you into one */}
      {!loading && <StepInsideShowcase properties={properties} />}

      {/* The three ways to take a home here - the platform's whole point */}
      <RentalHorizons />

      {/* Browse by Property Type — Image Carousel */}
      <CategoryCarousel
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Trending Destinations — Grid with hover effects */}
      <TrendingDestinations />

      {/* Main Filtered Property Carousel */}
      <div className="bg-cream py-4">
        <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8">
          <SectionHeading
            eyebrow={`Popular ${activeCategoryName}`}
            title="Places people keep coming back to"
          />
        </div>
        {loading ? (
          <div className="py-12 text-center text-espresso-soft/55 font-semibold text-sm">Loading properties...</div>
        ) : (
          <PropertyCarousel
            properties={filteredProperties.length > 0 ? filteredProperties : properties.slice(0, 4)}
            subtitle={`Handpicked stays listed in ${activeCategoryName}`}
          />
        )}
      </div>

      {/* Secondary Guest Favorite Carousel */}
      <div className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8">
        <SectionHeading eyebrow="Guest favourites" title="Rated highest by the people who stayed" />
      </div>
      {!loading && (
        <div className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 sm:px-8">
          <CurvedCarousel
            properties={(otherPopularProperties.length > 0 ? otherPopularProperties : properties).slice(0, 8)}
          />
        </div>
      )}

      {/* 3-Step Guide */}
      <div className="bg-cream">
        <HowItWorks />
      </div>

      {/* What the same home earns on each horizon */}
      <HostEarnings />

      {/* Testimonials */}
      <Testimonials />
    </div>
  )
}

export default Home