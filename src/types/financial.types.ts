// ============================================
// FINANCIAL MANAGEMENT TYPES
// ============================================

export type TransactionType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense';
export type ProviderType = 'supplier' | 'service' | 'professional' | 'utility' | 'government' | 'other';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'scheduled';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type BudgetType = 'monthly' | 'quarterly' | 'annual' | 'project';
export type BudgetStatus = 'draft' | 'active' | 'closed';
export type PaymentScheduleStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// Income & Expense Category
export interface IncomeExpenseCategory {
  id: string;
  type: CategoryType;
  name: string;
  code?: string;
  parent_category_id?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  is_system: boolean;
  tax_deductible?: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  parent_category?: IncomeExpenseCategory;
  subcategories?: IncomeExpenseCategory[];
  transaction_count?: number;
  total_amount?: number;
}

// Provider/Supplier
export interface Provider {
  id: string;
  name: string;
  type?: string;
  tax_id?: string;
  category?: string;
  category_id?: string;
  
  // Contact
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  zip_code?: string; // Alias for postal_code
  country?: string;
  website?: string;
  
  // Payment
  payment_terms?: string | number;
  payment_method?: string;
  bank_account?: string;
  bank_name?: string;
  
  // Additional
  notes?: string;
  contact_info?: any;
  is_active: boolean;
  rating?: number;
  total_paid?: number;
  last_payment_date?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  category_relation?: IncomeExpenseCategory;
  recent_transactions?: FinancialTransaction[];
}

// Financial Transaction
export interface FinancialTransaction {
  id: string;
  transaction_type: TransactionType;
  amount: number;
  currency: string;
  exchange_rate: number;
  
  // Categorization
  category_id?: string;
  subcategory_id?: string;
  
  // Relations
  provider_id?: string;
  project_id?: string;
  cash_type: 'admin' | 'master';
  
  // Details
  description?: string;
  reference_number?: string;
  payment_method?: string;
  
  // Dates
  transaction_date: string;
  due_date?: string;
  paid_date?: string;
  
  // Status
  status: TransactionStatus;
  
  // Attachments
  receipt_url?: string;
  invoice_number?: string;
  
  // Recurring
  recurring_transaction_id?: string;
  
  // Audit
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  
  // Relations
  category?: IncomeExpenseCategory;
  subcategory?: IncomeExpenseCategory;
  provider?: Provider;
  project?: any; // Project type from existing system
}

// Recurring Transaction
export interface RecurringTransaction {
  id: string;
  
  // Template
  transaction_type: TransactionType;
  category_id?: string;
  provider_id?: string;
  amount: number;
  currency: string;
  description?: string;
  payment_method?: string;
  
  // Recurrence
  frequency: RecurrenceFrequency;
  interval_value: number;
  day_of_month?: number;
  day_of_week?: number;
  month_of_year?: number;
  
  // Schedule
  start_date: string;
  end_date?: string;
  next_date: string;
  last_processed_date?: string;
  
  // Control
  is_active: boolean;
  auto_process: boolean;
  send_reminder: boolean;
  reminder_days_before?: number;
  
  // Stats
  total_occurrences: number;
  total_amount: number;
  
  created_at: string;
  created_by?: string;
  updated_at: string;
  
  // Relations
  category?: IncomeExpenseCategory;
  provider?: Provider;
  transactions?: FinancialTransaction[];
}

// Budget
export interface Budget {
  id: string;
  name: string;
  type?: BudgetType;
  category_id?: string;
  project_id?: string;
  
  // Amounts
  budgeted_amount: number;
  actual_amount: number;
  currency: string;
  
  // Period
  start_date: string;
  end_date: string;
  
  // Alerts
  alert_threshold: number;
  alert_sent: boolean;
  
  // Status
  status: BudgetStatus;
  notes?: string;
  
  created_at: string;
  created_by?: string;
  updated_at: string;
  
  // Relations
  category?: IncomeExpenseCategory;
  project?: any;
  
  // Calculated
  percentage_used?: number;
  remaining_amount?: number;
  is_over_budget?: boolean;
}

// Payment Schedule
export interface PaymentSchedule {
  id: string;
  provider_id?: string;
  financial_transaction_id?: string;
  scheduled_date: string;
  amount: number;
  currency: string;
  status: PaymentScheduleStatus;
  reminder_sent: boolean;
  reminder_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  provider?: Provider;
  transaction?: FinancialTransaction;
}

// Financial Report
export interface FinancialReport {
  id: string;
  report_type: string;
  report_name?: string;
  period_start: string;
  period_end: string;
  report_data: any; // JSON data
  generated_at: string;
  generated_by?: string;
  expires_at?: string;
  is_draft: boolean;
}

// Cash Flow Summary
export interface CashFlowSummary {
  month: string;
  transaction_type: TransactionType;
  total_ars: number;
  total_usd: number;
  transaction_count: number;
}

// Category Summary
export interface CategorySummary {
  id: string;
  type: CategoryType;
  name: string;
  code?: string;
  transaction_count: number;
  total_ars: number;
  last_transaction_date?: string;
}

// Provider Summary
export interface ProviderSummary {
  id: string;
  name: string;
  type?: ProviderType;
  transaction_count: number;
  total_spent: number;
  last_transaction_date?: string;
  avg_payment_delay_days?: number;
}

// Form Input Types
export interface TransactionFormData {
  transaction_type: TransactionType;
  amount: string;
  currency: string;
  category_id: string;
  provider_id?: string;
  project_id?: string;
  description: string;
  payment_method?: string;
  reference_number?: string;
  invoice_number?: string;
  transaction_date: string;
  due_date?: string;
  receipt_file?: File;
  is_recurring?: boolean;
  recurring_frequency?: RecurrenceFrequency;
  recurring_end_date?: string;
}

export interface ProviderFormData {
  name: string;
  category?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  website?: string;
  payment_terms?: string;
  bank_account?: string;
  notes?: string;
  is_active: boolean;
}

export interface BudgetFormData {
  name: string;
  type: BudgetType;
  category_id?: string;
  project_id?: string;
  budgeted_amount: string;
  currency: string;
  start_date: string;
  end_date: string;
  alert_threshold?: number;
  notes?: string;
}

// Dashboard Metrics
export interface FinancialMetrics {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  cash_balance: number;
  pending_payments: number;
  overdue_payments: number;
  budget_utilization: number;
  top_expense_categories: CategorySummary[];
  top_income_sources: CategorySummary[];
  recent_transactions: FinancialTransaction[];
  upcoming_payments: PaymentSchedule[];
  monthly_trend: CashFlowSummary[];
}

// Filter Options
export interface TransactionFilters {
  type?: TransactionType;
  category_id?: string;
  provider_id?: string;
  status?: TransactionStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

export interface ProviderFilters {
  type?: ProviderType;
  category_id?: string;
  is_active?: boolean;
  search?: string;
}

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'check', label: 'Cheque' },
  { value: 'mercado_pago', label: 'Mercado Pago' },
  { value: 'crypto', label: 'Criptomoneda' },
  { value: 'other', label: 'Otro' }
] as const;

// Currency Options
export const CURRENCIES = [
  { value: 'ARS', label: 'Pesos Argentinos', symbol: '$' },
  { value: 'USD', label: 'Dólares', symbol: 'US$' }
] as const;