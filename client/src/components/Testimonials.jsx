import React from 'react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Frequent Traveler',
    quote: 'The booking was smooth and I loved the clean layout! The interactive availability calendar was spot on and let me plan without worry.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'David K.',
    role: 'Property Owner',
    quote: 'Listing my property here has been incredible. The automatic calendar prevents double booking, and communicating with guests via chat is super fast.',
    rating: 5,
    avatar: 'DK'
  },
  {
    id: 3,
    name: 'Evelyn Martinez',
    role: 'Vlogger & Host',
    quote: 'Absolutely gorgeous user interface! The property carousels and responsive design are beautiful. Highly recommend the platform.',
    rating: 5,
    avatar: 'EM'
  }
]

const Testimonials = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 font-sans">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-display font-bold text-gray-800">
          What Our <span className="text-[#f0506e]">Guests Say</span>
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
          Hear reviews from hosts and travelers about their experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.id}
            className="card-clean p-8 rounded-2xl relative flex flex-col justify-between"
          >
            {/* Quote icon */}
            <div className="absolute top-6 right-8 text-gray-100">
              <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.914-3.996 3.635-3.996 5.846h3.999v10h-10z" />
              </svg>
            </div>

            <div className="space-y-4">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(item.rating)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-500 leading-relaxed italic">
                "{item.quote}"
              </p>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 mt-8 pt-4 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#fce4ec] flex items-center justify-center font-bold text-xs text-[#f0506e]">
                {item.avatar}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700">{item.name}</h4>
                <p className="text-[10px] text-gray-400">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
