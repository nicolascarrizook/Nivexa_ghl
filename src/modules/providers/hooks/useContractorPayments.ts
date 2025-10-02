import { useState, useEffect, useCallback } from 'react';
import { contractorPaymentService, type PaymentSummary } from '../services';
import type { Database } from '@/types/database.types';

type ContractorPayment = Database['public']['Tables']['contractor_payments']['Row'];
type ContractorPaymentInsert = Database['public']['Tables']['contractor_payments']['Insert'];
type ContractorPaymentUpdate = Database['public']['Tables']['contractor_payments']['Update'];

interface UseContractorPaymentsResult {
  payments: ContractorPayment[];
  loading: boolean;
  error: Error | null;
  summary: PaymentSummary | null;
  refetch: () => Promise<void>;
  createPayment: (data: ContractorPaymentInsert) => Promise<boolean>;
  updatePayment: (id: string, data: ContractorPaymentUpdate) => Promise<boolean>;
  deletePayment: (id: string) => Promise<boolean>;
  markAsPaid: (id: string, paidBy?: string, receiptUrl?: string) => Promise<boolean>;
  cancelPayment: (id: string, reason?: string) => Promise<boolean>;
}

/**
 * Hook para gestionar pagos de un contractor
 */
export function useContractorPayments(projectContractorId: string): UseContractorPaymentsResult {
  const [payments, setPayments] = useState<ContractorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await contractorPaymentService.getByProjectContractorId(projectContractorId);

      if (fetchError) {
        throw fetchError;
      }

      setPayments(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectContractorId]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data, error: summaryError } = await contractorPaymentService.getSummary(projectContractorId);

      if (summaryError) {
        throw summaryError;
      }

      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [projectContractorId]);

  useEffect(() => {
    if (projectContractorId) {
      fetchPayments();
      fetchSummary();
    }
  }, [projectContractorId, fetchPayments, fetchSummary]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchPayments(), fetchSummary()]);
  }, [fetchPayments, fetchSummary]);

  const createPayment = useCallback(async (data: ContractorPaymentInsert): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: createError } = await contractorPaymentService.create(data);

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

  const updatePayment = useCallback(async (id: string, data: ContractorPaymentUpdate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorPaymentService.update(id, data);

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

  const deletePayment = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await contractorPaymentService.delete(id);

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

  const markAsPaid = useCallback(async (
    id: string,
    paidBy?: string,
    receiptUrl?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorPaymentService.markAsPaid(id, paidBy, receiptUrl);

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

  const cancelPayment = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await contractorPaymentService.cancel(id, reason);

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
    payments,
    loading,
    error,
    summary,
    refetch,
    createPayment,
    updatePayment,
    deletePayment,
    markAsPaid,
    cancelPayment,
  };
}