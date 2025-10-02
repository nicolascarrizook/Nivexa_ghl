import { supabase as _supabase } from '@/config/supabase';
import { exchangeRateService } from './ExchangeRateService';
import {
  Currency,
  ExchangeRateSource,
  CurrencyConversionParams,
  CurrencyConversion,
} from './MasterCashService';

// Type cast to bypass database type restrictions for tables not in schema
const supabase = _supabase as any;

export interface ConversionResult {
  success: boolean;
  conversion?: CurrencyConversion;
  error?: string;
}

class CurrencyConversionService {
  /**
   * Convert currency in Master Cash
   * Creates two movements: outbound (source currency) and inbound (destination currency)
   */
  async convertCurrency(params: CurrencyConversionParams): Promise<ConversionResult> {
    const { from_currency, amount, to_currency, exchange_rate_source, notes } = params;

    // Validation
    if (from_currency === to_currency) {
      return {
        success: false,
        error: 'No se puede convertir a la misma moneda',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: 'El monto debe ser mayor a cero',
      };
    }

    try {
      // Step 1: Get current exchange rate
      console.log(`💱 Getting ${exchange_rate_source} rate for ${from_currency} → ${to_currency}...`);
      const exchangeRate = await exchangeRateService.getExchangeRate(exchange_rate_source);

      // Step 2: Calculate converted amount
      let convertedAmount: number;
      let rateUsed: number;

      if (from_currency === 'USD' && to_currency === 'ARS') {
        // USD -> ARS: use sell rate
        convertedAmount = amount * exchangeRate.sell;
        rateUsed = exchangeRate.sell;
      } else if (from_currency === 'ARS' && to_currency === 'USD') {
        // ARS -> USD: use buy rate
        convertedAmount = amount / exchangeRate.buy;
        rateUsed = exchangeRate.buy;
      } else {
        return {
          success: false,
          error: 'Conversión no soportada',
        };
      }

      // Round to 2 decimals
      convertedAmount = Math.round(convertedAmount * 100) / 100;

      console.log(`💱 Converting ${amount} ${from_currency} → ${convertedAmount} ${to_currency} @ ${rateUsed}`);

      // Step 3: Get master cash and validate balance
      const { data: masterCash, error: cashError } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      if (cashError || !masterCash) {
        return {
          success: false,
          error: 'No se pudo obtener la información de Caja Maestra',
        };
      }

      // Validate sufficient balance in source currency
      const sourceBalance = from_currency === 'ARS' ? masterCash.balance_ars : masterCash.balance_usd;
      if (sourceBalance < amount) {
        return {
          success: false,
          error: `Saldo insuficiente en ${from_currency}. Disponible: ${sourceBalance}, Solicitado: ${amount}`,
        };
      }

      // Step 4: Create outbound movement (deduct from source currency)
      const { data: outboundMovement, error: outboundError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'currency_exchange',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: amount,
          currency: from_currency,
          exchange_rate: rateUsed,
          description: `Conversión: -${amount} ${from_currency} → +${convertedAmount} ${to_currency} (${exchange_rate_source})`,
        })
        .select()
        .single();

      if (outboundError || !outboundMovement) {
        console.error('Error creating outbound movement:', outboundError);
        return {
          success: false,
          error: 'Error al crear el movimiento de salida',
        };
      }

      // Step 5: Create inbound movement (add to destination currency)
      const { data: inboundMovement, error: inboundError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'currency_exchange',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: convertedAmount,
          currency: to_currency,
          exchange_rate: rateUsed,
          description: `Conversión: -${amount} ${from_currency} → +${convertedAmount} ${to_currency} (${exchange_rate_source})`,
        })
        .select()
        .single();

      if (inboundError || !inboundMovement) {
        console.error('Error creating inbound movement:', inboundError);
        // TODO: Rollback outbound movement
        return {
          success: false,
          error: 'Error al crear el movimiento de entrada',
        };
      }

      // Step 6: Create currency conversion record
      const { data: conversion, error: conversionError } = await supabase
        .from('currency_conversions')
        .insert({
          from_currency,
          from_amount: amount,
          to_currency,
          to_amount: convertedAmount,
          exchange_rate: rateUsed,
          exchange_rate_source,
          outbound_movement_id: outboundMovement.id,
          inbound_movement_id: inboundMovement.id,
          notes: notes || `Conversión automática usando cotización ${exchange_rate_source}`,
        })
        .select()
        .single();

      if (conversionError || !conversion) {
        console.error('Error creating conversion record:', conversionError);
        // TODO: Rollback movements
        return {
          success: false,
          error: 'Error al registrar la conversión',
        };
      }

      // Step 7: Update master cash balances
      const newBalances: any = {};
      if (from_currency === 'ARS') {
        newBalances.balance_ars = masterCash.balance_ars - amount;
        newBalances.balance_usd = masterCash.balance_usd + convertedAmount;
      } else {
        newBalances.balance_usd = masterCash.balance_usd - amount;
        newBalances.balance_ars = masterCash.balance_ars + convertedAmount;
      }
      newBalances.last_movement_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('master_cash')
        .update(newBalances)
        .eq('id', masterCash.id);

      if (updateError) {
        console.error('Error updating master cash balances:', updateError);
        // TODO: Rollback everything
        return {
          success: false,
          error: 'Error al actualizar los saldos de Caja Maestra',
        };
      }

      console.log(`✅ Conversion successful: ${amount} ${from_currency} → ${convertedAmount} ${to_currency}`);
      console.log(`📊 New balances: ARS ${newBalances.balance_ars}, USD ${newBalances.balance_usd}`);

      return {
        success: true,
        conversion,
      };
    } catch (error) {
      console.error('Error in convertCurrency:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al convertir moneda',
      };
    }
  }

  /**
   * Get conversion history
   */
  async getConversionHistory(limit: number = 50): Promise<CurrencyConversion[]> {
    try {
      const { data, error } = await supabase
        .from('currency_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching conversion history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversionHistory:', error);
      return [];
    }
  }

  /**
   * Get conversion by ID
   */
  async getConversion(id: string): Promise<CurrencyConversion | null> {
    try {
      const { data, error } = await supabase
        .from('currency_conversions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching conversion:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getConversion:', error);
      return null;
    }
  }

  /**
   * Preview conversion without executing it
   */
  async previewConversion(
    from_currency: Currency,
    amount: number,
    to_currency: Currency,
    exchange_rate_source: ExchangeRateSource
  ): Promise<{
    convertedAmount: number;
    rate: number;
    source: ExchangeRateSource;
  } | null> {
    try {
      const exchangeRate = await exchangeRateService.getExchangeRate(exchange_rate_source);

      let convertedAmount: number;
      let rateUsed: number;

      if (from_currency === 'USD' && to_currency === 'ARS') {
        convertedAmount = amount * exchangeRate.sell;
        rateUsed = exchangeRate.sell;
      } else if (from_currency === 'ARS' && to_currency === 'USD') {
        convertedAmount = amount / exchangeRate.buy;
        rateUsed = exchangeRate.buy;
      } else {
        return null;
      }

      return {
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        rate: rateUsed,
        source: exchange_rate_source,
      };
    } catch (error) {
      console.error('Error in previewConversion:', error);
      return null;
    }
  }
}

// Export singleton instance
export const currencyConversionService = new CurrencyConversionService();