import React from 'react'

const CommonHead = ({name,des}) => {
  return (
    <div>
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
            {name}
          </h2>
          <p className="text-m font-medium text-gray-600 mt-1">{des}</p>
        </div>
    </div>
  )
}

export default CommonHead