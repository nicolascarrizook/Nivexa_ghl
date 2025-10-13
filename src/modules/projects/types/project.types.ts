export interface ProjectFormData {
  // Step 1: Project Basics
  projectName?: string;
  projectType?: "construction" | "renovation" | "design" | "other";
  estimatedValue?: number;
  description?: string;

  // Step 2: Client Details
  clientId?: string; // Reference to existing client
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientTaxId?: string;
  propertyAddress?: string;
  propertyType?: "residential" | "commercial" | "industrial";
  city?: string;
  zipCode?: string;
  additionalContacts?: AdditionalContact[];

  // Step 3: Payment Configuration
  currency?: 'ARS' | 'USD';
  exchangeRate?: number;
  totalAmount?: number;
  downPaymentAmount?: number;
  downPaymentPercentage?: number;
  downPaymentDate?: string;
  installmentCount?: number;
  installmentAmount?: number;
  paymentFrequency?: "monthly" | "biweekly" | "weekly" | "quarterly";
  firstPaymentDate?: string;
  lateFeeAmount?: number;
  lateFeeType?: "fixed" | "percentage";
  lateFeePercentage?: number;
  gracePeriodDays?: number;
  contractNotes?: string;
  
  // Administrative Fees
  adminFeeType?: "percentage" | "fixed" | "manual" | "none";
  adminFeePercentage?: number;
  adminFeeAmount?: number;
  
  // Payment Confirmation
  paymentConfirmation?: PaymentConfirmation;

  // Step 4: Terms & Conditions
  startDate?: string;
  estimatedEndDate?: string;
  projectPhases?: ProjectPhase[];
  paymentTerms?: string;
  specialConditions?: string;
  contractNotes?: string;

  // Contract Signature
  clientSignature?: string;
  signatureDate?: string;
  contractSigned?: boolean;

  // Step 5: Review & Confirm
  termsAccepted?: boolean;
  dataAccuracyConfirmed?: boolean;
  authorityConfirmed?: boolean;
}

export interface AdditionalContact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface ProjectPhase {
  name: string;
  description?: string;
  duration: string;
  startDate?: string;
  endDate?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_tax_id?: string;
  project_type: "construction" | "renovation" | "design" | "other";
  status: "draft" | "active" | "on_hold" | "completed" | "cancelled";
  total_amount: number;
  down_payment_amount: number;
  down_payment_percentage?: number;
  installments_count: number;
  installment_amount?: number;
  late_fee_percentage: number;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Computed fields for display
  paid_amount?: number;
  next_payment_amount?: number;
  next_payment_date?: string;
  progress_percentage?: number;
}

export interface Installment {
  id: string;
  project_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paid_amount: number;
  paid_at?: string;
  late_fee_applied: number;
  notes?: string;
  // Administrator fee configuration
  admin_fee_percentage?: number; // Custom fee percentage for this installment
  admin_fee_amount?: number; // Fixed fee amount (overrides percentage)
  admin_fee_collected?: boolean; // Whether fee has been collected
  created_at: string;
  updated_at: string;
}

export interface PaymentConfirmation {
  confirmed: boolean;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccount?: string;
  notes?: string;
  confirmedAt?: string;
  paymentCurrency?: 'ARS' | 'USD'; // Moneda en la que se recibió el pago
}

export interface PaymentSummary {
  totalValue: number;
  downPayment: number;
  financedAmount: number;
  monthlyPayment: number;
  numberOfPayments: number;
  paymentDuration: string;
  riskLevel: "low" | "medium" | "high";
}
