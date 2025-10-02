import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type InterProjectLoan = Database['public']['Tables']['inter_project_loans']['Row'];
type InterProjectLoanInsert = Database['public']['Tables']['inter_project_loans']['Insert'];
type LoanInstallment = Database['public']['Tables']['loan_installments']['Row'];
type LoanInstallmentInsert = Database['public']['Tables']['loan_installments']['Insert'];

export interface CreateLoanData {
  lender_project_id: string;
  borrower_project_id: string;
  amount: number;
  currency: 'ARS' | 'USD';
  interest_rate?: number;
  due_date: string;
  description?: string;
  notes?: string;
  payment_terms?: string;
  installments_count: number;
}

export interface RegisterPaymentData {
  loan_id: string;
  installment_id: string;
  amount: number;
  paid_date: string;
  notes?: string;
}

export interface LoanWithDetails extends InterProjectLoan {
  lender_project: { id: string; name: string; code: string } | null;
  borrower_project: { id: string; name: string; code: string } | null;
  installments: LoanInstallment[];
}

export class InterProjectLoanService {
  /**
   * Genera un código único para el préstamo
   */
  private static async generateLoanCode(): Promise<string> {
    const { data: loans, error } = await supabase
      .from('inter_project_loans')
      .select('loan_code')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    const lastNumber = loans && loans.length > 0
      ? parseInt(loans[0].loan_code.split('-')[1])
      : 0;

    return `LOAN-${String(lastNumber + 1).padStart(4, '0')}`;
  }

  /**
   * Crea un nuevo préstamo inter-proyecto
   */
  static async createLoan(data: CreateLoanData): Promise<InterProjectLoan> {
    const loan_code = await this.generateLoanCode();

    const loanData: InterProjectLoanInsert = {
      loan_code,
      lender_project_id: data.lender_project_id,
      borrower_project_id: data.borrower_project_id,
      amount: data.amount,
      currency: data.currency,
      interest_rate: data.interest_rate || 0,
      due_date: data.due_date,
      loan_status: 'pending',
      outstanding_balance: data.amount,
      total_paid: 0,
      description: data.description,
      notes: data.notes,
      payment_terms: data.payment_terms,
    };

    const { data: loan, error: loanError } = await supabase
      .from('inter_project_loans')
      .insert(loanData)
      .select()
      .single();

    if (loanError) throw loanError;

    // Crear cuotas
    const installmentAmount = data.amount / data.installments_count;
    const installments: LoanInstallmentInsert[] = [];

    for (let i = 1; i <= data.installments_count; i++) {
      const dueDate = new Date(data.due_date);
      dueDate.setMonth(dueDate.getMonth() - (data.installments_count - i));

      installments.push({
        loan_id: loan.id,
        installment_number: i,
        amount: installmentAmount,
        due_date: dueDate.toISOString().split('T')[0],
        payment_status: 'pending',
        paid_amount: 0,
        interest_amount: 0,
        late_fee_amount: 0,
      });
    }

    const { error: installmentsError } = await supabase
      .from('loan_installments')
      .insert(installments);

    if (installmentsError) throw installmentsError;

    return loan;
  }

  /**
   * Obtiene un préstamo con todos sus detalles
   */
  static async getLoanById(loanId: string): Promise<LoanWithDetails | null> {
    const { data, error } = await supabase
      .from('inter_project_loans')
      .select(`
        *,
        lender_project:lender_project_id (id, name, code),
        borrower_project:borrower_project_id (id, name, code),
        installments:loan_installments (*)
      `)
      .eq('id', loanId)
      .single();

    if (error) throw error;

    return data as LoanWithDetails;
  }

