import React, { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { MOCK_PROPERTIES } from '../data/mockProperties'
import ThreeSixtyViewer from '../components/ThreeSixtyViewer'

const FloorPlanSVG = () => (
  <svg viewBox="0 0 800 500" className="w-full h-full text-gray-600 bg-gray-50 rounded-2xl md:rounded-3xl p-6 sm:p-8" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Outer walls */}
    <rect x="50" y="50" width="700" height="400" rx="12" strokeWidth="4" stroke="currentColor" />
    
    {/* Rooms divisions */}
    <line x1="260" y1="50" x2="260" y2="450" strokeWidth="3" />
    <line x1="520" y1="50" x2="520" y2="450" strokeWidth="3" />
    <line x1="260" y1="220" x2="520" y2="220" strokeWidth="2.5" />
    <line x1="520" y1="250" x2="750" y2="250" strokeWidth="2.5" />
    <line x1="50" y1="280" x2="260" y2="280" strokeWidth="2.5" />
    
    {/* Doors */}
    {/* Main entrance */}
    <path d="M 50 250 A 40 40 0 0 1 90 210" stroke="#f43f5e" strokeWidth="3" fill="none" />
    <line x1="50" y1="210" x2="90" y2="210" stroke="#f43f5e" strokeWidth="3" />
    
    {/* Internal doors */}
    <path d="M 260 140 A 30 30 0 0 1 290 110" stroke="#f43f5e" strokeWidth="2" fill="none" />
    <path d="M 520 140 A 30 30 0 0 0 490 110" stroke="#f43f5e" strokeWidth="2" fill="none" />
    <path d="M 520 350 A 30 30 0 0 1 550 320" stroke="#f43f5e" strokeWidth="2" fill="none" />
    
    {/* Labels */}
    <text x="155" y="140" textAnchor="middle" fill="currentColor" className="font-bold text-xs sm:text-sm">Bedroom 1</text>
    <text x="155" y="360" textAnchor="middle" fill="currentColor" className="font-bold text-xs sm:text-sm">Bedroom 2</text>
    <text x="390" y="140" textAnchor="middle" fill="currentColor" className="font-bold text-xs sm:text-sm">Living Room</text>
    <text x="390" y="340" textAnchor="middle" fill="currentColor" className="font-bold text-xs sm:text-sm">Gourmet Kitchen</text>
    <text x="635" y="150" textAnchor="middle" fill="currentColor" className="font-bold text-xs sm:text-sm">Master Bedroom</text>
    <text x="635" y="350" textAnchor="middle" fill="currentColor" className="font-bold text-xs sm:text-sm">Dining Lounge</text>
    
    {/* Detail shapes */}
    <rect x="110" y="70" width="90" height="50" rx="4" fill="none" strokeDasharray="4 4" />
    <rect x="590" y="70" width="90" height="60" rx="4" fill="none" strokeDasharray="4 4" />
    <circle cx="390" cy="100" r="12" fill="currentColor" opacity="0.1" />
  </svg>
)

const MockMap = ({ location }) => (
  <div className="relative w-full h-[350px] bg-sky-50 rounded-3xl overflow-hidden border border-gray-100 shadow-md">
    {/* Map grid lines */}
    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0ea5e9_1.2px,transparent_1.2px)] [background-size:20px_20px]"></div>
    
    {/* Rivers and lands patterns */}
    <div className="absolute top-1/3 left-0 w-full h-16 bg-sky-200/40 transform -rotate-3"></div>
    <div className="absolute top-1/2 left-0 w-full h-12 bg-sky-100/50 transform rotate-6"></div>
    <div className="absolute right-20 top-0 w-36 h-full bg-emerald-50/30 transform -skew-x-12"></div>
    
    {/* Roads */}
    <div className="absolute top-16 left-0 w-full h-5 bg-white shadow-xs"></div>
    <div className="absolute top-0 left-1/4 w-8 h-full bg-white shadow-xs"></div>
    <div className="absolute top-0 left-3/4 w-6 h-full bg-white shadow-xs"></div>
    <div className="absolute bottom-20 left-0 w-full h-6 bg-white shadow-xs"></div>

    {/* Location Pin */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
      <div className="absolute w-12 h-12 bg-rose-500/25 rounded-full animate-ping"></div>
      <div className="absolute w-6 h-6 bg-rose-500/45 rounded-full animate-pulse"></div>
      
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-500 drop-shadow-md z-10" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 0L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    </div>

    {/* Zoom Controls */}
    <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
      <button className="w-9 h-9 rounded-xl bg-white shadow-md text-gray-800 font-bold hover:bg-gray-50 flex items-center justify-center transition-all select-none hover:scale-105 active:scale-95">+</button>
      <button className="w-9 h-9 rounded-xl bg-white shadow-md text-gray-800 font-bold hover:bg-gray-50 flex items-center justify-center transition-all select-none hover:scale-105 active:scale-95">-</button>
    </div>

    {/* Tag overlay */}
    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-gray-100 shadow-md text-xs font-semibold text-gray-700 flex items-center gap-1.5">
      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
      {location}
    </div>
  </div>
)

