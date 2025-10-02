import React, { useState, useRef, useEffect } from 'react'

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface DateRangePreset {
  id: string
  label: string
  getRange: () => DateRange
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  presets?: DateRangePreset[]
  showFiscalQuarters?: boolean
  fiscalYearStart?: number // Month (0-11) when fiscal year starts
  minDate?: Date
  maxDate?: Date
  locale?: string
}

const defaultPresets: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Hoy',
    getRange: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const end = new Date(today)
      end.setHours(23, 59, 59, 999)
      return { start: today, end }
    }
  },
  {
    id: 'yesterday',
    label: 'Ayer',
    getRange: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const end = new Date(yesterday)
      end.setHours(23, 59, 59, 999)
      return { start: yesterday, end }
    }
  },
  {
    id: 'thisWeek',
    label: 'Esta semana',
    getRange: () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const start = new Date(today)
      start.setDate(today.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    id: 'lastWeek',
    label: 'Semana pasada',
    getRange: () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const start = new Date(today)
      start.setDate(today.getDate() - dayOfWeek - 7)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    id: 'thisMonth',
    label: 'Este mes',
    getRange: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    id: 'lastMonth',
    label: 'Mes pasado',
    getRange: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    id: 'thisQuarter',
    label: 'Este trimestre',
    getRange: () => {
      const today = new Date()
      const quarter = Math.floor(today.getMonth() / 3)
      const start = new Date(today.getFullYear(), quarter * 3, 1)
      const end = new Date(today.getFullYear(), quarter * 3 + 3, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    id: 'thisYear',
    label: 'Este año',
    getRange: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), 0, 1)
      const end = new Date(today.getFullYear(), 11, 31)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    id: 'lastYear',
    label: 'Año pasado',
    getRange: () => {
      const today = new Date()
      const start = new Date(today.getFullYear() - 1, 0, 1)
      const end = new Date(today.getFullYear() - 1, 11, 31)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  }
]

const getFiscalQuarterPresets = (fiscalYearStart: number = 0): DateRangePreset[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Determine fiscal year based on current date and fiscal year start
  let fiscalYear = currentYear
  if (today.getMonth() < fiscalYearStart) {
    fiscalYear = currentYear - 1
  }

  return [
    {
      id: 'fiscalQ1',
      label: 'Q1 Fiscal',
      getRange: () => {
        const start = new Date(fiscalYear, fiscalYearStart, 1)
        const end = new Date(fiscalYear, fiscalYearStart + 3, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    {
      id: 'fiscalQ2',
      label: 'Q2 Fiscal',
      getRange: () => {
        const start = new Date(fiscalYear, fiscalYearStart + 3, 1)
        const end = new Date(fiscalYear, fiscalYearStart + 6, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    {
      id: 'fiscalQ3',
      label: 'Q3 Fiscal',
      getRange: () => {
        const start = new Date(fiscalYear, fiscalYearStart + 6, 1)
        const end = new Date(fiscalYear, fiscalYearStart + 9, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    {
      id: 'fiscalQ4',
      label: 'Q4 Fiscal',
      getRange: () => {
        const start = new Date(fiscalYear, fiscalYearStart + 9, 1)
        const end = new Date(fiscalYear + 1, fiscalYearStart, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    {
      id: 'fiscalYear',
      label: 'Año Fiscal',
      getRange: () => {
        const start = new Date(fiscalYear, fiscalYearStart, 1)
        const end = new Date(fiscalYear + 1, fiscalYearStart, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    }
  ]
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar rango de fechas",
  className = "",
  disabled = false,
  presets,
  showFiscalQuarters = false,
  fiscalYearStart = 0,
  minDate,
  maxDate,
  locale = 'es-MX'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const allPresets = [
    ...(presets || defaultPresets),
    ...(showFiscalQuarters ? getFiscalQuarterPresets(fiscalYearStart) : [])
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (date: Date | null): string => {
    if (!date) return ""
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDisplayValue = (): string => {
    if (!value.start && !value.end) return ""
    if (value.start && !value.end) return formatDate(value.start)
    if (!value.start && value.end) return formatDate(value.end)
    return `${formatDate(value.start)} - ${formatDate(value.end)}`
  }

  const handleDateClick = (date: Date) => {
    if (selectingStart || !value.start) {
      onChange({ start: date, end: value.end })
      setSelectingStart(false)
    } else {
      if (date < value.start) {
        onChange({ start: date, end: value.start })
      } else {
        onChange({ start: value.start, end: date })
      }
      setSelectingStart(true)
      setIsOpen(false)
    }
  }

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = preset.getRange()
    onChange(range)
    setIsOpen(false)
  }

  const isDateInRange = (date: Date): boolean => {
    if (!value.start || !value.end) return false
    return date >= value.start && date <= value.end
  }

  const isDateSelected = (date: Date): boolean => {
    return (value.start && date.getTime() === value.start.getTime()) ||
           (value.end && date.getTime() === value.end.getTime())
  }

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const renderCalendar = (monthOffset: number = 0) => {
    const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1)
    const startOfMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)
    const endOfMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0)
    const startDate = new Date(startOfMonth)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate)
      const isCurrentMonth = date.getMonth() === displayMonth.getMonth()
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = isDateSelected(date)
      const inRange = isDateInRange(date)
      const disabled = isDateDisabled(date)

      days.push(
        <button
          key={date.toISOString()}
          onClick={() => !disabled && handleDateClick(date)}
          disabled={disabled}
          className={`
            w-8 h-8 text-sm rounded-md transition-colors
            ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
            ${isToday ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${inRange && !isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
          `}
        >
          {date.getDate()}
        </button>
      )
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {displayMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
          </h3>
          {monthOffset === 0 && (
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="w-8 h-8 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={formatDisplayValue() ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
            {formatDisplayValue() || placeholder}
          </span>
        </div>
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-max">
          <div className="flex">
            {/* Presets */}
            <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Rangos rápidos
              </h4>
              <div className="space-y-1">
                {allPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="flex">
              {renderCalendar(0)}
              <div className="border-l border-gray-200 dark:border-gray-700">
                {renderCalendar(1)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectingStart ? 'Selecciona fecha de inicio' : 'Selecciona fecha de fin'}
            </div>
            <button
              onClick={() => {
                onChange({ start: null, end: null })
                setIsOpen(false)
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker