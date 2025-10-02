import { BaseService } from '@core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Tables, InsertTables, UpdateTables } from '@/config/supabase';
import type { ProjectFormData } from '../types/project.types';
import type { Currency } from '@/services/CurrencyService';
import { administratorFeeService } from '@/services/AdministratorFeeService';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';

export type Project = Tables<'projects'>;
export type InsertProject = InsertTables<'projects'>;
export type UpdateProject = UpdateTables<'projects'>;
export type Installment = Tables<'installments'>;

// Extended project type for UI display with computed fields
export interface ProjectWithDetails extends Project {
  paid_amount?: number;
  next_payment_amount?: number;
  next_payment_date?: string;
  progress_percentage?: number;
  installments?: Installment[];
  project_cash?: {
    balance: number;
    total_received: number;
    last_movement_at: string | null;
  };
}

export class ProjectService extends BaseService<'projects'> {
  constructor() {
    super('projects');
  }

  /**
   * Generate a unique project code
   */
  async generateProjectCode(): Promise<string> {
    const year = new Date().getFullYear();
    
    // Get the last project code for this year
    const { data } = await supabase
      .from(this.tableName)
      .select('code')
      .like('code', `PRY-${year}-%`)
      .order('code', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastCode = data[0].code;
      const lastNumber = parseInt(lastCode.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `PRY-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Convert ProjectFormData to database InsertProject
   */
  private mapFormDataToInsert(formData: ProjectFormData): Omit<InsertProject, 'code'> {
    return {
      name: formData.projectName || '',
      client_id: formData.clientId || null,
      client_name: formData.clientName || '',
      client_email: formData.clientEmail || null,
      client_phone: formData.clientPhone || null,
      client_tax_id: formData.clientTaxId || null,
      project_type: formData.projectType || 'other',
      status: 'active',
      total_amount: formData.totalAmount || 0,
      down_payment_amount: formData.downPaymentAmount || 0,
      down_payment_percentage: formData.downPaymentPercentage || null,
      installments_count: formData.installmentCount || 1,
      installment_amount: formData.installmentAmount || null,
      late_fee_percentage: formData.lateFeePercentage || 0,
      start_date: formData.startDate || null,
      estimated_end_date: formData.estimatedEndDate || null,
      description: formData.description || null,
      currency: formData.currency || 'ARS',
      metadata: {
        propertyAddress: formData.propertyAddress,
        propertyType: formData.propertyType,
        city: formData.city,
        zipCode: formData.zipCode,
        paymentFrequency: formData.paymentFrequency,
        firstPaymentDate: formData.firstPaymentDate,
        lateFeeAmount: formData.lateFeeAmount,
        lateFeeType: formData.lateFeeType,
        gracePeriodDays: formData.gracePeriodDays,
        contractNotes: formData.contractNotes,
        paymentTerms: formData.paymentTerms,
        specialConditions: formData.specialConditions,
        projectPhases: formData.projectPhases,
        additionalContacts: formData.additionalContacts,
        downPaymentDate: formData.downPaymentDate,
        paymentConfirmation: formData.paymentConfirmation,
      },
    };
  }

  /**
   * Create project with generated code and project cash box from form data
   */
  async createProjectFromForm(formData: ProjectFormData): Promise<ProjectWithDetails | null> {
    const projectData = this.mapFormDataToInsert(formData);
    return this.createProject(projectData);
  }

  /**
   * Create project with generated code and project cash box
   * NO automatic income registration - payment must be confirmed separately
   */
  async createProject(project: Omit<InsertProject, 'code'>): Promise<ProjectWithDetails | null> {
    const code = await this.generateProjectCode();
    
    try {
      // Start a transaction
      const { data: projectData, error: projectError } = await supabase
        .from(this.tableName)
        .insert({ ...project, code })
        .select()
        .single();

      if (projectError || !projectData) {
        throw new Error(projectError?.message || 'Failed to create project');
      }

      // Create project cash box (starts with zero balance)
      const { error: cashError } = await supabase
        .from('project_cash')
        .insert({
          project_id: projectData.id,
          balance: 0,
          total_received: 0,
        });

      if (cashError) {
        // Rollback by deleting the project
        await this.delete(projectData.id);
        throw new Error('Failed to create project cash box');
      }

      // Generate installments (always generate, even for single payment)
      if (projectData.installments_count >= 1) {
        await this.generateInstallments(projectData);
      }
      
      // Create down payment record if there's a down payment
      if (projectData.down_payment_amount && projectData.down_payment_amount > 0) {
        await this.createDownPaymentRecord(projectData);
        
        // Auto-confirm down payment as paid (since it's usually received upfront)
        // This ensures the project progress shows correctly from the start
        const { data: downPaymentInstallment } = await supabase
          .from('installments')
          .select('*')
          .eq('project_id', projectData.id)
          .eq('installment_number', 0)
          .single();
          
        if (downPaymentInstallment) {
          // Mark down payment as paid
          await supabase
            .from('installments')
            .update({
              status: 'paid',
              paid_amount: downPaymentInstallment.amount,
              paid_date: new Date().toISOString(),
              notes: 'Anticipo confirmado al crear proyecto'
            })
            .eq('id', downPaymentInstallment.id);
            
          // Create a payment record for the down payment
          await supabase
            .from('payments')
            .insert({
              installment_id: downPaymentInstallment.id,
              amount: downPaymentInstallment.amount,
              payment_method: 'transfer',
              payment_reference: 'Anticipo inicial'
            });
            
          // Process payment to cash boxes
          await newCashBoxService.processProjectPayment({
            projectId: projectData.id,
            amount: downPaymentInstallment.amount,
            description: `Anticipo - ${projectData.name}`,
            installmentId: downPaymentInstallment.id
          });
        }
      }

      // Note: Administrator fees are now created per payment when installments are paid
      // instead of upfront for the entire project amount

      // Get project cash box
      const { data: projectCash } = await supabase
        .from('project_cash')
        .select('*')
        .eq('project_id', projectData.id)
        .single();

      // Return project with initial computed fields (no payments made yet)
      const progress = await this.calculateProgress(projectData.id);
      const nextPayment = await this.getNextPayment(projectData.id);
      
      const result: ProjectWithDetails = {
        ...projectData,
        paid_amount: progress.totalPaid,
        next_payment_amount: nextPayment?.amount,
        next_payment_date: nextPayment?.due_date,
        progress_percentage: progress.percentageComplete,
        project_cash: projectCash || {
          balance: 0,
          total_received: 0,
          last_movement_at: null,
        },
      };

      console.log(`✅ Project created: ${projectData.code} - Payment confirmation required`);
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Confirm down payment receipt and register cash flow
   */
  async confirmDownPayment(
    projectId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      referenceNumber?: string;
      bankAccount?: string;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        console.error('Project not found');
        return false;
      }

      // Get project cash box
      const { data: projectCash } = await supabase
        .from('project_cash')
        .select('*')
        .eq('project_id', projectId)
        .single();

      // Get master cash box (only one exists, no currency field)
      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      if (!projectCash || !masterCash) {
        console.error('Cash boxes not found');
        return false;
      }

      // Create cash movements
      const movements = [
        // Movement from external to project cash
        {
          movement_type: 'down_payment',
          source_type: 'external',
          source_id: null,
          destination_type: 'project',
          destination_id: projectCash.id,
          amount: paymentData.amount,
          description: `Anticipo recibido - ${project.name}`,
          project_id: projectId,
          metadata: {
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            bankAccount: paymentData.bankAccount,
            notes: paymentData.notes,
          }
        },
        // Duplicate to master cash
        {
          movement_type: 'master_income',
          source_type: 'external',
          source_id: null,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: paymentData.amount,
          description: `Anticipo duplicado - ${project.name}`,
          project_id: projectId,
          metadata: {
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            bankAccount: paymentData.bankAccount,
          }
        }
      ];

      // Insert movements
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert(movements);

      if (movementError) {
        console.error('Error creating cash movements:', movementError);
        return false;
      }

      // Update cash box balances
      const updates = [
        // Update project cash
        supabase
          .from('project_cash')
          .update({
            balance: projectCash.balance + paymentData.amount,
            total_received: projectCash.total_received + paymentData.amount,
            last_movement_at: new Date().toISOString(),
          })
          .eq('id', projectCash.id),
        
        // Update master cash
        supabase
          .from('master_cash')
          .update({
            balance: masterCash.balance + paymentData.amount,
            last_movement_at: new Date().toISOString(),
          })
          .eq('id', masterCash.id),
      ];

      await Promise.all(updates);

      // Mark down payment installment as paid if it exists
      const { data: downPaymentInstallment } = await supabase
        .from('installments')
        .select('*')
        .eq('project_id', projectId)
        .eq('installment_number', 0) // Down payment is installment 0
        .single();

      if (downPaymentInstallment) {
        await supabase
          .from('installments')
          .update({
            status: 'paid',
            paid_amount: paymentData.amount,
            paid_at: new Date().toISOString(),
            notes: paymentData.notes || 'Anticipo confirmado',
          })
          .eq('id', downPaymentInstallment.id);
      }

      console.log(`✅ Down payment confirmed: ${paymentData.amount} ${project.currency || 'ARS'} for project ${project.code}`);
      return true;
    } catch (error) {
      console.error('Error confirming down payment:', error);
      return false;
    }
  }

  /**
   * Create down payment record
   */
  async createDownPaymentRecord(project: Project): Promise<void> {
    const metadata = project.metadata as any;
    const downPaymentDate = metadata?.downPaymentDate || project.start_date || new Date().toISOString().split('T')[0];
    
    const downPaymentInstallment = {
      project_id: project.id,
      installment_number: 0, // Down payment is installment 0
      amount: project.down_payment_amount,
      due_date: downPaymentDate,
      status: 'pending' as const,
      paid_amount: 0,
      late_fee_applied: 0,
      // Note: installment 0 indicates down payment
    };

    const { error } = await supabase
      .from('installments')
      .insert(downPaymentInstallment);

    if (error) {
      console.error('Failed to create down payment record:', error);
      // Don't throw, just log - this is not critical
    }
  }

  /**
   * Generate installments for a project
   */
  async generateInstallments(project: Project): Promise<void> {
    const installments = [];
    const metadata = project.metadata as any;
    const paymentFrequency = metadata?.paymentFrequency || 'monthly';
    const firstPaymentDate = metadata?.firstPaymentDate ? new Date(metadata.firstPaymentDate) : new Date(project.start_date || new Date());
    
    // Calculate installment amount
    const remainingAmount = project.total_amount - project.down_payment_amount;
    const installmentAmount = remainingAmount / project.installments_count;

    for (let i = 1; i <= project.installments_count; i++) {
      const dueDate = new Date(firstPaymentDate);
      
      // Calculate date based on frequency
      switch (paymentFrequency) {
        case 'monthly':
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          break;
        case 'biweekly':
          dueDate.setDate(dueDate.getDate() + ((i - 1) * 14));
          break;
        case 'weekly':
          dueDate.setDate(dueDate.getDate() + ((i - 1) * 7));
          break;
        case 'quarterly':
          dueDate.setMonth(dueDate.getMonth() + ((i - 1) * 3));
          break;
      }

      installments.push({
        project_id: project.id,
        installment_number: i,
        amount: installmentAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
        paid_amount: 0,
        late_fee_applied: 0,
      });
    }

    const { error } = await supabase
      .from('installments')
      .insert(installments);

    if (error) {
      throw new Error('Failed to generate installments');
    }
  }

  /**
   * Get all projects (similar to mock service interface)
   */
  async getProjects(): Promise<ProjectWithDetails[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project_cash(
          balance,
          total_received,
          last_movement_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Calculate progress and next payments for each project
    const projectsWithDetails = await Promise.all(
      (data || []).map(async (project) => {
        console.log('Processing project:', project.name, 'ID:', project.id);
        const progress = await this.calculateProgress(project.id);
        const nextPayment = await this.getNextPayment(project.id);
        
        // Map to match the expected format in ProjectsPage
        return {
          ...project,
          id: project.id,
          projectName: project.name || 'Sin nombre',
          projectType: project.project_type || 'other',
          status: project.status || 'draft',
          totalAmount: project.total_amount || 0,
          client_name: project.client_name || 'Sin cliente',
          progress: progress.percentageComplete || 0,
          installmentCount: project.installments_count || 12,
          downPayment: project.down_payment_amount || 0,
          downPaymentPercentage: project.down_payment_percentage || 0,
          total_collected: progress.totalPaid || 0,
          next_payment_date: nextPayment?.due_date,
          next_payment_amount: nextPayment?.amount || 0,
          paid_amount: progress.totalPaid,
          progress_percentage: progress.percentageComplete,
          project_cash: Array.isArray(project.project_cash) 
            ? project.project_cash[0] 
            : project.project_cash,
        } as ProjectWithDetails;
      })
    );

    return projectsWithDetails;
  }

  /**
   * Get projects with their cash boxes
   */
  async getProjectsWithCash(): Promise<ProjectWithDetails[]> {
    return this.getProjects();
  }

  /**
   * Get single project by ID (similar to mock service interface)
   */
  async getProject(id: string): Promise<ProjectWithDetails | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project_cash(
          balance,
          total_received,
          last_movement_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }
    
    // Calculate progress and next payment
    const progress = await this.calculateProgress(id);
    const nextPayment = await this.getNextPayment(id);
    
    return {
      ...data,
      paid_amount: progress.totalPaid,
      progress_percentage: progress.percentageComplete,
      next_payment_amount: nextPayment?.amount,
      next_payment_date: nextPayment?.due_date,
      project_cash: Array.isArray(data.project_cash) 
        ? data.project_cash[0] 
        : data.project_cash,
    } as ProjectWithDetails;
  }

  /**
   * Get next pending payment for a project
   */
  private async getNextPayment(projectId: string): Promise<Installment | null> {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get project with installments
   */
  async getProjectWithInstallments(projectId: string): Promise<ProjectWithDetails | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project_cash(
          balance,
          total_received,
          last_movement_at
        ),
        installments(
          *
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project with installments:', error);
      return null;
    }
    
    const progress = await this.calculateProgress(projectId);
    const nextPayment = await this.getNextPayment(projectId);
    
    return {
      ...data,
      paid_amount: progress.totalPaid,
      progress_percentage: progress.percentageComplete,
      next_payment_amount: nextPayment?.amount,
      next_payment_date: nextPayment?.due_date,
      project_cash: Array.isArray(data.project_cash) 
        ? data.project_cash[0] 
        : data.project_cash,
      installments: data.installments,
    } as ProjectWithDetails;
  }

  /**
   * Get project payments (installments for compatibility)
   */
  async getProjectPayments(projectId: string): Promise<Installment[]> {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', projectId)
      .order('installment_number', { ascending: true });

    if (error) {
      console.error('Error fetching project payments:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Update project status
   */
  async updateStatus(projectId: string, status: Project['status']): Promise<ProjectWithDetails | null> {
    const result = await this.update(projectId, { status } as UpdateProject);
    if (!result.data) return null;
    
    // Return updated project with details
    return this.getProject(projectId);
  }

  /**
   * Update project (with compatibility layer)
   */
  async updateProject(id: string, updates: Partial<ProjectWithDetails>): Promise<ProjectWithDetails | null> {
    const result = await this.update(id, updates as UpdateProject);
    if (!result.data) return null;
    
    return this.getProject(id);
  }

  /**
   * Delete project (with compatibility layer)
   */
  async deleteProject(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return result.data || false;
  }

  /**
   * Calculate project progress
   */
  async calculateProgress(projectId: string): Promise<{
    totalPaid: number;
    totalPending: number;
    percentageComplete: number;
  }> {
    // Get project total and down payment
    const project = await this.getById(projectId);
    if (!project.data) {
      return { totalPaid: 0, totalPending: 0, percentageComplete: 0 };
    }

    // Get installments
    const { data: installments, error: installmentsError } = await supabase
      .from('installments')
      .select('paid_amount, amount, installment_number, status')
      .eq('project_id', projectId);

    if (installmentsError) {
      console.error('Error fetching installments:', installmentsError);
      return { totalPaid: 0, totalPending: 0, percentageComplete: 0 };
    }

    if (!installments || installments.length === 0) {
      console.log('No installments found for project:', projectId);
      return { totalPaid: 0, totalPending: 0, percentageComplete: 0 };
    }

    // Calculate total paid from all installments (including down payment which is installment 0)
    const totalPaidFromInstallments = installments.reduce((sum, i) => {
      console.log('Installment:', i.installment_number, 'Status:', i.status, 'Paid:', i.paid_amount);
      // Only count paid amounts
      return sum + (i.paid_amount || 0);
    }, 0);
    
    // Total paid is just the sum of all paid installments
    const totalPaid = totalPaidFromInstallments;
    const totalProject = project.data.total_amount;
    const totalPending = totalProject - totalPaid;
    const percentageComplete = totalProject > 0 ? (totalPaid / totalProject) * 100 : 0;

    console.log('Project progress:', {
      projectId,
      totalPaid,
      totalProject,
      percentageComplete,
      installments: installments.length
    });

    return {
      totalPaid,
      totalPending,
      percentageComplete: Math.round(percentageComplete),
    };
  }
}

// Export singleton instance
export const projectService = new ProjectService();