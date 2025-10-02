import { BaseService, ServiceResponse } from '@/core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type ContractorPayment = Database['public']['Tables']['contractor_payments']['Row'];
type ContractorPaymentInsert = Database['public']['Tables']['contractor_payments']['Insert'];
type ContractorPaymentUpdate = Database['public']['Tables']['contractor_payments']['Update'];

export interface PaymentSummary {
  total_payments: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  next_payment_due: {
    date: string | null;
    amount: number;
  };
}

/**
 * Service para gestionar pagos a contractors
 * Maneja anticipos, pagos progresivos y pagos finales
 */
export class ContractorPaymentService extends BaseService<'contractor_payments'> {
  constructor() {
    super('contractor_payments');
  }

  /**
   * Obtiene todos los pagos de un contractor con información del ítem de presupuesto
   */
  async getByProjectContractorId(projectContractorId: string): Promise<ServiceResponse<ContractorPayment[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .select(`
          *,
          budget_item:budget_item_id (
            id,
            description,
            category
          )
        `)
        .eq('project_contractor_id', projectContractorId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      return {
        data: data as ContractorPayment[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene pagos por estado
   */
  async getByStatus(
    projectContractorId: string,
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  ): Promise<ServiceResponse<ContractorPayment[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .eq('status', status)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      return {
        data: data as ContractorPayment[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene pagos por tipo
   */
  async getByType(
    projectContractorId: string,
    paymentType: 'advance' | 'progress' | 'final' | 'adjustment'
  ): Promise<ServiceResponse<ContractorPayment[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .eq('payment_type', paymentType)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      return {
        data: data as ContractorPayment[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Crea un nuevo pago
   */
  async create(payment: ContractorPaymentInsert): Promise<ServiceResponse<ContractorPayment>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorPayment,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Actualiza un pago
   */
  async update(id: string, updates: ContractorPaymentUpdate): Promise<ServiceResponse<ContractorPayment>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorPayment,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Marca un pago como pagado
   */
  async markAsPaid(
    id: string,
    paidBy?: string,
    receiptUrl?: string
  ): Promise<ServiceResponse<ContractorPayment>> {
    return this.update(id, {
      status: 'paid',
      paid_at: new Date().toISOString(),
      paid_by: paidBy,
      receipt_file_url: receiptUrl,
    });
  }

  /**
   * Cancela un pago
   */
  async cancel(id: string, reason?: string): Promise<ServiceResponse<ContractorPayment>> {
    return this.update(id, {
      status: 'cancelled',
      notes: reason,
    });
  }

  /**
   * Elimina un pago
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('contractor_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene resumen de pagos
   */
  async getSummary(projectContractorId: string): Promise<ServiceResponse<PaymentSummary>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .select('payment_type, status, amount, due_date')
        .eq('project_contractor_id', projectContractorId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          data: {
            total_payments: 0,
            total_paid: 0,
            total_pending: 0,
            total_overdue: 0,
            by_type: {},
            by_status: {},
            next_payment_due: { date: null, amount: 0 },
          },
          error: null,
        };
      }

      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      let totalPaid = 0;
      let totalPending = 0;
      let totalOverdue = 0;
      let nextPaymentDue: { date: string | null; amount: number } = { date: null, amount: 0 };

      const today = new Date().toISOString().split('T')[0];

      data.forEach(payment => {
        const type = payment.payment_type;
        const status = payment.status;
        const amount = payment.amount || 0;

        byType[type] = (byType[type] || 0) + amount;
        byStatus[status] = (byStatus[status] || 0) + amount;

        if (status === 'paid') {
          totalPaid += amount;
        } else if (status === 'pending') {
          totalPending += amount;

          // Verificar próximo pago
          if (payment.due_date && payment.due_date >= today) {
            if (!nextPaymentDue.date || payment.due_date < nextPaymentDue.date) {
              nextPaymentDue = { date: payment.due_date, amount };
            }
          }
        } else if (status === 'overdue') {
          totalOverdue += amount;
        }
      });

      return {
        data: {
          total_payments: data.length,
          total_paid: totalPaid,
          total_pending: totalPending,
          total_overdue: totalOverdue,
          by_type: byType,
          by_status: byStatus,
          next_payment_due: nextPaymentDue,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene pagos vencidos
   */
  async getOverduePayments(projectContractorId?: string): Promise<ServiceResponse<ContractorPayment[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('contractor_payments')
        .select('*')
        .eq('status', 'pending')
        .lt('due_date', today);

      if (projectContractorId) {
        query = query.eq('project_contractor_id', projectContractorId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;

      return {
        data: data as ContractorPayment[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene pagos próximos a vencer
   */
  async getUpcomingPayments(
    days: number = 7,
    projectContractorId?: string
  ): Promise<ServiceResponse<ContractorPayment[]>> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const todayStr = today.toISOString().split('T')[0];
      const futureDateStr = futureDate.toISOString().split('T')[0];

      let query = supabase
        .from('contractor_payments')
        .select('*')
        .eq('status', 'pending')
        .gte('due_date', todayStr)
        .lte('due_date', futureDateStr);

      if (projectContractorId) {
        query = query.eq('project_contractor_id', projectContractorId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;

      return {
        data: data as ContractorPayment[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Crea múltiples pagos en lote
   */
  async bulkCreate(payments: ContractorPaymentInsert[]): Promise<ServiceResponse<ContractorPayment[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_payments')
        .insert(payments)
        .select();

      if (error) throw error;

      return {
        data: data as ContractorPayment[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }
}

// Singleton instance
export const contractorPaymentService = new ContractorPaymentService();