import { useQuery } from '@tanstack/react-query';
import { contractorPaymentService, type ContractorAccountStatement } from '../services/ContractorPaymentService';

/**
 * Hook para obtener el estado de cuenta completo de un contractor
 * Incluye presupuesto total, pagado, saldo pendiente e historial de pagos
 */
export function useContractorAccountStatement(projectContractorId: string | undefined) {
  return useQuery({
    queryKey: ['contractor-account-statement', projectContractorId],
    queryFn: async (): Promise<ContractorAccountStatement> => {
      if (!projectContractorId) {
        throw new Error('Project contractor ID is required');
      }

      const { data, error } = await contractorPaymentService.getAccountStatement(projectContractorId);

      if (error) throw error;
      if (!data) throw new Error('Failed to fetch account statement');

      return data;
    },
    enabled: !!projectContractorId,
    staleTime: 1000 * 60, // 1 minute - refresh frequently to show current balance
    refetchOnWindowFocus: true,
  });
}
