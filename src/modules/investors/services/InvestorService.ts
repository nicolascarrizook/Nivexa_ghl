import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type Investor = Database['public']['Tables']['investors']['Row'];
type InvestorInsert = Database['public']['Tables']['investors']['Insert'];
type InvestorUpdate = Database['public']['Tables']['investors']['Update'];

export interface InvestorWithStats extends Investor {
  total_projects: number;
  total_investment_ars: number;
  total_investment_usd: number;
}

class InvestorService {
  private tableName = 'investors' as const;

  /**
   * Find existing investor or create new one
   * Searches by email first (more reliable), then by name
   * Prevents duplicate investors when creating projects
   */
  async findOrCreateInvestor(
    investorData: Omit<InvestorInsert, 'id' | 'architect_id' | 'created_at' | 'updated_at'>
  ): Promise<Investor> {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, try to find existing investor
      let existingInvestor: Investor | null = null;

      // Search by email first (more reliable unique identifier)
      if (investorData.email) {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('architect_id', user.id)
          .eq('email', investorData.email)
          .maybeSingle();

        if (!error && data) {
          existingInvestor = data;
          console.log('✅ Found existing investor by email:', existingInvestor.id);
        }
      }

      // If not found by email, search by name (case-insensitive exact match)
      if (!existingInvestor && investorData.name) {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('architect_id', user.id)
          .ilike('name', investorData.name)
          .maybeSingle();

        if (!error && data) {
          existingInvestor = data;
          console.log('✅ Found existing investor by name:', existingInvestor.id);
        }
      }

      // Return existing investor if found
      if (existingInvestor) {
        return existingInvestor;
      }

      // If not found, create new investor
      console.log('🆕 Creating new investor:', investorData.name);
      return await this.createInvestor(investorData);
    } catch (error) {
      console.error('InvestorService: Error in findOrCreateInvestor', error);
      throw error;
    }
  }

  /**
   * Create a new investor
   */
  async createInvestor(
    investor: Omit<InvestorInsert, 'id' | 'architect_id' | 'created_at' | 'updated_at'>
  ): Promise<Investor> {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...investor,
          architect_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating investor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('InvestorService: Error creating investor', error);
      throw error;
    }
  }

  /**
   * Get a single investor by ID
   */
  async getInvestor(investorId: string): Promise<Investor | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', investorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching investor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('InvestorService: Error fetching investor', error);
      throw error;
    }
  }

  /**
   * Get all investors for the current architect
   */
  async getAllInvestors(): Promise<Investor[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching all investors:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('InvestorService: Error fetching all investors', error);
      throw error;
    }
  }

  /**
   * Get all investors with project statistics
   */
  async getAllInvestorsWithStats(): Promise<InvestorWithStats[]> {
    try {
      const { data: investors, error: investorsError } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name');

      if (investorsError) {
        console.error('Error fetching investors:', investorsError);
        throw investorsError;
      }

      if (!investors || investors.length === 0) {
        return [];
      }

      // Get stats for each investor
      const investorsWithStats = await Promise.all(
        investors.map(async (investor) => {
          // Count total active projects
          const { count: projectCount } = await supabase
            .from('project_investors')
            .select('*', { count: 'exact', head: true })
            .eq('investor_id', investor.id)
            .eq('status', 'active');

          // Calculate total investment amounts
          const { data: investments } = await supabase
            .from('project_investors')
            .select('investment_amount_ars, investment_amount_usd, estimated_value_ars, estimated_value_usd')
            .eq('investor_id', investor.id)
            .eq('status', 'active');

          const totalInvestmentArs = investments?.reduce(
            (sum, inv) => sum + (inv.investment_amount_ars || 0) + (inv.estimated_value_ars || 0),
            0
          ) || 0;

          const totalInvestmentUsd = investments?.reduce(
            (sum, inv) => sum + (inv.investment_amount_usd || 0) + (inv.estimated_value_usd || 0),
            0
          ) || 0;

          return {
            ...investor,
            total_projects: projectCount || 0,
            total_investment_ars: totalInvestmentArs,
            total_investment_usd: totalInvestmentUsd,
          };
        })
      );

      return investorsWithStats;
    } catch (error) {
      console.error('InvestorService: Error fetching investors with stats', error);
      throw error;
    }
  }

  /**
   * Search investors by name, email, phone or tax_id
   */
  async searchInvestors(query: string, limit = 10): Promise<Investor[]> {
    try {
      // Clean and prepare the search query
      const searchTerm = query.trim().toLowerCase();

      if (searchTerm.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`)
        .order('name')
        .limit(limit);

      if (error) {
        console.error('Error searching investors:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('InvestorService: Error searching investors', error);
      throw error;
    }
  }

  /**
   * Update an existing investor
   */
  async updateInvestor(
    investorId: string,
    updates: Omit<InvestorUpdate, 'id' | 'architect_id' | 'created_at' | 'updated_at'>
  ): Promise<Investor> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', investorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating investor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('InvestorService: Error updating investor', error);
      throw error;
    }
  }

  /**
   * Delete an investor (soft delete - only if no active projects)
   */
  async deleteInvestor(investorId: string): Promise<boolean> {
    try {
      // First, check if investor has active projects
      const { count, error: countError } = await supabase
        .from('project_investors')
        .select('*', { count: 'exact', head: true })
        .eq('investor_id', investorId)
        .eq('status', 'active');

      if (countError) {
        console.error('Error checking investor projects:', countError);
        throw countError;
      }

      if (count && count > 0) {
        throw new Error(
          `No se puede eliminar el inversionista. Tiene ${count} proyecto(s) activo(s). Primero debe removerlo de los proyectos.`
        );
      }

      // If no active projects, proceed with deletion
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', investorId);

      if (error) {
        console.error('Error deleting investor:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('InvestorService: Error deleting investor', error);
      throw error;
    }
  }
}

export const investorService = new InvestorService();
export default investorService;
