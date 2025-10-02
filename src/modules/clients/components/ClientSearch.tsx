import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Mail, Phone, MapPin, Plus } from 'lucide-react';
import { useClientSearch } from '../hooks/useClientSearch';
import type { ClientSearchResult } from '../services/ClientService';
import { cn } from '@/lib/utils';

interface ClientSearchProps {
  onSelectClient: (client: ClientSearchResult | null) => void;
  onCreateNew?: () => void;
  selectedClientId?: string | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function ClientSearch({
  onSelectClient,
  onCreateNew,
  selectedClientId,
  placeholder = "Buscar cliente por nombre, email o teléfono...",
  className,
  disabled = false,
  autoFocus = false,
}: ClientSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    results,
    isLoading,
    error,
    setSearchQuery,
    clearSearch,
    hasResults,
    canSearch,
  } = useClientSearch({
    minSearchLength: 2,
    debounceMs: 300,
    limit: 8,
  });

  // Handle clicking outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectClient(results[selectedIndex]);
        } else if (selectedIndex === -1 && onCreateNew && canSearch) {
          // If no item is selected and we can create new, trigger create
          onCreateNew();
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setShowResults(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handleSelectClient = (client: ClientSearchResult) => {
    onSelectClient(client);
    setSearchQuery(client.name);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    clearSearch();
    onSelectClient(null);
    setShowResults(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (hasResults || canSearch) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Don't hide results immediately to allow click events to fire
    setTimeout(() => {
      if (!isFocused) {
        setShowResults(false);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setShowResults(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "w-full pl-9 pr-9 py-2 border rounded-lg text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-300",
            "disabled:bg-gray-50 disabled:text-gray-500",
            disabled ? "cursor-not-allowed" : "cursor-text",
            error ? "border-gray-300" : "border-gray-200"
          )}
        />
        
        {/* Clear button */}
        {searchQuery && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-gray-600">{error}</p>
      )}

      {/* Search Results Dropdown */}
      {showResults && (canSearch || hasResults) && (
        <div
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg max-h-80 overflow-auto"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Buscando clientes...
            </div>
          )}

          {/* Results */}
          {!isLoading && hasResults && (
            <div className="py-1">
              {results.map((client, index) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelectClient(client)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-300",
                    "border-b border-gray-100 last:border-b-0",
                    selectedIndex === index && "bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {client.name}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {client.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.city && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{client.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !hasResults && canSearch && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No se encontraron clientes
            </div>
          )}

          {/* Create New Option */}
          {!isLoading && canSearch && onCreateNew && (
            <button
              type="button"
              onClick={() => {
                setShowResults(false);
                onCreateNew();
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-300",
                "border-t border-gray-200 bg-gray-50",
                "flex items-center gap-2 text-gray-600"
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">
                Crear nuevo cliente "{searchQuery}"
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}