import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { HiMenuAlt4, HiOutlineX, HiOutlineShoppingCart } from 'react-icons/hi'
import { selectCartCount, toggleCart } from '../store/slices/cartSlice'
import { selectIsAuthenticated, selectCurrentUser, logout } from '../store/slices/authSlice'
import { useLogoutMutation } from '../store/api/authApi'
import LocaleSwitcher from './common/LocaleSwitcher'
import { useLocale } from '../i18n/LocaleContext'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useLocale()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [logoutApi] = useLogoutMutation()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  const cartCount = useSelector(selectCartCount)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 80))

  // Every page now opens on a light ground, the home page included, so the bar
  // only ever changes its own background - never the colour of the type on it
  const onDark = false

  const handleLogout = async () => {
    // httpOnly cookies cannot be cleared from JS, the server has to expire them
    try {
      await logoutApi().unwrap()
    } catch (err) {
      console.log(err?.data?.message || err?.message || 'Logout failed')
    }
    dispatch(logout())
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  // The ground is cream the whole way down, so the bar only ever changes
  // its own background - never the colour of the type sitting on it

  const linkClass = ({ isActive }) =>
    `text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${
      isActive
        ? 'text-bronze-soft'
        : onDark
        ? 'text-linen/75 hover:text-linen'
        : 'text-espresso-soft hover:text-espresso'
    }`

  const accountLinks = [
    ...(currentUser?.role === 'admin' || currentUser?.role === 'host'
      ? [{ to: '/admin', label: 'Admin panel' }]
      : []),
    { to: '/profile', label: t('nav.profile') },
    { to: '/my-bookings', label: t('nav.myBookings') },
    { to: '/my-applications', label: t('nav.myApplications') },
    { to: '/my-leases', label: t('nav.myLeases') },
    { to: '/wishlist', label: t('nav.wishlist') },
    { to: '/my-payments', label: t('nav.payments') },
  ]

  const initials = (currentUser?.fullName || 'G')
    .split(' ').map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-espresso-line bg-cream/90 py-3 backdrop-blur-xl' : 'bg-transparent py-5'
        } ${
          onDark ? 'text-linen' : 'text-espresso'
        }`}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 sm:px-8">
          {/* ====== Logo ====== */}
          <Link to="/" className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center border font-serif text-[17px] ${
              'border-bronze/50 text-bronze'
            }`}>
              E
            </span>
            <span className="leading-tight">
              <span className={`block font-serif text-[17px] tracking-[0.14em] ${onDark ? 'text-linen' : 'text-espresso'}`}>EASYLET</span>
              <span className={`block text-[8px] uppercase tracking-[0.42em] ${onDark ? 'text-linen/55' : 'text-espresso-soft/60'}`}>Stays &amp; Homes</span>
            </span>
          </Link>

          {/* ====== Desktop links ====== */}
          <ul className="hidden items-center gap-9 lg:flex">
            <li><NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink></li>
            <li><NavLink to="/properties" className={linkClass}>{t('nav.properties')}</NavLink></li>
            <li><NavLink to="/map" className={linkClass}>{t('nav.map')}</NavLink></li>
            <li>
              <a href="#how-it-works" className={`text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                onDark ? 'text-linen/75 hover:text-linen' : 'text-espresso-soft hover:text-espresso'
              }`}>
                How it works
              </a>
            </li>
          </ul>

          {/* ====== Actions ====== */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className={`relative cursor-pointer border-none bg-transparent p-1.5 transition-colors hover:text-bronze ${
                onDark ? 'text-linen/75' : 'text-espresso-soft'
              }`}
              title="Your stays"
            >
              <HiOutlineShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-bronze text-[9px] font-bold text-linen">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex cursor-pointer items-center gap-2.5 border border-espresso-line bg-transparent px-3 py-1.5 transition-colors hover:border-bronze"
                >
                  {currentUser?.profileImg ? (
                    <img src={currentUser.profileImg} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center bg-bronze text-[10px] font-bold text-linen">
                      {initials}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-[0.16em] text-espresso-soft">
                    {(currentUser?.fullName || 'Account').split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-3 w-56 border border-espresso-line bg-cream shadow-2xl"
                    >
                      {accountLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-5 py-3 text-[12px] text-espresso-soft transition-colors hover:bg-linen hover:text-bronze"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full cursor-pointer border-t border-espresso-line bg-transparent px-5 py-3 text-left text-[12px] text-espresso-soft/70 transition-colors hover:text-bronze"
                      >
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <Link to="/login" className={`text-[12px] uppercase tracking-[0.18em] transition-colors ${
                  onDark ? 'text-linen/75 hover:text-linen' : 'text-espresso-soft hover:text-espresso'
                }`}>
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2.5 bg-bronze px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-linen transition-colors duration-500 hover:bg-bronze-soft"
                >
                  {t('nav.signup')}
                  <span className="h-px w-4 bg-cream transition-all duration-500 group-hover:w-6" />
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`cursor-pointer border-none bg-transparent p-1.5 lg:hidden ${onDark ? 'text-linen' : 'text-espresso'}`}
              aria-label="Open menu"
            >
              <HiMenuAlt4 className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ====== Mobile sheet ====== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-cream lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <span className="font-serif text-[17px] tracking-[0.14em] text-espresso">EASYLET</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer border-none bg-transparent p-1.5 text-espresso"
                aria-label="Close menu"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-1 px-6 pt-8">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/properties', label: t('nav.properties') },
                { to: '/map', label: t('nav.map') },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b border-espresso-line py-4 font-serif text-[26px] font-light text-espresso"
                >
                  {item.label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  {accountLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="border-b border-espresso-line py-3.5 text-[13px] uppercase tracking-[0.18em] text-espresso-soft/80"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="mt-4 cursor-pointer border-none bg-transparent py-3 text-left text-[13px] uppercase tracking-[0.18em] text-bronze"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="border border-espresso-line py-4 text-center text-[12px] uppercase tracking-[0.2em] text-espresso"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-bronze py-4 text-center text-[12px] uppercase tracking-[0.2em] text-linen"
                  >
                    {t('nav.signup')}
                  </Link>
                </div>
              )}

              <div className="mt-8">
                <LocaleSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
