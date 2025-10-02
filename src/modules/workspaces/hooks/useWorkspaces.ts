import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkspaceService, type WorkspaceFilters } from '../services/WorkspaceService';
import type { InsertTables, UpdateTables } from '@config/supabase';
import { useCallback } from 'react';

// Create service instance
const workspaceService = new WorkspaceService();

// Query keys factory
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters?: WorkspaceFilters) => [...workspaceKeys.lists(), filters] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  stats: (id: string) => [...workspaceKeys.detail(id), 'stats'] as const,
  recent: (userId: string) => [...workspaceKeys.all, 'recent', userId] as const,
};

/**
 * Hook to fetch all workspaces with filters
 */
export function useWorkspaces(userId: string, filters?: WorkspaceFilters) {
  return useQuery({
    queryKey: workspaceKeys.list({ ...filters, userId }),
    queryFn: () => workspaceService.getUserWorkspaces(userId, filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single workspace
 */
export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(id!),
    queryFn: () => workspaceService.getById(id!),
    select: (response) => response.data,
    enabled: !!id,
  });
}

/**
 * Hook to fetch workspace with statistics
 */
export function useWorkspaceWithStats(id: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.stats(id!),
    queryFn: () => workspaceService.getWorkspaceWithStats(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch recent workspaces
 */
export function useRecentWorkspaces(userId: string, limit?: number) {
  return useQuery({
    queryKey: workspaceKeys.recent(userId),
    queryFn: () => workspaceService.getRecentWorkspaces(userId, limit),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertTables<'workspaces'>) => 
      workspaceService.create(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate all workspace lists
        queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
        
        // Add the new workspace to the cache
        queryClient.setQueryData(
          workspaceKeys.detail(response.data.id),
          response
        );
      }
    },
  });
}

/**
 * Hook to update a workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTables<'workspaces'> }) =>
      workspaceService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific workspace in cache
        queryClient.setQueryData(
          workspaceKeys.detail(variables.id),
          response
        );
        
        // Invalidate lists to reflect changes
        queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      }
    },
  });
}

/**
 * Hook to delete a workspace
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workspaceService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

/**
 * Hook to archive a workspace
 */
export function useArchiveWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workspaceService.archiveWorkspace(id),
    onSuccess: (response, id) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(workspaceKeys.detail(id), response);
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      }
    },
  });
}

/**
 * Hook to clone a workspace
 */
export function useCloneWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      newName, 
      userId 
    }: { 
      workspaceId: string; 
      newName: string; 
      userId: string;
    }) => workspaceService.cloneWorkspace(workspaceId, newName, userId),
    onSuccess: () => {
      // Invalidate all workspace lists
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

/**
 * Hook to search workspaces
 */
export function useSearchWorkspaces(userId: string, searchTerm: string) {
  return useQuery({
    queryKey: [...workspaceKeys.all, 'search', userId, searchTerm],
    queryFn: () => workspaceService.searchByName(userId, searchTerm),
    select: (response) => response.data || [],
    enabled: searchTerm.length > 0,
  });
}

/**
 * Hook to update workspace settings
 */
export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: Record<string, any> }) =>
      workspaceService.updateSettings(id, settings),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(
          workspaceKeys.detail(variables.id),
          response
        );
      }
    },
  });
}

/**
 * Hook for workspace real-time subscription
 */
export function useWorkspaceSubscription(
  workspaceId: string | undefined,
  onUpdate?: (payload: any) => void
) {
  const queryClient = useQueryClient();
  
  const handleUpdate = useCallback((payload: any) => {
    // Invalidate the workspace detail
    if (workspaceId) {
      queryClient.invalidateQueries({ 
        queryKey: workspaceKeys.detail(workspaceId) 
      });
    }
    
    // Call custom handler if provided
    onUpdate?.(payload);
  }, [workspaceId, queryClient, onUpdate]);
  
  // This would be implemented with actual subscription logic
  // For now, it's a placeholder
  return {
    subscribe: () => {
      if (!workspaceId) return () => {};
      
      return workspaceService.subscribeToChanges(
        handleUpdate,
        { id: workspaceId }
      );
    },
  };
}