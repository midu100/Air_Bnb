import React from 'react'
import { Link } from 'react-router'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-gray-900 group-hover:text-rose-500 transition-colors">
                Air<span className="text-rose-500">Bnb</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              Experience the world's most luxurious and unique stays. From beachfront glass villas to chic urban lofts, find your next adventure with us.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li><a href="#" className="hover:text-rose-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">AirCover</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Anti-discrimination</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Disability support</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Cancellation options</a></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-4">Hosting</h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li><a href="#" className="hover:text-rose-500 transition-colors">AirBnb your home</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Hosting resources</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Community forum</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Hosting responsibly</a></li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-4">Get in Touch</h4>
            <p className="text-xs text-gray-500">Questions? Feel free to write to us or follow us online.</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:text-rose-500 hover:border-rose-250 transition-all text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:text-rose-500 hover:border-rose-250 transition-all text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:text-rose-500 hover:border-rose-250 transition-all text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom border & disclaimer */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-gray-400">
            &copy; {currentYear} Air-Bnb clone. Built with passion for midu100 using React, Vite & Tailwind CSS v4.
          </p>
          <div className="flex gap-6 text-[11px] text-gray-400">
            <a href="#" className="hover:text-rose-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
