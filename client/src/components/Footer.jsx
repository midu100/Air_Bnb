import React from 'react'
import { Link } from 'react-router'
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import { useLocale } from '../i18n/LocaleContext'

const socials = [
  { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook' },
  { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FaXTwitter, href: 'https://x.com', label: 'X' },
]

const Footer = () => {
  const { t } = useLocale()

  const explore = [
    { to: '/properties', label: t('nav.properties') },
    { to: '/map', label: t('nav.map') },
    { to: '/my-bookings', label: t('nav.myBookings') },
    { to: '/wishlist', label: t('nav.wishlist') },
  ]

  const hosting = [
    { to: '/admin/properties/add', label: 'List your property' },
    { to: '/admin', label: 'Host dashboard' },
    { to: '/admin/payouts', label: 'Payouts' },
    { to: '/admin/assistant', label: 'Business assistant' },
  ]

  return (
    <footer className="relative border-t border-ink-line bg-ink grain">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* ====== Brand ====== */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border border-brass/50 font-serif text-[19px] text-brass">
                E
              </span>
              <span>
                <span className="block font-serif text-[19px] tracking-[0.14em] text-ivory">EASYLET</span>
                <span className="block text-[8px] uppercase tracking-[0.42em] text-ivory/45">Stays &amp; Homes</span>
              </span>
            </div>

            <p className="mt-6 max-w-[34ch] text-[14px] leading-[1.85] text-ivory/50">
              One place to book a night, take a furnished month, or sign a year — across
              fourteen homes in seven countries.
            </p>

            <p className="eyebrow mt-6 text-brass">Nightly · Monthly · Long lease</p>
          </div>

          {/* ====== Explore ====== */}
          <div>
            <p className="eyebrow text-ivory/40">Explore</p>
            <ul className="mt-6 space-y-3">
              {explore.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-[14px] text-ivory/65 transition-colors duration-300 hover:text-brass">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ====== Hosting ====== */}
          <div>
            <p className="eyebrow text-ivory/40">Hosting</p>
            <ul className="mt-6 space-y-3">
              {hosting.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-[14px] text-ivory/65 transition-colors duration-300 hover:text-brass">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ====== Reach ====== */}
          <div>
            <p className="eyebrow text-ivory/40">Get in touch</p>
            <address className="mt-6 space-y-3 not-italic text-[14px] leading-relaxed text-ivory/65">
              <p className="max-w-[24ch]">Agrabad, Chattogram, Bangladesh</p>
              <p>
                <a href="mailto:hello@easylet.test" className="transition-colors hover:text-brass">
                  hello@easylet.test
                </a>
              </p>
            </address>

            <div className="mt-6 flex gap-3">
              {socials.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-9 w-9 items-center justify-center border border-ivory/20 text-ivory/60 transition-all duration-300 hover:border-brass hover:text-brass"
                  >
                    <Icon size={13} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ivory/35">© {new Date().getFullYear()} EasyLet. All rights reserved.</p>
          <p className="text-[12px] text-ivory/35">Built for stays of every length.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
