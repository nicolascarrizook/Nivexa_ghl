import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';
import { cashBoxService } from '@/modules/finance/services/CashBoxService';

type ProjectInvestor = Database['public']['Tables']['project_investors']['Row'];
type ProjectInvestorInsert = Database['public']['Tables']['project_investors']['Insert'];
type ProjectInvestorUpdate = Database['public']['Tables']['project_investors']['Update'];
type Investor = Database['public']['Tables']['investors']['Row'];

export type InvestmentType =
  | 'cash_ars'
  | 'cash_usd'
  | 'materials'
  | 'land'
  | 'labor'
  | 'equipment'
  | 'other';

export interface ProjectInvestorWithDetails extends ProjectInvestor {
  investor: Investor;
}

export interface AddInvestorData {
  projectId: string;
  investorId: string;
  investmentType: InvestmentType;
  amountArs?: number;
  amountUsd?: number;
  description?: string;
  estimatedValueArs?: number;
  estimatedValueUsd?: number;
  percentageShare: number;
  notes?: string;
  // Installment fields (only for cash_ars and cash_usd)
  installmentCount?: number;
  paymentFrequency?: 'monthly' | 'biweekly' | 'weekly' | 'quarterly';
  firstPaymentDate?: string;
}

class ProjectInvestorService {
  private tableName = 'project_investors' as const;

  /**
   * Add an investor to a project with their investment details
   * Validates percentage limits and registers cash movements if applicable
   */
  async addInvestorToProject(data: AddInvestorData): Promise<ProjectInvestorWithDetails> {
    try {
      // 1. Validate that total percentage doesn't exceed 100%
      await this.validatePercentages(data.projectId, data.percentageShare);

      // 2. Create project_investor record
      const isCash = data.investmentType === 'cash_ars' || data.investmentType === 'cash_usd';

      const projectInvestorData: Omit<ProjectInvestorInsert, 'id' | 'created_at' | 'updated_at'> = {
        project_id: data.projectId,
        investor_id: data.investorId,
        investment_type: data.investmentType,
        investment_amount_ars: data.amountArs || 0,
        investment_amount_usd: data.amountUsd || 0,
        investment_description: data.description || null,
        estimated_value_ars: data.estimatedValueArs || 0,
        estimated_value_usd: data.estimatedValueUsd || 0,
        percentage_share: data.percentageShare,
        notes: data.notes || null,
        // Only set installment fields for cash investments
        installment_count: isCash ? (data.installmentCount || 1) : null,
        payment_frequency: isCash ? (data.paymentFrequency || null) : null,
        first_payment_date: isCash ? (data.firstPaymentDate || null) : null,
      };

      const { data: projectInvestor, error: insertError } = await supabase
        .from(this.tableName)
        .insert(projectInvestorData)
        .select(`
          *,
          investor:investors(*)
        `)
        .single();

      if (insertError) {
        console.error('Error inserting project_investor:', insertError);
        throw insertError;
      }

      // 3. If cash investment, register in cash_movements
      if (data.investmentType === 'cash_ars' || data.investmentType === 'cash_usd') {
        const amount = data.investmentType === 'cash_ars' ? data.amountArs : data.amountUsd;
        const currency = data.investmentType === 'cash_ars' ? 'ARS' : 'USD';

        if (amount && amount > 0) {
          await cashBoxService.registerInvestorContribution({
            projectId: data.projectId,
            investorId: data.investorId,
            amount: amount,
            currency: currency as 'ARS' | 'USD',
            notes: `Inversión de ${projectInvestor.investor.name} - ${data.percentageShare}%`,
          });
        }
      }

      // 4. Update project.has_investors = true
      await supabase
        .from('projects')
        .update({ has_investors: true })
        .eq('id', data.projectId);

      console.log('✅ Investor added to project:', projectInvestor.id);

      return projectInvestor as ProjectInvestorWithDetails;
    } catch (error) {
      console.error('ProjectInvestorService: Error adding investor to project', error);
      throw error;
    }
  }

