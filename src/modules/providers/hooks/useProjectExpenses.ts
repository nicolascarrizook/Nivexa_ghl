import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';

export interface ProjectExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  contractor_name?: string;
  payment_type?: string;
  currency: 'ARS' | 'USD';
}

interface UseProjectExpensesResult {
  expenses: ProjectExpense[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener todos los gastos de un proyecto (pagos a contractors)
 */
export function useProjectExpenses(projectId: string): UseProjectExpensesResult {
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!projectId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Paso 1: Obtener todos los project_contractor_ids de este proyecto
      const { data: projectContractors, error: contractorsError } = await supabase
        .from('project_contractors')
        .select('id')
        .eq('project_id', projectId);

      if (contractorsError) {
        throw contractorsError;
      }

      if (!projectContractors || projectContractors.length === 0) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const contractorIds = projectContractors.map(pc => pc.id);

      // Paso 2: Obtener todos los pagos de esos contractors
      const { data, error: fetchError } = await supabase
        .from('contractor_payments')
        .select(`
          id,
          amount,
          currency,
          payment_date,
          status,
          payment_type,
          notes,
          project_contractor:project_contractor_id (
            id,
            contractor:contractor_id (
              id,
              name
            )
          )
        `)
        .in('project_contractor_id', contractorIds)
        .order('payment_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transformar los pagos a formato de gastos
      const transformedExpenses: ProjectExpense[] = (data || []).map((payment: any) => {
        const contractorName = payment.project_contractor?.contractor?.name || 'Proveedor';
        const paymentTypeLabel = {
          advance: 'Anticipo',
          progress: 'Pago de Avance',
          final: 'Pago Final',
          adjustment: 'Ajuste',
        }[payment.payment_type as string] || payment.payment_type;

        return {
          id: payment.id,
          description: payment.notes || `Pago a ${contractorName}`,
          amount: payment.amount,
          category: paymentTypeLabel,
          date: payment.payment_date,
          status: payment.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
          contractor_name: contractorName,
          payment_type: payment.payment_type,
          currency: payment.currency || 'ARS',
        };
      });

      setExpenses(transformedExpenses);
    } catch (err) {
      console.error('Error fetching project expenses:', err);
      setError(err as Error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const refetch = useCallback(async () => {
    await fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    refetch,
  };
}
