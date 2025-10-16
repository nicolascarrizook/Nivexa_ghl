import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
type BankAccountInsert = Database['public']['Tables']['bank_accounts']['Insert'];
type BankAccountTransfer = Database['public']['Tables']['bank_account_transfers']['Row'];
type BankAccountTransferInsert = Database['public']['Tables']['bank_account_transfers']['Insert'];

export interface CreateAccountData {
  account_type: BankAccount['account_type'];
  account_name: string;
  project_id?: string | null;
  currency: 'ARS' | 'USD';
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
}

export interface TransferData {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  transfer_type: string;
  description: string;
  notes?: string;
  reference_number?: string;
  related_loan_id?: string;
  related_installment_id?: string;
  exchange_rate?: number;
}

export interface AccountWithProject extends BankAccount {
  project?: { id: string; name: string; code: string } | null;
}

export class BankAccountService {
  /**
   * Crea una nueva cuenta bancaria
   */
  static async createAccount(data: CreateAccountData): Promise<BankAccount> {
    const accountData: BankAccountInsert = {
      account_type: data.account_type,
      account_name: data.account_name,
      project_id: data.project_id,
      currency: data.currency,
      balance: 0,
      available_balance: 0,
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_holder: data.account_holder,
      is_active: true,
    };

    const { data: account, error } = await supabase
      .from('bank_accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) throw error;

    return account;
  }

  /**
   * Obtiene todas las cuentas activas
   */
  static async getActiveAccounts() {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select(`
        *,
        project:project_id (id, name, code)
      `)
      .eq('is_active', true)
      .order('account_type', { ascending: true });

    if (error) throw error;

    return data as AccountWithProject[];
  }

  /**
   * Obtiene cuentas master (ARS y USD)
   * Usa los datos de master_cash existente
   */
  static async getMasterAccounts() {
    // Obtener master_cash existente
    const { data: masterCash, error } = await supabase
      .from('master_cash')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    // Si no existe master_cash, retornar array vacío
    if (!masterCash) {
      console.warn('No master_cash found in database');
      return [];
    }

    // Retornar en formato compatible con bank_accounts
    return [
      {
        id: `master_ars_${masterCash.id}`,
        account_type: 'master_ars',
        account_name: 'Caja Maestra ARS',
        project_id: null,
        currency: 'ARS',
        balance: masterCash.balance_ars || 0,
        available_balance: masterCash.balance_ars || 0,
        bank_name: null,
        account_number: null,
        account_holder: null,
        is_active: true,
        created_at: masterCash.created_at,
        updated_at: masterCash.updated_at,
      },
      {
        id: `master_usd_${masterCash.id}`,
        account_type: 'master_usd',
        account_name: 'Caja Maestra USD',
        project_id: null,
        currency: 'USD',
        balance: masterCash.balance_usd || 0,
        available_balance: masterCash.balance_usd || 0,
        bank_name: null,
        account_number: null,
        account_holder: null,
        is_active: true,
        created_at: masterCash.created_at,
        updated_at: masterCash.updated_at,
      },
    ];
  }

  /**
   * Obtiene cuentas de un proyecto específico
   */
  static async getProjectAccounts(projectId: string) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('currency', { ascending: true });

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene una cuenta por ID
   */
  static async getAccountById(accountId: string): Promise<AccountWithProject | null> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select(`
        *,
        project:project_id (id, name, code)
      `)
      .eq('id', accountId)
      .single();

    if (error) throw error;

    return data as AccountWithProject;
  }

  /**
   * Obtiene el balance de todas las cuentas
   */
  static async getAllAccountsBalance() {
    const { data, error } = await supabase
      .from('bank_accounts_balance')
      .select('*')
      .order('account_type', { ascending: true });

    if (error) throw error;

    return data;
  }

