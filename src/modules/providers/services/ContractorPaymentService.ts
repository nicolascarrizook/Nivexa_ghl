import { BaseService, ServiceResponse } from '@/core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';

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

export interface ContractorAccountStatement {
  contractor_id: string;
  contractor_name: string;
  project_contractor_id: string;
  budget_total: number;
  total_paid: number;
  pending_balance: number;
  currency: string;
  payment_history: Array<{
    id: string;
    date: string;
    amount: number;
    payment_type: string;
    progress_percentage: number | null;
    notes: string | null;
    status: string;
  }>;
  last_payment_date: string | null;
  progress_percentage_total: number;
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
   * Marca un pago como pagado (método antiguo - sin integración de cajas)
   * @deprecated Use markAsPaidWithCashBoxIntegration instead
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
   * Marca un pago como pagado con integración completa del sistema de cajas
   * - Valida fondos suficientes en project_cash_box y master_cash_box
   * - Registra movimientos de caja trazables
   * - Deduce el monto de ambas cajas automáticamente
   * - Vincula el pago con el movimiento de caja
   */
  async markAsPaidWithCashBoxIntegration(
    id: string,
    paidBy?: string,
    receiptUrl?: string
  ): Promise<ServiceResponse<ContractorPayment>> {
    try {
      // 1. Get the payment details
      const { data: payment, error: fetchError } = await supabase
        .from('contractor_payments')
        .select(`
          *,
          project_contractor:project_contractor_id (
            id,
            project_id,
            contractor:contractor_id (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!payment) throw new Error('Payment not found');

      // Verify payment is not already paid
      if (payment.status === 'paid') {
        return {
          data: null,
          error: new Error('Payment is already marked as paid'),
        };
      }

      // 2. Get project_id from the project_contractor
      const projectContractor = payment.project_contractor as any;
      if (!projectContractor || !projectContractor.project_id) {
        throw new Error('Project information not found for this contractor');
      }

      const projectId = projectContractor.project_id;
      const contractorName = projectContractor.contractor?.name || 'Proveedor';

      // 3. Record the provider payment in cash boxes
      // This will validate sufficient funds and deduct from both boxes
      const description = payment.notes
        ? `Pago a ${contractorName}: ${payment.notes}`
        : `Pago a ${contractorName}`;

      const movementId = await newCashBoxService.processProjectExpense({
        projectId,
        amount: payment.amount,
        description,
        contractorPaymentId: payment.id,
        currency: payment.currency as 'ARS' | 'USD',
        contractorName,
      });

      // 4. Update the payment status with movement_id
      const { data: updatedPayment, error: updateError } = await supabase
        .from('contractor_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          paid_by: paidBy,
          receipt_file_url: receiptUrl,
          movement_id: movementId,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        data: updatedPayment as ContractorPayment,
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
   * Cancela un pago
   */
  async cancel(id: string, reason?: string): Promise<ServiceResponse<ContractorPayment>> {
    return this.update(id, {
      status: 'cancelled',
      notes: reason,
    });
  }

  /**
   * Registra y procesa un pago en una sola operación
   * Crea el pago y lo marca como pagado con validación de fondos
   */
  async registerAndProcessPayment(params: {
    projectContractorId: string;
    amount: number;
    currency: 'ARS' | 'USD';
    notes?: string;
    paidBy?: string;
  }): Promise<ServiceResponse<ContractorPayment>> {
    try {
      // 1. Crear el pago como pendiente
      const { data: newPayment, error: createError } = await supabase
        .from('contractor_payments')
        .insert({
          project_contractor_id: params.projectContractorId,
          payment_type: 'progress',
          amount: params.amount,
          currency: params.currency,
          payment_date: new Date().toISOString(),
          due_date: new Date().toISOString(),
          notes: params.notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newPayment) throw new Error('Failed to create payment');

      // 2. Marcar como pagado con validación de fondos
      const { data: processedPayment, error: processError } =
        await this.markAsPaidWithCashBoxIntegration(
          newPayment.id,
          params.paidBy,
          undefined
        );

      if (processError) {
        // Si falla el procesamiento, eliminar el pago creado
        await supabase.from('contractor_payments').delete().eq('id', newPayment.id);
        throw processError;
      }

      return {
        data: processedPayment,
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

  /**
   * Obtiene el estado de cuenta completo de un contractor
   * Muestra presupuesto total, pagado, saldo pendiente e historial de pagos
   */
  async getAccountStatement(projectContractorId: string): Promise<ServiceResponse<ContractorAccountStatement>> {
    try {
      // 1. Get project contractor with budget info
      const { data: projectContractor, error: contractorError } = await supabase
        .from('project_contractors')
        .select(`
          id,
          project_id,
          budget_amount,
          currency,
          contractor:contractor_id (
            id,
            name
          )
        `)
        .eq('id', projectContractorId)
        .single();

      if (contractorError) throw contractorError;
      if (!projectContractor) throw new Error('Project contractor not found');

      // 2. Get all payments for this contractor
      const { data: payments, error: paymentsError } = await supabase
        .from('contractor_payments')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // 3. Calculate totals
      const totalPaid = payments
        ?.filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const budgetTotal = projectContractor.budget_amount || 0;
      const pendingBalance = budgetTotal - totalPaid;

      // 4. Calculate total progress percentage (sum of all progress payments)
      const progressPercentageTotal = payments
        ?.filter(p => p.progress_percentage != null)
        .reduce((sum, p) => sum + (p.progress_percentage || 0), 0) || 0;

      // 5. Get last payment date
      const paidPayments = payments?.filter(p => p.status === 'paid' && p.paid_at);
      const lastPaymentDate = paidPayments && paidPayments.length > 0
        ? paidPayments.sort((a, b) =>
            new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime()
          )[0].paid_at
        : null;

      // 6. Format payment history
      const paymentHistory = payments?.map(p => ({
        id: p.id,
        date: p.paid_at || p.payment_date,
        amount: p.amount,
        payment_type: p.payment_type,
        progress_percentage: p.progress_percentage,
        notes: p.notes,
        status: p.status,
      })) || [];

      const contractor = projectContractor.contractor as any;

      return {
        data: {
          contractor_id: contractor?.id || '',
          contractor_name: contractor?.name || 'Proveedor',
          project_contractor_id: projectContractorId,
          budget_total: budgetTotal,
          total_paid: totalPaid,
          pending_balance: pendingBalance,
          currency: projectContractor.currency || 'ARS',
          payment_history: paymentHistory,
          last_payment_date: lastPaymentDate,
          progress_percentage_total: progressPercentageTotal,
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
}

// Singleton instance
export const contractorPaymentService = new ContractorPaymentService();