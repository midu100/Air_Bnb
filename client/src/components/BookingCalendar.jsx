import React, { useState } from 'react'

// ====== Formats a Date as YYYY-MM-DD in local time
// toISOString would shift the day in negative-offset timezones.
const toDateStr = (date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/**
 * BookingCalendar — a month grid that picks a single date.
 *
 * Past days and any date in `unavailableDates` are not selectable, so the same
 * component works for a stay, a viewing or a lease start date.
 */
const BookingCalendar = ({
  value,
  onChange,
  unavailableDates = [],
  minDate,
  monthsAhead = 18,
  label = 'Choose a date',
}) => {
  const today = new Date()
  const todayStr = toDateStr(today)
  const floor = minDate && minDate > todayStr ? minDate : todayStr

  const initial = value ? new Date(value) : today
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1)
  )

  const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const totalDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const offset = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()

  const grid = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ]

  const dayToDateStr = (day) =>
    toDateStr(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))

  const isBlocked = (day) => {
    if (!day) return true
    const dateStr = dayToDateStr(day)
    return dateStr < floor || unavailableDates.includes(dateStr)
  }

  const isAtFloor =
    calendarMonth.getFullYear() === new Date(floor).getFullYear() &&
    calendarMonth.getMonth() === new Date(floor).getMonth()

  const lastMonth = new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1)
  const isAtLimit =
    calendarMonth.getFullYear() === lastMonth.getFullYear() &&
    calendarMonth.getMonth() === lastMonth.getMonth()

  const shiftMonth = (delta) =>
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1))

  const [typedError, setTypedError] = useState('')

  // A typed date has to clear the same rules as a clicked one
  const handleTyped = (dateStr) => {
    if (!dateStr) {
      setTypedError('')
      onChange('')
      return
    }
    if (dateStr < floor) {
      setTypedError('That date has already passed.')
      return
    }
    if (unavailableDates.includes(dateStr)) {
      setTypedError('That date is unavailable.')
      return
    }
    setTypedError('')
    onChange(dateStr)
    // Bring the grid to whatever was typed
    const picked = new Date(dateStr)
    setCalendarMonth(new Date(picked.getFullYear(), picked.getMonth(), 1))
  }

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
        {value && (
          <span className="text-[11px] font-bold text-[#f0506e]">
            {new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mb-4">Red-bordered dates are unavailable.</p>

      {/* ====== Type it instead of hunting for it in the grid ====== */}
      <div className="mb-5">
        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Or type the date
        </label>
        <input
          type="date"
          value={value || ''}
          min={floor}
          onChange={(e) => handleTyped(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#f0506e] focus:bg-white transition-colors"
        />
        {typedError && <p className="text-[10px] text-rose-600 font-semibold mt-1.5">{typedError}</p>}
      </div>

      {/* ====== Month navigation ====== */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={isAtFloor}
          className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-xs font-bold text-gray-800 tracking-wide">{monthLabel}</span>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={isAtLimit}
          className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider">
        {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {grid.map((day, index) => {
          const blocked = isBlocked(day)
          const selected = day && value === dayToDateStr(day)

          return (
            <button
              type="button"
              key={index}
              disabled={blocked}
              onClick={() => onChange(dayToDateStr(day))}
              className={`h-9 w-9 text-xs font-semibold flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                !day
                  ? 'opacity-0 cursor-default pointer-events-none'
                  : selected
                  ? 'bg-rose-500 text-white'
                  : blocked
                  ? 'bg-rose-50 text-rose-500 border border-rose-100 line-through opacity-70 cursor-not-allowed'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-105 active:scale-95'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BookingCalendar
