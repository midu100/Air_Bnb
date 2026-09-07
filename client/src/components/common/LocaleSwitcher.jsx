import React, { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { useGetExchangeRatesQuery } from '../../store/api/currencyApi'

const LocaleSwitcher = () => {
  const { language, setLanguage, currency, setCurrency, languages, t } = useLocale()
  const { data: rateData } = useGetExchangeRatesQuery()
  const [isOpen, setIsOpen] = useState(false)
  const boxRef = useRef(null)

  const supported = rateData?.supported || ['USD']
  const symbols = rateData?.symbols || {}
  const activeLanguage = languages.find((item) => item.code === language)

  // Close when the click lands anywhere else
  useEffect(() => {
    const handleClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 hover:bg-white text-gray-700 text-xs font-semibold transition-all cursor-pointer"
        title={`${t('common.language')} / ${t('common.currency')}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span className="uppercase">{language}</span>
        <span className="text-gray-300">·</span>
        <span>{symbols[currency] || currency}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('common.language')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((item) => (
                <button
                  key={item.code}
                  onClick={() => { setLanguage(item.code); setIsOpen(false); }}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    language === item.code
                      ? 'bg-espresso text-linen'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.native}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('common.currency')}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {supported.map((code) => (
                <button
                  key={code}
                  onClick={() => { setCurrency(code); setIsOpen(false); }}
                  className={`px-1.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    currency === code
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {activeLanguage?.dir === 'rtl' && (
            <p className="px-3 pb-3 text-[10px] text-gray-400 font-semibold">
              Right-to-left layout is active.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default LocaleSwitcher
