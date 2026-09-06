import React, { useState, useEffect } from 'react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/common/SectionHeading'
import CurvedCarousel from '../components/CurvedCarousel'
import CategoryCarousel from '../components/CategoryCarousel'
import TrendingDestinations from '../components/TrendingDestinations'
import PropertyCarousel from '../components/PropertyCarousel'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'

import { useGetPropertiesQuery } from '../store/api/propertyApi'

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('hotels') // Default to a matching category from CATEGORIES
  
  const { data, isLoading: loading } = useGetPropertiesQuery({ limit: 100 });
  const properties = data?.properties || [];


  // Filter properties based on active category name/slug/type or _id
  const filteredProperties = properties.filter((prop) => {
    const propCatId = prop.category?._id || prop.category
    const catName = (prop.category?.name || "").toLowerCase()
    const catSlug = (prop.category?.slug || "").toLowerCase()
    const propType = (prop.propertyType || "").toLowerCase()
    const active = activeCategory.toLowerCase()

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
    const active = activeCategory.toLowerCase()
    const isMatched = propCatId === activeCategory || catName.includes(active) || catSlug.includes(active)

    return !isMatched && (prop.isFeatured || prop.averageRating >= 4.5)
  })

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId)
  }

  return (
    <div className="w-full bg-ink">
      {/* Dynamic Video Hero */}
      <HeroSection />

      {/* Browse by Property Type — Image Carousel */}
      <CategoryCarousel
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Trending Destinations — Grid with hover effects */}
      <TrendingDestinations />

      {/* Main Filtered Property Carousel */}
      <div className="bg-ink py-4">
        <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8">
          <SectionHeading
            eyebrow={`Popular ${activeCategory}`}
            title="Places people keep coming back to"
          />
        </div>
        {loading ? (
          <div className="py-12 text-center text-ivory/40 font-semibold text-sm">Loading properties...</div>
        ) : (
          <PropertyCarousel
            properties={filteredProperties.length > 0 ? filteredProperties : properties.slice(0, 4)}
            subtitle={`Handpicked stays listed in ${activeCategory}`}
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
      <div className="bg-ink">
        <HowItWorks />
      </div>

      {/* Testimonials */}
      <Testimonials />
    </div>
  )
}

export default Home