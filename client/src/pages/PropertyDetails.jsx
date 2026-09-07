import React, { useState, useRef, useEffect, useMemo } from 'react'
import PropertyLocationMap from '../components/PropertyLocationMap'
import { useParams, Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { MOCK_PROPERTIES } from '../data/mockProperties'
import ThreeSixtyViewer from '../components/ThreeSixtyViewer'
import { useGetPropertyByIdQuery } from '../store/api/propertyApi'
import { useGetAvailabilityQuery, useGetQuoteQuery, useCreateBookingMutation } from '../store/api/bookingApi'
import { addToCart } from '../store/slices/cartSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

// Formats a Date as YYYY-MM-DD in local time (toISOString would shift across timezones)
// How each horizon reads on a listing badge
const HORIZON_TAGS = { short: 'By the night', mid: 'By the month', long: 'On a lease' }

const toDateStr = (date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const FloorPlanSVG = () => (
  <svg viewBox="0 0 800 500" className="w-full h-full text-espresso-soft bg-cream rounded-2xl md:rounded-3xl p-6 sm:p-8" fill="none" stroke="currentColor" strokeWidth="2">
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


const PropertyDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // ====== State Management
  // Every hook must run before the early returns further down, otherwise the hook count
  // changes between the loading and loaded renders and React throws.
  const [activeTab, setActiveTab] = useState('gallery') // gallery, smartVIEW, video, layout
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Booking details & calendar state (Preserving original functional features)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [bookingMessage, setBookingMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const today = new Date()
  const todayStr = toDateStr(today)
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  // ====== Which horizon the guest is shopping for on this page
  const [rentalType, setRentalType] = useState('short')
  const [guestsCount, setGuestsCount] = useState(1)
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')

  const HORIZON_LABELS = [
    { id: 'short', label: 'Nightly', hint: '1-29 nights' },
    { id: 'mid', label: 'Monthly', hint: '1-11 months' },
  ]

  // Fetch property from API
  const { data: apiData, isLoading, error } = useGetPropertyByIdQuery(id)
  const apiProperty = apiData?.property || null

  // Also try mock data as fallback (for demo/dev purposes)
  const mockProperty = MOCK_PROPERTIES.find((p) => p.id === parseInt(id, 10))

  // Merge: API data takes priority, mock data as fallback for fields not in DB
  // A real listing is never merged with a mock one. `parseInt` on a Mongo id
  // returns whatever digits happen to lead it, so every real home was picking
  // up an unrelated mock listing's square footage, balconies and garage.
  const property = apiProperty ? {
    ...apiProperty,
    // Map backend fields to the field names used in this component
    id: apiProperty._id || id,
    price: apiProperty.pricePerNight || mockProperty?.price || 0,
    beds: apiProperty.bedrooms || apiProperty.beds || mockProperty?.beds || 2,
    baths: apiProperty.bathrooms || mockProperty?.baths || 1,
    image: apiProperty.thumbnail || mockProperty?.image,
    location: apiProperty.city && apiProperty.country ? `${apiProperty.city}, ${apiProperty.country}` : (mockProperty?.location || ''),
    ownerName: apiProperty.host?.fullName || mockProperty?.ownerName || 'Host',
    ownerAvatar: apiProperty.host?.profileImg ? '🏠' : (mockProperty?.ownerAvatar || '🏠'),
    unavailableDates: [], // Will be computed from availability API
    propertyId: apiProperty._id || mockProperty?.propertyId || id,
    serviceCharge: apiProperty.serviceFee || mockProperty?.serviceCharge || 0,
    isGuestFavorite: apiProperty.isFeatured || mockProperty?.isGuestFavorite || false,
  } : mockProperty

  // ====== The facts this listing actually records
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

  const specs = useMemo(() => {
    if (!property) return []

    const rows = [
      { label: 'Guests', value: plural(property.maxGuests || 1, 'guest') },
      { label: 'Bedrooms', value: plural(property.bedrooms ?? property.beds ?? 0, 'bedroom') },
      { label: 'Beds', value: plural(property.beds ?? 0, 'bed') },
      { label: 'Bathrooms', value: plural(property.bathrooms ?? 0, 'bathroom') },
      { label: 'Property type', value: property.propertyType || 'Home' },
      { label: 'Furnishing', value: property.furnished ? 'Furnished' : 'Unfurnished' },
    ]

    if (property.utilitiesIncluded) rows.push({ label: 'Utilities', value: 'Included in the rent' })
    if (property.workspace) rows.push({ label: 'Workspace', value: 'Desk and chair' })
    if (property.securityDeposit > 0) {
      rows.push({ label: 'Deposit', value: `$${property.securityDeposit.toLocaleString('en-US')}` })
    }
    if (property.minStayNights > 1) {
      rows.push({ label: 'Minimum stay', value: plural(property.minStayNights, 'night') })
    }

    return rows
  }, [property])

  // Fetch real booking availability to compute unavailable dates
  const { data: availData } = useGetAvailabilityQuery(id, { skip: !apiProperty })

  // ====== The server prices the stay, so seasonal rules, discounts and tax all apply
  const { data: quoteData, isFetching: quoteLoading, error: quoteError } = useGetQuoteQuery(
    { propertyId: id, rentalType, checkInDate, checkOutDate, ...(appliedCoupon ? { couponCode: appliedCoupon } : {}) },
    { skip: !apiProperty || !checkInDate || !checkOutDate }
  )
  const quote = quoteData?.quote || null
  const quoteMessage = quoteError?.data?.message || null
  // The server prices the stay either way and reports separately why a code was refused
  const couponError = quoteData?.couponError || null

  // Compute unavailable date strings from availability API data
  const unavailableDates = useMemo(() => {
    if (!availData?.data) return []
    const dates = []
    for (const booking of availData.data) {
      let current = new Date(booking.checkInDate)
      const end = new Date(booking.checkOutDate)
      while (current < end) {
        // toISOString would shift the day in negative-offset timezones
        dates.push(toDateStr(current))
        current.setDate(current.getDate() + 1)
      }
    }
    return dates
  }, [availData])

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 text-center font-sans">
        <div className="animate-pulse text-espresso-soft/55 font-bold text-sm">Loading property details...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="pt-32 pb-24 text-center font-sans">
        <h2 className="text-xl font-bold text-espresso">Property not found</h2>
        <Link to="/properties" className="text-espresso text-sm hover:underline mt-2 inline-block">
          Go back to exploring stays
        </Link>
      </div>
    )
  }

  // ====== Calendar is driven by a real month instead of a hardcoded July 2026 grid
  // Only offer the horizons this listing is actually sold on
  const offeredTypes = HORIZON_LABELS.filter(item => (property?.rentalTypes || ['short']).includes(item.id))

  // Nights between the two picked dates - check-out day is not a night
  const selectedNights = checkInDate && checkOutDate
    ? Math.round((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
    : 0

  const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const totalDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const offset = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)
  const emptyBoxes = Array.from({ length: offset }, () => null)
  const calendarGrid = [...emptyBoxes, ...daysArray]

  // A day is only bookable if it is not already booked and not in the past
  const dayToDateStr = (day) =>
    toDateStr(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))

  const isPastMonth =
    calendarMonth.getFullYear() === today.getFullYear() && calendarMonth.getMonth() === today.getMonth()

  const handlePrevMonth = () => {
    if (isPastMonth) return
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  }

  const checkUnavailable = (day) => {
    if (!day) return false
    const dateStr = dayToDateStr(day)
    return dateStr < todayStr || unavailableDates.includes(dateStr)
  }

  const handleDateSelect = (day) => {
    if (!day || checkUnavailable(day)) return

    const dateStr = dayToDateStr(day)

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
          if (unavailableDates.includes(dateFormatted)) {
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

  // ====== Book Now used to validate the dates, clear the message and stop.
  // Nothing was ever created, so the button looked like it worked and did nothing.
  const handleBook = async (e) => {
    e.preventDefault()

    if (!checkInDate || !checkOutDate) {
      setIsError(true)
      setBookingMessage('Please select check-in and check-out dates on the calendar.')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please login to book this stay.', { position: 'top-center' })
      navigate('/login', { state: { from: `/property/${property._id || property.id}` } })
      return
    }

    if (!quote) {
      setIsError(true)
      setBookingMessage('Still pricing this stay. Try again in a moment.')
      return
    }

    try {
      const res = await createBooking({
        propertyId: property._id || property.id,
        checkInDate,
        checkOutDate,
        guestsCount: guestsCount,
        rentalType,
        ...(quote.couponCode ? { couponCode: quote.couponCode } : {}),
      }).unwrap()

      setIsError(false)
      setBookingMessage(null)
      toast.success(res.message || 'Booking created. Pay to confirm it.', { position: 'top-center' })
      navigate('/my-bookings')
    } catch (err) {
      console.log(err)
      const message = err?.data?.message || err?.message || 'Could not create that booking.'
      setIsError(true)
      setBookingMessage(message)
      toast.error(message, { position: 'top-center' })
    }
  }

  // ====== Typing a date has to pass the same checks as clicking one
  const handleTypedDate = (field, dateStr) => {
    if (!dateStr) {
      if (field === 'checkIn') { setCheckInDate(''); setCheckOutDate('') } else setCheckOutDate('')
      setBookingMessage(null)
      return
    }

    if (dateStr < todayStr) {
      setIsError(true)
      setBookingMessage('That date has already passed.')
      return
    }

    if (unavailableDates.includes(dateStr)) {
      setIsError(true)
      setBookingMessage('That date is already booked or blocked by the host.')
      return
    }

    if (field === 'checkIn') {
      setCheckInDate(dateStr)
      // A check-out that no longer follows check-in is cleared rather than left wrong
      if (checkOutDate && dateStr >= checkOutDate) setCheckOutDate('')
    } else {
      if (!checkInDate) {
        setIsError(true)
        setBookingMessage('Pick a check-in date first.')
        return
      }
      if (dateStr <= checkInDate) {
        setIsError(true)
        setBookingMessage('Check-out must be after check-in.')
        return
      }

      // Nothing in the range may be unavailable
      const cursor = new Date(checkInDate)
      const end = new Date(dateStr)
      while (cursor < end) {
        if (unavailableDates.includes(toDateStr(cursor))) {
          setIsError(true)
          setBookingMessage('Double Booking Prevented! Selected dates overlap with existing bookings.')
          return
        }
        cursor.setDate(cursor.getDate() + 1)
      }
      setCheckOutDate(dateStr)
    }

    setIsError(false)
    setBookingMessage(null)

    // Move the grid to match what was typed
    const picked = new Date(dateStr)
    setCalendarMonth(new Date(picked.getFullYear(), picked.getMonth(), 1))
  }

  const handleAddToCart = () => {
    if (!checkInDate || !checkOutDate) {
      setIsError(true)
      setBookingMessage('Please select check-in and check-out dates on the calendar.')
      return
    }

    if (!quote) {
      setIsError(true)
      setBookingMessage('Still pricing this stay. Try again in a moment.')
      return
    }

    dispatch(addToCart({
      rentalType,
      property: {
        _id: property._id || property.id,
        title: property.title,
        thumbnail: property.thumbnail || property.image,
        city: property.city || '',
        country: property.country || '',
        pricePerNight: property.pricePerNight,
      },
      checkInDate,
      checkOutDate,
      guestsCount,
      totalNights: quote.nights,
      totalAmount: quote.dueNow,
    }))

    toast.success('Added to cart! Open cart to checkout.', { position: 'top-center' })
  }

  const isSelected = (day) => {
    if (!day) return false
    const dateStr = dayToDateStr(day)
    if (checkInDate === dateStr) return 'bg-espresso text-white rounded-l-full'
    if (checkOutDate === dateStr) return 'bg-espresso text-white rounded-r-full'

    if (checkInDate && checkOutDate) {
      const current = new Date(dateStr)
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      if (current > start && current < end) {
        return 'bg-cream text-bronze'
      }
    }
    return ''
  }

  // Copy helpers
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
      <Link to="/properties" className="text-xs text-espresso-soft/75 hover:text-espresso flex items-center gap-1.5 mb-6 group transition-colors">
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
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-espresso-line/70 shadow-xl bg-gray-900 group">
            
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-espresso shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all select-none z-10 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-espresso shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all select-none z-10 cursor-pointer"
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
              <div className="w-full h-full flex items-center justify-center bg-cream">
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
                className={`h-5.5 w-5.5 transition-colors ${isSaved ? 'fill-bronze text-bronze' : 'text-espresso-soft/75 hover:text-bronze'}`}
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
                className="absolute top-4 right-4 bg-white/95 hover:bg-white text-espresso border border-espresso-line font-display font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
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
              <span className="absolute bottom-4 right-4 bg-white/95 text-espresso text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-espresso-line shadow-md">
                Guest Favorite
              </span>
            )}
          </div>

          {/* Media Selection Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-espresso-line pb-4">
            
            {/* Gallery Tab */}
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-cream border-bronze/35 text-espresso'
                  : 'bg-white border-espresso-line text-espresso-soft hover:bg-cream'
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
                  ? 'bg-cream border-bronze/35 text-espresso shadow-xs'
                  : 'bg-white border-espresso-line text-espresso-soft hover:bg-cream'
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
                  ? 'bg-cream border-bronze/35 text-espresso'
                  : 'bg-white border-espresso-line text-espresso-soft hover:bg-cream'
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
                  ? 'bg-cream border-bronze/35 text-espresso'
                  : 'bg-white border-espresso-line text-espresso-soft hover:bg-cream'
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border bg-white border-espresso-line text-espresso-soft hover:bg-cream transition-all cursor-pointer ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Additional Features
            </button>
          </div>

          {/* About this Property Details Box */}
          <div className="bg-white border border-espresso-line/70 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-espresso flex items-center gap-2">
              About this Property
            </h2>

            {/* What the listing actually records.
                This grid used to show square footage, balconies, a garage and a
                construction year, none of which a listing carries. They came
                from a mock property picked with parseInt on a Mongo id, so
                every real home was described with an unrelated one's numbers. */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-xl border border-espresso-line/70 bg-linen px-4 py-3.5">
                  <p className="text-[13px] font-medium text-espresso">{spec.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-espresso-soft/55">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* Description Text */}
            <div className="pt-4 border-t border-espresso-line/70">
              <h3 className="font-bold text-espresso text-sm mb-3">Property Description</h3>
              <p className="text-xs sm:text-sm text-espresso-soft leading-relaxed font-light whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Hosting Details */}
            <div className="flex items-center gap-4 py-4 border-t border-espresso-line/70">
              <div className="w-12 h-12 rounded-full bg-cream border border-espresso-line flex items-center justify-center font-bold text-sm text-espresso shadow-xs">
                {property.ownerAvatar}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-espresso">Hosted by {property.ownerName}</h4>
                <p className="text-[10px] sm:text-xs text-espresso-soft/75 font-medium">Professional Host &bull; 24/7 Priority Support Enabled</p>
              </div>
            </div>

          </div>

          {/* Location / Map Section Box */}
          <div className="bg-white border border-espresso-line/70 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-espresso">Location</h2>
              <span className="text-xs text-espresso-soft/75 font-semibold">{property.location}</span>
            </div>
            
            {/* Map Component */}
            <PropertyLocationMap
              latitude={property.coordinates?.latitude}
              longitude={property.coordinates?.longitude}
              label={property.title}
            />
          </div>

          {/* Additional Features Section Box */}
          <div
            id="additional-features-section"
            className="bg-white border border-espresso-line/70 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-24"
          >
            <h2 className="text-xl font-display font-extrabold text-espresso sm:text-2xl">What this place offers</h2>

            {/* The amenities and rules the host set. This section used to list
                "24/7 Security Guard, CCTV Surveillance, Govt Gas Supply,
                Community Hall, House-help Room" - written into the markup and
                shown identically on every listing on the platform. */}
            {(property.amenities || []).length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity._id || amenity.name || amenity}
                    className="flex items-center gap-2.5 text-xs capitalize text-espresso-soft sm:text-sm"
                  >
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-bronze"></span>
                    {amenity.name || amenity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-espresso-soft/60">
                This host has not listed any amenities yet.
              </p>
            )}

            {(property.houseRules || []).length > 0 && (
              <div className="border-t border-espresso-line/70 pt-5">
                <h3 className="mb-3 text-sm font-bold text-espresso">House rules</h3>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {property.houseRules.map((rule, index) => (
                    <li key={index} className="flex items-center gap-2.5 text-xs text-espresso-soft sm:text-sm">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-espresso-line"></span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Booking / Booking Calendar Container (Preserving original double booking functional flow) */}
          <div className="bg-white border border-espresso-line/70 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-espresso-line/70 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-espresso">Select Booking Dates</h2>
                <p className="text-[10px] text-espresso-soft/55 mt-1">Red-bordered dates are unavailable.</p>

                {/* A long lease is applied for, not booked */}
                {(property?.rentalTypes || []).includes('long') && (
                  <div className="mt-4 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-indigo-900">Also available on a long lease</p>
                      <p className="text-[11px] text-indigo-700/80 font-semibold mt-0.5">
                        ${(property.longTermRent || 0).toLocaleString()} / month rent, {property.minTermMonths || 12} month minimum
                      </p>
                    </div>
                    <Link
                      to={`/apply/${property._id || property.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center whitespace-nowrap"
                    >
                      Apply to rent
                    </Link>
                  </div>
                )}

                {/* ====== Rental horizon switcher ====== */}
                {offeredTypes.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {offeredTypes.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setRentalType(item.id)}
                        className={`px-3.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                          rentalType === item.id
                            ? 'border-espresso bg-cream text-bronze'
                            : 'border-espresso-line bg-white text-espresso-soft hover:border-gray-300'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">{item.label}</span>
                        <span className="block text-[9px] opacity-70 font-semibold">{item.hint}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Secure checkout
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* Calendar Grid Container */}
              <div>
                {/* ====== Month navigation ====== */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={handlePrevMonth}
                    disabled={isPastMonth}
                    className="w-8 h-8 rounded-lg border border-espresso-line text-espresso-soft flex items-center justify-center transition-all hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous month"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <span className="text-xs font-bold text-espresso tracking-wide">{monthLabel}</span>

                  <button
                    onClick={handleNextMonth}
                    className="w-8 h-8 rounded-lg border border-espresso-line text-espresso-soft flex items-center justify-center transition-all hover:bg-cream cursor-pointer"
                    title="Next month"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-espresso-soft/75 mb-3 uppercase tracking-wider">
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
                            ? 'bg-cream text-bronze border border-espresso-line line-through opacity-70 cursor-not-allowed'
                            : selectedClass
                            ? selectedClass
                            : 'bg-cream hover:bg-gray-100 text-gray-700 hover:scale-105 active:scale-95'
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
                  <div className="bg-cream border border-espresso-line p-3.5 rounded-2xl">
                    <label className="block text-[9px] font-bold text-espresso-soft/55 uppercase tracking-wider mb-1">Check-In</label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={todayStr}
                      onChange={(e) => handleTypedDate('checkIn', e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-espresso focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="bg-cream border border-espresso-line p-3.5 rounded-2xl">
                    <label className="block text-[9px] font-bold text-espresso-soft/55 uppercase tracking-wider mb-1">Check-Out</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate || todayStr}
                      onChange={(e) => handleTypedDate('checkOut', e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-espresso focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-cream border border-espresso-line p-3.5 rounded-2xl">
                  <label className="block text-[9px] font-bold text-espresso-soft/55 uppercase tracking-wider mb-1">
                    Guests {property.maxGuests ? `(max ${property.maxGuests})` : ''}
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-espresso focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: property.maxGuests || 8 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>
                        {count} guest{count === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* The check-out day is not a night, so show the count rather than let people guess */}
                {selectedNights > 0 && (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gray-900 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      {rentalType === 'mid' ? 'Length of stay' : 'Nights'}
                    </span>
                    <span className="text-xs font-bold">
                      {selectedNights} night{selectedNights === 1 ? '' : 's'}
                      {rentalType === 'mid' && quote && quote.months > 0
                        ? ` · ${quote.months} month${quote.months === 1 ? '' : 's'}${quote.extraDays ? ` + ${quote.extraDays} days` : ''}`
                        : ''}
                    </span>
                  </div>
                )}

                {/* ====== Coupon ====== */}
                {checkInDate && checkOutDate && (
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-espresso-soft/55 uppercase tracking-wider">
                      Coupon code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME20"
                        className="flex-1 bg-cream border border-espresso-line rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-espresso placeholder-espresso-soft/45 focus:outline-none focus:border-espresso focus:bg-white transition-colors uppercase"
                      />
                      {appliedCoupon ? (
                        <button
                          onClick={() => { setAppliedCoupon(''); setCouponInput('') }}
                          className="px-4 rounded-2xl border border-espresso-line text-espresso-soft hover:bg-cream text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => setAppliedCoupon(couponInput.trim())}
                          disabled={!couponInput.trim()}
                          className="px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-bronze font-semibold">{couponError}</p>
                    )}
                    {quote?.couponCode && (
                      <p className="text-[11px] text-green-600 font-semibold">
                        {quote.couponLabel} applied — you save ${quote.couponDiscount.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* ====== Live quote from the server ====== */}
                {checkInDate && checkOutDate && (
                  <div className="bg-white border border-espresso-line rounded-2xl p-4 space-y-2.5">
                    {quoteLoading ? (
                      <div className="text-[11px] text-espresso-soft/55 font-semibold py-3 text-center">Pricing your stay...</div>
                    ) : quoteMessage ? (
                      <div className="text-[11px] text-bronze font-semibold py-2">{quoteMessage}</div>
                    ) : quote ? (
                      <>
                        <div className="flex justify-between text-[11px] text-espresso-soft/75">
                          <span>
                            {quote.rentalType === 'mid'
                              ? quote.months === 0
                                ? `${quote.extraDays} days at $${quote.monthlyRate}/month`
                                : `${quote.months} month${quote.months > 1 ? 's' : ''}${quote.extraDays ? ` + ${quote.extraDays} days` : ''} x $${quote.monthlyRate}`
                              : `${quote.nights} night${quote.nights > 1 ? 's' : ''} x $${quote.averageNightlyRate} avg`}
                          </span>
                          <span className="font-semibold text-espresso">
                            ${quote.rentalType === 'mid'
                              ? (quote.months * quote.monthlyRate + (quote.proratedAmount || 0)).toLocaleString()
                              : (quote.averageNightlyRate * quote.nights).toLocaleString()}
                          </span>
                        </div>

                        {quote.discountPercent > 0 && (
                          <div className="flex justify-between text-[11px] text-green-600 font-semibold">
                            <span>{quote.discountPercent}% length-of-stay discount</span>
                            <span>-${quote.discountAmount.toLocaleString()}</span>
                          </div>
                        )}

                        {quote.couponDiscount > 0 && (
                          <div className="flex justify-between text-[11px] text-green-600 font-semibold">
                            <span>Coupon {quote.couponCode}</span>
                            <span>-${quote.couponDiscount.toLocaleString()}</span>
                          </div>
                        )}

                        {quote.cleaningFee > 0 && (
                          <div className="flex justify-between text-[11px] text-espresso-soft/75">
                            <span>Cleaning fee</span><span className="font-semibold text-espresso">${quote.cleaningFee}</span>
                          </div>
                        )}

                        {quote.serviceFee > 0 && (
                          <div className="flex justify-between text-[11px] text-espresso-soft/75">
                            <span>Service fee</span><span className="font-semibold text-espresso">${quote.serviceFee}</span>
                          </div>
                        )}

                        {quote.taxAmount > 0 && (
                          <div className="flex justify-between text-[11px] text-espresso-soft/75">
                            <span>Taxes ({quote.taxRatePercent}%)</span><span className="font-semibold text-espresso">${quote.taxAmount}</span>
                          </div>
                        )}

                        {quote.securityDeposit > 0 && (
                          <div className="flex justify-between text-[11px] text-espresso-soft/75">
                            <span>Refundable deposit</span><span className="font-semibold text-espresso">${quote.securityDeposit.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex justify-between pt-2.5 border-t border-espresso-line/70 text-sm font-extrabold text-espresso">
                          <span>{quote.billingCycle === 'monthly' ? 'Due today' : 'Total'}</span>
                          <span>${quote.dueNow.toLocaleString()}</span>
                        </div>

                        {quote.billingCycle === 'monthly' && quote.schedule.length > 0 && (
                          <div className="pt-1 space-y-1">
                            <p className="text-[10px] text-espresso-soft/55 font-semibold">
                              Then {quote.schedule.length} monthly charge{quote.schedule.length > 1 ? 's' : ''} — ${quote.totalAmount.toLocaleString()} in total
                            </p>
                            {quote.schedule.slice(0, 3).map((charge, index) => (
                              <div key={index} className="flex justify-between text-[10px] text-espresso-soft/55">
                                <span>{new Date(charge.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span>${charge.amount.toLocaleString()}{charge.prorated ? ' (prorated)' : ''}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {quote.billingCycle === 'monthly' && quote.schedule.length === 0 && (
                          <p className="text-[10px] text-espresso-soft/55 font-semibold pt-1">
                            Nothing further to pay — the whole stay is settled today.
                          </p>
                        )}

                        {quote.utilitiesIncluded && (
                          <p className="text-[10px] text-green-600 font-semibold pt-1">Utilities included{quote.utilityCap ? ` up to $${quote.utilityCap}/month` : ''}</p>
                        )}

                        <p className="text-[10px] text-espresso-soft/55 font-semibold capitalize pt-1">
                          {quote.cancellationPolicy.replace('_', ' ')} cancellation policy
                        </p>
                      </>
                    ) : null}
                  </div>
                )}

                {bookingMessage && (
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      isError
                        ? 'bg-cream border-espresso-line text-bronze animate-pulse'
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

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white rounded-2xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBook}
                    disabled={isBooking}
                    className="w-full bg-espresso hover:bg-espresso-soft active:scale-[0.99] text-white rounded-2xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-espresso/10 cursor-pointer disabled:opacity-60"
                  >
                    {isBooking ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Quick Metadata Sidebar Box */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-espresso-line/70 sticky top-24 shadow-xl space-y-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            
            {/* Tags Row with Share button */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {/* The horizons this home can be taken on - the one thing a
                    visitor cannot work out from the photographs. The fallback
                    used to read "Residential / Apartment / Used", which says
                    nothing about a place you are renting. */}
                {(property.rentalTypes || []).map((type) => (
                  <span
                    key={type}
                    className="rounded-md border border-espresso-line bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-espresso-soft/75"
                  >
                    {HORIZON_TAGS[type] || type}
                  </span>
                ))}
                {property.propertyType && (
                  <span className="rounded-md border border-espresso-line bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-espresso-soft/75">
                    {property.propertyType}
                  </span>
                )}
              </div>

              {/* Share Button with Tooltip notification */}
              <div className="relative">
                <button
                  onClick={copyShareLink}
                  className="w-8 h-8 rounded-full bg-cream border border-espresso-line hover:bg-gray-100 text-espresso-soft hover:text-espresso flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
            <div className="space-y-1.5 pb-5 border-b border-espresso-line/70">
              <div className="flex items-baseline">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-espresso">
                  ${(property.pricePerNight || property.price || 0).toLocaleString()}
                </span>
                <span className="text-xs text-espresso-soft/55 font-bold ml-1">/ night</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-espresso-soft/75 font-semibold bg-cream px-3 py-1.5 rounded-lg border border-espresso-line w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Service Charge ${(property.serviceFee || property.serviceCharge || 0).toLocaleString()}
              </div>
            </div>

            {/* Visual Metadata Panel list */}
            <div className="space-y-4">
              
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-bronze mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] text-espresso-soft/55 font-bold uppercase tracking-wider">Location</span>
                  <span className="text-xs sm:text-sm font-semibold text-espresso">{property.location}</span>
                </div>
              </div>

              {/* Cancellation, which is what a guest wants to know before
                  booking. This row used to promise "Available from 1st June
                  2026" - a date written into the markup, shown on every
                  listing, true of none of them. */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-bronze">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-espresso-soft/55">Cancellation</span>
                  <span className="text-xs font-semibold capitalize text-espresso sm:text-sm">
                    {(property.cancellationPolicy || 'moderate').replace('_', ' ')}
                  </span>
                </div>
              </div>


            </div>

            {/* Quick Contact & Scheduling CTA Buttons */}
            <div className="space-y-3 pt-4 border-t border-espresso-line/70">
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* Secondary Button: Request Viewing */}
                <button
                  onClick={() => handleScrollToSection('additional-features-section')}
                  className="bg-white border border-espresso hover:bg-cream text-bronze rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Request Viewing
                </button>

                {/* Secondary Button: Call Us */}
                <a
                  href="tel:+8801700000000"
                  className="bg-white border border-espresso hover:bg-cream text-bronze rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center block"
                >
                  Call Us
                </a>

              </div>

              {/* Primary Call to Action Button: Apply for Rent */}
              <button
                onClick={() => handleScrollToSection('additional-features-section')}
                className="w-full bg-espresso hover:bg-espresso-soft active:scale-[0.99] text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-espresso/10 cursor-pointer text-center"
              >
                Apply for Rent
              </button>

            </div>

          </div>
        </div>

      </div>


    </div>
  )
}

export default PropertyDetails
