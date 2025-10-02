import { supabase } from '@/config/supabase';

// ============================================
// TYPES
// ============================================

export type Currency = 'ARS' | 'USD';

export type MasterTransactionType = 
  | 'project_income'        // Ingreso desde proyecto
  | 'honorarium_payment'    // Pago de honorarios personales
  | 'operational_expense'   // Gastos operativos
  | 'tax_payment'          // Pago de impuestos
  | 'investment'           // Inversiones
  | 'loan_given'           // Préstamo otorgado
  | 'loan_received'        // Préstamo recibido
  | 'loan_payment'         // Pago de préstamo
  | 'transfer_out'         // Transferencia saliente
  | 'transfer_in'          // Transferencia entrante
  | 'bank_fee'             // Comisiones bancarias
  | 'other_income'         // Otros ingresos
  | 'other_expense';       // Otros gastos

export type ProjectTransactionType =
  | 'down_payment'         // Anticipo inicial
  | 'installment_payment'  // Pago de cuota
  | 'additional_payment'   // Pago adicional
  | 'material_purchase'    // Compra de materiales
  | 'labor_payment'        // Pago de mano de obra
  | 'service_payment'      // Pago de servicios
  | 'permit_fee'          // Permisos y habilitaciones
  | 'refund'              // Reembolso
  | 'adjustment'          // Ajuste
  | 'other';              // Otros

