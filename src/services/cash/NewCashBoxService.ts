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
        balance_ars: 0,
        balance_usd: 0,
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

      // Capture balance snapshots BEFORE payment
      const projectBalanceBefore = {
        ars: projectCash.current_balance_ars || 0,
        usd: projectCash.current_balance_usd || 0,
      };

      const masterBalanceBefore = {
        ars: masterCash.balance_ars || 0,
        usd: masterCash.balance_usd || 0,
      };

      // Calculate balance AFTER payment
      const projectBalanceAfter = {
        ars: currency === 'ARS' ? projectBalanceBefore.ars + params.amount : projectBalanceBefore.ars,
        usd: currency === 'USD' ? projectBalanceBefore.usd + params.amount : projectBalanceBefore.usd,
      };

      const masterBalanceAfter = {
        ars: currency === 'ARS' ? masterBalanceBefore.ars + params.amount : masterBalanceBefore.ars,
        usd: currency === 'USD' ? masterBalanceBefore.usd + params.amount : masterBalanceBefore.usd,
      };

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
          currency: currency,
          description: params.description,
          project_id: params.projectId,
          installment_id: params.installmentId || null,
          balance_before_ars: projectBalanceBefore.ars,
          balance_after_ars: projectBalanceAfter.ars,
          balance_before_usd: projectBalanceBefore.usd,
          balance_after_usd: projectBalanceAfter.usd,
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
          currency: currency,
          description: `Control financiero - ${params.description}`,
          project_id: params.projectId,
          installment_id: params.installmentId || null,
          balance_before_ars: masterBalanceBefore.ars,
          balance_after_ars: masterBalanceAfter.ars,
          balance_before_usd: masterBalanceBefore.usd,
          balance_after_usd: masterBalanceAfter.usd,
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
    contractorName?: string;
  }): Promise<string> {
    try {
      const paymentCurrency = params.currency || 'ARS';

      // Get project cash and project info
      const { data: projectCash, error: projectCashError } = await supabase
        .from('project_cash_box')
        .select(`
          *,
          project:project_id (
            name,
            code
          )
        `)
        .eq('project_id', params.projectId)
        .single();

      if (projectCashError || !projectCash) {
        console.error('Project cash not found');
        throw new Error('Project cash not found');
      }

      const projectInfo = projectCash.project as any;
      const projectName = projectInfo?.name || 'Proyecto';
      const projectCode = projectInfo?.code || '';

      // Get master cash
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        console.error('Master cash not found');
        throw new Error('Master cash not found');
      }

      // Verificar si hay fondos suficientes según la moneda del pago
      if (paymentCurrency === 'ARS') {
        const arsNeeded = params.amount;
        const arsAvailable = projectCash.current_balance_ars || 0;

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
          if (projectCash.current_balance_usd < usdNeeded) {
            const totalDeficitArs = arsNeeded - arsAvailable;
            throw new Error(
              `Fondos insuficientes en la caja del proyecto.\n\n` +
              `💵 Moneda del pago: ARS\n` +
              `💰 Monto requerido: $${arsNeeded.toFixed(2)} ARS\n\n` +
              `📊 Balances disponibles:\n` +
              `   • ARS: $${arsAvailable.toFixed(2)}\n` +
              `   • USD: $${projectCash.current_balance_usd.toFixed(2)}\n\n` +
              `⚠️ Se intentó conversión automática de USD a ARS:\n` +
              `   • Faltan: $${arsMissing.toFixed(2)} ARS\n` +
              `   • Se necesitan: $${usdNeeded.toFixed(2)} USD para convertir\n` +
              `   • Déficit USD: $${(usdNeeded - projectCash.current_balance_usd).toFixed(2)} USD\n\n` +
              `Por favor, registre ingresos adicionales al proyecto antes de realizar este pago.`
            );
          }

          // Convertir USD a ARS dentro de project_cash
          const arsConverted = usdNeeded * rate;

          // Capture balance snapshots BEFORE conversion
          const conversionBalanceBefore = {
            ars: projectCash.current_balance_ars || 0,
            usd: projectCash.current_balance_usd || 0,
          };

          await supabase
            .from('project_cash_box')
            .update({
              current_balance_usd: (projectCash.current_balance_usd || 0) - usdNeeded,
              current_balance_ars: (projectCash.current_balance_ars || 0) + arsConverted,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectCash.id);

          // Calculate balance AFTER conversion
          const conversionBalanceAfter = {
            ars: conversionBalanceBefore.ars + arsConverted,
            usd: conversionBalanceBefore.usd - usdNeeded,
          };

          // Registrar el movimiento de conversión con snapshots
          await supabase
            .from('cash_movements')
            .insert({
              movement_type: 'adjustment',
              source_type: 'project',
              source_id: projectCash.id,
              destination_type: 'project',
              destination_id: projectCash.id,
              amount: arsConverted,
              currency: 'ARS',
              description: `Conversión interna: ${usdNeeded} USD → ${arsConverted.toFixed(2)} ARS`,
              project_id: params.projectId,
              balance_before_ars: conversionBalanceBefore.ars,
              balance_after_ars: conversionBalanceAfter.ars,
              balance_before_usd: conversionBalanceBefore.usd,
              balance_after_usd: conversionBalanceAfter.usd,
              metadata: {
                usd_amount: usdNeeded,
                ars_amount: arsConverted,
                exchange_rate: rate,
                reason: 'insufficient_ars_for_payment'
              }
            });

          console.log(`✅ Conversión completada: ${usdNeeded} USD → ${arsConverted.toFixed(2)} ARS`);

          // Actualizar balance en memoria
          projectCash.current_balance_ars = (projectCash.current_balance_ars || 0) + arsConverted;
          projectCash.current_balance_usd = (projectCash.current_balance_usd || 0) - usdNeeded;
        }

        // Verificar fondos suficientes después de conversión
        if ((projectCash.current_balance_ars || 0) < arsNeeded) {
          throw new Error(
            `Fondos insuficientes después de conversión.\n\n` +
            `💰 Monto requerido: $${arsNeeded.toFixed(2)} ARS\n` +
            `📊 Balance disponible: $${(projectCash.current_balance_ars || 0).toFixed(2)} ARS\n` +
            `❌ Déficit: $${(arsNeeded - (projectCash.current_balance_ars || 0)).toFixed(2)} ARS\n\n` +
            `Este error no debería ocurrir. Por favor contacte soporte técnico.`
          );
        }
      } else {
        // Pago en USD
        const usdNeeded = params.amount;
        const usdAvailable = projectCash.current_balance_usd || 0;
        if (usdAvailable < usdNeeded) {
          const deficit = usdNeeded - usdAvailable;
          throw new Error(
            `Fondos insuficientes en la caja del proyecto.\n\n` +
            `💵 Moneda del pago: USD\n` +
            `💰 Monto requerido: $${usdNeeded.toFixed(2)} USD\n` +
            `📊 Balance disponible: $${usdAvailable.toFixed(2)} USD\n` +
            `❌ Déficit: $${deficit.toFixed(2)} USD\n\n` +
            `Por favor, registre un ingreso adicional al proyecto antes de realizar este pago.`
          );
        }
      }

      // Capture balance snapshots BEFORE the expense (after any conversion)
      const projectBalanceBefore = {
        ars: projectCash.current_balance_ars || 0,
        usd: projectCash.current_balance_usd || 0,
      };

      // Calculate balance AFTER the expense
      const projectBalanceAfter = {
        ars: paymentCurrency === 'ARS' ? projectBalanceBefore.ars - params.amount : projectBalanceBefore.ars,
        usd: paymentCurrency === 'USD' ? projectBalanceBefore.usd - params.amount : projectBalanceBefore.usd,
      };

      // Create movement - expense from project with snapshots
      const movement = {
        movement_type: 'expense',
        source_type: 'project',
        source_id: projectCash.id,
        destination_type: 'external', // El dinero sale a un proveedor externo
        destination_id: null,
        amount: params.amount,
        currency: paymentCurrency,
        description: params.description,
        project_id: params.projectId,
        balance_before_ars: projectBalanceBefore.ars,
        balance_after_ars: projectBalanceAfter.ars,
        balance_before_usd: projectBalanceBefore.usd,
        balance_after_usd: projectBalanceAfter.usd,
        metadata: params.contractorPaymentId ? {
          contractor_payment_id: params.contractorPaymentId,
          currency: params.currency || 'ARS'
        } : null,
      };

      // Insert movement and get the ID
      const { data: insertedMovement, error: movementError } = await supabase
        .from('cash_movements')
        .insert(movement)
        .select('id')
        .single();

      if (movementError || !insertedMovement) {
        console.error('Error creating expense movement:', movementError);
        throw movementError || new Error('Failed to create movement');
      }

      // Capture master cash balance snapshots BEFORE the expense
      const masterBalanceBefore = {
        ars: masterCash.balance_ars || 0,
        usd: masterCash.balance_usd || 0,
      };

      // Calculate master balance AFTER the expense
      const masterBalanceAfter = {
        ars: paymentCurrency === 'ARS' ? masterBalanceBefore.ars - params.amount : masterBalanceBefore.ars,
        usd: paymentCurrency === 'USD' ? masterBalanceBefore.usd - params.amount : masterBalanceBefore.usd,
      };

      // Create mirrored expense movement from master cash for traceability with snapshots
      const masterMovement = {
        movement_type: 'expense',
        source_type: 'master',
        source_id: masterCash.id,
        destination_type: 'external',
        destination_id: null,
        amount: params.amount,
        currency: paymentCurrency,
        description: `${projectCode ? `[${projectCode}] ` : ''}${params.description}`,
        project_id: params.projectId,
        balance_before_ars: masterBalanceBefore.ars,
        balance_after_ars: masterBalanceAfter.ars,
        balance_before_usd: masterBalanceBefore.usd,
        balance_after_usd: masterBalanceAfter.usd,
        metadata: {
          currency: paymentCurrency,
          contractor_payment_id: params.contractorPaymentId,
          contractor_name: params.contractorName,
          project_name: projectName,
          project_code: projectCode,
          mirrored_from_project: true,
          original_movement_id: insertedMovement.id,
        },
      };

      const { error: masterMovementError } = await supabase
        .from('cash_movements')
        .insert(masterMovement);

      if (masterMovementError) {
        console.error('Error creating master cash movement:', masterMovementError);
        // Don't throw - the main movement was successful
      }

      // Update balances según la moneda del pago
      if (paymentCurrency === 'ARS') {
        // Descontar pesos de project_cash y master_cash
        await Promise.all([
          supabase
            .from('project_cash_box')
            .update({
              current_balance_ars: (projectCash.current_balance_ars || 0) - params.amount,
              total_expenses_ars: (projectCash.total_expenses_ars || 0) + params.amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectCash.id),

          supabase
            .from('master_cash')
            .update({
              balance_ars: (masterCash.balance_ars || 0) - params.amount,
              balance: ((masterCash.balance_usd || 0) * 1000) + ((masterCash.balance_ars || 0) - params.amount),
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
              current_balance_usd: (projectCash.current_balance_usd || 0) - params.amount,
              total_expenses_usd: (projectCash.total_expenses_usd || 0) + params.amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectCash.id),

          supabase
            .from('master_cash')
            .update({
              balance_usd: (masterCash.balance_usd || 0) - params.amount,
              balance: (((masterCash.balance_usd || 0) - params.amount) * 1000) + (masterCash.balance_ars || 0),
              last_movement_at: new Date().toISOString()
            })
            .eq('id', masterCash.id)
        ]);

        console.log(`✅ Gasto procesado: -$${params.amount} USD - Descontado de project_cash y master_cash`);
      }

      return insertedMovement.id;
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
    percentage?: number; // Optional, fee percentage for display
  }): Promise<void> {
    try {
      const { amount, currency, description, projectId, percentage } = params;

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

      // Capture balance snapshots BEFORE the fee collection
      const masterBalanceBefore = {
        ars: masterCash.balance_ars || 0,
        usd: masterCash.balance_usd || 0,
      };

      const adminBalanceBefore = {
        ars: adminCash.balance_ars || 0,
        usd: adminCash.balance_usd || 0,
      };

      // Calculate balance AFTER the fee collection
      const masterBalanceAfter = {
        ars: currency === 'ARS' ? masterBalanceBefore.ars - amount : masterBalanceBefore.ars,
        usd: currency === 'USD' ? masterBalanceBefore.usd - amount : masterBalanceBefore.usd,
      };

      const adminBalanceAfter = {
        ars: currency === 'ARS' ? adminBalanceBefore.ars + amount : adminBalanceBefore.ars,
        usd: currency === 'USD' ? adminBalanceBefore.usd + amount : adminBalanceBefore.usd,
      };

      // Create cash movement with balance snapshots
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'fee_collection',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'admin',
          destination_id: adminCash.id,
          amount: amount,
          currency: currency,
          description: description,
          project_id: projectId || null,
          balance_before_ars: masterBalanceBefore.ars,
          balance_after_ars: masterBalanceAfter.ars,
          balance_before_usd: masterBalanceBefore.usd,
          balance_after_usd: masterBalanceAfter.usd,
          metadata: {
            currency,
            manual: true,
            percentage: percentage || 0,
            adminBalanceBefore,
            adminBalanceAfter,
          },
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

          // Increase admin cash with multi-currency support
          supabase
            .from('admin_cash')
            .update({
              balance: (adminCash.balance || 0) + amount, // Legacy total
              balance_ars: (adminCash.balance_ars || 0) + amount,
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

          // Increase admin cash with multi-currency support
          supabase
            .from('admin_cash')
            .update({
              balance: (adminCash.balance || 0) + amount, // Legacy total
              balance_usd: (adminCash.balance_usd || 0) + amount,
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
  // ADMIN EXPENSES
  // ============================================

  async recordAdminExpense(params: {
    amount: number;
    currency: 'ARS' | 'USD';
    category: 'personal' | 'rent' | 'utilities' | 'services' | 'provider' | 'other';
    description: string;
    paymentMethod?: string;
    receiptNumber?: string;
    notes?: string;
  }): Promise<void> {
    try {
      const { amount, currency, category, description, paymentMethod, receiptNumber, notes } = params;

      // Get admin cash
      const adminCash = await this.getAdminCash();
      if (!adminCash) {
        throw new Error('Admin cash box not found');
      }

      // Validate sufficient funds
      const currentBalance = currency === 'ARS'
        ? (adminCash.balance_ars || 0)
        : (adminCash.balance_usd || 0);

      if (currentBalance < amount) {
        throw new Error(
          `Fondos insuficientes en Admin Cash ${currency}. ` +
          `Disponible: ${currency === 'USD' ? 'U$S' : '$'}${currentBalance.toFixed(2)}, ` +
          `Requerido: ${currency === 'USD' ? 'U$S' : '$'}${amount.toFixed(2)}`
        );
      }

      // Capture balance snapshots BEFORE the expense
      const balanceBefore = {
        ars: adminCash.balance_ars || 0,
        usd: adminCash.balance_usd || 0,
      };

      // Calculate balance AFTER the expense
      const balanceAfter = {
        ars: currency === 'ARS' ? balanceBefore.ars - amount : balanceBefore.ars,
        usd: currency === 'USD' ? balanceBefore.usd - amount : balanceBefore.usd,
      };

      // Create cash movement with balance snapshots
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'expense',
          source_type: 'admin',
          source_id: adminCash.id,
          destination_type: 'external',
          destination_id: null,
          amount: amount,
          currency: currency,
          description: description,
          balance_before_ars: balanceBefore.ars,
          balance_after_ars: balanceAfter.ars,
          balance_before_usd: balanceBefore.usd,
          balance_after_usd: balanceAfter.usd,
          metadata: {
            currency,
            category,
            paymentMethod,
            receiptNumber,
            notes,
            expenseType: 'admin'
          },
        });

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Update admin cash balance
      if (currency === 'ARS') {
        await supabase
          .from('admin_cash')
          .update({
            balance: (adminCash.balance || 0) - amount,
            balance_ars: (adminCash.balance_ars || 0) - amount,
            last_movement_at: new Date().toISOString()
          })
          .eq('id', adminCash.id);
      } else {
        await supabase
          .from('admin_cash')
          .update({
            balance: (adminCash.balance || 0) - amount,
            balance_usd: (adminCash.balance_usd || 0) - amount,
            last_movement_at: new Date().toISOString()
          })
          .eq('id', adminCash.id);
      }

      console.log(`✅ Admin expense recorded: ${amount} ${currency} - ${category}`);
    } catch (error) {
      console.error('Error recording admin expense:', error);
      throw error;
    }
  }

  // ============================================
  // CURRENCY CONVERSION
  // ============================================

  async convertAdminCurrency(params: {
    fromCurrency: 'ARS' | 'USD';
    toCurrency: 'ARS' | 'USD';
    amount: number;
    exchangeRate: number;
    description?: string;
  }): Promise<void> {
    try {
      const { fromCurrency, toCurrency, amount, exchangeRate, description } = params;

      if (fromCurrency === toCurrency) {
        throw new Error('No se puede convertir la misma moneda');
      }

      // Get admin cash
      const adminCash = await this.getAdminCash();
      if (!adminCash) {
        throw new Error('Admin cash box not found');
      }

      // Validate sufficient funds in source currency
      const sourceBalance = fromCurrency === 'ARS'
        ? (adminCash.balance_ars || 0)
        : (adminCash.balance_usd || 0);

      if (sourceBalance < amount) {
        throw new Error(
          `Fondos insuficientes en ${fromCurrency}. ` +
          `Disponible: ${fromCurrency === 'USD' ? 'U$S' : '$'}${sourceBalance.toFixed(2)}, ` +
          `Requerido: ${fromCurrency === 'USD' ? 'U$S' : '$'}${amount.toFixed(2)}`
        );
      }

      // Calculate converted amount
      const convertedAmount = fromCurrency === 'ARS'
        ? amount / exchangeRate  // ARS → USD (dividir)
        : amount * exchangeRate; // USD → ARS (multiplicar)

      // Capture balance snapshots BEFORE conversion
      const balanceBefore = {
        ars: adminCash.balance_ars || 0,
        usd: adminCash.balance_usd || 0,
      };

      // Calculate balance AFTER conversion
      const balanceAfter = {
        ars: fromCurrency === 'ARS'
          ? balanceBefore.ars - amount
          : balanceBefore.ars + convertedAmount,
        usd: fromCurrency === 'USD'
          ? balanceBefore.usd - amount
          : balanceBefore.usd + convertedAmount,
      };

      // Create cash movement for audit trail with snapshots
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'adjustment',
          source_type: 'admin',
          source_id: adminCash.id,
          destination_type: 'admin',
          destination_id: adminCash.id,
          amount: amount,
          currency: fromCurrency,
          description: description || `Conversión ${fromCurrency} → ${toCurrency}`,
          balance_before_ars: balanceBefore.ars,
          balance_after_ars: balanceAfter.ars,
          balance_before_usd: balanceBefore.usd,
          balance_after_usd: balanceAfter.usd,
          metadata: {
            conversionType: 'currency_exchange',
            fromCurrency,
            toCurrency,
            fromAmount: amount,
            toAmount: convertedAmount,
            exchangeRate,
            timestamp: new Date().toISOString(),
          },
        });

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Update balances
      const newBalances = {
        balance_ars: adminCash.balance_ars || 0,
        balance_usd: adminCash.balance_usd || 0,
      };

      if (fromCurrency === 'ARS') {
        // ARS → USD
        newBalances.balance_ars -= amount;
        newBalances.balance_usd += convertedAmount;
      } else {
        // USD → ARS
        newBalances.balance_usd -= amount;
        newBalances.balance_ars += convertedAmount;
      }

      // Update admin cash
      await supabase
        .from('admin_cash')
        .update({
          balance: (newBalances.balance_ars + newBalances.balance_usd), // Legacy field
          balance_ars: newBalances.balance_ars,
          balance_usd: newBalances.balance_usd,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', adminCash.id);

      console.log(
        `✅ Currency conversion completed: ${amount} ${fromCurrency} → ` +
        `${convertedAmount.toFixed(2)} ${toCurrency} (Rate: ${exchangeRate})`
      );
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  async convertMasterCurrency(params: {
    fromCurrency: 'ARS' | 'USD';
    toCurrency: 'ARS' | 'USD';
    amount: number;
    exchangeRate: number;
    description?: string;
  }): Promise<void> {
    try {
      const { fromCurrency, toCurrency, amount, exchangeRate, description } = params;

      if (fromCurrency === toCurrency) {
        throw new Error('No se puede convertir la misma moneda');
      }

      // Get master cash
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        throw new Error('Master cash box not found');
      }

      // Validate sufficient funds in source currency
      const sourceBalance = fromCurrency === 'ARS'
        ? (masterCash.balance_ars || 0)
        : (masterCash.balance_usd || 0);

      if (sourceBalance < amount) {
        throw new Error(
          `Fondos insuficientes en ${fromCurrency}. ` +
          `Disponible: ${fromCurrency === 'USD' ? 'U$S' : '$'}${sourceBalance.toFixed(2)}, ` +
          `Requerido: ${fromCurrency === 'USD' ? 'U$S' : '$'}${amount.toFixed(2)}`
        );
      }

      // Calculate converted amount
      const convertedAmount = fromCurrency === 'ARS'
        ? amount / exchangeRate  // ARS → USD (dividir)
        : amount * exchangeRate; // USD → ARS (multiplicar)

      // Capture balance snapshots BEFORE conversion
      const balanceBefore = {
        ars: masterCash.balance_ars || 0,
        usd: masterCash.balance_usd || 0,
      };

      // Calculate balance AFTER conversion
      const balanceAfter = {
        ars: fromCurrency === 'ARS'
          ? balanceBefore.ars - amount
          : balanceBefore.ars + convertedAmount,
        usd: fromCurrency === 'USD'
          ? balanceBefore.usd - amount
          : balanceBefore.usd + convertedAmount,
      };

      // Create cash movement for audit trail with snapshots
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'adjustment',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: amount,
          currency: fromCurrency,
          description: description || `Conversión ${fromCurrency} → ${toCurrency}`,
          balance_before_ars: balanceBefore.ars,
          balance_after_ars: balanceAfter.ars,
          balance_before_usd: balanceBefore.usd,
          balance_after_usd: balanceAfter.usd,
          metadata: {
            conversionType: 'currency_exchange',
            fromCurrency,
            toCurrency,
            fromAmount: amount,
            toAmount: convertedAmount,
            exchangeRate,
            timestamp: new Date().toISOString(),
          },
        });

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Update balances
      const newBalances = {
        balance_ars: masterCash.balance_ars || 0,
        balance_usd: masterCash.balance_usd || 0,
      };

      if (fromCurrency === 'ARS') {
        // ARS → USD
        newBalances.balance_ars -= amount;
        newBalances.balance_usd += convertedAmount;
      } else {
        // USD → ARS
        newBalances.balance_usd -= amount;
        newBalances.balance_ars += convertedAmount;
      }

      // Update master cash
      await supabase
        .from('master_cash')
        .update({
          balance: (newBalances.balance_ars + newBalances.balance_usd), // Legacy field
          balance_ars: newBalances.balance_ars,
          balance_usd: newBalances.balance_usd,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', masterCash.id);

      console.log(
        `✅ Master Cash currency conversion completed: ${amount} ${fromCurrency} → ` +
        `${convertedAmount.toFixed(2)} ${toCurrency} (Rate: ${exchangeRate})`
      );
    } catch (error) {
      console.error('Error converting master currency:', error);
      throw error;
    }
  }

  // ============================================
  // MASTER LOAN TRANSFERS
  // ============================================

  /**
   * Transfer funds from Master Cash to Project (loan disbursement)
   */
  async transferMasterToProject(params: {
    projectId: string;
    amount: number;
    currency: 'ARS' | 'USD';
    description: string;
    metadata?: any;
  }): Promise<any> {
    try {
      const { projectId, amount, currency, description, metadata } = params;

      // Get master cash
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        throw new Error('Master cash box not found');
      }

      // Get project cash box
      const { data: projectCash, error: projectError } = await supabase
        .from('project_cash_box')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (projectError || !projectCash) {
        throw new Error('Project cash box not found');
      }

      // Validate sufficient funds in Master
      const masterBalance = currency === 'ARS'
        ? (masterCash.balance_ars || 0)
        : (masterCash.balance_usd || 0);

      if (masterBalance < amount) {
        throw new Error(
          `Fondos insuficientes en Caja Master. Disponible: ${currency === 'USD' ? 'U$S' : '$'}${masterBalance.toFixed(2)}`
        );
      }

      // Capture balance snapshots BEFORE movement
      const balanceBefore = {
        ars: masterCash.balance_ars || 0,
        usd: masterCash.balance_usd || 0,
      };

      // Calculate balance AFTER movement
      const balanceAfter = {
        ars: currency === 'ARS' ? balanceBefore.ars - amount : balanceBefore.ars,
        usd: currency === 'USD' ? balanceBefore.usd - amount : balanceBefore.usd,
      };

      // Use specific movement_type from metadata if provided (e.g., loan_disbursement)
      const movementType = metadata?.movement_type || 'adjustment';

      // Create cash movement with balance snapshots
      const { data: movement, error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: movementType,
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'project',
          destination_id: projectCash.id,
          amount: amount,
          currency: currency,
          description: description,
          project_id: projectId,
          balance_before_ars: balanceBefore.ars,
          balance_after_ars: balanceAfter.ars,
          balance_before_usd: balanceBefore.usd,
          balance_after_usd: balanceAfter.usd,
          metadata: {
            ...metadata,
            transfer_type: 'master_to_project',
          },
        })
        .select()
        .single();

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Update Master Cash balance
      const newMasterBalances = {
        balance_ars: masterCash.balance_ars || 0,
        balance_usd: masterCash.balance_usd || 0,
      };

      if (currency === 'ARS') {
        newMasterBalances.balance_ars -= amount;
      } else {
        newMasterBalances.balance_usd -= amount;
      }

      await supabase
        .from('master_cash')
        .update({
          balance: (newMasterBalances.balance_ars + newMasterBalances.balance_usd),
          balance_ars: newMasterBalances.balance_ars,
          balance_usd: newMasterBalances.balance_usd,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', masterCash.id);

      // Update Project Cash Box balance
      const newProjectBalances = {
        current_balance_ars: projectCash.current_balance_ars || 0,
        current_balance_usd: projectCash.current_balance_usd || 0,
      };

      if (currency === 'ARS') {
        newProjectBalances.current_balance_ars += amount;
      } else {
        newProjectBalances.current_balance_usd += amount;
      }

      await supabase
        .from('project_cash_box')
        .update({
          current_balance: (newProjectBalances.current_balance_ars + newProjectBalances.current_balance_usd),
          current_balance_ars: newProjectBalances.current_balance_ars,
          current_balance_usd: newProjectBalances.current_balance_usd,
          last_transaction_date: new Date().toISOString()
        })
        .eq('id', projectCash.id);

      console.log(
        `✅ Master → Project transfer completed: ${amount} ${currency} (${description})`
      );

      return movement;
    } catch (error) {
      console.error('Error transferring master to project:', error);
      throw error;
    }
  }

  /**
   * Transfer funds from Project to Master Cash (loan repayment)
   */
  async transferProjectToMaster(params: {
    projectId: string;
    amount: number;
    currency: 'ARS' | 'USD';
    description: string;
    metadata?: any;
  }): Promise<any> {
    try {
      const { projectId, amount, currency, description, metadata } = params;

      // Get master cash
      const masterCash = await this.getMasterCash();
      if (!masterCash) {
        throw new Error('Master cash box not found');
      }

      // Get project cash box
      const { data: projectCash, error: projectError } = await supabase
        .from('project_cash_box')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (projectError || !projectCash) {
        throw new Error('Project cash box not found');
      }

      // Validate sufficient funds in Project
      const projectBalance = currency === 'ARS'
        ? (projectCash.current_balance_ars || 0)
        : (projectCash.current_balance_usd || 0);

      if (projectBalance < amount) {
        throw new Error(
          `Fondos insuficientes en Caja del Proyecto. Disponible: ${currency === 'USD' ? 'U$S' : '$'}${projectBalance.toFixed(2)}`
        );
      }

      // Capture balance snapshots BEFORE movement (from project perspective)
      const balanceBefore = {
        ars: projectCash.current_balance_ars || 0,
        usd: projectCash.current_balance_usd || 0,
      };

      // Calculate balance AFTER movement
      const balanceAfter = {
        ars: currency === 'ARS' ? balanceBefore.ars - amount : balanceBefore.ars,
        usd: currency === 'USD' ? balanceBefore.usd - amount : balanceBefore.usd,
      };

      // Use specific movement_type from metadata if provided (e.g., loan_payment)
      const movementType = metadata?.movement_type || 'adjustment';

      // Create cash movement with balance snapshots
      const { data: movement, error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: movementType,
          source_type: 'project',
          source_id: projectCash.id,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: amount,
          currency: currency,
          description: description,
          project_id: projectId,
          balance_before_ars: balanceBefore.ars,
          balance_after_ars: balanceAfter.ars,
          balance_before_usd: balanceBefore.usd,
          balance_after_usd: balanceAfter.usd,
          metadata: {
            ...metadata,
            transfer_type: 'project_to_master',
          },
        })
        .select()
        .single();

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Update Project Cash Box balance
      const newProjectBalances = {
        current_balance_ars: projectCash.current_balance_ars || 0,
        current_balance_usd: projectCash.current_balance_usd || 0,
      };

      if (currency === 'ARS') {
        newProjectBalances.current_balance_ars -= amount;
      } else {
        newProjectBalances.current_balance_usd -= amount;
      }

      await supabase
        .from('project_cash_box')
        .update({
          current_balance: (newProjectBalances.current_balance_ars + newProjectBalances.current_balance_usd),
          current_balance_ars: newProjectBalances.current_balance_ars,
          current_balance_usd: newProjectBalances.current_balance_usd,
          last_transaction_date: new Date().toISOString()
        })
        .eq('id', projectCash.id);

      // Update Master Cash balance
      const newMasterBalances = {
        balance_ars: masterCash.balance_ars || 0,
        balance_usd: masterCash.balance_usd || 0,
      };

      if (currency === 'ARS') {
        newMasterBalances.balance_ars += amount;
      } else {
        newMasterBalances.balance_usd += amount;
      }

      await supabase
        .from('master_cash')
        .update({
          balance: (newMasterBalances.balance_ars + newMasterBalances.balance_usd),
          balance_ars: newMasterBalances.balance_ars,
          balance_usd: newMasterBalances.balance_usd,
          last_movement_at: new Date().toISOString()
        })
        .eq('id', masterCash.id);

      console.log(
        `✅ Project → Master transfer completed: ${amount} ${currency} (${description})`
      );

      return movement;
    } catch (error) {
      console.error('Error transferring project to master:', error);
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
        (m.currency === 'ARS' || m.metadata?.currency === 'ARS')
      ).reduce((sum, m) => sum + m.amount, 0) || 0;

      const monthlyIncomeUSD = movements?.filter(m =>
        (m.movement_type === 'project_income' || m.movement_type === 'project_payment') &&
        (m.currency === 'USD' || m.metadata?.currency === 'USD')
      ).reduce((sum, m) => sum + m.amount, 0) || 0;

      const monthlyExpensesARS = movements?.filter(m =>
        m.movement_type === 'operational_expense' &&
        (m.currency === 'ARS' || m.metadata?.currency === 'ARS')
      ).reduce((sum, m) => sum + Math.abs(m.amount), 0) || 0;

      const monthlyExpensesUSD = movements?.filter(m =>
        m.movement_type === 'operational_expense' &&
        (m.currency === 'USD' || m.metadata?.currency === 'USD')
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