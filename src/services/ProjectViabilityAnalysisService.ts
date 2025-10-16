import { supabase } from '@/config/supabase';
import { currencyService, ExchangeRateType } from '@/services/currency/CurrencyService';

export interface ViabilityAnalysis {
  projectId: string;
  projectName: string;
  riskScore: number; // 0-100 (100 = lowest risk)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Historical data
  historicalIncome: {
    totalARS: number;
    totalUSD: number;
    paymentCount: number;
    averagePaymentARS: number;
    averagePaymentUSD: number;
    firstPaymentDate: string | null;
    lastPaymentDate: string | null;
  };

  // Future projections
  futureProjections: {
    pendingInstallmentsCount: number;
    projectedIncomeARS: number;
    projectedIncomeUSD: number;
    nextPaymentDate: string | null;
    installments: Array<{
      number: number;
      amount: number;
      currency: 'ARS' | 'USD';
      dueDate: string;
      status: string;
    }>;
  };

  // Debt analysis
  debtAnalysis: {
    activeLoansCount: number;
    totalDebtARS: number;
    totalDebtUSD: number;
    monthlyPaymentObligationARS: number;
    monthlyPaymentObligationUSD: number;
  };

  // Capacity metrics
  paymentCapacity: {
    monthlyIncomeCapacityARS: number;
    monthlyIncomeCapacityUSD: number;
    debtToIncomeRatio: number; // percentage
    availableCapacityARS: number;
    availableCapacityUSD: number;
  };

  // Recommendations
  recommendations: {
    maxSafeLoanARS: number;
    maxSafeLoanUSD: number;
    maxSafeLoanARSConverted: number; // From USD capacity
    maxSafeLoanUSDConverted: number; // From ARS capacity
    primaryCurrency: 'ARS' | 'USD' | 'BOTH'; // Which currency has actual capacity
    recommendedTermMonths: number;
    warnings: string[];
    strengths: string[];
    exchangeRate: number; // USD to ARS rate used
  };
}

