import React from 'react'

const CommonHead = ({name,des}) => {
  return (
    <div>
        <div>
          <h2 className="text-3xl font-black text-black tracking-tight uppercase">{name}</h2>
          <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest mt-1">{des}</p>
        </div>
    </div>
  )
}

export default CommonHead