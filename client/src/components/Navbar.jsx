import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import ButtonOne from './common/ButtonOne'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmitRequest = (e) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setIsAddModalOpen(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        message: ''
      })
    }, 2000)
  }

  const linkClass = ({ isActive }) =>
    `text-xl font-medium transition-colors hover:text-[#f0506e] ${
      isActive ? 'text-[#f0506e]' : 'text-gray-600'
    }`
    
    
    const handleLogin =()=>{
       navigate('/login')
    }

    const handleSignUp = ()=>{
        navigate('/register')
    }

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <nav
        className={`mx-auto max-w-7xl rounded-full transition-all duration-300 border border-white/40 backdrop-blur-md relative ${
          isScrolled
            ? 'bg-white/85 shadow-lg py-2.5 px-6'
            : 'bg-white/50 shadow-md py-3.5 px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo — matching smartLET style */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#f0506e] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-gray-800 group-hover:text-[#f0506e] transition-colors">
              Easy<span className="text-[#f0506e]">Let</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/properties" className={linkClass}>Find Properties</NavLink>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xl font-medium text-gray-600 hover:text-[#f0506e] transition-colors cursor-pointer bg-transparent border-none"
            >
              Add a Property
            </button>
            <a href="#how-it-works" className="text-xl font-medium text-gray-600 hover:text-[#f0506e] transition-colors">
              How It Works
            </a>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ButtonOne onClick={handleLogin} name={"Login"}/>
            <ButtonOne onClick={handleSignUp} name={"Sign Up"}/>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-white/40 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer - Floating capsule layout matching Navbar */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl py-5 px-6 rounded-3xl flex flex-col gap-3 animate-fade-in">
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={linkClass}>Home</NavLink>
            <NavLink to="/properties" onClick={() => setIsMobileMenuOpen(false)} className={linkClass}>Find Properties</NavLink>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                setIsAddModalOpen(true)
              }}
              className="text-sm font-medium text-gray-600 py-2 text-left cursor-pointer bg-transparent border-none"
            >
              Add a Property
            </button>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-gray-600 py-2">How It Works</a>
            <div className="h-px bg-gray-100 my-2"></div>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 py-2.5 rounded-lg text-sm font-medium text-center border border-gray-200 bg-white/50">Login</Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-brand text-center py-2.5 rounded-full">Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Add Property Request Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsAddModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-fade-in border border-gray-150 p-6 sm:p-8">
            {/* Close Icon button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border-none bg-transparent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {isSubmitted ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-500 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Request Sent!</h3>
                <p className="text-xs text-gray-500 max-w-md">
                  Thank you, {formData.firstName}. Your request to add your property has been submitted. Our team will contact you shortly.
                </p>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="mb-6 text-left">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800">
                    Make a Request to Add Your Property
                  </h2>
                  <p className="text-xs text-gray-400 mt-1.5 font-light leading-relaxed">
                    Provide a few details to get started, and our team will be in touch shortly.
                  </p>
                </div>

                {/* Form fields layout matching user's image grid structure */}
                <form onSubmit={handleSubmitRequest} className="space-y-4 text-left">
                  {/* Row 1: First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#f0506e] rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0506e]/10 transition-all placeholder-gray-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">Last Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#f0506e] rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0506e]/10 transition-all placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#f0506e] rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0506e]/10 transition-all placeholder-gray-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#f0506e] rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0506e]/10 transition-all placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Row 3: Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#f0506e] rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0506e]/10 transition-all placeholder-gray-300 resize-none font-sans"
                    ></textarea>
                  </div>

                  {/* Row 4: Message (Optional) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Message <span className="text-gray-400 font-light">(Optional)</span></label>
                    <textarea
                      rows={3}
                      placeholder="Enter your message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#f0506e] rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0506e]/10 transition-all placeholder-gray-300 resize-none font-sans"
                    ></textarea>
                  </div>

                  {/* Row 5: Submit Button */}
                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="border border-[#f0506e] text-[#f0506e] hover:bg-[#fce4ec]/40 rounded-xl px-8 py-2.5 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs bg-transparent"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar