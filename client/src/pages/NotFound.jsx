import React from 'react'
import { Link } from 'react-router'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center font-sans">
      <div className="space-y-6 max-w-md animate-fade-in-up">
        {/* Animated icon sphere */}
        <div className="w-24 h-24 rounded-3xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto shadow-2xl relative">
          <span className="text-4xl font-display font-black text-brand animate-pulse">404</span>
          <div className="absolute inset-0 rounded-3xl border border-brand/20 animate-ping opacity-20"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-display font-extrabold text-gray-900">
            Lost in the wild?
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed font-light font-sans">
            We couldn't find the page you are looking for. It might have been moved or doesn't exist anymore. Let's get you back on track.
          </p>
        </div>

        <Link
          to="/"
          className="btn-brand inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
