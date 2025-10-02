import { useState, useCallback, useEffect, useRef } from 'react';
import { clientService, type ClientSearchResult } from '../services/ClientService';
import { useDebounce } from '@/hooks/useDebounce';

interface UseClientSearchOptions {
  minSearchLength?: number;
  debounceMs?: number;
  limit?: number;
}

export function useClientSearch(options: UseClientSearchOptions = {}) {
  const {
    minSearchLength = 2,
    debounceMs = 300,
    limit = 10,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  // Perform the search
  const performSearch = useCallback(async (query: string) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear results if query is too short
    if (query.length < minSearchLength) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await clientService.searchClients(query, limit);
      
      // Only update if this request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setResults(searchResults);
        setError(null);
      }
    } catch (err) {
      // Only handle error if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Error searching clients:', err);
        setError('Error al buscar clientes. Por favor, intente nuevamente.');
        setResults([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [minSearchLength, limit]);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
    } else {
      setResults([]);
      setIsLoading(false);
      setError(null);
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearchQuery, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setIsLoading(false);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Select a client from results
  const selectClient = useCallback((client: ClientSearchResult) => {
    // This will be used by the parent component
    // The parent will handle what to do with the selected client
    return client;
  }, []);

  return {
    // State
    searchQuery,
    results,
    isLoading,
    error,
    
    // Actions
    setSearchQuery,
    clearSearch,
    selectClient,
    
    // Computed
    hasResults: results.length > 0,
    isSearching: searchQuery.length >= minSearchLength && isLoading,
    canSearch: searchQuery.length >= minSearchLength,
  };
}