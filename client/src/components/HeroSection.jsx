import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import heroVdo from '../assets/videos/hero.mp4'

const HeroSection = () => {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')

  // Typewriter
  const phrases = [
    'Luxurious Beachfront Villas',
    'Chic Downtown Lofts',
    'Cozy Forest Cabins',
    'Exotic Private Islands',
    'Stunning Architectural Masterpieces'
  ]
  const [currentText, setCurrentText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timer
    const currentPhrase = phrases[phraseIndex]
    const typingSpeed = isDeleting ? 40 : 80

    if (!isDeleting && currentText === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false)
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
    } else {
      timer = setTimeout(() => {
        setCurrentText(
          isDeleting
            ? currentPhrase.substring(0, currentText.length - 1)
            : currentPhrase.substring(0, currentText.length + 1)
        )
      }, typingSpeed)
    }

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, phraseIndex])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/properties?destination=${destination}&guests=${guests}`)
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden font-sans">
      {/* Background Video with grayscale filter (smartLET cityscape style) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover scale-105 pointer-events-none z-0"
        style={{ filter: 'grayscale(0.3) brightness(0.9)' }}
        src={heroVdo}
      />

      {/* Light overlay (smartLET uses a light/white-ish overlay, not dark) */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/40 to-white/80 z-10"></div> */}

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center select-none flex flex-col items-center">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-2 text-white max-w-4xl leading-tight">
          Renting Made{' '}
          <span className="text-[#f0506e]">Smart</span>
        </h1>

        {/* Typewriter subtitle */}
        <div className="h-10 sm:h-12 flex items-center justify-center mb-6">
          <span className="text-lg sm:text-2xl font-display font-semibold text-white">
            {currentText}
            <span className="inline-block w-0.5 h-6 sm:h-7 ml-1 bg-[#f0506e] animate-pulse align-middle"></span>
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-white text-sm sm:text-base max-w-xl mb-10 leading-relaxed font-light">
          Discover handpicked spaces around the globe. Browse verified properties and book instantly with zero double-booking hassles.
        </p>

        {/* Search Panel (smartLET-style: white card, subtle shadow) */}
        <form
          onSubmit={handleSearch}
          className="search-panel w-full max-w-3xl p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center"
        >
          {/* Search Input */}
          <div className="flex-1 w-full relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by Area, Popular Landmarks, or Nearby Locations"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-transparent text-gray-700 text-sm focus:outline-none placeholder-gray-400 border-none"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200"></div>

          {/* Check-In */}
          <div className="w-full md:w-36 text-left px-3">
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-gray-400 mb-0.5">
              Check in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-gray-600 text-xs font-medium focus:outline-none cursor-pointer border-none p-0"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-gray-200"></div>

          {/* Check-Out */}
          <div className="w-full md:w-36 text-left px-3">
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-gray-400 mb-0.5">
              Check out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-gray-600 text-xs font-medium focus:outline-none cursor-pointer border-none p-0"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="btn-brand w-full md:w-auto px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </form>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-float">
        <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mb-1">Explore Properties</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#f0506e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  )
}

export default HeroSection
