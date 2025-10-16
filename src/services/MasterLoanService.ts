import { supabase } from '@/config/supabase';
import { newCashBoxService } from './cash/NewCashBoxService';

export interface CreateMasterLoanData {
  project_id: string;
  amount: number;
  currency: 'ARS' | 'USD';
  interest_rate: number;
  due_date: string;
  description?: string;
  notes?: string;
  payment_terms?: string;
  installments_count: number;
  viability_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

export interface MasterLoan {
  id: string;
  loan_code: string;
  project_id: string;
  amount: number;
  currency: 'ARS' | 'USD';
  interest_rate: number;
  loan_date: string;
  due_date: string;
  loan_status: 'draft' | 'pending' | 'active' | 'paid' | 'overdue' | 'cancelled';
  outstanding_balance: number;
  total_paid: number;
  description: string | null;
  notes: string | null;
  payment_terms: string | null;
  installments_count: number;
  viability_score: number | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface MasterLoanInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_amount: number;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
}

export class MasterLoanService {
  /**
   * Create a new loan from Master Cash to a project
   */
  async createLoan(data: CreateMasterLoanData): Promise<MasterLoan> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Validate project exists and is not deleted
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .is('deleted_at', null)
        .eq('id', data.project_id)
        .single();

      if (projectError || !project) {
        throw new Error('Proyecto no encontrado');
      }

      // Validate Master Cash has sufficient funds
      const masterCash = await newCashBoxService.getMasterCash();
      if (!masterCash) {
        throw new Error('Caja Master no encontrada');
      }

      const availableBalance = data.currency === 'ARS'
        ? masterCash.balance_ars || 0
        : masterCash.balance_usd || 0;

      if (availableBalance < data.amount) {
        throw new Error(
          `Fondos insuficientes en Caja Master. Disponible: ${data.currency === 'USD' ? 'U$S' : '$'}${availableBalance.toLocaleString()}`
        );
      }

      // Generate loan code
      const { data: codeResult, error: codeError } = await supabase
        .rpc('generate_master_loan_code');

      if (codeError) throw codeError;

      const loan_code = codeResult as string;

      // Calculate total with interest
      const totalAmount = data.amount * (1 + data.interest_rate / 100);

      // Create loan
      const { data: loan, error: loanError } = await supabase
        .from('master_loans')
        .insert({
          loan_code,
          project_id: data.project_id,
          amount: data.amount,
          currency: data.currency,
          interest_rate: data.interest_rate,
          due_date: data.due_date,
          loan_status: 'active',
          outstanding_balance: totalAmount,
          total_paid: 0,
          description: data.description,
          notes: data.notes,
          payment_terms: data.payment_terms,
          installments_count: data.installments_count,
          viability_score: data.viability_score,
          risk_level: data.risk_level,
          created_by: user.id,
        })
        .select()
        .single();

      if (loanError) throw loanError;

      // Create installments
      await this.createInstallments(loan.id, totalAmount, data.installments_count, data.due_date);

      // Transfer funds from Master Cash to Project Cash Box
      await newCashBoxService.transferMasterToProject({
        projectId: data.project_id,
        amount: data.amount,
        currency: data.currency,
        description: `Préstamo ${loan_code} - ${project.name}`,
        metadata: {
          loan_id: loan.id,
          loan_code,
          movement_type: 'loan_disbursement',
        },
      });

      console.log(`✅ Master loan created: ${loan_code} - ${data.currency} ${data.amount}`);