export interface MasterCashBox {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  current_balance_ars: number;
  current_balance_usd: number;
  total_income_ars: number;
  total_income_usd: number;
  total_expenses_ars: number;
  total_expenses_usd: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectCashBox {
  id: string;
  project_id: string;
  current_balance_ars: number;
  current_balance_usd: number;
  total_income_ars: number;
  total_income_usd: number;
  total_expenses_ars: number;
  total_expenses_usd: number;
  budget_allocated_ars: number;
  budget_allocated_usd: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasterCashTransaction {
  id: string;
  master_cash_box_id: string;
  transaction_type: MasterTransactionType;
  transaction_date: string;
  amount: number;
  currency: Currency;
  exchange_rate: number;
  project_id?: string;
  project_payment_id?: string;
  expense_category_id?: string;
  description: string;
  reference_number?: string;
  payment_method?: string;
  bank_account?: string;
  recipient_name?: string;
  recipient_account?: string;
  source_name?: string;
  source_description?: string;
  receipt_url?: string;
  invoice_url?: string;
  attachments?: any[];
  notes?: string;
  tags?: string[];
  is_recurring: boolean;
  recurrence_pattern?: any;
  balance_after_ars: number;
  balance_after_usd: number;
  created_at: string;
  created_by: string;
}

export interface ProjectCashTransaction {
  id: string;
  project_cash_box_id: string;
  project_id: string;
  transaction_type: ProjectTransactionType;
  transaction_date: string;
  amount: number;
  currency: Currency;
  exchange_rate: number;
  description: string;
  reference_number?: string;
  payment_method?: string;
  client_id?: string;
  installment_number?: number;
  vendor_name?: string;
  invoice_number?: string;
  receipt_url?: string;
  attachments?: any[];
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  tags?: string[];
  balance_after_ars: number;
  balance_after_usd: number;
  created_at: string;
  created_by: string;
}

export interface ExpenseCategory {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface PaymentProcessingParams {
  organization_id: string;
  project_id: string;
  amount: number;
  currency: Currency;
  payment_type: ProjectTransactionType;
  description: string;
  reference_number?: string;
  payment_method?: string;
  client_id?: string;
  installment_number?: number;
  exchange_rate?: number;
}

export interface MasterWithdrawalParams {
  organization_id: string;
  amount: number;
  currency: Currency;
  transaction_type: MasterTransactionType;
  description: string;
  expense_category_id?: string;
  recipient_name?: string;
  recipient_account?: string;
  reference_number?: string;
  payment_method?: string;
}

// ============================================
// CASH BOX SERVICE
// ============================================

class CashBoxService {
  private static instance: CashBoxService;

  private constructor() {}

  public static getInstance(): CashBoxService {
    if (!CashBoxService.instance) {
      CashBoxService.instance = new CashBoxService();
    }
    return CashBoxService.instance;
  }

  // ============================================
  // MASTER CASH BOX (Caja Maestra/Financiera)
  // ============================================

  /**
   * Obtener la caja maestra de una organización
   */
  async getMasterCashBox(organizationId: string): Promise<MasterCashBox | null> {
    const { data, error } = await supabase
      .from('master_cash_box')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching master cash box:', error);
      throw error;
    }

    // If no cash box exists, create one automatically
    if (!data) {
      return await this.createMasterCashBox(organizationId);
    }

    return data;
  }

  /**
   * Crear caja maestra si no existe
   */
  async createMasterCashBox(organizationId: string): Promise<MasterCashBox> {
    const { data, error } = await supabase
      .from('master_cash_box')
      .insert({
        organization_id: organizationId,
        name: 'Caja Maestra Principal'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating master cash box:', error);
      throw error;
    }

    return data;
  }

  /**
   * Obtener transacciones de la caja maestra
   */
  async getMasterTransactions(
    masterCashBoxId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      transactionType?: MasterTransactionType;
      projectId?: string;
    }
  ): Promise<MasterCashTransaction[]> {
    let query = supabase
      .from('master_cash_transactions')
      .select('*')
      .eq('master_cash_box_id', masterCashBoxId)
      .order('transaction_date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    if (filters?.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching master transactions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Procesar retiro de la caja maestra (gastos privados)
   */
  async processMasterWithdrawal(params: MasterWithdrawalParams): Promise<any> {
    const { data, error } = await supabase.rpc('process_master_cash_withdrawal', {
      p_organization_id: params.organization_id,
      p_amount: params.amount,
      p_currency: params.currency,
      p_transaction_type: params.transaction_type,
      p_description: params.description,
      p_expense_category_id: params.expense_category_id,
      p_recipient_name: params.recipient_name,
      p_recipient_account: params.recipient_account,
      p_reference_number: params.reference_number,
      p_payment_method: params.payment_method
    });

    if (error) {
      console.error('Error processing master withdrawal:', error);
      throw error;
    }

    return data;
  }

  // ============================================
  // PROJECT CASH BOX (Caja del Proyecto)
  // ============================================

  /**
   * Obtener la caja de un proyecto
   */
  async getProjectCashBox(projectId: string): Promise<ProjectCashBox | null> {
    const { data, error } = await supabase
      .from('project_cash_box')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching project cash box:', error);
      throw error;
    }

    return data;
  }

  /**
   * Obtener transacciones de la caja del proyecto
   */
  async getProjectTransactions(
    projectId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      transactionType?: ProjectTransactionType;
      clientId?: string;
    }
  ): Promise<ProjectCashTransaction[]> {
    let query = supabase
      .from('project_cash_transactions')
      .select('*')
      .eq('project_id', projectId)
      .order('transaction_date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    if (filters?.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching project transactions:', error);
      throw error;
    }

    return data || [];
  }

  // ============================================
  // PAYMENT PROCESSING (Ambas Cajas)
  // ============================================

  /**
   * Procesar un pago que afecta ambas cajas
   * Este método se llama cuando se confirma un pago del cliente
   */
  async processPaymentToBothCashBoxes(params: PaymentProcessingParams): Promise<any> {
    const { data, error } = await supabase.rpc('process_payment_to_cash_boxes', {
      p_organization_id: params.organization_id,
      p_project_id: params.project_id,
      p_amount: params.amount,
      p_currency: params.currency,
      p_payment_type: params.payment_type,
      p_description: params.description,
      p_reference_number: params.reference_number,
      p_payment_method: params.payment_method,
      p_client_id: params.client_id,
      p_installment_number: params.installment_number,
      p_exchange_rate: params.exchange_rate || 1
    });

    if (error) {
      console.error('Error processing payment to cash boxes:', error);
      throw error;
    }

    return data;
  }

  // ============================================
  // EXPENSE CATEGORIES
  // ============================================

  /**
   * Obtener categorías de gastos
   */
  async getExpenseCategories(organizationId: string): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching expense categories:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Crear nueva categoría de gastos
   */
  async createExpenseCategory(
    organizationId: string,
    name: string,
    description?: string,
    color?: string,
    icon?: string
  ): Promise<ExpenseCategory> {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        organization_id: organizationId,
        name,
        description,
        color,
        icon
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense category:', error);
      throw error;
    }

    return data;
  }

