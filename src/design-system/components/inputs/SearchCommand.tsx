import React, { useState, useEffect, useRef } from 'react'

export interface SearchCommandItem {
  id: string
  title: string
  description?: string
  category: 'clientes' | 'proyectos' | 'facturas'
  icon?: React.ReactNode
  keywords?: string[]
  data?: any
}

export interface SearchCommandProps {
  items: SearchCommandItem[]
  onSelect: (item: SearchCommandItem) => void
  placeholder?: string
  className?: string
  isLoading?: boolean
  recentSearches?: SearchCommandItem[]
  aiSuggestions?: SearchCommandItem[]
  disabled?: boolean
}

const categoryLabels = {
  clientes: 'Clientes',
  proyectos: 'Proyectos', 
  facturas: 'Facturas'
}

const categoryIcons = {
  clientes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  proyectos: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  facturas: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export const SearchCommand: React.FC<SearchCommandProps> = ({
  items,
  onSelect,
  placeholder = "Buscar...",
  className = "",
  isLoading = false,
  recentSearches = [],
  aiSuggestions = [],
  disabled = false
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleSelect = (item: SearchCommandItem) => {
    onSelect(item)
    setOpen(false)
    setSearch("")
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, SearchCommandItem[]>)

  const filteredItems = search 
    ? items.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase()))
      )
    : items

  const filteredGroupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, SearchCommandItem[]>)

  if (!open) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span>{placeholder}</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
      
      {/* Command Palette */}
      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl">
        <div className="cmdk-root">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {filteredItems.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No se encontraron resultados.
              </div>
            )}

            {/* Recent Searches */}
            {search === "" && recentSearches.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Búsquedas recientes
                </div>
                {recentSearches.map((item) => (
                  <div
                    key={`recent-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{categoryLabels[item.category]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Suggestions */}
            {search === "" && aiSuggestions.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Sugerencias IA
                </div>
                {aiSuggestions.map((item) => (
                  <div
                    key={`ai-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{categoryLabels[item.category]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Search Results by Category */}
            {search && Object.entries(filteredGroupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.icon || categoryIcons[item.category]}
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{categoryLabels[item.category]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Keyboard shortcuts footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                <span>para navegar</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↵</kbd>
                <span>para seleccionar</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">esc</kbd>
                <span>para cerrar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchCommand