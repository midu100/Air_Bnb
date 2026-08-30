import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LANGUAGES, translations } from './translations'

const LocaleContext = createContext(null)

const STORAGE_KEY = 'airbnb_locale'

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// The browser's own preference is a better first guess than defaulting to English
const detectLanguage = () => {
  const stored = readStored()
  if (stored?.language) return stored.language

  const browser = (navigator.language || 'en').slice(0, 2)
  return LANGUAGES.some((item) => item.code === browser) ? browser : 'en'
}

export const LocaleProvider = ({ children }) => {
  const [language, setLanguage] = useState(detectLanguage)
  const [currency, setCurrency] = useState(() => readStored()?.currency || 'USD')

  const dir = LANGUAGES.find((item) => item.code === language)?.dir || 'ltr'

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, currency }))
    } catch {
      // A private window can refuse storage, the app still works without it
    }

    // Right to left languages need the whole document flipped
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, currency, dir])

  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en

    // Missing keys fall back to English rather than showing the raw key
    const t = (key) => dictionary[key] || translations.en[key] || key

    return { language, setLanguage, currency, setCurrency, dir, t, languages: LANGUAGES }
  }, [language, currency, dir])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useLocale must be used inside LocaleProvider')
  return context
}
