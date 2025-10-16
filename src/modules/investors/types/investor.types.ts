import type { Database } from '@/types/database.types';

// Base types from database
export type Investor = Database['public']['Tables']['investors']['Row'];
export type InvestorInsert = Database['public']['Tables']['investors']['Insert'];
export type InvestorUpdate = Database['public']['Tables']['investors']['Update'];

export type ProjectInvestor = Database['public']['Tables']['project_investors']['Row'];
export type ProjectInvestorInsert = Database['public']['Tables']['project_investors']['Insert'];
export type ProjectInvestorUpdate = Database['public']['Tables']['project_investors']['Update'];

export type InvestorAccessToken = Database['public']['Tables']['investor_access_tokens']['Row'];

// Investment types enum
export type InvestmentType =
  | 'cash_ars'
  | 'cash_usd'
  | 'materials'
  | 'land'
  | 'labor'
  | 'equipment'
  | 'other';

// Investor types enum
export type InvestorType = 'individual' | 'company';

// Project financing types
export type ProjectFinancingType = 'owner_financed' | 'investor_financed' | 'mixed';

// Extended types with relationships
export interface InvestorWithStats extends Investor {
  total_projects: number;
  total_investment_ars: number;
  total_investment_usd: number;
}

export interface ProjectInvestorWithDetails extends ProjectInvestor {
  investor: Investor;
}

export interface ProjectWithInvestors {
  id: string;
  name: string;
  has_investors: boolean;
  project_financing_type: ProjectFinancingType;
  investors: ProjectInvestorWithDetails[];
  total_invested_ars: number;
  total_invested_usd: number;
  remaining_percentage: number;
}

// Form data types
export interface InvestorFormData {
  name: string;
  email?: string | null;
  phone?: string | null;
  tax_id?: string | null;
  investor_type?: InvestorType;
  address?: string | null;
  city?: string | null;
}

export interface AddInvestorToProjectFormData {
  investorId?: string; // existing investor
  investorName?: string; // create new investor
  investorEmail?: string;
  investorPhone?: string;
  investorTaxId?: string;
  investorType?: InvestorType;

  investmentType: InvestmentType;
  amountArs?: number;
  amountUsd?: number;
  description?: string;
  estimatedValueArs?: number;
  estimatedValueUsd?: number;
  percentageShare: number;
  notes?: string;
}

// Portal/Access types
export interface InvestorPortalData {
  investor: Investor;
  projectInvestment: ProjectInvestorWithDetails;
  project: {
    id: string;
    name: string;
    code: string;
    status: string;
    progress_percentage: number;
    start_date: string | null;
    estimated_end_date: string | null;
    actual_end_date: string | null;
  };
  coInvestors: Array<{
    name: string;
    percentage_share: number;
    // Note: amounts are NOT included for privacy
  }>;
}

// Investment summary types
export interface InvestmentSummary {
  totalArs: number;
  totalUsd: number;
  byType: Record<InvestmentType, {
    countArs: number;
    countUsd: number;
    amountArs: number;
    amountUsd: number;
  }>;
}

// Validation types
export interface InvestorValidation {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    phone?: string;
    tax_id?: string;
    percentageShare?: string;
    amount?: string;
  };
}

// Helper type guards
export function isInvestorFormComplete(data: Partial<InvestorFormData>): data is InvestorFormData {
  return !!data.name && data.name.trim().length > 0;
}

export function isCashInvestment(type: InvestmentType): boolean {
  return type === 'cash_ars' || type === 'cash_usd';
}

export function getInvestmentTypeCurrency(type: InvestmentType): 'ARS' | 'USD' | null {
  if (type === 'cash_ars') return 'ARS';
  if (type === 'cash_usd') return 'USD';
  return null;
}

// Display helpers
export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  cash_ars: 'Efectivo (ARS)',
  cash_usd: 'Efectivo (USD)',
  materials: 'Materiales',
  land: 'Terreno',
  labor: 'Mano de obra',
  equipment: 'Equipamiento',
  other: 'Otro',
};

export const INVESTOR_TYPE_LABELS: Record<InvestorType, string> = {
  individual: 'Persona física',
  company: 'Empresa',
};

export const FINANCING_TYPE_LABELS: Record<ProjectFinancingType, string> = {
  owner_financed: 'Cliente único',
  investor_financed: 'Solo inversionistas',
  mixed: 'Cliente + Inversionistas',
};