  // ============================================
  // STATISTICS & REPORTS
  // ============================================

  /**
   * Obtener estadísticas de la caja maestra
   */
  async getMasterCashStatistics(
    organizationId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<any> {
    const masterBox = await this.getMasterCashBox(organizationId);
    if (!masterBox) {
      return null;
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const transactions = await this.getMasterTransactions(masterBox.id, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Calculate statistics
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const projectIncome = transactions
      .filter(t => t.transaction_type === 'project_income')
      .reduce((sum, t) => sum + t.amount, 0);

    const honorariums = transactions
      .filter(t => t.transaction_type === 'honorarium_payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      currentBalanceArs: masterBox.current_balance_ars,
      currentBalanceUsd: masterBox.current_balance_usd,
      periodIncome: income,
      periodExpenses: expenses,
      netFlow: income - expenses,
      projectIncome,
      honorariums,
      transactionCount: transactions.length
    };
  }

  /**
   * Obtener resumen de flujo de caja por proyecto
   */
  async getProjectCashFlow(projectId: string): Promise<any> {
    const projectBox = await this.getProjectCashBox(projectId);
    if (!projectBox) {
      return null;
    }

    const transactions = await this.getProjectTransactions(projectId);

    const income = transactions
      .filter(t => ['down_payment', 'installment_payment', 'additional_payment'].includes(t.transaction_type))
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => ['material_purchase', 'labor_payment', 'service_payment', 'permit_fee'].includes(t.transaction_type))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentBalanceArs: projectBox.current_balance_ars,
      currentBalanceUsd: projectBox.current_balance_usd,
      totalIncome: income,
      totalExpenses: expenses,
      netFlow: income - expenses,
      transactionCount: transactions.length
    };
  }

  /**
   * Get all cash boxes summary (compatible with dashboard)
   */
  async getAllCashBoxesSummary(organizationId: string): Promise<{
    masterBalanceArs: number;
    masterBalanceUsd: number;
    projectsCount: number;
    projectsTotalArs: number;
    projectsTotalUsd: number;
  }> {
    try {
      // Get master cash box
      const masterBox = await this.getMasterCashBox(organizationId);
      
      // Get all project cash boxes
      const { data: projectBoxes, error } = await supabase
        .from('project_cash_box')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project cash boxes:', error);
      }

      const projects = projectBoxes || [];
      
      const result = {
        masterBalanceArs: masterBox?.current_balance_ars || 0,
        masterBalanceUsd: masterBox?.current_balance_usd || 0,
        projectsCount: projects.length,
        projectsTotalArs: projects.reduce((sum, p) => sum + (p.current_balance_ars || 0), 0),
        projectsTotalUsd: projects.reduce((sum, p) => sum + (p.current_balance_usd || 0), 0)
      };

      console.log('📊 CashBoxService.getAllCashBoxesSummary() returning:', result);
      
      return result;
    } catch (error) {
      console.error('Error in getAllCashBoxesSummary:', error);
      return {
        masterBalanceArs: 0,
        masterBalanceUsd: 0,
        projectsCount: 0,
        projectsTotalArs: 0,
        projectsTotalUsd: 0
      };
    }
  }
}

export const cashBoxService = CashBoxService.getInstance();