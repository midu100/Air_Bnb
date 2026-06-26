import React from 'react'

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Find Your Stay',
      description: 'Search from thousands of curated cabins, beachfront villas, and chic lofts worldwide.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f0506e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      step: '02',
      title: 'Book Instantly',
      description: 'Check verified dates on the booking calendar. Zero double-booking issues with auto-blocking.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f0506e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      step: '03',
      title: 'Experience Travel',
      description: 'Arrive at your dream location, communicate with the host, and enjoy a seamless stay.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f0506e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 font-sans">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-display font-bold text-gray-800">
          Why Choose <span className="text-[#f0506e]">Air-Bnb</span>?
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
          We make searching and booking property stays simpler, faster, and double-booking safe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="card-clean p-8 rounded-2xl flex flex-col items-center text-center group"
          >
            {/* Step Number */}
            <span className="absolute top-4 right-6 text-3xl font-display font-black text-gray-100 select-none group-hover:text-[#fce4ec] transition-colors">
              {item.step}
            </span>

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-[#fce4ec] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>

            <h3 className="text-base font-bold text-gray-700 mb-3 group-hover:text-[#f0506e] transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
