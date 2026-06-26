import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChatButton from '../components/ChatButton'
import ScrollToTop from '../components/ScrollToTop'

const LayoutOne = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans overflow-x-hidden antialiased">
      {/* Scroll Reset */}
      <ScrollToTop />

      {/* Navigation */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-grow pt-0">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Real-time Simulated Support FAB */}
      <ChatButton />
    </div>
  )
}

export default LayoutOne