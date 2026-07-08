import React, { useState, useEffect } from 'react'
import HeroSection from '../components/HeroSection'
import CategoryCarousel from '../components/CategoryCarousel'
import TrendingDestinations from '../components/TrendingDestinations'
import PropertyCarousel from '../components/PropertyCarousel'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import { MOCK_PROPERTIES } from '../data/mockProperties'

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
    <div className="w-full pb-10">
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
      <div className="bg-gray-50 py-4">
        {loading ? (
          <div className="py-12 text-center text-gray-400 font-semibold text-sm">Loading properties...</div>
        ) : (
          <PropertyCarousel
            properties={filteredProperties.length > 0 ? filteredProperties : properties.slice(0, 4)}
            title={`Popular ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
            subtitle={`Handpicked stays listed in ${activeCategory}`}
          />
        )}
      </div>

      {/* Secondary Guest Favorite Carousel */}
      {!loading && (
        <PropertyCarousel
          properties={otherPopularProperties.length > 0 ? otherPopularProperties : properties}
          title="Guest Favorites"
          subtitle="Highly rated stays loved by travelers worldwide"
        />
      )}

      {/* 3-Step Guide */}
      <div className="bg-gray-50/50">
        <HowItWorks />
      </div>

      {/* Testimonials */}
      <Testimonials />
    </div>
  )
}

export default Home