import { BaseService } from '@core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Tables, InsertTables, UpdateTables } from '@/config/supabase';
import type { ProjectFormData } from '../types/project.types';
import type { Currency } from '@/services/CurrencyService';
import { administratorFeeService } from '@/services/AdministratorFeeService';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import { clientService } from '@modules/clients/services/ClientService';

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
  project_cash_box?: {
    current_balance_ars: number;
    current_balance_usd: number;
    total_income_ars: number;
    total_income_usd: number;
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
        adminFeeType: formData.adminFeeType,
        adminFeePercentage: formData.adminFeePercentage,
        adminFeeAmount: formData.adminFeeAmount,
      },
    };
  }

  /**
   * Create project with generated code and project cash box from form data
   * Creates client in clients table if it doesn't exist (when no clientId provided)
   */
  async createProjectFromForm(formData: ProjectFormData): Promise<ProjectWithDetails | null> {
    // If no clientId, find existing client or create new one
    let clientId = formData.clientId;

    if (!clientId && formData.clientName) {
      try {
        // Use findOrCreateClient to prevent duplicates
        const client = await clientService.findOrCreateClient({
          name: formData.clientName,
          email: formData.clientEmail || null,
          phone: formData.clientPhone || null,
          tax_id: formData.clientTaxId || null,
          address: formData.propertyAddress || null,
          city: formData.city || null,
        });

        clientId = client.id;
        console.log('✅ Client ready for project:', clientId, '-', client.name);
      } catch (error) {
        console.error('❌ Error finding/creating client from project wizard:', error);
        // Don't continue if client resolution fails - this would leave the project orphaned
        throw new Error(`No se pudo obtener o crear el cliente: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intente nuevamente.`);
      }
    }

    // Validate that we have a client ID if client name was provided
    if (formData.clientName && !clientId) {
      throw new Error('Se especificó un cliente pero no se pudo obtener su ID. Por favor, verifique los datos del cliente.');
    }

    // Update formData with the client ID (existing or newly created)
    const updatedFormData = {
      ...formData,
      clientId: clientId,
    };

    const projectData = this.mapFormDataToInsert(updatedFormData);
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
        .from('project_cash_box')
        .insert({
          project_id: projectData.id,
          current_balance_ars: 0,
          current_balance_usd: 0,
          total_income_ars: 0,
          total_income_usd: 0,
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
            installmentId: downPaymentInstallment.id,
            currency: projectData.currency as 'ARS' | 'USD' // Pass project currency
          });

          // Process administrator fee for down payment
          const metadata = projectData.metadata as any;
          const adminFeeType = metadata?.adminFeeType || 'percentage';
          const adminFeePercentage = metadata?.adminFeePercentage || 0;
          const adminFeeAmount = metadata?.adminFeeAmount || 0;

          if (adminFeeType !== 'none') {
            let feePercentage = adminFeePercentage;
            let feeAmount = adminFeeAmount;

            // Calculate fee based on type
            if (adminFeeType === 'percentage' && feePercentage > 0) {
              feeAmount = (downPaymentInstallment.amount * feePercentage) / 100;
            } else if (adminFeeType === 'fixed') {
              // Use the fixed amount from metadata
              feeAmount = adminFeeAmount;
            }

            if (feeAmount > 0) {
              console.log(`Creating administrator fee: ${feeAmount} ${projectData.currency} (${feePercentage}%)`);

              // Create administrator fee record
              const adminFee = await administratorFeeService.createAdminFee(
                projectData.id,
                downPaymentInstallment.amount,
                projectData.currency as Currency || 'ARS',
                feePercentage,
                downPaymentInstallment.id
              );

              // Immediately collect the fee (transfer from master to admin cash)
              if (adminFee) {
                const collected = await administratorFeeService.collectAdminFee(adminFee.id);
                if (collected) {
                  console.log(`✅ Administrator fee collected: ${feeAmount} ${projectData.currency}`);
                } else {
                  console.warn('⚠️ Administrator fee created but not collected');
                }
              }
            }
          }
        }
      }

      // Administrator fees are created per payment when installments are paid

      // Get project cash box
      const { data: projectCash } = await supabase
        .from('project_cash_box')
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
        project_cash_box: projectCash || {
          current_balance_ars: 0,
          current_balance_usd: 0,
          total_income_ars: 0,
          total_income_usd: 0,
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
        .from('project_cash_box')
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

      // Determine currency from project or payment data (default to ARS if not specified)
      const currency = (project.currency as Currency) || 'ARS';
      const isARS = currency === 'ARS';

      // Update cash box balances
      const updates = [
        // Update project cash
        supabase
          .from('project_cash_box')
          .update({
            current_balance_ars: isARS ? projectCash.current_balance_ars + paymentData.amount : projectCash.current_balance_ars,
            current_balance_usd: !isARS ? projectCash.current_balance_usd + paymentData.amount : projectCash.current_balance_usd,
            total_income_ars: isARS ? projectCash.total_income_ars + paymentData.amount : projectCash.total_income_ars,
            total_income_usd: !isARS ? projectCash.total_income_usd + paymentData.amount : projectCash.total_income_usd,
            updated_at: new Date().toISOString(),
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

      // ✨ AUTOMATIC ADMIN FEE LIQUIDATION ✨
      // If project has admin_fee_percentage configured, automatically liquidate fees
      if (project.admin_fee_percentage && project.admin_fee_percentage > 0) {
        try {
          const feeAmount = (paymentData.amount * project.admin_fee_percentage) / 100;
          const currency = (project.currency as 'ARS' | 'USD') || 'ARS';

          // Import newCashBoxService for automatic fee liquidation
          const { newCashBoxService } = await import('@/services/cash/NewCashBoxService');

          await newCashBoxService.collectAdminFeeManual({
            amount: feeAmount,
            currency: currency,
            description: `Honorarios ${project.admin_fee_percentage}% - Anticipo ${project.name}`,
            projectId: projectId,
            percentage: project.admin_fee_percentage,
          });

          console.log(`✅ Admin fees automatically liquidated: ${feeAmount} ${currency} (${project.admin_fee_percentage}%)`);
        } catch (feeError) {
          console.error('Error liquidating admin fees:', feeError);
          // Don't fail the entire payment if fee liquidation fails
          // Just log the error - the payment is still confirmed
        }
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
        project_cash_box(
          current_balance_ars,
          current_balance_usd,
          total_income_ars,
          total_income_usd
        )
      `)
      .is('deleted_at', null) // Only show active (non-deleted) projects
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
          project_cash_box: Array.isArray(project.project_cash_box)
            ? project.project_cash_box[0]
            : project.project_cash_box,
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
   * Get all projects for a specific client
   */
  async getProjectsByClient(clientId: string): Promise<ProjectWithDetails[]> {
    console.log('🔍 getProjectsByClient: Buscando proyectos para client_id:', clientId);

    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project_cash_box(
          current_balance_ars,
          current_balance_usd,
          total_income_ars,
          total_income_usd
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error en query de proyectos:', error);
      throw error;
    }

    console.log(`✅ Query retornó ${data?.length || 0} proyectos:`, data?.map(p => ({
      id: p.id,
      name: p.name,
      code: p.code,
      status: p.status,
      client_id: p.client_id
    })));

    // Calculate progress and next payments for each project using Promise.allSettled
    // This ensures we process all projects even if some fail
    const projectsWithDetailsSettled = await Promise.allSettled(
      (data || []).map(async (project) => {
        try {
          console.log(`📊 Procesando proyecto: ${project.name} (${project.code})`);
          const progress = await this.calculateProgress(project.id);
          const nextPayment = await this.getNextPayment(project.id);

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
            project_cash_box: Array.isArray(project.project_cash_box)
              ? project.project_cash_box[0]
              : project.project_cash_box,
          } as ProjectWithDetails;
        } catch (error) {
          console.error(`❌ Error procesando proyecto ${project.name} (${project.code}):`, error);
          throw error;
        }
      })
    );

    // Filter successful results and log failures
    const projectsWithDetails = projectsWithDetailsSettled
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Proyecto ${index + 1} procesado exitosamente`);
          return result.value;
        } else {
          console.error(`❌ Proyecto ${index + 1} falló:`, result.reason);
          return null;
        }
      })
      .filter((p): p is ProjectWithDetails => p !== null);

    console.log(`📋 Retornando ${projectsWithDetails.length} de ${data?.length || 0} proyectos`);
    return projectsWithDetails;
  }

  /**
   * Get single project by ID (similar to mock service interface)
   */
  async getProject(id: string): Promise<ProjectWithDetails | null> {
    const { data, error} = await supabase
      .from(this.tableName)
      .select(`
        *,
        project_cash_box(
          current_balance_ars,
          current_balance_usd,
          total_income_ars,
          total_income_usd
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
      project_cash_box: Array.isArray(data.project_cash_box)
        ? data.project_cash_box[0]
        : data.project_cash_box,
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
        project_cash_box(
          current_balance_ars,
          current_balance_usd,
          total_income_ars,
          total_income_usd,
          total_expenses_ars,
          total_expenses_usd
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
      project_cash_box: Array.isArray(data.project_cash_box)
        ? data.project_cash_box[0]
        : data.project_cash_box,
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
   * Delete project (SOFT DELETE - preserves financial history)
   * Projects are never physically deleted to maintain audit trail
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      // Verify project exists
      const project = await this.getById(id);
      if (!project.data) {
        throw new Error('Proyecto no encontrado');
      }

      // Check if project has financial movements
      const { data: movements } = await supabase
        .from('cash_movements')
        .select('id')
        .eq('project_id', id)
        .limit(1);

      if (movements && movements.length > 0) {
        console.log(`⚠️  Proyecto ${id} tiene movimientos financieros - usando soft delete`);
      }

      // Soft delete: mark as deleted instead of removing
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error soft-deleting project:', error);
        throw error;
      }

      console.log(`✅ Proyecto soft-deleted: ${id}`);
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return false;
    }
  }

  /**
   * Restore a soft-deleted project
   */
  async restoreProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error restoring project:', error);
        throw error;
      }

      console.log(`✅ Proyecto restaurado: ${id}`);
      return true;
    } catch (error) {
      console.error('Error in restoreProject:', error);
      return false;
    }
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