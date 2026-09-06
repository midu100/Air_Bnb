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

  const linkClass = ({ isActive }) =>
    `text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${
      isActive ? 'text-brass' : 'text-ivory/65 hover:text-ivory'
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
          scrolled ? 'border-b border-ink-line bg-ink/90 py-3 backdrop-blur-xl' : 'bg-transparent py-5'
        }`}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 sm:px-8">
          {/* ====== Logo ====== */}
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border border-brass/50 font-serif text-[17px] text-brass">
              E
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[17px] tracking-[0.14em] text-ivory">EASYLET</span>
              <span className="block text-[8px] uppercase tracking-[0.42em] text-ivory/45">Stays &amp; Homes</span>
            </span>
          </Link>

          {/* ====== Desktop links ====== */}
          <ul className="hidden items-center gap-9 lg:flex">
            <li><NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink></li>
            <li><NavLink to="/properties" className={linkClass}>{t('nav.properties')}</NavLink></li>
            <li><NavLink to="/map" className={linkClass}>{t('nav.map')}</NavLink></li>
            <li>
              <a href="#how-it-works" className="text-[12px] uppercase tracking-[0.18em] text-ivory/65 transition-colors duration-300 hover:text-ivory">
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
              className="relative cursor-pointer border-none bg-transparent p-1.5 text-ivory/70 transition-colors hover:text-brass"
              title="Your stays"
            >
              <HiOutlineShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-brass text-[9px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex cursor-pointer items-center gap-2.5 border border-ivory/20 bg-transparent px-3 py-1.5 transition-colors hover:border-brass"
                >
                  {currentUser?.profileImg ? (
                    <img src={currentUser.profileImg} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center bg-brass text-[10px] font-bold text-ink">
                      {initials}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-[0.16em] text-ivory/80">
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
                      className="absolute right-0 mt-3 w-56 border border-ink-line bg-ink shadow-2xl"
                    >
                      {accountLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-5 py-3 text-[12px] text-ivory/70 transition-colors hover:bg-ink-soft hover:text-brass"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full cursor-pointer border-t border-ink-line bg-transparent px-5 py-3 text-left text-[12px] text-ivory/50 transition-colors hover:text-brass"
                      >
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <Link to="/login" className="text-[12px] uppercase tracking-[0.18em] text-ivory/65 transition-colors hover:text-ivory">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2.5 bg-brass px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:bg-brass-soft"
                >
                  {t('nav.signup')}
                  <span className="h-px w-4 bg-ink transition-all duration-500 group-hover:w-6" />
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="cursor-pointer border-none bg-transparent p-1.5 text-ivory lg:hidden"
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
            className="fixed inset-0 z-[60] bg-ink lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <span className="font-serif text-[17px] tracking-[0.14em] text-ivory">EASYLET</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer border-none bg-transparent p-1.5 text-ivory"
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
                  className="border-b border-ink-line py-4 font-serif text-[26px] font-light text-ivory"
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
                      className="border-b border-ink-line py-3.5 text-[13px] uppercase tracking-[0.18em] text-ivory/60"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="mt-4 cursor-pointer border-none bg-transparent py-3 text-left text-[13px] uppercase tracking-[0.18em] text-brass"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="border border-ivory/25 py-4 text-center text-[12px] uppercase tracking-[0.2em] text-ivory"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-brass py-4 text-center text-[12px] uppercase tracking-[0.2em] text-ink"
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
