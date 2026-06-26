import React from 'react'

const CategoryCard = ({ category, isActive, onClick }) => {
  const { name, image, count } = category

  return (
    <button
      onClick={onClick}
      className={`group relative flex-shrink-0 w-[220px] md:w-[260px] cursor-pointer select-none bg-transparent border-none p-0 text-left transition-all`}
    >
      {/* Image Container */}
      <div className={`relative w-full h-[180px] md:h-[200px] rounded-xl overflow-hidden transition-all duration-300 ${
        isActive ? 'ring-2 ring-[#f0506e] ring-offset-2' : ''
      }`}>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 rounded-xl" />
        
        {/* Count badge */}
        {count && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-sm">
            {count} properties
          </div>
        )}
      </div>

      {/* Label */}
      <h3 className={`mt-2.5 text-sm font-bold transition-colors duration-200 ${
        isActive ? 'text-[#f0506e]' : 'text-gray-800 group-hover:text-[#f0506e]'
      }`}>
        {name}
      </h3>
    </button>
  )
}

export default CategoryCard