  /**
   * Obtiene todos los préstamos activos
   */
  static async getActiveLoans() {
    const { data, error } = await supabase
      .from('active_loans_summary')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene préstamos por estado
   */
  static async getLoansByStatus(status: InterProjectLoan['loan_status']) {
    const { data, error } = await supabase
      .from('inter_project_loans')
      .select(`
        *,
        lender_project:lender_project_id (id, name, code),
        borrower_project:borrower_project_id (id, name, code)
      `)
      .eq('loan_status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene préstamos de un proyecto (como prestador)
   */
  static async getLoansByLenderProject(projectId: string) {
    const { data, error } = await supabase
      .from('inter_project_loans')
      .select(`
        *,
        borrower_project:borrower_project_id (id, name, code)
      `)
      .eq('lender_project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene préstamos de un proyecto (como prestatario)
   */
  static async getLoansByBorrowerProject(projectId: string) {
    const { data, error } = await supabase
      .from('inter_project_loans')
      .select(`
        *,
        lender_project:lender_project_id (id, name, code)
      `)
      .eq('borrower_project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Registra un pago de cuota
   */
  static async registerPayment(data: RegisterPaymentData): Promise<void> {
    const { data: installment, error: fetchError } = await supabase
      .from('loan_installments')
      .select('*')
      .eq('id', data.installment_id)
      .single();

    if (fetchError) throw fetchError;

    const newPaidAmount = (installment.paid_amount || 0) + data.amount;
    const totalAmount = installment.amount + installment.interest_amount + installment.late_fee_amount;

    let newStatus: LoanInstallment['payment_status'] = 'partial';
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    }

    const { error: updateError } = await supabase
      .from('loan_installments')
      .update({
        paid_amount: newPaidAmount,
        payment_status: newStatus,
        paid_date: data.paid_date,
        notes: data.notes,
      })
      .eq('id', data.installment_id);

    if (updateError) throw updateError;

    // Crear movimiento de caja
    const { data: loan } = await supabase
      .from('inter_project_loans')
      .select('*')
      .eq('id', data.loan_id)
      .single();

    if (loan) {
      await supabase.from('cash_movements').insert({
        movement_type: 'loan_repayment',
        source_type: 'project',
        source_id: loan.borrower_project_id,
        destination_type: 'master',
        destination_id: null,
        amount: data.amount,
        description: `Pago de cuota #${installment.installment_number} del préstamo ${loan.loan_code}`,
        project_id: loan.borrower_project_id,
        related_loan_id: data.loan_id,
        related_installment_id: data.installment_id,
        metadata: {},
      });
    }
  }

  /**
   * Cancela un préstamo
   */
  static async cancelLoan(
    loanId: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('inter_project_loans')
      .update({
        loan_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: reason,
      })
      .eq('id', loanId);

    if (error) throw error;

    // Cancelar todas las cuotas pendientes
    await supabase
      .from('loan_installments')
      .update({ payment_status: 'cancelled' })
      .eq('loan_id', loanId)
      .in('payment_status', ['pending', 'partial']);
  }

  /**
   * Activa un préstamo (cambia de pending a active)
   */
  static async activateLoan(loanId: string): Promise<void> {
    const { error } = await supabase
      .from('inter_project_loans')
      .update({ loan_status: 'active' })
      .eq('id', loanId);

    if (error) throw error;
  }

  /**
   * Obtiene cuotas vencidas
   */
  static async getOverdueInstallments() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('loan_installments')
      .select(`
        *,
        loan:inter_project_loans (
          *,
          lender_project:lender_project_id (id, name),
          borrower_project:borrower_project_id (id, name)
        )
      `)
      .in('payment_status', ['pending', 'partial'])
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene estadísticas de préstamos
   */
  static async getLoanStatistics() {
    const { data: loans, error } = await supabase
      .from('inter_project_loans')
      .select('*');

    if (error) throw error;

    const totalActive = loans.filter(l => l.loan_status === 'active').length;
    const totalOverdue = loans.filter(l => l.loan_status === 'overdue').length;
    const totalPaid = loans.filter(l => l.loan_status === 'paid').length;

    const totalLentARS = loans
      .filter(l => l.currency === 'ARS')
      .reduce((sum, l) => sum + l.amount, 0);

    const totalLentUSD = loans
      .filter(l => l.currency === 'USD')
      .reduce((sum, l) => sum + l.amount, 0);

    const totalOutstandingARS = loans
      .filter(l => l.currency === 'ARS' && l.loan_status !== 'paid')
      .reduce((sum, l) => sum + l.outstanding_balance, 0);

    const totalOutstandingUSD = loans
      .filter(l => l.currency === 'USD' && l.loan_status !== 'paid')
      .reduce((sum, l) => sum + l.outstanding_balance, 0);

    return {
      totalActive,
      totalOverdue,
      totalPaid,
      totalLentARS,
      totalLentUSD,
      totalOutstandingARS,
      totalOutstandingUSD,
    };
  }
}