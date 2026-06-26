import React, { useState } from 'react'
import HeroSection from '../components/HeroSection'
import CategoryCarousel from '../components/CategoryCarousel'
import TrendingDestinations from '../components/TrendingDestinations'
import PropertyCarousel from '../components/PropertyCarousel'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import { MOCK_PROPERTIES } from '../data/mockProperties'

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('cabins')

  // Filter properties based on active category
  const filteredProperties = MOCK_PROPERTIES.filter(
    (prop) => prop.category === activeCategory
  )

  // Get other popular properties for a secondary carousel
  const otherPopularProperties = MOCK_PROPERTIES.filter(
    (prop) => prop.category !== activeCategory && prop.isGuestFavorite
  )

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
        <PropertyCarousel
          properties={filteredProperties.length > 0 ? filteredProperties : MOCK_PROPERTIES.slice(0, 4)}
          title={`Popular ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
          subtitle={`Handpicked stays listed in ${activeCategory}`}
        />
      </div>

      {/* Secondary Guest Favorite Carousel */}
      <PropertyCarousel
        properties={otherPopularProperties.length > 0 ? otherPopularProperties : MOCK_PROPERTIES}
        title="Guest Favorites"
        subtitle="Highly rated stays loved by travelers worldwide"
      />

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