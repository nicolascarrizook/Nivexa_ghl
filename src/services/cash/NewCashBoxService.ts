import { supabase } from '@/config/supabase';

// ============================================
// NEW CASH BOX SERVICE - SISTEMA ACTUALIZADO
// ============================================
// Este servicio usa únicamente las tablas nuevas:
// - master_cash (Caja Maestra/Financiera)
// - project_cash (Caja del Proyecto)
// - admin_cash (Caja Administrativa)
// - cash_movements (Movimientos)
// ============================================

export type Currency = 'ARS' | 'USD';

export type MovementType = 
  | 'project_payment'     // Pago de cliente en proyecto
  | 'project_expense'     // Gasto del proyecto
  | 'salary_payment'      // Pago de salario
  | 'operational_expense' // Gasto operativo
  | 'tax_payment'        // Pago de impuestos
  | 'investment'         // Inversión
  | 'transfer'           // Transferencia entre cajas (incluye honorarios)
  | 'adjustment'         // Ajuste
  | 'other';             // Otros

export interface MasterCash {
  id: string;
  balance: number; // Legacy field, kept for backward compatibility
  balance_ars: number; // Balance in Argentine Pesos
  balance_usd: number; // Balance in US Dollars
  last_movement_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCash {
  id: string;
  project_id: string;
  current_balance_ars: number; // Balance in Argentine Pesos
  current_balance_usd: number; // Balance in US Dollars
  total_income_ars: number; // Total income in ARS
  total_income_usd: number; // Total income in USD
  total_expenses_ars: number; // Total expenses in ARS
  total_expenses_usd: number; // Total expenses in USD
  budget_allocated_ars: number; // Budget allocated in ARS
  budget_allocated_usd: number; // Budget allocated in USD
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminCash {
  id: string;
  balance: number;
  total_collected: number;
  last_movement_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CashMovement {
  id: string;
  movement_type: string; // 'project_income', 'master_duplication', 'fee_collection', etc.
  source_type: string | null; // 'master', 'admin', 'project', 'external'
  source_id: string | null;
  destination_type: string | null; // 'master', 'admin', 'project', 'external'
  destination_id: string | null;
  amount: number;
  description: string;
  project_id?: string;
  installment_id?: string;
  fee_collection_id?: string;
  metadata?: any;
  balance_after?: number; // Calculated field, not in DB
  created_at: string;
  created_by?: string;
}

class NewCashBoxService {
  private static instance: NewCashBoxService;

  private constructor() {}

  public static getInstance(): NewCashBoxService {
    if (!NewCashBoxService.instance) {
      NewCashBoxService.instance = new NewCashBoxService();
    }
    return NewCashBoxService.instance;
  }

  // ============================================
  // MASTER CASH (Caja Maestra/Financiera)
  // ============================================

  async getMasterCash(organizationId?: string): Promise<MasterCash | null> {
    // Only one master cash exists (no organization_id field)
    const { data, error } = await supabase
      .from('master_cash')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching master cash:', error);
      throw error;
    }

    // Create if doesn't exist
    if (!data) {
      return await this.createMasterCash();
    }

    return data;
  }

  async createMasterCash(): Promise<MasterCash> {
    const { data, error } = await supabase
      .from('master_cash')
      .insert({
        balance: 0,
        last_movement_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating master cash:', error);
      throw error;
    }

    return data;
  }

  // ============================================
  // PROJECT CASH (Caja del Proyecto)
  // ============================================

  async getProjectCash(projectId: string): Promise<ProjectCash | null> {
    const { data, error } = await supabase
      .from('project_cash_box')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching project cash:', error);
      throw error;
    }

    return data;
  }

  async createProjectCash(projectId: string): Promise<ProjectCash> {
    const { data, error } = await supabase
      .from('project_cash_box')
      .insert({
        project_id: projectId,
        current_balance_ars: 0,
        current_balance_usd: 0,
        total_income_ars: 0,
        total_income_usd: 0,
        total_expenses_ars: 0,
        total_expenses_usd: 0,
        budget_allocated_ars: 0,
        budget_allocated_usd: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project cash box:', error);
      throw error;
    }

    return data;
  }

  // ============================================
  // ADMIN CASH (Caja Administrativa)
  // ============================================

  async getAdminCash(organizationId?: string): Promise<AdminCash | null> {
    // Only one admin cash exists (no organization_id field)
    const { data, error } = await supabase
      .from('admin_cash')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching admin cash:', error);
      throw error;
    }

    // Create if doesn't exist
    if (!data) {
      return await this.createAdminCash();
    }

    return data;
  }

  async createAdminCash(): Promise<AdminCash> {
    const { data, error } = await supabase
      .from('admin_cash')
      .insert({
        balance: 0,
        total_collected: 0,
        last_movement_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin cash:', error);
      throw error;
    }

    return data;
  }

  // ============================================
  // CASH MOVEMENTS (Movimientos)
  // ============================================

  async getCashMovements(
    cashType: 'master' | 'project' | 'admin',
    cashId: string,
    limit = 50
  ): Promise<CashMovement[]> {
    // Query movements where this cash box is either source or destination
    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .or(`source_id.eq.${cashId},destination_id.eq.${cashId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }

    return data || [];
  }

  async recordMovement(params: {
    cashType: 'master' | 'project' | 'admin';
    cashId: string;
    movementType: MovementType;
    amount: number;
    description: string;
    projectId?: string;
    installmentId?: string;
    reference?: string;
  }): Promise<CashMovement> {
    // Map our movement types to the database schema
    let dbMovementType: string;
    if (params.movementType === 'project_payment') {
      dbMovementType = 'project_income';
    } else if (params.movementType === 'transfer') {
      dbMovementType = 'fee_collection';
    } else {
      dbMovementType = 'adjustment';
    }

    // Determine source and destination based on amount and cash type
    let sourceType: string;
    let sourceId: string | null;
    let destinationType: string;
    let destinationId: string;

    if (params.amount > 0) {
      // Money coming IN
      sourceType = 'external';
      sourceId = null;
      destinationType = params.cashType;
      destinationId = params.cashId;
    } else {
      // Money going OUT
      sourceType = params.cashType;
      sourceId = params.cashId;
      destinationType = 'external';
      destinationId = params.cashId; // Still track which cash it came from
    }

    // Special case for transfers between cash boxes
    if (params.movementType === 'transfer') {
      // This is handled by calling recordMovement twice with opposite signs
    }

    // Record movement
    const { data: movement, error: movementError } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: dbMovementType,
        source_type: sourceType,
        source_id: sourceId,
        destination_type: destinationType,
        destination_id: destinationId,
        amount: Math.abs(params.amount), // Store positive amount
        description: params.description,
        project_id: params.projectId,
        installment_id: params.installmentId,
        metadata: params.reference ? { reference: params.reference } : {}
      })
      .select()
      .single();

    if (movementError) {
      console.error('Error recording movement:', movementError);
      throw movementError;
    }

    // Update cash balance
    if (params.cashType === 'master') {
      await this.updateMasterCashBalance(params.cashId, params.amount);
    } else if (params.cashType === 'project') {
      await this.updateProjectCashBalance(params.cashId, params.amount);
    } else if (params.cashType === 'admin') {
      await this.updateAdminCashBalance(params.cashId, params.amount);
    }

    return movement as any; // Cast to our interface temporarily
  }

  // ============================================
  // PAYMENT PROCESSING
  // ============================================

  async processProjectPayment(params: {
    organizationId?: string; // Not used anymore but kept for compatibility
    projectId: string;
    amount: number;
    description: string;
    installmentId?: string;
    currency?: Currency; // Add currency parameter (defaults to ARS)
  }): Promise<void> {
    try {
      const currency = params.currency || 'ARS'; // Default to ARS for backward compatibility

      // Get project cash box
      const { data: projectCash, error: projectCashError } = await supabase
        .from('project_cash_box')
        .select('*')
        .eq('project_id', params.projectId)
        .single();

      if (projectCashError || !projectCash) {
        console.error('Project cash box not found for project:', params.projectId);
        console.error('Error:', projectCashError);
        return;
      }

      // Get master cash (only one exists)
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        console.error('Master cash not found');
        return;
      }

      // Create movements - ONE income from client, tracked in both boxes
      const movements = [
        // REAL income from client to project (THIS is the actual payment)
        {
          movement_type: 'project_income',
          source_type: 'external',
          source_id: null,
          destination_type: 'project',
          destination_id: projectCash.id,
          amount: params.amount,
          description: params.description,
          project_id: params.projectId,
          installment_id: params.installmentId || null,
          metadata: { currency },
        },
        // Internal control record in master cash (NOT a new income)
        {
          movement_type: 'master_duplication', // Different type to avoid counting as income
          source_type: 'project',
          source_id: projectCash.id,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: params.amount,
          description: `Control financiero - ${params.description}`,
          project_id: params.projectId,
          installment_id: params.installmentId || null,
          metadata: { currency },
        }
      ];

      // Insert movements
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert(movements);

      if (movementError) {
        console.error('Error creating movements:', movementError);
        throw movementError;
      }

      // Update balances based on currency
      if (currency === 'ARS') {
        await Promise.all([
          // Update project cash box (ARS)
          supabase
            .from('project_cash_box')
            .update({
              current_balance_ars: projectCash.current_balance_ars + params.amount,
              total_income_ars: projectCash.total_income_ars + params.amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectCash.id),

          // Update master cash (ARS)
          supabase
            .from('master_cash')
            .update({
              balance: (masterCash.balance || 0) + params.amount, // Legacy total
              balance_ars: (masterCash.balance_ars || 0) + params.amount,
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id)
        ]);
      } else {
        // USD payment
        await Promise.all([
          // Update project cash box (USD)
          supabase
            .from('project_cash_box')
            .update({
              current_balance_usd: projectCash.current_balance_usd + params.amount,
              total_income_usd: projectCash.total_income_usd + params.amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectCash.id),

          // Update master cash (USD)
          supabase
            .from('master_cash')
            .update({
              balance: (masterCash.balance || 0) + params.amount, // Legacy total
              balance_usd: (masterCash.balance_usd || 0) + params.amount,
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id)
        ]);
      }

      console.log(`✅ Payment processed: ${params.amount} ${currency} - ONE income recorded in TWO cash boxes`);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Procesa un gasto del proyecto (pago a proveedor/contractor)
   * Descuenta el dinero de la caja del proyecto
   * Si el pago es en ARS pero no hay suficientes pesos, convierte desde USD
   */
  async processProjectExpense(params: {
    projectId: string;
    amount: number;
    description: string;
    contractorPaymentId?: string;
    currency?: Currency;
  }): Promise<void> {
    try {
      const paymentCurrency = params.currency || 'ARS';

      // Get project cash
      const { data: projectCash, error: projectCashError } = await supabase
        .from('project_cash_box')
        .select('*')
        .eq('project_id', params.projectId)
        .single();

      if (projectCashError || !projectCash) {
        console.error('Project cash not found');
        throw new Error('Project cash not found');
      }

      // Get master cash
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        console.error('Master cash not found');
        throw new Error('Master cash not found');
      }

      // Verificar si hay fondos suficientes según la moneda del pago
      if (paymentCurrency === 'ARS') {
        const arsNeeded = params.amount;
        const arsAvailable = projectCash.balance_ars;

        if (arsAvailable < arsNeeded) {
          console.log(`⚠️ Fondos insuficientes en ARS. Necesario: ${arsNeeded}, Disponible: ${arsAvailable}`);

          // Calcular cuántos pesos faltan
          const arsMissing = arsNeeded - arsAvailable;

          // Obtener tasa de cambio actual
          const { data: exchangeRate } = await supabase
            .from('exchange_rates')
            .select('rate')
            .eq('from_currency', 'USD')
            .eq('to_currency', 'ARS')
            .order('effective_date', { ascending: false })
            .limit(1)
            .single();

          const rate = exchangeRate?.rate ? parseFloat(exchangeRate.rate.toString()) : 1000;

          // Calcular USD necesarios (redondeado hacia arriba para asegurar suficientes pesos)
          const usdNeeded = Math.ceil(arsMissing / rate * 100) / 100; // 2 decimales

          console.log(`💱 Conversión necesaria: ${usdNeeded} USD → ${arsMissing} ARS (Tasa: ${rate})`);

          // Verificar que project_cash tiene suficientes USD
          if (projectCash.balance_usd < usdNeeded) {
            throw new Error(
              `Fondos insuficientes en la caja del proyecto. ` +
              `ARS disponibles: $${arsAvailable.toFixed(2)}, ` +
              `USD disponibles: $${projectCash.balance_usd.toFixed(2)}, ` +
              `USD necesarios para conversión: $${usdNeeded.toFixed(2)}`
            );
          }

          // Convertir USD a ARS dentro de project_cash
          const arsConverted = usdNeeded * rate;

          await supabase
            .from('project_cash_box')
            .update({
              balance_usd: projectCash.balance_usd - usdNeeded,
              balance_ars: projectCash.balance_ars + arsConverted,
              balance: (projectCash.balance_usd - usdNeeded) * rate + (projectCash.balance_ars + arsConverted), // Legacy total
              last_movement_at: new Date().toISOString()
            })
            .eq('id', projectCash.id);

          // Registrar el movimiento de conversión
          await supabase
            .from('cash_movements')
            .insert({
              movement_type: 'currency_exchange',
              source_type: 'project',
              source_id: projectCash.id,
              destination_type: 'project',
              destination_id: projectCash.id,
              amount: arsConverted,
              description: `Conversión interna: ${usdNeeded} USD → ${arsConverted.toFixed(2)} ARS`,
              project_id: params.projectId,
              metadata: {
                usd_amount: usdNeeded,
                ars_amount: arsConverted,
                exchange_rate: rate,
                reason: 'insufficient_ars_for_payment'
              }
            });

          console.log(`✅ Conversión completada: ${usdNeeded} USD → ${arsConverted.toFixed(2)} ARS`);

          // Actualizar balance en memoria
          projectCash.balance_ars += arsConverted;
          projectCash.balance_usd -= usdNeeded;
        }

        // Verificar fondos suficientes después de conversión
        if (projectCash.balance_ars < arsNeeded) {
          throw new Error(`Fondos insuficientes. Balance ARS: ${projectCash.balance_ars}, Requerido: ${arsNeeded}`);
        }
      } else {
        // Pago en USD
        const usdNeeded = params.amount;
        if (projectCash.balance_usd < usdNeeded) {
          throw new Error(
            `Fondos insuficientes en USD. Disponible: $${projectCash.balance_usd.toFixed(2)}, ` +
            `Requerido: $${usdNeeded.toFixed(2)}`
          );
        }
      }

      // Create movement - expense from project
      const movement = {
        movement_type: 'expense',
        source_type: 'project',
        source_id: projectCash.id,
        destination_type: 'external', // El dinero sale a un proveedor externo
        destination_id: null,
        amount: params.amount,
        description: params.description,
        project_id: params.projectId,
        metadata: params.contractorPaymentId ? {
          contractor_payment_id: params.contractorPaymentId,
          currency: params.currency || 'ARS'
        } : null,
      };

      // Insert movement
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert(movement);

      if (movementError) {
        console.error('Error creating expense movement:', movementError);
        throw movementError;
      }

      // Update balances según la moneda del pago
      if (paymentCurrency === 'ARS') {
        // Descontar pesos de project_cash y master_cash
        await Promise.all([
          supabase
            .from('project_cash_box')
            .update({
              balance_ars: projectCash.balance_ars - params.amount,
              balance: (projectCash.balance_usd * 1000) + (projectCash.balance_ars - params.amount), // Legacy total
              last_movement_at: new Date().toISOString()
            })
            .eq('id', projectCash.id),

          supabase
            .from('master_cash')
            .update({
              balance_ars: masterCash.balance_ars - params.amount,
              balance: (masterCash.balance_usd * 1000) + (masterCash.balance_ars - params.amount), // Legacy total
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id)
        ]);

        console.log(`✅ Gasto procesado: -$${params.amount} ARS - Descontado de project_cash y master_cash`);
      } else {
        // Descontar dólares de project_cash y master_cash
        await Promise.all([
          supabase
            .from('project_cash_box')
            .update({
              balance_usd: projectCash.balance_usd - params.amount,
              balance: ((projectCash.balance_usd - params.amount) * 1000) + projectCash.balance_ars, // Legacy total
              last_movement_at: new Date().toISOString()
            })
            .eq('id', projectCash.id),

          supabase
            .from('master_cash')
            .update({
              balance_usd: masterCash.balance_usd - params.amount,
              balance: ((masterCash.balance_usd - params.amount) * 1000) + masterCash.balance_ars, // Legacy total
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id)
        ]);

        console.log(`✅ Gasto procesado: -$${params.amount} USD - Descontado de project_cash y master_cash`);
      }
    } catch (error) {
      console.error('Error processing project expense:', error);
      throw error;
    }
  }

  // ============================================
  // BALANCE UPDATES
  // ============================================

  private async updateMasterCashBalance(cashId: string, amount: number): Promise<void> {
    const { data: current } = await supabase
      .from('master_cash')
      .select('balance')
      .eq('id', cashId)
      .single();

    if (current) {
      await supabase
        .from('master_cash')
        .update({
          balance: current.balance + amount,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', cashId);
    }
  }

  private async updateProjectCashBalance(cashId: string, amount: number): Promise<void> {
    const { data: current } = await supabase
      .from('project_cash_box')
      .select('balance, total_received')
      .eq('id', cashId)
      .single();

    if (current) {
      await supabase
        .from('project_cash_box')
        .update({
          balance: current.balance + amount,
          total_received: amount > 0 ? current.total_received + amount : current.total_received,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', cashId);
    }
  }

  private async updateAdminCashBalance(cashId: string, amount: number): Promise<void> {
    const { data: current } = await supabase
      .from('admin_cash')
      .select('balance, total_collected')
      .eq('id', cashId)
      .single();

    if (current) {
      await supabase
        .from('admin_cash')
        .update({
          balance: current.balance + amount,
          total_collected: amount > 0 ? current.total_collected + amount : current.total_collected,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', cashId);
    }
  }

  // ============================================
  // ADMIN FEE COLLECTION (MANUAL)
  // ============================================

  /**
   * Collect admin fee manually from Master Cash to Admin Cash
   * This is used when the architect wants to manually withdraw fees
   * Does NOT affect Project Cash (client doesn't see this operation)
   */
  async collectAdminFeeManual(params: {
    amount: number;
    currency: Currency;
    description: string;
    projectId?: string; // Optional, only for tracking/description
  }): Promise<void> {
    try {
      const { amount, currency, description, projectId } = params;

      // Get master cash
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        throw new Error('Master cash not found');
      }

      // Get admin cash
      const adminCash = await this.getAdminCash();
      if (!adminCash) {
        throw new Error('Admin cash not found');
      }

      // Check sufficient balance in correct currency
      const currentBalance = currency === 'ARS'
        ? (masterCash.balance_ars || 0)
        : (masterCash.balance_usd || 0);

      if (currentBalance < amount) {
        throw new Error(
          `Fondos insuficientes en Master Cash ${currency}. ` +
          `Disponible: $${currentBalance.toFixed(2)}, Requerido: $${amount.toFixed(2)}`
        );
      }

      // Create cash movement
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'admin_fee_collection',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'admin',
          destination_id: adminCash.id,
          amount: amount,
          description: description,
          project_id: projectId || null,
          metadata: { currency, manual: true },
        });

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Update balances based on currency
      if (currency === 'ARS') {
        await Promise.all([
          // Decrease master cash ARS
          supabase
            .from('master_cash')
            .update({
              balance: (masterCash.balance || 0) - amount, // Legacy total
              balance_ars: (masterCash.balance_ars || 0) - amount,
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id),

          // Increase admin cash (legacy field only for now)
          supabase
            .from('admin_cash')
            .update({
              balance: (adminCash.balance || 0) + amount,
              total_collected: (adminCash.total_collected || 0) + amount,
              last_movement_at: new Date().toISOString()
            })
            .eq('id', adminCash.id)
        ]);
      } else {
        // USD
        await Promise.all([
          // Decrease master cash USD
          supabase
            .from('master_cash')
            .update({
              balance: (masterCash.balance || 0) - amount, // Legacy total
              balance_usd: (masterCash.balance_usd || 0) - amount,
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id),

          // Increase admin cash (legacy field only for now)
          supabase
            .from('admin_cash')
            .update({
              balance: (adminCash.balance || 0) + amount,
              total_collected: (adminCash.total_collected || 0) + amount,
              last_movement_at: new Date().toISOString()
            })
            .eq('id', adminCash.id)
        ]);
      }

      console.log(`✅ Admin fee collected manually: ${amount} ${currency} from Master Cash → Admin Cash`);
    } catch (error) {
      console.error('Error collecting admin fee:', error);
      throw error;
    }
  }

  // ============================================
  // DASHBOARD SUMMARY
  // ============================================

  async getDashboardSummary(organizationId?: string): Promise<{
    masterBalanceARS: number;
    masterBalanceUSD: number;
    adminBalanceARS: number;
    adminBalanceUSD: number;
    projectsCount: number;
    projectsTotalARS: number;
    projectsTotalUSD: number;
    monthlyIncomeARS: number;
    monthlyIncomeUSD: number;
    monthlyExpensesARS: number;
    monthlyExpensesUSD: number;
  }> {
    try {
      const master = await this.getMasterCash();
      const admin = await this.getAdminCash();

      const { data: projects } = await supabase
        .from('project_cash_box')
        .select('current_balance_ars, current_balance_usd');

      const projectsTotalARS = projects?.reduce((sum, p) => sum + (p.current_balance_ars || 0), 0) || 0;
      const projectsTotalUSD = projects?.reduce((sum, p) => sum + (p.current_balance_usd || 0), 0) || 0;

      // Calculate monthly income and expenses
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: movements } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyIncomeARS = movements?.filter(m =>
        (m.movement_type === 'project_income' || m.movement_type === 'project_payment') &&
        m.metadata?.currency === 'ARS'
      ).reduce((sum, m) => sum + m.amount, 0) || 0;

      const monthlyIncomeUSD = movements?.filter(m =>
        (m.movement_type === 'project_income' || m.movement_type === 'project_payment') &&
        m.metadata?.currency === 'USD'
      ).reduce((sum, m) => sum + m.amount, 0) || 0;

      const monthlyExpensesARS = movements?.filter(m =>
        m.movement_type === 'operational_expense' &&
        m.metadata?.currency === 'ARS'
      ).reduce((sum, m) => sum + Math.abs(m.amount), 0) || 0;

      const monthlyExpensesUSD = movements?.filter(m =>
        m.movement_type === 'operational_expense' &&
        m.metadata?.currency === 'USD'
      ).reduce((sum, m) => sum + Math.abs(m.amount), 0) || 0;

      return {
        masterBalanceARS: master?.balance_ars || 0,
        masterBalanceUSD: master?.balance_usd || 0,
        adminBalanceARS: admin?.balance_ars || 0,
        adminBalanceUSD: admin?.balance_usd || 0,
        projectsCount: projects?.length || 0,
        projectsTotalARS,
        projectsTotalUSD,
        monthlyIncomeARS,
        monthlyIncomeUSD,
        monthlyExpensesARS,
        monthlyExpensesUSD,
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return {
        masterBalanceARS: 0,
        masterBalanceUSD: 0,
        adminBalanceARS: 0,
        adminBalanceUSD: 0,
        projectsCount: 0,
        projectsTotalARS: 0,
        projectsTotalUSD: 0,
        monthlyIncomeARS: 0,
        monthlyIncomeUSD: 0,
        monthlyExpensesARS: 0,
        monthlyExpensesUSD: 0,
      };
    }
  }
}

export const newCashBoxService = NewCashBoxService.getInstance();