export class ProjectViabilityAnalysisService {
  /**
   * Perform comprehensive viability analysis for a project
   */
  async analyzeProject(projectId: string): Promise<ViabilityAnalysis> {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name, start_date, total_amount, currency')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Parallel data fetching including exchange rate
      const [historicalIncome, futureProjections, debtAnalysis, exchangeRate] = await Promise.all([
        this.getHistoricalIncome(projectId),
        this.getFutureProjections(projectId),
        this.getDebtAnalysis(projectId),
        currencyService.getRate(ExchangeRateType.BLUE), // Use blue rate (real market rate)
      ]);

      // Calculate payment capacity (use 'monthly' as default frequency)
      const paymentCapacity = this.calculatePaymentCapacity(
        historicalIncome,
        futureProjections,
        debtAnalysis,
        'monthly',
        exchangeRate.sell
      );

      // Calculate risk score
      const riskScore = this.calculateRiskScore(
        historicalIncome,
        futureProjections,
        debtAnalysis,
        paymentCapacity
      );

      // Generate recommendations with real exchange rate
      const recommendations = this.generateRecommendations(
        paymentCapacity,
        debtAnalysis,
        futureProjections,
        riskScore,
        exchangeRate.sell // Use sell rate for USD to ARS conversion
      );

      return {
        projectId,
        projectName: project.name,
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        historicalIncome,
        futureProjections,
        debtAnalysis,
        paymentCapacity,
        recommendations,
      };
    } catch (error) {
      console.error('Error analyzing project viability:', error);
      throw error;
    }
  }

  /**
   * Get historical income from payments
   */
  private async getHistoricalIncome(projectId: string) {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        amount,
        currency,
        payment_date,
        installments!inner(project_id)
      `)
      .eq('installments.project_id', projectId)
      .order('payment_date', { ascending: true });

    if (error) throw error;

    const totalARS = payments
      ?.filter((p) => p.currency === 'ARS')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const totalUSD = payments
      ?.filter((p) => p.currency === 'USD')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const paymentCount = payments?.length || 0;

    return {
      totalARS,
      totalUSD,
      paymentCount,
      averagePaymentARS: paymentCount > 0 ? totalARS / paymentCount : 0,
      averagePaymentUSD: paymentCount > 0 ? totalUSD / paymentCount : 0,
      firstPaymentDate: payments && payments.length > 0 ? payments[0].payment_date : null,
      lastPaymentDate: payments && payments.length > 0 ? payments[payments.length - 1].payment_date : null,
    };
  }

  /**
   * Get future payment projections from pending installments
   */
  private async getFutureProjections(projectId: string) {
    const { data: installments, error } = await supabase
      .from('installments')
      .select('installment_number, amount, currency, due_date, status')
      .eq('project_id', projectId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true });

    if (error) throw error;

    const projectedIncomeARS = installments
      ?.filter((i) => i.currency === 'ARS')
      .reduce((sum, i) => sum + i.amount, 0) || 0;

    const projectedIncomeUSD = installments
      ?.filter((i) => i.currency === 'USD')
      .reduce((sum, i) => sum + i.amount, 0) || 0;

    return {
      pendingInstallmentsCount: installments?.length || 0,
      projectedIncomeARS,
      projectedIncomeUSD,
      nextPaymentDate: installments && installments.length > 0 ? installments[0].due_date : null,
      installments: installments?.map((i) => ({
        number: i.installment_number,
        amount: i.amount,
        currency: i.currency,
        dueDate: i.due_date,
        status: i.status,
      })) || [],
    };
  }

  /**
   * Get debt analysis from active loans where this project is the borrower
   */
  private async getDebtAnalysis(projectId: string) {
    const { data: loans, error } = await supabase
      .from('inter_project_loans')
      .select('amount, currency, outstanding_balance, due_date')
      .eq('borrower_project_id', projectId)
      .in('loan_status', ['active', 'overdue']);

    if (error) throw error;

    const totalDebtARS = loans
      ?.filter((l) => l.currency === 'ARS')
      .reduce((sum, l) => sum + l.outstanding_balance, 0) || 0;

    const totalDebtUSD = loans
      ?.filter((l) => l.currency === 'USD')
      .reduce((sum, l) => sum + l.outstanding_balance, 0) || 0;

    // Estimate monthly payment obligation (simplified)
    const monthlyPaymentObligationARS = totalDebtARS > 0 ? totalDebtARS / 12 : 0; // Assuming 12-month average
    const monthlyPaymentObligationUSD = totalDebtUSD > 0 ? totalDebtUSD / 12 : 0;

    return {
      activeLoansCount: loans?.length || 0,
      totalDebtARS,
      totalDebtUSD,
      monthlyPaymentObligationARS,
      monthlyPaymentObligationUSD,
    };
  }

  /**
   * Calculate payment capacity based on income and debt
   */
  private calculatePaymentCapacity(
    historicalIncome: any,
    futureProjections: any,
    debtAnalysis: any,
    paymentFrequency: string
  ) {
    // Calculate average monthly income based on historical data and projections
    const monthsOfHistory = historicalIncome.firstPaymentDate && historicalIncome.lastPaymentDate
      ? Math.max(1, Math.ceil(
          (new Date(historicalIncome.lastPaymentDate).getTime() - new Date(historicalIncome.firstPaymentDate).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
        ))
      : 1;

    const avgMonthlyHistoricalARS = historicalIncome.totalARS / monthsOfHistory;
    const avgMonthlyHistoricalUSD = historicalIncome.totalUSD / monthsOfHistory;

    // Project future monthly income
    const monthsUntilCompletion = futureProjections.pendingInstallmentsCount > 0
      ? this.estimateMonthsFromFrequency(paymentFrequency, futureProjections.pendingInstallmentsCount)
      : 12;

    const projectedMonthlyARS = monthsUntilCompletion > 0
      ? futureProjections.projectedIncomeARS / monthsUntilCompletion
      : 0;
    const projectedMonthlyUSD = monthsUntilCompletion > 0
      ? futureProjections.projectedIncomeUSD / monthsUntilCompletion
      : 0;

    // Average of historical and projected
    const monthlyIncomeCapacityARS = (avgMonthlyHistoricalARS + projectedMonthlyARS) / 2;
    const monthlyIncomeCapacityUSD = (avgMonthlyHistoricalUSD + projectedMonthlyUSD) / 2;

    // Calculate debt-to-income ratio
    const totalMonthlyIncome = monthlyIncomeCapacityARS + (monthlyIncomeCapacityUSD * 1000); // Convert USD to ARS estimate
    const totalMonthlyDebt = debtAnalysis.monthlyPaymentObligationARS + (debtAnalysis.monthlyPaymentObligationUSD * 1000);
    const debtToIncomeRatio = totalMonthlyIncome > 0 ? (totalMonthlyDebt / totalMonthlyIncome) * 100 : 0;

    // Available capacity after debt obligations
    const availableCapacityARS = Math.max(0, monthlyIncomeCapacityARS - debtAnalysis.monthlyPaymentObligationARS);
    const availableCapacityUSD = Math.max(0, monthlyIncomeCapacityUSD - debtAnalysis.monthlyPaymentObligationUSD);

    return {
      monthlyIncomeCapacityARS,
      monthlyIncomeCapacityUSD,
      debtToIncomeRatio,
      availableCapacityARS,
      availableCapacityUSD,
    };
  }

  /**
   * Calculate overall risk score (0-100, higher is better/safer)
   */
  private calculateRiskScore(
    historicalIncome: any,
    futureProjections: any,
    debtAnalysis: any,
    paymentCapacity: any
  ): number {
    let score = 100;

    // Factor 1: Payment history (30 points)
    if (historicalIncome.paymentCount === 0) {
      score -= 30;
    } else if (historicalIncome.paymentCount < 3) {
      score -= 15;
    } else if (historicalIncome.paymentCount < 6) {
      score -= 5;
    }

    // Factor 2: Debt-to-income ratio (30 points)
    if (paymentCapacity.debtToIncomeRatio > 50) {
      score -= 30;
    } else if (paymentCapacity.debtToIncomeRatio > 30) {
      score -= 15;
    } else if (paymentCapacity.debtToIncomeRatio > 15) {
      score -= 5;
    }

    // Factor 3: Future income projections (20 points)
    if (futureProjections.pendingInstallmentsCount === 0) {
      score -= 20;
    } else if (futureProjections.pendingInstallmentsCount < 3) {
      score -= 10;
    }

    // Factor 4: Current debt load (20 points)
    if (debtAnalysis.activeLoansCount > 3) {
      score -= 20;
    } else if (debtAnalysis.activeLoansCount > 1) {
      score -= 10;
    } else if (debtAnalysis.activeLoansCount === 1) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get risk level from score
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  /**
   * Generate loan recommendations
   */
  private generateRecommendations(
    paymentCapacity: any,
    debtAnalysis: any,
    futureProjections: any,
    riskScore: number,
    usdToArsRate: number
  ) {
    const warnings: string[] = [];
    const strengths: string[] = [];

    // Calculate max safe loan (conservative: 30% of available monthly capacity for 12 months)
    const maxSafeLoanARS = paymentCapacity.availableCapacityARS * 12 * 0.3;
    const maxSafeLoanUSD = paymentCapacity.availableCapacityUSD * 12 * 0.3;

    // Calculate cross-currency conversions using real exchange rate
    const maxSafeLoanARSConverted = maxSafeLoanUSD * usdToArsRate;
    const maxSafeLoanUSDConverted = maxSafeLoanARS / usdToArsRate;

    // Determine primary currency (which has actual payment capacity)
    let primaryCurrency: 'ARS' | 'USD' | 'BOTH' = 'ARS';
    if (maxSafeLoanARS > 0 && maxSafeLoanUSD > 0) {
      primaryCurrency = 'BOTH';
    } else if (maxSafeLoanUSD > 0) {
      primaryCurrency = 'USD';
    } else if (maxSafeLoanARS > 0) {
      primaryCurrency = 'ARS';
    }

    // Recommended term based on future projections
    const recommendedTermMonths = Math.min(
      12,
      Math.max(6, futureProjections.pendingInstallmentsCount)
    );

    // Generate warnings
    if (debtAnalysis.activeLoansCount > 2) {
      warnings.push('El proyecto ya tiene múltiples préstamos activos');
    }
    if (paymentCapacity.debtToIncomeRatio > 30) {
      warnings.push('Alto ratio de deuda sobre ingresos');
    }
    if (futureProjections.pendingInstallmentsCount < 3) {
      warnings.push('Pocas cuotas pendientes - flujo de caja limitado');
    }
    if (riskScore < 50) {
      warnings.push('Score de riesgo bajo - préstamo no recomendado');
    }

    // Generate strengths
    if (paymentCapacity.debtToIncomeRatio < 15) {
      strengths.push('Excelente ratio de deuda sobre ingresos');
    }
    if (futureProjections.pendingInstallmentsCount > 6) {
      strengths.push('Buen flujo de caja proyectado');
    }
    if (debtAnalysis.activeLoansCount === 0) {
      strengths.push('Sin deudas activas');
    }
    if (riskScore >= 80) {
      strengths.push('Excelente historial de pagos');
    }

    // Add currency-specific strengths
    if (primaryCurrency === 'BOTH') {
      strengths.push('Capacidad de pago en múltiples monedas');
    }

    return {
      maxSafeLoanARS,
      maxSafeLoanUSD,
      maxSafeLoanARSConverted,
      maxSafeLoanUSDConverted,
      primaryCurrency,
      recommendedTermMonths,
      warnings,
      strengths,
      exchangeRate: usdToArsRate,
    };
  }

  /**
   * Estimate months from payment frequency
   */
  private estimateMonthsFromFrequency(frequency: string, installmentCount: number): number {
    const monthsPerInstallment: { [key: string]: number } = {
      monthly: 1,
      biweekly: 0.5,
      weekly: 0.25,
      quarterly: 3,
    };

    return installmentCount * (monthsPerInstallment[frequency] || 1);
  }
}

export const projectViabilityService = new ProjectViabilityAnalysisService();