const PropertyDetails = () => {
  const { id } = useParams()
  const property = MOCK_PROPERTIES.find((p) => p.id === parseInt(id, 10))

  if (!property) {
    return (
      <div className="pt-32 pb-24 text-center font-sans">
        <h2 className="text-xl font-bold text-gray-800">Property not found</h2>
        <Link to="/properties" className="text-brand text-sm hover:underline mt-2 inline-block">
          Go back to exploring stays
        </Link>
      </div>
    )
  }

  // State Management
  const [activeTab, setActiveTab] = useState('gallery') // gallery, smartVIEW, video, layout
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Booking details & calendar state (Preserving original functional features)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [bookingMessage, setBookingMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  // Generate calendar days for July 2026 (31 days)
  const totalDays = 31
  const offset = 3
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)
  const emptyBoxes = Array.from({ length: offset }, (_, i) => null)
  const calendarGrid = [...emptyBoxes, ...daysArray]

  const checkUnavailable = (day) => {
    if (!day) return false
    const dateStr = `2026-07-${day.toString().padStart(2, '0')}`
    return property.unavailableDates.includes(dateStr)
  }

  const handleDateSelect = (day) => {
    if (!day || checkUnavailable(day)) return

    const dateStr = `2026-07-${day.toString().padStart(2, '0')}`

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dateStr)
      setCheckOutDate('')
      setBookingMessage(null)
    } else {
      if (new Date(dateStr) < new Date(checkInDate)) {
        setCheckInDate(dateStr)
        setCheckOutDate('')
      } else {
        // Check for double bookings in the range
        let hasOverlap = false
        let currentDate = new Date(checkInDate)
        const targetDate = new Date(dateStr)

        while (currentDate <= targetDate) {
          const dateFormatted = currentDate.toISOString().split('T')[0]
          if (property.unavailableDates.includes(dateFormatted)) {
            hasOverlap = true
            break
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }

        if (hasOverlap) {
          setIsError(true)
          setBookingMessage('Double Booking Prevented! Selected dates overlap with existing bookings.')
        } else {
          setCheckOutDate(dateStr)
          setIsError(false)
          setBookingMessage(null)
        }
      }
    }
  }

  const handleBook = (e) => {
    e.preventDefault()
    if (!checkInDate || !checkOutDate) {
      setIsError(true)
      setBookingMessage('Please select check-in and check-out dates on the calendar.')
      return
    }

    setIsError(false)
    setBookingMessage('Booking request pending! Auto-expiration timer started (10 minutes). Double booking prevention lock activated.')
  }

  const isSelected = (day) => {
    if (!day) return false
    const dateStr = `2026-07-${day.toString().padStart(2, '0')}`
    if (checkInDate === dateStr) return 'bg-rose-500 text-white rounded-l-full'
    if (checkOutDate === dateStr) return 'bg-rose-500 text-white rounded-r-full'

    if (checkInDate && checkOutDate) {
      const current = new Date(dateStr)
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      if (current > start && current < end) {
        return 'bg-rose-50 text-rose-600'
      }
    }
    return ''
  }

  // Copy helpers
  const copyPropertyId = () => {
    navigator.clipboard.writeText(property.propertyId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Smooth scroll helper
  const handleScrollToSection = (elementId) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Image Navigation for Gallery
  const handlePrevImage = () => {
    const imagesCount = property.images ? property.images.length : 1
    setCurrentImgIndex((prev) => (prev === 0 ? imagesCount - 1 : prev - 1))
  }

  const handleNextImage = () => {
    const imagesCount = property.images ? property.images.length : 1
    setCurrentImgIndex((prev) => (prev === imagesCount - 1 ? 0 : prev + 1))
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      {/* Back Link */}
      <Link to="/properties" className="text-xs text-gray-500 hover:text-brand flex items-center gap-1.5 mb-6 group transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Explore
      </Link>

      {/* Main Grid Layout (Visual & Tabs left, info sidebar right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Visual Media Box & Tabs & Details content */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
          
          {/* Main Visual Display Screen */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-gray-900 group">
            
            {/* 1. Gallery Slider Mode */}
            {activeTab === 'gallery' && (
              <div className="relative w-full h-full">
                <img
                  src={property.images ? property.images[currentImgIndex] : property.image}
                  alt={`${property.title} - view ${currentImgIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                />
                
                {/* Arrow navigation indicators */}
                {property.images && property.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all select-none z-10 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all select-none z-10 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold uppercase px-3 py-1.5 rounded-full tracking-wider border border-white/10">
                      {currentImgIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. Interactive smartVIEW 360° Mode */}
            {activeTab === 'smartVIEW' && (
              <div className="w-full h-full">
                <ThreeSixtyViewer imageSrc={property.panoramaImage} />
              </div>
            )}

            {/* 3. Video Mode */}
            {activeTab === 'video' && (
              <div className="w-full h-full relative">
                <video
                  src="https://assets.mixkit.co/videos/preview/mixkit-living-room-of-a-modern-apartment-43033-large.mp4"
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 4. Floor Layout Blueprint Mode */}
            {activeTab === 'layout' && (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <FloorPlanSVG />
              </div>
            )}

            {/* Overlay Left Top: Save Heart Button */}
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
              title="Save to favorites"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5.5 w-5.5 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
                fill={isSaved ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Overlay Right Top: Floating smartVIEW Toggle (Hidden when activeTab is smartVIEW) */}
            {activeTab !== 'smartVIEW' && (
              <button
                onClick={() => setActiveTab('smartVIEW')}
                className="absolute top-4 right-4 bg-white/95 hover:bg-white text-brand border border-rose-100 font-display font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                smartVIEW
              </button>
            )}

            {/* Guest Favorite Badge */}
            {property.isGuestFavorite && activeTab === 'gallery' && (
              <span className="absolute bottom-4 right-4 bg-white/95 text-brand text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-rose-100 shadow-md">
                Guest Favorite
              </span>
            )}
          </div>

          {/* Media Selection Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-150 pb-4">
            
            {/* Gallery Tab */}
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-rose-50 border-rose-200 text-brand'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gallery
            </button>

            {/* smartVIEW 360 Tab */}
            <button
              onClick={() => setActiveTab('smartVIEW')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeTab === 'smartVIEW'
                  ? 'bg-rose-50 border-rose-200 text-brand shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              smartVIEW
            </button>

            {/* Video Tab */}
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-rose-50 border-rose-200 text-brand'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Video
            </button>

            {/* Layout Tab */}
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeTab === 'layout'
                  ? 'bg-rose-50 border-rose-200 text-brand'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Layout
            </button>

            {/* Additional Features Anchor Link */}
            <button
              onClick={() => handleScrollToSection('additional-features-section')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Additional Features
            </button>
          </div>

          {/* About this Property Details Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900 flex items-center gap-2">
              About this Property
            </h2>

            {/* Specifications Details Grid (11 Attributes matching reference images) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              
              {/* 1. Bedrooms */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 18h18M3 6h6v4H3V6zm12 0h6v4h-6V6z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">{property.beds} Bedrooms</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Rooms</span>
                </div>
              </div>

              {/* 2. Bathrooms */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16M20 4v16M4 12h16M7 8a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">{property.baths} Bathrooms</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Bathrooms</span>
                </div>
              </div>

              {/* 3. Area (sqft) */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2zM9 6v4M15 6v4M6 6v2M12 6v2M18 6v2" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">{property.sqft} sqft</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Area</span>
                </div>
              </div>

              {/* 4. Units */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">{property.units} Units</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Units</span>
                </div>
              </div>

              {/* 5. Balcony */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16M4 6v12M20 6v12" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">{property.balcony} Balcony</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Balcony</span>
                </div>
              </div>

              {/* 6. Facing Direction */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <circle cx={12} cy={12} r={9} />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7l1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5L12 7z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800 truncate" title={property.facing}>{property.facing}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Facing</span>
                </div>
              </div>

              {/* 7. Parking */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10V7a3 3 0 013-3h8a3 3 0 013 3v3M4 19v-4a2 2 0 012-2h12a2 2 0 012 2v4m-12 0H5m14 0h-1M9 17h.01M15 17h.01" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800 truncate" title={property.parking}>{property.parking}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Parking</span>
                </div>
              </div>

              {/* 8. Elevator */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <rect x={4} y={4} width={16} height={16} rx={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l3-3 3 3M9 15l3 3 3-3" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800 truncate" title={property.elevator}>{property.elevator}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Elevator</span>
                </div>
              </div>

              {/* 9. Floor */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M3 20v-4h4v4M7 16v-4h4v4M11 12v-4h4v4M15 8V4h6v4" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800 truncate" title={property.floor}>{property.floor}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Floor</span>
                </div>
              </div>

              {/* 10. Est Year */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">Est. {property.estYear}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Built Year</span>
                </div>
              </div>

              {/* 11. Furnished State */}
              <div className="border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 p-3.5 rounded-2xl flex items-center gap-3 transition-all col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10V7a1 1 0 011-1h14a1 1 0 011 1v3M3 18v-5a2 2 0 012-2h14a2 2 0 012 2v5M3 18h18M6 18v1M18 18v1" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-800">{property.furnished}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Furnishing</span>
                </div>
              </div>

            </div>

            {/* Description Text */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Property Description</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Hosting Details */}
            <div className="flex items-center gap-4 py-4 border-t border-gray-100">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-sm text-brand shadow-xs">
                {property.ownerAvatar}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-800">Hosted by {property.ownerName}</h4>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Professional Host &bull; 24/7 Priority Support Enabled</p>
              </div>
            </div>

          </div>

          {/* Location / Map Section Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">Location</h2>
              <span className="text-xs text-gray-500 font-semibold">{property.location}</span>
            </div>
            
            {/* Map Component */}
            <MockMap location={property.location} />
          </div>

          {/* Additional Features Section Box */}
          <div
            id="additional-features-section"
            className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-24"
          >
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">Additional Features</h2>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.additionalFeatures ? (
                property.additionalFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse"></span>
                    {feature}
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                    24/7 Security Guard
                  </li>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                    CCTV Surveillance
                  </li>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                    Govt Gas Supply
                  </li>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                    Community Hall
                  </li>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                    House-help Room
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Booking / Booking Calendar Container (Preserving original double booking functional flow) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">Select Booking Dates</h2>
                <p className="text-[10px] text-gray-400 mt-1">July 2026 calendar. Red-bordered dates are unavailable.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Secure checkout
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* Calendar Grid Container */}
              <div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {calendarGrid.map((day, index) => {
                    const isBooked = checkUnavailable(day)
                    const selectedClass = isSelected(day)

                    return (
                      <button
                        key={index}
                        disabled={!day || isBooked}
                        onClick={() => handleDateSelect(day)}
                        className={`h-9 w-9 text-xs font-semibold flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                          !day
                            ? 'opacity-0 cursor-default pointer-events-none'
                            : isBooked
                            ? 'bg-rose-50 text-rose-500 border border-rose-100 line-through opacity-70 cursor-not-allowed'
                            : selectedClass
                            ? selectedClass
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form Input Display & Status Messages */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Check-In</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">{checkInDate || 'Select date'}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Check-Out</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">{checkOutDate || 'Select date'}</span>
                  </div>
                </div>

                {bookingMessage && (
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      isError
                        ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}
                  >
                    <div className="flex gap-2">
                      {isError ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span>{bookingMessage}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  className="w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white rounded-2xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Request Booking Date Lock
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Quick Metadata Sidebar Box */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 sticky top-24 shadow-xl space-y-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            
            {/* Tags Row with Share button */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {property.tags ? (
                  property.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Residential</span>
                    <span className="bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Apartment</span>
                    <span className="bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Used</span>
                  </>
                )}
              </div>

              {/* Share Button with Tooltip notification */}
              <div className="relative">
                <button
                  onClick={copyShareLink}
                  className="w-8 h-8 rounded-full bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Share property link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318m6-4.636a3 3 0 11-6 0 3 3 0 016 0zm-6 6a3 3 0 11-6 0 3 3 0 016 0zm0-12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {copiedLink && (
                  <span className="absolute right-0 bottom-full mb-2 bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-md whitespace-nowrap z-30 tracking-wider">
                    Link Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Price Detail Frame (smartLET structure) */}
            <div className="space-y-1.5 pb-5 border-b border-gray-100">
              <div className="flex items-baseline">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900">
                  ৳{(property.price * 500).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-bold ml-1">/ month</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Service Charge ৳{((property.serviceCharge || 15) * 500).toLocaleString()}
              </div>
            </div>

            {/* Visual Metadata Panel list */}
            <div className="space-y-4">
              
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-rose-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">{property.location}</span>
                </div>
              </div>

              {/* Available From */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-rose-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Availability</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">Available from {property.availableFrom || '1st June 2026'}</span>
                </div>
              </div>

              {/* Property ID */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-rose-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div className="flex-grow flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Property ID</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-gray-800">{property.propertyId}</span>
                  </div>
                  
                  {/* Copy Button */}
                  <div className="relative">
                    <button
                      onClick={copyPropertyId}
                      className="w-7 h-7 rounded-lg hover:bg-gray-50 border border-gray-150 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-gray-500 hover:text-gray-900 cursor-pointer"
                      title="Copy property ID"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    {copiedId && (
                      <span className="absolute right-0 bottom-full mb-1 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-30">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Contact & Scheduling CTA Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* Secondary Button: Request Viewing */}
                <button
                  onClick={() => handleScrollToSection('additional-features-section')}
                  className="bg-white border border-rose-500 hover:bg-rose-50 text-rose-500 rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Request Viewing
                </button>

                {/* Secondary Button: Call Us */}
                <a
                  href="tel:+8801700000000"
                  className="bg-white border border-rose-500 hover:bg-rose-50 text-rose-500 rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center block"
                >
                  Call Us
                </a>

              </div>

              {/* Primary Call to Action Button: Apply for Rent */}
              <button
                onClick={() => handleScrollToSection('additional-features-section')}
                className="w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-rose-500/10 cursor-pointer text-center"
              >
                Apply for Rent
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* Floating WhatsApp Action Button in Bottom-Right Corner */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-20 w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        title="Contact us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.48 1.332 5l-1.416 5.176 5.3-.1.01.002c1.616.866 3.42 1.32 5.258 1.32 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.273 14.1c-.244.686-1.22 1.258-1.688 1.334-.45.074-.74.134-2.584-.6-2.368-.946-3.896-3.356-4.016-3.514-.118-.158-.976-1.3-1.008-2.618-.032-1.318.664-1.968.9-2.228.24-.26.5-.326.666-.326.166 0 .332.002.476.008.15.006.352-.058.552.428.2.484.686 1.674.746 1.794.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.256.314-.366.422-.12.12-.246.252-.106.494.14.242.62 1.022 1.33 1.656.914.816 1.686 1.07 1.928 1.19.24.12.38.102.52-.058.14-.16.6-.698.76-.938.16-.24.32-.2.534-.12.214.08 1.36.642 1.594.76.234.118.39.176.448.276.058.1.058.574-.186 1.26z" />
        </svg>
      </a>

    </div>
  )
}

export default PropertyDetails