      return loan;
    } catch (error) {
      console.error('Error creating master loan:', error);
      throw error;
    }
  }

  /**
   * Create installment schedule for a loan
   */
  private async createInstallments(
    loanId: string,
    totalAmount: number,
    installmentCount: number,
    dueDate: string
  ): Promise<void> {
    const installmentAmount = totalAmount / installmentCount;
    const startDate = new Date(dueDate);

    const installments = [];
    for (let i = 1; i <= installmentCount; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setMonth(startDate.getMonth() + (i - 1));

      installments.push({
        loan_id: loanId,
        installment_number: i,
        amount: installmentAmount,
        due_date: installmentDate.toISOString().split('T')[0],
        status: 'pending',
      });
    }

    const { error } = await supabase
      .from('master_loan_installments')
      .insert(installments);

    if (error) throw error;
  }

  /**
   * Get all master loans with project details
   */
  async getLoans(): Promise<any[]> {
    const { data, error } = await supabase
      .from('master_loans')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active loans
   */
  async getActiveLoans(): Promise<any[]> {
    const { data, error } = await supabase
      .from('master_loans')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          code
        )
      `)
      .in('loan_status', ['active', 'overdue'])
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get loans for a specific project
   */
  async getProjectLoans(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('master_loans')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          code
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get loan by ID with full details
   */
  async getLoan(loanId: string): Promise<any> {
    const { data, error } = await supabase
      .from('master_loans')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          code
        ),
        installments:master_loan_installments (
          id,
          installment_number,
          amount,
          due_date,
          status,
          paid_amount,
          paid_date
        )
      `)
      .eq('id', loanId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Record a payment towards a loan
   */
  async recordPayment(params: {
    loanId: string;
    installmentId?: string;
    amount: number;
    currency: 'ARS' | 'USD';
    notes?: string;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get loan details
      const { data: loan, error: loanError } = await supabase
        .from('master_loans')
        .select('*, projects:project_id(name)')
        .eq('id', params.loanId)
        .single();

      if (loanError || !loan) throw new Error('Préstamo no encontrado');

      // Validate currency matches
      if (loan.currency !== params.currency) {
        throw new Error(`El préstamo es en ${loan.currency}, no se puede pagar en ${params.currency}`);
      }

      // Transfer funds from Project to Master Cash
      const movement = await newCashBoxService.transferProjectToMaster({
        projectId: loan.project_id,
        amount: params.amount,
        currency: params.currency,
        description: `Pago préstamo ${loan.loan_code}${params.installmentId ? ` - Cuota` : ''}`,
        metadata: {
          loan_id: params.loanId,
          loan_code: loan.loan_code,
          installment_id: params.installmentId,
          movement_type: 'loan_repayment',
        },
      });

      // Record payment
      const { error: paymentError } = await supabase
        .from('master_loan_payments')
        .insert({
          loan_id: params.loanId,
          installment_id: params.installmentId,
          amount: params.amount,
          currency: params.currency,
          movement_id: movement?.id,
          notes: params.notes,
          created_by: user.id,
        });

      if (paymentError) throw paymentError;

      // Update loan outstanding balance
      const newOutstanding = loan.outstanding_balance - params.amount;
      const newTotalPaid = loan.total_paid + params.amount;

      const updateData: any = {
        outstanding_balance: Math.max(0, newOutstanding),
        total_paid: newTotalPaid,
      };

      // Update status if fully paid
      if (newOutstanding <= 0) {
        updateData.loan_status = 'paid';
      }

      await supabase
        .from('master_loans')
        .update(updateData)
        .eq('id', params.loanId);

      // Update installment if specified
      if (params.installmentId) {
        const { data: installment } = await supabase
          .from('master_loan_installments')
          .select('paid_amount, amount')
          .eq('id', params.installmentId)
          .single();

        if (installment) {
          const newPaidAmount = installment.paid_amount + params.amount;
          const installmentUpdate: any = {
            paid_amount: newPaidAmount,
          };

          if (newPaidAmount >= installment.amount) {
            installmentUpdate.status = 'paid';
            installmentUpdate.paid_date = new Date().toISOString();
          }

          await supabase
            .from('master_loan_installments')
            .update(installmentUpdate)
            .eq('id', params.installmentId);
        }
      }

      console.log(`✅ Payment recorded: ${params.currency} ${params.amount} for loan ${loan.loan_code}`);
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Get loan statistics
   */
  async getStatistics(): Promise<{
    totalActiveLoans: number;
    totalOutstandingARS: number;
    totalOutstandingUSD: number;
    totalOverdue: number;
  }> {
    const { data: loans } = await supabase
      .from('master_loans')
      .select('loan_status, outstanding_balance, currency, due_date')
      .in('loan_status', ['active', 'overdue']);

    const stats = {
      totalActiveLoans: loans?.length || 0,
      totalOutstandingARS: 0,
      totalOutstandingUSD: 0,
      totalOverdue: 0,
    };

    loans?.forEach(loan => {
      if (loan.currency === 'ARS') {
        stats.totalOutstandingARS += loan.outstanding_balance;
      } else {
        stats.totalOutstandingUSD += loan.outstanding_balance;
      }

      if (loan.loan_status === 'overdue' || new Date(loan.due_date) < new Date()) {
        stats.totalOverdue++;
      }
    });

    return stats;
  }
}

export const masterLoanService = new MasterLoanService();