  /**
   * Remove an investor from a project (soft delete - changes status to 'removed')
   */
  async removeInvestorFromProject(projectInvestorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ status: 'removed' })
        .eq('id', projectInvestorId);

      if (error) {
        console.error('Error removing investor from project:', error);
        throw error;
      }

      console.log('✅ Investor removed from project:', projectInvestorId);
      return true;
    } catch (error) {
      console.error('ProjectInvestorService: Error removing investor', error);
      throw error;
    }
  }

  /**
   * Update investor share details (amount, percentage, etc.)
   */
  async updateInvestorShare(
    projectInvestorId: string,
    updates: Partial<Pick<ProjectInvestor,
      'investment_amount_ars' |
      'investment_amount_usd' |
      'estimated_value_ars' |
      'estimated_value_usd' |
      'percentage_share' |
      'investment_description' |
      'notes'
    >>
  ): Promise<ProjectInvestor> {
    try {
      // If updating percentage, validate first
      if (updates.percentage_share !== undefined) {
        // Get current record to know which project
        const { data: current } = await supabase
          .from(this.tableName)
          .select('project_id, percentage_share')
          .eq('id', projectInvestorId)
          .single();

        if (current) {
          await this.validatePercentages(
            current.project_id,
            updates.percentage_share,
            projectInvestorId
          );
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', projectInvestorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project_investor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProjectInvestorService: Error updating investor share', error);
      throw error;
    }
  }

  /**
   * Get all investors for a specific project
   */
  async getInvestorsByProject(projectId: string): Promise<ProjectInvestorWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          investor:investors(*)
        `)
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('created_at');

      if (error) {
        console.error('Error fetching investors by project:', error);
        throw error;
      }

      return (data || []) as ProjectInvestorWithDetails[];
    } catch (error) {
      console.error('ProjectInvestorService: Error fetching investors by project', error);
      throw error;
    }
  }

  /**
   * Get all projects where an investor participates
   */
  async getProjectsByInvestor(investorId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          project:projects(*)
        `)
        .eq('investor_id', investorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects by investor:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('ProjectInvestorService: Error fetching projects by investor', error);
      throw error;
    }
  }

  /**
   * Get total invested amounts in a project (all investors combined)
   */
  async getTotalInvestedByProject(
    projectId: string
  ): Promise<{ totalArs: number; totalUsd: number }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('investment_amount_ars, investment_amount_usd, estimated_value_ars, estimated_value_usd')
        .eq('project_id', projectId)
        .eq('status', 'active');

      if (error) {
        console.error('Error calculating total invested:', error);
        throw error;
      }

      const totalArs = data?.reduce(
        (sum, inv) => sum + (inv.investment_amount_ars || 0) + (inv.estimated_value_ars || 0),
        0
      ) || 0;

      const totalUsd = data?.reduce(
        (sum, inv) => sum + (inv.investment_amount_usd || 0) + (inv.estimated_value_usd || 0),
        0
      ) || 0;

      return { totalArs, totalUsd };
    } catch (error) {
      console.error('ProjectInvestorService: Error calculating total invested', error);
      throw error;
    }
  }

  /**
   * Get remaining percentage available for a project
   */
  async getRemainingPercentage(projectId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('percentage_share')
        .eq('project_id', projectId)
        .eq('status', 'active');

      if (error) {
        console.error('Error calculating remaining percentage:', error);
        throw error;
      }

      const totalPercentage = data?.reduce(
        (sum, inv) => sum + (inv.percentage_share || 0),
        0
      ) || 0;

      return 100 - totalPercentage;
    } catch (error) {
      console.error('ProjectInvestorService: Error calculating remaining percentage', error);
      throw error;
    }
  }

  /**
   * Validate that adding a new percentage doesn't exceed 100%
   * @param projectId - The project to validate
   * @param newPercentage - The percentage to add
   * @param excludeId - Optional: exclude this record from calculation (for updates)
   */
  private async validatePercentages(
    projectId: string,
    newPercentage: number,
    excludeId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('percentage_share')
        .eq('project_id', projectId)
        .eq('status', 'active');

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const currentTotal = data?.reduce(
        (sum, inv) => sum + (inv.percentage_share || 0),
        0
      ) || 0;

      const newTotal = currentTotal + newPercentage;

      if (newTotal > 100) {
        throw new Error(
          `La suma de porcentajes no puede exceder 100%. ` +
          `Actual: ${currentTotal.toFixed(2)}%, ` +
          `Nuevo: ${newPercentage.toFixed(2)}%, ` +
          `Total: ${newTotal.toFixed(2)}%`
        );
      }
    } catch (error) {
      console.error('ProjectInvestorService: Error validating percentages', error);
      throw error;
    }
  }
}

export const projectInvestorService = new ProjectInvestorService();
export default projectInvestorService;
