import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Clock, 
  User, 
  Building2,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'project' | 'client' | 'recent';
  icon?: React.ElementType;
  description?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onFilterClick?: () => void;
  filterCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-8',
    input: 'text-sm pl-8 pr-8',
    icon: 'h-4 w-4',
    iconLeft: 'left-2.5',
    iconRight: 'right-2.5',
    suggestion: 'px-3 py-2 text-sm',
  },
  md: {
    container: 'h-10',
    input: 'text-sm pl-10 pr-10',
    icon: 'h-4 w-4',
    iconLeft: 'left-3',
    iconRight: 'right-3',
    suggestion: 'px-4 py-2.5 text-sm',
  },
  lg: {
    container: 'h-12',
    input: 'text-base pl-12 pr-12',
    icon: 'h-5 w-5',
    iconLeft: 'left-4',
    iconRight: 'right-4',
    suggestion: 'px-4 py-3 text-base',
  },
} as const;

const getSuggestionIcon = (type: SearchSuggestion['type']) => {
  switch (type) {
    case 'project':
      return Building2;
    case 'client':
      return User;
    case 'recent':
      return Clock;
    default:
      return Search;
  }
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar proyectos, clientes...',
  suggestions = [],
  showSuggestions = true,
  onSuggestionSelect,
  className,
  disabled = false,
  autoFocus = false,
  onFilterClick,
  filterCount = 0,
  size = 'md',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sizeConfig = SIZE_CONFIG[size];

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          onSuggestionSelect?.(suggestions[highlightedIndex]);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (showSuggestions && newValue.length > 0) {
      setShowDropdown(true);
      setHighlightedIndex(-1);
    } else {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionSelect?.(suggestion);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <motion.div
          className={clsx(
            'relative flex items-center',
            sizeConfig.container,
            'bg-white border rounded-lg transition-all duration-200',
            isFocused 
              ? 'border-gray-200 ring-2 ring-gray-300/20 ' 
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          animate={{
            boxShadow: isFocused 
              ? '0 0 0 1px rgba(59, 130, 246, 0.3)' 
              : '0 0 0 0px transparent'
          }}
        >
          {/* Search Icon */}
          <Search className={clsx(
            'absolute text-gray-400',
            sizeConfig.icon,
            sizeConfig.iconLeft
          )} />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (showSuggestions && value.length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding dropdown to allow for clicks
              setTimeout(() => setShowDropdown(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={clsx(
              'w-full border-0 bg-transparent focus:outline-none focus:ring-0',
              'placeholder-gray-500 text-gray-900',
              sizeConfig.input
            )}
          />

          {/* Clear Button */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className={clsx(
                  'absolute text-gray-400 hover:text-gray-600 transition-colors',
                  'hover:bg-gray-100 rounded-full p-0.5',
                  sizeConfig.icon,
                  sizeConfig.iconRight
                )}
              >
                <X className="h-full w-full" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filter Button */}
        {onFilterClick && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFilterClick}
            className={clsx(
              'ml-2 px-3 py-2 bg-white border border-gray-300 rounded-lg',
              'hover:bg-gray-50 hover:border-gray-400 transition-all duration-200',
              'flex items-center space-x-2 text-sm text-gray-600',
              filterCount > 0 && 'border-gray-200 text-gray-600 bg-gray-900'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {filterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded-full font-medium">
                {filterCount}
              </span>
            )}
          </motion.button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg  overflow-hidden z-50"
          >
            <div className="py-2 max-h-64 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon || getSuggestionIcon(suggestion.type);
                const isHighlighted = index === highlightedIndex;

                return (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={clsx(
                      'w-full flex items-center text-left transition-colors',
                      sizeConfig.suggestion,
                      isHighlighted 
                        ? 'bg-gray-900 text-gray-600' 
                        : 'text-gray-900 hover:bg-gray-50'
                    )}
                    whileHover={{ backgroundColor: 'var(--tw-color-gray-50)' }}
                  >
                    <div className={clsx(
                      'flex-shrink-0 p-1.5 rounded-md mr-3',
                      isHighlighted ? 'bg-gray-900' : 'bg-gray-100'
                    )}>
                      <Icon className={clsx(
                        'h-4 w-4',
                        isHighlighted ? 'text-gray-600' : 'text-gray-500'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.description && (
                        <div className={clsx(
                          'text-xs truncate mt-0.5',
                          isHighlighted ? 'text-gray-600' : 'text-gray-500'
                        )}>
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    
                    {suggestion.type === 'recent' && (
                      <div className="flex-shrink-0 text-xs text-gray-400">
                        Reciente
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};