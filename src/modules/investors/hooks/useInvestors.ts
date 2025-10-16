import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investorService } from '../services/InvestorService';
import type { Investor, InvestorFormData } from '../types/investor.types';

// Query key factory
const investorKeys = {
  all: ['investors'] as const,
  lists: () => [...investorKeys.all, 'list'] as const,
  list: (filters?: any) => [...investorKeys.lists(), filters] as const,
  details: () => [...investorKeys.all, 'detail'] as const,
  detail: (id: string) => [...investorKeys.details(), id] as const,
  withStats: () => [...investorKeys.all, 'withStats'] as const,
  search: (query: string) => [...investorKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all investors
 */
export function useInvestors() {
  return useQuery({
    queryKey: investorKeys.lists(),
    queryFn: async () => {
      try {
        return await investorService.getAllInvestors();
      } catch (error) {
        console.error('Error fetching investors:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook to fetch all investors with project statistics
 */
export function useInvestorsWithStats() {
  return useQuery({
    queryKey: investorKeys.withStats(),
    queryFn: async () => {
      try {
        return await investorService.getAllInvestorsWithStats();
      } catch (error) {
        console.error('Error fetching investors with stats:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook to fetch a single investor by ID
 */
export function useInvestor(investorId: string) {
  return useQuery({
    queryKey: investorKeys.detail(investorId),
    queryFn: async () => {
      try {
        return await investorService.getInvestor(investorId);
      } catch (error) {
        console.error('Error fetching investor:', error);
        throw error;
      }
    },
    enabled: !!investorId,
  });
}

/**
 * Hook to search investors by query string
 */
export function useSearchInvestors(query: string, enabled = true) {
  return useQuery({
    queryKey: investorKeys.search(query),
    queryFn: async () => {
      try {
        if (query.length < 2) return [];
        return await investorService.searchInvestors(query);
      } catch (error) {
        console.error('Error searching investors:', error);
        throw error;
      }
    },
    enabled: enabled && query.length >= 2,
  });
}

/**
 * Hook to create a new investor
 */
export function useCreateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: InvestorFormData) => {
      try {
        return await investorService.createInvestor(formData);
      } catch (error) {
        console.error('Error creating investor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investorKeys.all });
    },
  });
}

/**
 * Hook to find existing investor or create new one (prevents duplicates)
 */
export function useFindOrCreateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: InvestorFormData) => {
      try {
        return await investorService.findOrCreateInvestor(formData);
      } catch (error) {
        console.error('Error finding/creating investor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investorKeys.all });
    },
  });
}

/**
 * Hook to update an existing investor
 */
export function useUpdateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Investor> }) => {
      try {
        return await investorService.updateInvestor(id, updates);
      } catch (error) {
        console.error('Error updating investor:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: investorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: investorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: investorKeys.withStats() });
    },
  });
}

/**
 * Hook to delete an investor
 */
export function useDeleteInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await investorService.deleteInvestor(id);
      } catch (error) {
        console.error('Error deleting investor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investorKeys.all });
    },
  });
}

// Export query keys for external use
export { investorKeys };
