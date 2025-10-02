import { useState, useEffect, useCallback } from 'react';
import { projectContractorService, type ProjectContractorWithDetails } from '../services';
import type { Database } from '@/types/database.types';

type ProjectContractorInsert = Database['public']['Tables']['project_contractors']['Insert'];
type ProjectContractorUpdate = Database['public']['Tables']['project_contractors']['Update'];

interface UseProjectContractorsResult {
  contractors: ProjectContractorWithDetails[];
  loading: boolean;
  error: Error | null;
  stats: {
    total_contractors: number;
    active_contractors: number;
    total_budget: number;
    total_paid: number;
    total_pending: number;
    average_progress: number;
  } | null;
  refetch: () => Promise<void>;
  createContractor: (data: ProjectContractorInsert) => Promise<boolean>;
  updateContractor: (id: string, data: ProjectContractorUpdate) => Promise<boolean>;
  deleteContractor: (id: string) => Promise<boolean>;
  updateProgress: (id: string, percentage: number) => Promise<boolean>;
  updateStatus: (id: string, status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled') => Promise<boolean>;
}

/**
 * Hook para gestionar contractors de un proyecto
 */
export function useProjectContractors(projectId: string): UseProjectContractorsResult {
  const [contractors, setContractors] = useState<ProjectContractorWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<UseProjectContractorsResult['stats']>(null);

  const fetchContractors = useCallback(async () => {
    console.log('useProjectContractors - fetchContractors called for project:', projectId);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await projectContractorService.getByProjectId(projectId);

      if (fetchError) {
        console.error('useProjectContractors - Error fetching:', fetchError);
        throw fetchError;
      }

      console.log('useProjectContractors - Received data:', {
        count: data?.length || 0,
        first_contractor: data?.[0],
      });

      setContractors(data || []);
    } catch (err) {
      console.error('useProjectContractors - Catch error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await projectContractorService.getProjectStats(projectId);

      if (statsError) {
        throw statsError;
      }

      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchContractors();
      fetchStats();
    }
  }, [projectId, fetchContractors, fetchStats]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchContractors(), fetchStats()]);
  }, [fetchContractors, fetchStats]);

  const createContractor = useCallback(async (data: ProjectContractorInsert): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: createError } = await projectContractorService.create(data);

      if (createError) {
        throw createError;
      }

      await refetch();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const updateContractor = useCallback(async (id: string, data: ProjectContractorUpdate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await projectContractorService.update(id, data);

      if (updateError) {
        throw updateError;
      }

      await refetch();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const deleteContractor = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await projectContractorService.delete(id);

      if (deleteError) {
        throw deleteError;
      }

      await refetch();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const updateProgress = useCallback(async (id: string, percentage: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await projectContractorService.updateProgress(id, percentage);

      if (updateError) {
        throw updateError;
      }

      await refetch();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const updateStatus = useCallback(async (
    id: string,
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await projectContractorService.updateStatus(id, status);

      if (updateError) {
        throw updateError;
      }

      await refetch();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return {
    contractors,
    loading,
    error,
    stats,
    refetch,
    createContractor,
    updateContractor,
    deleteContractor,
    updateProgress,
    updateStatus,
  };
}