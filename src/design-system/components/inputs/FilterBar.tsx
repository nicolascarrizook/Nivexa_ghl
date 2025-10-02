import React, { useState } from 'react'

export interface FilterOption {
  id: string
  label: string
  value: any
}

export interface FilterConfig {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange'
  options?: FilterOption[]
  placeholder?: string
  multiple?: boolean
  min?: number
  max?: number
}

export interface ActiveFilter {
  filterId: string
  label: string
  value: any
  displayValue: string
}

export interface FilterPreset {
  id: string
  name: string
  filters: Record<string, any>
}

export interface FilterBarProps {
  filters: FilterConfig[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  presets?: FilterPreset[]
  onSavePreset?: (name: string, filters: Record<string, any>) => void
  onLoadPreset?: (preset: FilterPreset) => void
  onDeletePreset?: (presetId: string) => void
  className?: string
  showPresets?: boolean
  disabled?: boolean
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFiltersChange,
  presets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  className = "",
  showPresets = true,
  disabled = false
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")

  const handleFilterChange = (filterId: string, value: any, label: string) => {
    const filterConfig = filters.find(f => f.id === filterId)
    if (!filterConfig) return

    const displayValue = formatDisplayValue(filterConfig, value)
    
    if (value === undefined || value === null || value === "" || 
        (Array.isArray(value) && value.length === 0)) {
      // Remove filter
      onFiltersChange(activeFilters.filter(f => f.filterId !== filterId))
    } else {
      // Add or update filter
      const newFilters = activeFilters.filter(f => f.filterId !== filterId)
      newFilters.push({
        filterId,
        label,
        value,
        displayValue
      })
      onFiltersChange(newFilters)
    }
  }

  const formatDisplayValue = (filterConfig: FilterConfig, value: any): string => {
    if (value === undefined || value === null) return ""
    
    switch (filterConfig.type) {
      case 'select':
        if (Array.isArray(value)) {
          const options = value.map(v => {
            const option = filterConfig.options?.find(o => o.value === v)
            return option?.label || v
          })
          return options.join(", ")
        } else {
          const option = filterConfig.options?.find(o => o.value === value)
          return option?.label || value
        }
      case 'date':
        return new Date(value).toLocaleDateString('es-MX')
      case 'dateRange':
        return `${new Date(value.start).toLocaleDateString('es-MX')} - ${new Date(value.end).toLocaleDateString('es-MX')}`
      case 'numberRange':
        return `${value.min} - ${value.max}`
      default:
        return String(value)
    }
  }

  const clearAllFilters = () => {
    onFiltersChange([])
  }

  const savePreset = () => {
    if (newPresetName.trim() && onSavePreset) {
      const filtersObject = activeFilters.reduce((acc, filter) => {
        acc[filter.filterId] = filter.value
        return acc
      }, {} as Record<string, any>)
      
      onSavePreset(newPresetName.trim(), filtersObject)
      setNewPresetName("")
      setShowPresetModal(false)
    }
  }

  const renderFilterInput = (filter: FilterConfig) => {
    const activeFilter = activeFilters.find(f => f.filterId === filter.id)
    const value = activeFilter?.value

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={filter.placeholder}
            value={value || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value, filter.label)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'select':
        return (
          <select
            multiple={filter.multiple}
            value={filter.multiple ? (value || []) : (value || "")}
            onChange={(e) => {
              const selectedValue = filter.multiple 
                ? Array.from(e.target.selectedOptions, option => option.value)
                : e.target.value
              handleFilterChange(filter.id, selectedValue, filter.label)
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            {filter.options?.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value, filter.label)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            value={value || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value ? Number(e.target.value) : undefined, filter.label)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Filtros
            {activeFilters.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {activeFilters.length}
              </span>
            )}
          </button>

          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {showPresets && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value && onLoadPreset) {
                    const preset = presets.find(p => p.id === e.target.value)
                    if (preset) onLoadPreset(preset)
                  }
                  e.target.value = ""
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Filtros guardados</option>
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {activeFilters.length > 0 && onSavePreset && (
              <button
                onClick={() => setShowPresetModal(true)}
                className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Guardar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div
              key={`${filter.filterId}-${index}`}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
            >
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.displayValue}</span>
              <button
                onClick={() => handleFilterChange(filter.filterId, undefined, filter.label)}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Inputs */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showPresetModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowPresetModal(false)} />
          <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Guardar filtros
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del filtro
                </label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Mi filtro personalizado"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPresetModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePreset}
                  disabled={!newPresetName.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FilterBar