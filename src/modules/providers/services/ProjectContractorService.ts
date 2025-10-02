import { BaseService, ServiceResponse } from '@/core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type ProjectContractor = Database['public']['Tables']['project_contractors']['Row'];
type ProjectContractorInsert = Database['public']['Tables']['project_contractors']['Insert'];
type ProjectContractorUpdate = Database['public']['Tables']['project_contractors']['Update'];
type Provider = Database['public']['Tables']['providers']['Row'];
type FinancialSummary = Database['public']['Views']['contractor_financial_summary']['Row'];

export interface ProjectContractorWithDetails extends ProjectContractor {
  provider?: Provider;
  financial_summary?: FinancialSummary;
}

/**
 * Service para gestionar la relación entre proyectos y proveedores/contractors
 * Incluye manejo de contratos, presupuestos y seguimiento financiero
 */
export class ProjectContractorService extends BaseService<'project_contractors'> {
  constructor() {
    super('project_contractors');
  }

  /**
   * Obtiene todos los contractors asignados a un proyecto
   */
  async getByProjectId(projectId: string): Promise<ServiceResponse<ProjectContractorWithDetails[]>> {
    try {
      console.log('getByProjectId called for project:', projectId);

      // First get the contractors with provider details
      const { data: contractors, error } = await supabase
        .from('project_contractors')
        .select(`
          *,
          provider:contractor_id (
            id,
            name,
            business_name,
            tax_id,
            provider_type,
            email,
            phone,
            status
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contractors:', error);
        throw error;
      }

      console.log('Contractors loaded:', contractors?.length || 0);

      if (!contractors || contractors.length === 0) {
        return {
          data: [],
          error: null,
        };
      }

      // Get all payments for these contractors
      const { data: payments, error: paymentsError } = await supabase
        .from('contractor_payments')
        .select('*')
        .in('project_contractor_id', contractors.map(c => c.id));

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
        throw paymentsError;
      }

      // Get all budget items for these contractors to calculate actual budget totals
      const { data: budgetItems, error: budgetError } = await supabase
        .from('contractor_budgets')
        .select('project_contractor_id, total_amount')
        .in('project_contractor_id', contractors.map(c => c.id));

      if (budgetError) {
        console.error('Error loading budget items:', budgetError);
        throw budgetError;
      }

      console.log('Payments loaded for contractors:', {
        contractor_count: contractors.length,
        payment_count: payments?.length || 0,
        payments_sample: payments?.slice(0, 3).map(p => ({
          id: p.id,
          project_contractor_id: p.project_contractor_id,
          amount: p.amount,
          status: p.status,
        })),
      });

      console.log('Budget items loaded for contractors:', {
        contractor_count: contractors.length,
        budget_items_count: budgetItems?.length || 0,
        budget_items_sample: budgetItems?.slice(0, 3),
      });

      // Calculate financial summaries manually
      const contractorsWithFinancials = contractors.map(contractor => {
        const contractorPayments = payments?.filter(p => p.project_contractor_id === contractor.id) || [];

        const totalPaid = contractorPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);

        const totalPending = contractorPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);

        // Calculate budget from budget items instead of using contractor.budget_amount
        const contractorBudgetItems = budgetItems?.filter(b => b.project_contractor_id === contractor.id) || [];
        const budgetAmount = contractorBudgetItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);

        const balanceDue = budgetAmount - totalPaid;
        const paymentProgressPercentage = budgetAmount > 0 ? (totalPaid / budgetAmount * 100) : 0;

        // Debug log
        console.log('Financial Summary Calculation:', {
          contractor_id: contractor.id,
          contractor_name: contractor.provider?.name,
          budget_items_count: contractorBudgetItems.length,
          budget_items_total: budgetAmount,
          total_payments: contractorPayments.length,
          payments_by_status: {
            paid: contractorPayments.filter(p => p.status === 'paid').length,
            pending: contractorPayments.filter(p => p.status === 'pending').length,
            overdue: contractorPayments.filter(p => p.status === 'overdue').length,
          },
          budget_amount: budgetAmount,
          total_paid: totalPaid,
          total_pending: totalPending,
          balance_due: balanceDue,
          payment_progress_percentage: paymentProgressPercentage,
        });

        const overduePayments = contractorPayments.filter(p => p.status === 'overdue').length;
        const totalPayments = contractorPayments.length;

        const pendingPaymentsWithDueDate = contractorPayments
          .filter(p => p.status === 'pending' && p.due_date)
          .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

        const nextPaymentDueDate = pendingPaymentsWithDueDate[0]?.due_date || null;
        const nextPaymentAmount = pendingPaymentsWithDueDate[0]?.amount || null;

        return {
          ...contractor,
          financial_summary: {
            project_contractor_id: contractor.id,
            project_id: contractor.project_id,
            contractor_id: contractor.contractor_id,
            budget_amount: budgetAmount,
            total_paid: totalPaid,
            total_pending: totalPending,
            balance_due: balanceDue,
            payment_progress_percentage: paymentProgressPercentage,
            total_payments: totalPayments,
            overdue_payments: overduePayments,
            next_payment_due_date: nextPaymentDueDate,
            next_payment_amount: nextPaymentAmount,
          },
        };
      });

      console.log('Returning contractors with financials:', {
        count: contractorsWithFinancials.length,
        first_contractor_summary: contractorsWithFinancials[0]?.financial_summary,
      });

      return {
        data: contractorsWithFinancials as ProjectContractorWithDetails[],
        error: null,
      };
    } catch (error) {
      console.error('Error in getByProjectId:', error);
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene un contractor específico con todos sus detalles
   */
  async getByIdWithDetails(id: string): Promise<ServiceResponse<ProjectContractorWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .select(`
          *,
          provider:contractor_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data: data as ProjectContractorWithDetails,
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
   * Obtiene el resumen financiero de un contractor en un proyecto
   */
  async getFinancialSummary(projectContractorId: string): Promise<ServiceResponse<FinancialSummary>> {
    try {
      const { data, error } = await supabase
        .from('contractor_financial_summary')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .single();

      if (error) throw error;

      return {
        data: data as FinancialSummary,
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
   * Crea una nueva asignación de contractor a proyecto
   */
  async create(contractorData: ProjectContractorInsert): Promise<ServiceResponse<ProjectContractor>> {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .insert(contractorData)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ProjectContractor,
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
   * Actualiza la información de un contractor en un proyecto
   */
  async update(id: string, updates: ProjectContractorUpdate): Promise<ServiceResponse<ProjectContractor>> {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ProjectContractor,
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
   * Actualiza el progreso de un contractor
   */
  async updateProgress(id: string, percentage: number): Promise<ServiceResponse<ProjectContractor>> {
    if (percentage < 0 || percentage > 100) {
      return {
        data: null,
        error: new Error('El porcentaje debe estar entre 0 y 100'),
      };
    }

    return this.update(id, { progress_percentage: percentage });
  }

  /**
   * Actualiza el estado de un contractor
   */
  async updateStatus(
    id: string,
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  ): Promise<ServiceResponse<ProjectContractor>> {
    return this.update(id, { status });
  }

  /**
   * Elimina un contractor de un proyecto
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('project_contractors')
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
   * Obtiene todos los proyectos donde un proveedor está asignado
   */
  async getProjectsByContractorId(contractorId: string): Promise<ServiceResponse<ProjectContractorWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .select(`
          *,
          project:project_id (
            id,
            code,
            name,
            status,
            start_date,
            estimated_end_date
          )
        `)
        .eq('contractor_id', contractorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data as ProjectContractorWithDetails[],
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
   * Verifica si un proveedor ya está asignado a un proyecto
   */
  async exists(projectId: string, contractorId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .select('id')
        .eq('project_id', projectId)
        .eq('contractor_id', contractorId)
        .maybeSingle();

      if (error) throw error;

      return {
        data: !!data,
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
   * Obtiene estadísticas de todos los contractors de un proyecto
   */
  async getProjectStats(projectId: string): Promise<ServiceResponse<{
    total_contractors: number;
    active_contractors: number;
    total_budget: number;
    total_paid: number;
    total_pending: number;
    average_progress: number;
  }>> {
    try {
      const { data: contractors, error: contractorsError } = await supabase
        .from('project_contractors')
        .select('id, status, budget_amount, progress_percentage')
        .eq('project_id', projectId);

      if (contractorsError) throw contractorsError;

      if (!contractors || contractors.length === 0) {
        return {
          data: {
            total_contractors: 0,
            active_contractors: 0,
            total_budget: 0,
            total_paid: 0,
            total_pending: 0,
            average_progress: 0,
          },
          error: null,
        };
      }

      // Obtener resúmenes financieros
      const { data: financialSummaries, error: summariesError } = await supabase
        .from('contractor_financial_summary')
        .select('*')
        .in('project_contractor_id', contractors.map(c => c.id));

      if (summariesError) throw summariesError;

      const stats = {
        total_contractors: contractors.length,
        active_contractors: contractors.filter(c => c.status === 'active').length,
        total_budget: contractors.reduce((sum, c) => sum + (c.budget_amount || 0), 0),
        total_paid: financialSummaries?.reduce((sum, s) => sum + (s.total_paid || 0), 0) || 0,
        total_pending: financialSummaries?.reduce((sum, s) => sum + (s.total_pending || 0), 0) || 0,
        average_progress: contractors.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / contractors.length,
      };

      return {
        data: stats,
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
export const projectContractorService = new ProjectContractorService();