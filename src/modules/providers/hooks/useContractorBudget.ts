import { useState, useEffect, useCallback } from 'react';
import { contractorBudgetService, type BudgetSummary } from '../services';
import type { Database } from '@/types/database.types';

type ContractorBudget = Database['public']['Tables']['contractor_budgets']['Row'];
type ContractorBudgetInsert = Database['public']['Tables']['contractor_budgets']['Insert'];
type ContractorBudgetUpdate = Database['public']['Tables']['contractor_budgets']['Update'];

interface UseContractorBudgetResult {
  budgetItems: ContractorBudget[];
  loading: boolean;
  error: Error | null;
  summary: BudgetSummary | null;
  refetch: () => Promise<void>;
  createItem: (data: ContractorBudgetInsert) => Promise<{ success: boolean; id?: string }>;
  updateItem: (id: string, data: ContractorBudgetUpdate) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  duplicateItem: (id: string) => Promise<boolean>;
  reorderItems: (items: { id: string; order_index: number }[]) => Promise<boolean>;
}

/**
 * Hook para gestionar presupuesto de un contractor
 */
export function useContractorBudget(projectContractorId: string): UseContractorBudgetResult {
  const [budgetItems, setBudgetItems] = useState<ContractorBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);

  const fetchBudgetItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await contractorBudgetService.getByProjectContractorId(projectContractorId);

      if (fetchError) {
        throw fetchError;
      }

      setBudgetItems(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectContractorId]);

  const fetchSummary = useCallback(async () => {
    try {
      console.log('useContractorBudget - Fetching summary for:', projectContractorId);
      const { data, error: summaryError } = await contractorBudgetService.getSummary(projectContractorId);

      if (summaryError) {
        console.error('useContractorBudget - Summary error:', summaryError);
        throw summaryError;
      }

      console.log('useContractorBudget - Summary received:', data);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [projectContractorId]);

  useEffect(() => {
    if (projectContractorId) {
      fetchBudgetItems();
      fetchSummary();
    }
  }, [projectContractorId, fetchBudgetItems, fetchSummary]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchBudgetItems(), fetchSummary()]);
  }, [fetchBudgetItems, fetchSummary]);

  const createItem = useCallback(async (data: ContractorBudgetInsert): Promise<{ success: boolean; id?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: createdItem, error: createError } = await contractorBudgetService.create(data);

      if (createError) {
        throw createError;
      }

      await refetch();
      return { success: true, id: createdItem?.id };
    } catch (err) {
      setError(err as Error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const updateItem = useCallback(async (id: string, data: ContractorBudgetUpdate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorBudgetService.update(id, data);

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

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await contractorBudgetService.delete(id);

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

  const duplicateItem = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: duplicateError } = await contractorBudgetService.duplicate(id);

      if (duplicateError) {
        throw duplicateError;
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

  const reorderItems = useCallback(async (items: { id: string; order_index: number }[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: reorderError } = await contractorBudgetService.reorder(items);

      if (reorderError) {
        throw reorderError;
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
    budgetItems,
    loading,
    error,
    summary,
    refetch,
    createItem,
    updateItem,
    deleteItem,
    duplicateItem,
    reorderItems,
  };
}