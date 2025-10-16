import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectInvestorService } from '../services/ProjectInvestorService';
import type { AddInvestorData } from '../services/ProjectInvestorService';
import type { ProjectInvestor } from '../types/investor.types';

// Query key factory
const projectInvestorKeys = {
  all: ['projectInvestors'] as const,
  byProject: (projectId: string) => [...projectInvestorKeys.all, 'project', projectId] as const,
  byInvestor: (investorId: string) => [...projectInvestorKeys.all, 'investor', investorId] as const,
  totals: (projectId: string) => [...projectInvestorKeys.byProject(projectId), 'totals'] as const,
  remaining: (projectId: string) => [...projectInvestorKeys.byProject(projectId), 'remaining'] as const,
};

/**
 * Hook to fetch all investors for a specific project
 */
export function useProjectInvestors(projectId: string) {
  return useQuery({
    queryKey: projectInvestorKeys.byProject(projectId),
    queryFn: async () => {
      try {
        return await projectInvestorService.getInvestorsByProject(projectId);
      } catch (error) {
        console.error('Error fetching project investors:', error);
        throw error;
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch all projects for a specific investor (portfolio)
 */
export function useInvestorProjects(investorId: string) {
  return useQuery({
    queryKey: projectInvestorKeys.byInvestor(investorId),
    queryFn: async () => {
      try {
        return await projectInvestorService.getProjectsByInvestor(investorId);
      } catch (error) {
        console.error('Error fetching investor projects:', error);
        throw error;
      }
    },
    enabled: !!investorId,
  });
}

/**
 * Hook to get total invested amounts in a project
 */
export function useProjectTotalInvested(projectId: string) {
  return useQuery({
    queryKey: projectInvestorKeys.totals(projectId),
    queryFn: async () => {
      try {
        return await projectInvestorService.getTotalInvestedByProject(projectId);
      } catch (error) {
        console.error('Error fetching total invested:', error);
        throw error;
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to get remaining percentage available for a project
 */
export function useProjectRemainingPercentage(projectId: string) {
  return useQuery({
    queryKey: projectInvestorKeys.remaining(projectId),
    queryFn: async () => {
      try {
        return await projectInvestorService.getRemainingPercentage(projectId);
      } catch (error) {
        console.error('Error fetching remaining percentage:', error);
        throw error;
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to add an investor to a project
 */
export function useAddInvestorToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddInvestorData) => {
      try {
        return await projectInvestorService.addInvestorToProject(data);
      } catch (error) {
        console.error('Error adding investor to project:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate project investors list
      queryClient.invalidateQueries({
        queryKey: projectInvestorKeys.byProject(variables.projectId),
      });
      // Invalidate investor projects list
      queryClient.invalidateQueries({
        queryKey: projectInvestorKeys.byInvestor(variables.investorId),
      });
      // Invalidate totals and remaining percentage
      queryClient.invalidateQueries({
        queryKey: projectInvestorKeys.totals(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectInvestorKeys.remaining(variables.projectId),
      });
      // Invalidate project details (to update has_investors flag)
      queryClient.invalidateQueries({
        queryKey: ['projects', 'detail', variables.projectId],
      });
    },
  });
}

/**
 * Hook to remove an investor from a project (soft delete)
 */
export function useRemoveInvestorFromProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectInvestorId: string) => {
      try {
        return await projectInvestorService.removeInvestorFromProject(projectInvestorId);
      } catch (error) {
        console.error('Error removing investor from project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all project investor queries
      queryClient.invalidateQueries({
        queryKey: projectInvestorKeys.all,
      });
    },
  });
}

/**
 * Hook to update investor share details
 */
export function useUpdateInvestorShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectInvestorId,
      updates,
    }: {
      projectInvestorId: string;
      updates: Partial<ProjectInvestor>;
    }) => {
      try {
        return await projectInvestorService.updateInvestorShare(projectInvestorId, updates);
      } catch (error) {
        console.error('Error updating investor share:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: projectInvestorKeys.all,
      });
    },
  });
}

// Export query keys for external use
export { projectInvestorKeys };
