import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InterProjectLoanService } from '@/services/InterProjectLoanService';
import { BankAccountService } from '@/services/BankAccountService';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import type { CreateLoanData, RegisterPaymentData } from '@/services/InterProjectLoanService';
import type { CreateAccountData, TransferData } from '@/services/BankAccountService';

// =====================================================
// PRÉSTAMOS INTER-PROYECTO
// =====================================================

export const useActiveLoans = () => {
  return useQuery({
    queryKey: ['active-loans'],
    queryFn: () => InterProjectLoanService.getActiveLoans(),
  });
};

export const useLoanById = (loanId: string | undefined) => {
  return useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => InterProjectLoanService.getLoanById(loanId!),
    enabled: !!loanId,
  });
};

export const useLoansByStatus = (status: 'draft' | 'pending' | 'active' | 'paid' | 'overdue' | 'cancelled') => {
  return useQuery({
    queryKey: ['loans-by-status', status],
    queryFn: () => InterProjectLoanService.getLoansByStatus(status),
  });
};

export const useLoansByLenderProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['loans-lender', projectId],
    queryFn: () => InterProjectLoanService.getLoansByLenderProject(projectId!),
    enabled: !!projectId,
  });
};

export const useLoansByBorrowerProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['loans-borrower', projectId],
    queryFn: () => InterProjectLoanService.getLoansByBorrowerProject(projectId!),
    enabled: !!projectId,
  });
};

export const useOverdueInstallments = () => {
  return useQuery({
    queryKey: ['overdue-installments'],
    queryFn: () => InterProjectLoanService.getOverdueInstallments(),
  });
};

export const useLoanStatistics = () => {
  return useQuery({
    queryKey: ['loan-statistics'],
    queryFn: () => InterProjectLoanService.getLoanStatistics(),
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanData) => InterProjectLoanService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['loan-statistics'] });
    },
  });
};

export const useRegisterPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterPaymentData) => InterProjectLoanService.registerPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loan', variables.loan_id] });
      queryClient.invalidateQueries({ queryKey: ['active-loans'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-installments'] });
      queryClient.invalidateQueries({ queryKey: ['loan-statistics'] });
    },
  });
};

export const useCancelLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, reason, userId }: { loanId: string; reason: string; userId?: string }) =>
      InterProjectLoanService.cancelLoan(loanId, reason, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['loan-statistics'] });
    },
  });
};

export const useActivateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => InterProjectLoanService.activateLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-by-status'] });
    },
  });
};

// =====================================================
// CUENTAS BANCARIAS
// =====================================================

export const useActiveAccounts = () => {
  return useQuery({
    queryKey: ['active-accounts'],
    queryFn: () => BankAccountService.getActiveAccounts(),
  });
};

export const useMasterAccounts = () => {
  return useQuery({
    queryKey: ['master-accounts'],
    queryFn: () => BankAccountService.getMasterAccounts(),
  });
};

export const useProjectAccounts = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-accounts', projectId],
    queryFn: () => BankAccountService.getProjectAccounts(projectId!),
    enabled: !!projectId,
  });
};

export const useAccountById = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: () => BankAccountService.getAccountById(accountId!),
    enabled: !!accountId,
  });
};

export const useAllAccountsBalance = () => {
  return useQuery({
    queryKey: ['accounts-balance'],
    queryFn: () => BankAccountService.getAllAccountsBalance(),
  });
};

export const useAccountTransfers = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ['account-transfers', accountId],
    queryFn: () => BankAccountService.getAccountTransfers(accountId!),
    enabled: !!accountId,
  });
};

export const useAllTransfers = (filters?: {
  transfer_type?: string;
  from_date?: string;
  to_date?: string;
}) => {
  return useQuery({
    queryKey: ['all-transfers', filters],
    queryFn: () => BankAccountService.getAllTransfers(filters),
  });
};

export const useAccountStatistics = () => {
  return useQuery({
    queryKey: ['account-statistics'],
    queryFn: () => BankAccountService.getAccountStatistics(),
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountData) => BankAccountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['master-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] });
      queryClient.invalidateQueries({ queryKey: ['account-statistics'] });
    },
  });
};

export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferData) => BankAccountService.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] });
      queryClient.invalidateQueries({ queryKey: ['account-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['all-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['account-statistics'] });
    },
  });
};

export const usePayFees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      amount,
      currency,
      description,
      notes,
    }: {
      projectId?: string; // Ahora es opcional
      amount: number;
      currency: 'ARS' | 'USD';
      description: string;
      notes?: string;
    }) => newCashBoxService.collectAdminFeeManual({
      amount,
      currency,
      description,
      projectId, // Opcional, solo para tracking
    }),
    onSuccess: () => {
      // Invalidar queries relacionadas con las cajas
      queryClient.invalidateQueries({ queryKey: ['master-cash'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cash'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
      // Mantener invalidación de queries legacy por compatibilidad
      queryClient.invalidateQueries({ queryKey: ['active-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] });
      queryClient.invalidateQueries({ queryKey: ['account-statistics'] });
    },
  });
};

export const useDeactivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => BankAccountService.deactivateAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] });
      queryClient.invalidateQueries({ queryKey: ['account-statistics'] });
    },
  });
};