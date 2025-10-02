import { useState, useEffect, useCallback } from 'react';
import { contractorProgressService, type ProgressTimeline, type ProgressStats } from '../services';
import type { Database } from '@/types/database.types';

type ContractorProgress = Database['public']['Tables']['contractor_progress']['Row'];
type ContractorProgressInsert = Database['public']['Tables']['contractor_progress']['Insert'];
type ContractorProgressUpdate = Database['public']['Tables']['contractor_progress']['Update'];

interface UseContractorProgressResult {
  progressRecords: ContractorProgress[];
  loading: boolean;
  error: Error | null;
  timeline: ProgressTimeline[] | null;
  stats: ProgressStats | null;
  milestones: ContractorProgress[];
  refetch: () => Promise<void>;
  createProgress: (data: ContractorProgressInsert) => Promise<boolean>;
  updateProgress: (id: string, data: ContractorProgressUpdate) => Promise<boolean>;
  deleteProgress: (id: string) => Promise<boolean>;
  markAsMilestone: (id: string, isMilestone?: boolean) => Promise<boolean>;
  addPhotos: (id: string, photoUrls: string[]) => Promise<boolean>;
  addDocuments: (id: string, documentUrls: string[]) => Promise<boolean>;
}

/**
 * Hook para gestionar progreso de un contractor
 */
export function useContractorProgress(projectContractorId: string): UseContractorProgressResult {
  const [progressRecords, setProgressRecords] = useState<ContractorProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeline, setTimeline] = useState<ProgressTimeline[] | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [milestones, setMilestones] = useState<ContractorProgress[]>([]);

  const fetchProgressRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await contractorProgressService.getByProjectContractorId(projectContractorId);

      if (fetchError) {
        throw fetchError;
      }

      setProgressRecords(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectContractorId]);

  const fetchTimeline = useCallback(async () => {
    try {
      const { data, error: timelineError } = await contractorProgressService.getTimeline(projectContractorId);

      if (timelineError) {
        throw timelineError;
      }

      setTimeline(data);
    } catch (err) {
      console.error('Error fetching timeline:', err);
    }
  }, [projectContractorId]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await contractorProgressService.getStats(projectContractorId);

      if (statsError) {
        throw statsError;
      }

      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [projectContractorId]);

  const fetchMilestones = useCallback(async () => {
    try {
      const { data, error: milestonesError } = await contractorProgressService.getMilestones(projectContractorId);

      if (milestonesError) {
        throw milestonesError;
      }

      setMilestones(data || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
    }
  }, [projectContractorId]);

  useEffect(() => {
    if (projectContractorId) {
      fetchProgressRecords();
      fetchTimeline();
      fetchStats();
      fetchMilestones();
    }
  }, [projectContractorId, fetchProgressRecords, fetchTimeline, fetchStats, fetchMilestones]);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchProgressRecords(),
      fetchTimeline(),
      fetchStats(),
      fetchMilestones()
    ]);
  }, [fetchProgressRecords, fetchTimeline, fetchStats, fetchMilestones]);

  const createProgress = useCallback(async (data: ContractorProgressInsert): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: createError } = await contractorProgressService.create(data);

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

  const updateProgress = useCallback(async (id: string, data: ContractorProgressUpdate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorProgressService.update(id, data);

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

  const deleteProgress = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await contractorProgressService.delete(id);

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

  const markAsMilestone = useCallback(async (id: string, isMilestone: boolean = true): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorProgressService.markAsMilestone(id, isMilestone);

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

  const addPhotos = useCallback(async (id: string, photoUrls: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorProgressService.addPhotos(id, photoUrls);

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

  const addDocuments = useCallback(async (id: string, documentUrls: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorProgressService.addDocuments(id, documentUrls);

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
    progressRecords,
    loading,
    error,
    timeline,
    stats,
    milestones,
    refetch,
    createProgress,
    updateProgress,
    deleteProgress,
    markAsMilestone,
    addPhotos,
    addDocuments,
  };
}