  /**
   * Realiza una transferencia entre cuentas
   */
  static async transfer(data: TransferData): Promise<BankAccountTransfer> {
    // Verificar fondos suficientes en cuenta origen
    const { data: fromAccount, error: fromError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', data.from_account_id)
      .single();

    if (fromError) throw fromError;
    if (!fromAccount) throw new Error('Cuenta origen no encontrada');
    if (fromAccount.available_balance < data.amount) {
      throw new Error('Fondos insuficientes en la cuenta origen');
    }

    // Obtener cuenta destino para verificar moneda
    const { data: toAccount, error: toError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', data.to_account_id)
      .single();

    if (toError) throw toError;
    if (!toAccount) throw new Error('Cuenta destino no encontrada');

    // Calcular monto convertido si hay diferencia de moneda
    let convertedAmount: number | null = null;
    let finalExchangeRate: number | null = null;

    if (fromAccount.currency !== toAccount.currency) {
      if (!data.exchange_rate) {
        // Buscar tasa de cambio actual
        const { data: rate, error: rateError } = await supabase
          .from('exchange_rates')
          .select('rate')
          .eq('from_currency', fromAccount.currency)
          .eq('to_currency', toAccount.currency)
          .order('effective_date', { ascending: false })
          .limit(1)
          .single();

        if (rateError) throw new Error('No se encontró tasa de cambio');
        finalExchangeRate = rate.rate;
      } else {
        finalExchangeRate = data.exchange_rate;
      }

      convertedAmount = data.amount * finalExchangeRate;
    }

    // Crear transferencia
    const transferData: BankAccountTransferInsert = {
      from_account_id: data.from_account_id,
      to_account_id: data.to_account_id,
      amount: data.amount,
      from_currency: fromAccount.currency,
      to_currency: toAccount.currency,
      exchange_rate: finalExchangeRate,
      converted_amount: convertedAmount,
      transfer_type: data.transfer_type,
      description: data.description,
      notes: data.notes,
      reference_number: data.reference_number,
      related_loan_id: data.related_loan_id,
      related_installment_id: data.related_installment_id,
    };

    const { data: transfer, error: transferError } = await supabase
      .from('bank_account_transfers')
      .insert(transferData)
      .select()
      .single();

    if (transferError) throw transferError;

    return transfer;
  }

  /**
   * Obtiene historial de transferencias de una cuenta
   */
  static async getAccountTransfers(accountId: string) {
    const { data, error } = await supabase
      .from('bank_account_transfers')
      .select(`
        *,
        from_account:from_account_id (id, account_name, account_type),
        to_account:to_account_id (id, account_name, account_type)
      `)
      .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
      .order('transfer_date', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene todas las transferencias con filtros
   */
  static async getAllTransfers(filters?: {
    transfer_type?: string;
    from_date?: string;
    to_date?: string;
  }) {
    let query = supabase
      .from('bank_account_transfers')
      .select(`
        *,
        from_account:from_account_id (id, account_name, account_type, currency),
        to_account:to_account_id (id, account_name, account_type, currency)
      `);

    if (filters?.transfer_type) {
      query = query.eq('transfer_type', filters.transfer_type);
    }

    if (filters?.from_date) {
      query = query.gte('transfer_date', filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte('transfer_date', filters.to_date);
    }

    const { data, error } = await query.order('transfer_date', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Cobra honorarios desde un proyecto hacia la caja maestra (admin)
   */
  static async payFees(
    projectId: string,
    amount: number,
    currency: 'ARS' | 'USD',
    description: string,
    notes?: string
  ): Promise<void> {
    // Obtener cuenta master correspondiente (DESTINO)
    const { data: masterAccount, error: masterError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('account_type', currency === 'ARS' ? 'master_ars' : 'master_usd')
      .eq('is_active', true)
      .single();

    if (masterError) throw masterError;
    if (!masterAccount) throw new Error('Cuenta master no encontrada');

    // Obtener cuenta del proyecto (ORIGEN)
    let projectAccount = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('project_id', projectId)
      .eq('currency', currency)
      .eq('is_active', true)
      .single();

    if (projectAccount.error) {
      throw new Error('El proyecto no tiene cuenta bancaria en esta moneda');
    }

    // Verificar que el proyecto tenga fondos suficientes
    if (projectAccount.data.available_balance < amount) {
      throw new Error('Fondos insuficientes en la cuenta del proyecto');
    }

    // Realizar transferencia DESDE proyecto HACIA caja maestra
    await this.transfer({
      from_account_id: projectAccount.data.id,
      to_account_id: masterAccount.id,
      amount: amount,
      transfer_type: 'fee_payment',
      description: description,
      notes: notes,
    });

    // Crear movimiento en cash_movements
    await supabase.from('cash_movements').insert({
      movement_type: 'fee_collection',
      source_type: 'project',
      source_id: projectId,
      destination_type: 'master',
      destination_id: null,
      amount: amount,
      description: description,
      project_id: projectId,
      metadata: { currency },
    });
  }

  /**
   * Desactiva una cuenta bancaria
   */
  static async deactivateAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) throw error;
  }

  /**
   * Obtiene estadísticas de cuentas bancarias
   * Usa los datos existentes de master_cash y project_cash
   */
  static async getAccountStatistics() {
    // Obtener datos de master_cash (tabla existente)
    const { data: masterCash, error: masterError } = await supabase
      .from('master_cash')
      .select('*')
      .maybeSingle();

    if (masterError) throw masterError;

    // Obtener todas las project_cash_box
    const { data: projectCashes, error: projectError } = await supabase
      .from('project_cash_box')
      .select('*');

    if (projectError) throw projectError;

    // Calcular balances desde las tablas existentes
    const masterBalanceARS = masterCash?.balance_ars || 0;
    const masterBalanceUSD = masterCash?.balance_usd || 0;
    const projectBalanceARS = projectCashes?.reduce((sum, p) => sum + (p.current_balance_ars || 0), 0) || 0;
    const projectBalanceUSD = projectCashes?.reduce((sum, p) => sum + (p.current_balance_usd || 0), 0) || 0;

    // Obtener cuentas de bank_accounts para los conteos
    const { data: accounts } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true);

    return {
      masterBalanceARS,
      masterBalanceUSD,
      projectBalanceARS,
      projectBalanceUSD,
      totalAccountsActive: (accounts?.length || 0) + (projectCashes?.length || 0),
      masterAccountsCount: masterCash ? 1 : 0,
      projectAccountsCount: projectCashes?.length || 0,
    };
  }
}