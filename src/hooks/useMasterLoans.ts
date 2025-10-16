import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterLoanService, type CreateMasterLoanData } from '@/services/MasterLoanService';
import { toast } from 'sonner';

/**
 * Hook to get all master loans
 */
export function useMasterLoans() {
  return useQuery({
    queryKey: ['master-loans'],
    queryFn: () => masterLoanService.getLoans(),
  });
}

/**
 * Hook to get active master loans
 */
export function useActiveLoans() {
  return useQuery({
    queryKey: ['master-loans', 'active'],
    queryFn: () => masterLoanService.getActiveLoans(),
  });
}

/**
 * Hook to get loans for a specific project
 */
export function useProjectLoans(projectId: string | null) {
  return useQuery({
    queryKey: ['master-loans', 'project', projectId],
    queryFn: () => (projectId ? masterLoanService.getProjectLoans(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

/**
 * Hook to get a single loan with full details
 */
export function useMasterLoan(loanId: string | null) {
  return useQuery({
    queryKey: ['master-loans', loanId],
    queryFn: () => (loanId ? masterLoanService.getLoan(loanId) : Promise.resolve(null)),
    enabled: !!loanId,
  });
}

/**
 * Hook to get loan statistics
 */
export function useLoanStatistics() {
  return useQuery({
    queryKey: ['master-loans', 'statistics'],
    queryFn: () => masterLoanService.getStatistics(),
  });
}

/**
 * Hook to create a new master loan
 */
export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMasterLoanData) => masterLoanService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-loans'] });
      queryClient.invalidateQueries({ queryKey: ['master-cash'] });
      queryClient.invalidateQueries({ queryKey: ['project-cash-boxes'] });
      toast.success('Préstamo creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating loan:', error);
      toast.error(error.message || 'Error al crear el préstamo');
    },
  });
}

/**
 * Hook to record a payment
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      loanId: string;
      installmentId?: string;
      amount: number;
      currency: 'ARS' | 'USD';
      notes?: string;
    }) => masterLoanService.recordPayment(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['master-loans'] });
      queryClient.invalidateQueries({ queryKey: ['master-loans', variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ['master-cash'] });
      queryClient.invalidateQueries({ queryKey: ['project-cash-boxes'] });
      toast.success('Pago registrado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error recording payment:', error);
      toast.error(error.message || 'Error al registrar el pago');
    },
  });
}
