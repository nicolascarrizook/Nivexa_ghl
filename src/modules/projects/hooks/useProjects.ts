import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type ProjectWithDetails } from '../services/ProjectService';
import type { ProjectFormData } from '../types/project.types';

// Query key factory
const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: any) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  withCash: () => [...projectKeys.all, 'withCash'] as const,
  withInstallments: (id: string) => [...projectKeys.detail(id), 'installments'] as const,
  progress: (id: string) => [...projectKeys.detail(id), 'progress'] as const,
  byClient: (clientId: string) => [...projectKeys.all, 'byClient', clientId] as const,
};

/**
 * Hook to fetch all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      try {
        return await projectService.getProjects();
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook to fetch projects by client ID
 */
export function useProjectsByClient(clientId: string) {
  return useQuery({
    queryKey: projectKeys.byClient(clientId),
    queryFn: async () => {
      try {
        return await projectService.getProjectsByClient(clientId);
      } catch (error) {
        console.error('Error fetching projects by client:', error);
        throw error;
      }
    },
    enabled: !!clientId,
  });
}

/**
 * Hook to fetch projects with cash boxes
 */
export function useProjectsWithCash() {
  return useQuery({
    queryKey: projectKeys.withCash(),
    queryFn: async () => {
      try {
        return await projectService.getProjectsWithCash();
      } catch (error) {
        console.error('Error fetching projects with cash:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook to fetch a single project
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      try {
        return await projectService.getProject(projectId);
      } catch (error) {
        console.error('Error fetching project:', error);
        throw error;
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch project with installments
 */
export function useProjectWithInstallments(projectId: string) {
  return useQuery({
    queryKey: projectKeys.withInstallments(projectId),
    queryFn: async () => {
      try {
        return await projectService.getProjectWithInstallments(projectId);
      } catch (error) {
        console.error('Error fetching project with installments:', error);
        throw error;
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch project progress
 */
export function useProjectProgress(projectId: string) {
  return useQuery({
    queryKey: projectKeys.progress(projectId),
    queryFn: async () => {
      try {
        return await projectService.calculateProgress(projectId);
      } catch (error) {
        console.error('Error calculating project progress:', error);
        throw error;
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to create a project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ProjectFormData) => {
      try {
        return await projectService.createProjectFromForm(formData);
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProjectWithDetails> }) => {
      try {
        return await projectService.updateProject(id, updates);
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update project status
 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled' }) => {
      try {
        return await projectService.updateStatus(id, status);
      } catch (error) {
        console.error('Error updating project status:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await projectService.deleteProject(id);
      } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/**
 * Hook to generate installments for a project
 */
export function useGenerateInstallments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: ProjectWithDetails) => {
      try {
        await projectService.generateInstallments(project);
        return true;
      } catch (error) {
        console.error('Error generating installments:', error);
        throw error;
      }
    },
    onSuccess: (data, project) => {
      if (project.id) {
        queryClient.invalidateQueries({ queryKey: projectKeys.withInstallments(project.id) });
      }
    },
  });
}