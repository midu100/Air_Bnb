import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccess('Logged in successfully! Redirecting you to home...')
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      {/* Background visual shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-gray-900 group-hover:text-rose-500 transition-colors">
              Air<span className="text-rose-500">Bnb</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="text-[11px] text-gray-500 mt-1">
            Log in to manage bookings and message hosts
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl text-center mb-6 animate-fade-in">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white border border-gray-200 focus:border-brand rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand/10 transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                Password
              </label>
              <a href="#" className="text-[10px] font-semibold text-brand hover:text-brand-dark">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full bg-white border border-gray-200 focus:border-brand rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand/10 transition-all placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-brand py-3 text-xs rounded-xl mt-2"
          >
            Log In
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-150 text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand hover:text-brand-dark">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
