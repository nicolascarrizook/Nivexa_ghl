/**
 * Utility functions for calculating installment plans and due dates
 */

export interface InstallmentPlan {
  number: number;
  amount: number;
  dueDate: Date;
  description: string;
  isDownPayment?: boolean;
  currency: 'USD' | 'ARS';
}

export interface InstallmentCalculationOptions {
  totalAmount: number;
  downPaymentAmount?: number;
  installmentCount: number;
  currency: 'USD' | 'ARS';
  startDate?: Date;
  frequency?: 'monthly' | 'biweekly' | 'weekly' | 'quarterly';
  includeDownPaymentInSchedule?: boolean;
  customInstallmentAmounts?: number[]; // For custom payment plans
}

/**
 * Calculate installment plan with due dates
 */
export function calculateInstallmentPlan(
  options: InstallmentCalculationOptions
): InstallmentPlan[] {
  const {
    totalAmount,
    downPaymentAmount = 0,
    installmentCount,
    currency,
    startDate = new Date(),
    frequency = 'monthly',
    includeDownPaymentInSchedule = true,
    customInstallmentAmounts,
  } = options;

  const installments: InstallmentPlan[] = [];
  const financedAmount = totalAmount - downPaymentAmount;

  // Add down payment if applicable
  if (downPaymentAmount > 0 && includeDownPaymentInSchedule) {
    installments.push({
      number: 0,
      amount: downPaymentAmount,
      dueDate: new Date(startDate),
      description: 'Anticipo inicial',
      isDownPayment: true,
      currency,
    });
  }

  // Calculate regular installments
  if (installmentCount > 0 && financedAmount > 0) {
    // Use custom amounts if provided, otherwise calculate equal installments
    const installmentAmounts = customInstallmentAmounts && customInstallmentAmounts.length === installmentCount
      ? customInstallmentAmounts
      : Array(installmentCount).fill(financedAmount / installmentCount);

    for (let i = 0; i < installmentCount; i++) {
      const installmentDate = calculateDueDate(startDate, i + 1, frequency);
      const amount = installmentAmounts[i];
      
      const frequencyText = frequency === 'monthly' ? 'mensual' : 
                           frequency === 'weekly' ? 'semanal' :
                           frequency === 'biweekly' ? 'quincenal' : 'trimestral';

      installments.push({
        number: i + 1,
        amount,
        dueDate: installmentDate,
        description: `Cuota ${frequencyText} ${i + 1} de ${installmentCount}`,
        isDownPayment: false,
        currency,
      });
    }
  }

  return installments;
}

/**
 * Calculate due date based on frequency
 */
function calculateDueDate(
  startDate: Date,
  installmentNumber: number,
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'quarterly'
): Date {
  const date = new Date(startDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + (installmentNumber * 7));
      break;
    
    case 'biweekly':
      date.setDate(date.getDate() + (installmentNumber * 14));
      break;
    
    case 'monthly':
      date.setMonth(date.getMonth() + installmentNumber);
      break;
    
    case 'quarterly':
      date.setMonth(date.getMonth() + (installmentNumber * 3));
      break;
  }

  return date;
}

/**
 * Generate milestone-based payment plan (common for construction projects)
 */
export function generateMilestonePaymentPlan(
  totalAmount: number,
  currency: 'USD' | 'ARS',
  startDate: Date = new Date()
): InstallmentPlan[] {
  const milestones = [
    { percentage: 20, description: 'Anticipo - Inicio del proyecto', days: 0 },
    { percentage: 15, description: 'Finalización de planos', days: 30 },
    { percentage: 20, description: 'Inicio de obra - Fundaciones', days: 60 },
    { percentage: 15, description: 'Estructura y techos', days: 120 },
    { percentage: 15, description: 'Instalaciones y acabados', days: 180 },
    { percentage: 15, description: 'Entrega final del proyecto', days: 240 },
  ];

  return milestones.map((milestone, index) => {
    const amount = (totalAmount * milestone.percentage) / 100;
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + milestone.days);

    return {
      number: index + 1,
      amount,
      dueDate,
      description: milestone.description,
      isDownPayment: index === 0,
      currency,
    };
  });
}

/**
 * Generate progressive payment plan (increasing amounts)
 */
export function generateProgressivePaymentPlan(
  totalAmount: number,
  installmentCount: number,
  currency: 'USD' | 'ARS',
  downPaymentAmount: number = 0,
  startDate: Date = new Date(),
  progressionRate: number = 1.1 // 10% increase per installment
): InstallmentPlan[] {
  const installments: InstallmentPlan[] = [];
  const financedAmount = totalAmount - downPaymentAmount;

  // Add down payment
  if (downPaymentAmount > 0) {
    installments.push({
      number: 0,
      amount: downPaymentAmount,
      dueDate: new Date(startDate),
      description: 'Anticipo inicial',
      isDownPayment: true,
      currency,
    });
  }

  // Calculate progressive amounts
  const baseAmount = financedAmount / installmentCount;
  let cumulativeMultiplier = 0;
  
  for (let i = 0; i < installmentCount; i++) {
    cumulativeMultiplier += Math.pow(progressionRate, i);
  }
  
  const adjustedBaseAmount = financedAmount / cumulativeMultiplier;

  for (let i = 0; i < installmentCount; i++) {
    const multiplier = Math.pow(progressionRate, i);
    const amount = adjustedBaseAmount * multiplier;
    const dueDate = calculateDueDate(startDate, i + 1, 'monthly');

    installments.push({
      number: i + 1,
      amount,
      dueDate,
      description: `Cuota progresiva mensual ${i + 1} de ${installmentCount}`,
      isDownPayment: false,
      currency,
    });
  }

  return installments;
}

/**
 * Validate installment plan totals
 */
export function validateInstallmentPlan(
  installments: InstallmentPlan[],
  expectedTotal: number,
  tolerance: number = 0.01
): { isValid: boolean; difference: number; totalCalculated: number } {
  const totalCalculated = installments.reduce((sum, installment) => sum + installment.amount, 0);
  const difference = Math.abs(totalCalculated - expectedTotal);
  const isValid = difference <= tolerance;

  return {
    isValid,
    difference,
    totalCalculated,
  };
}

/**
 * Get payment plan summary
 */
export function getPaymentPlanSummary(installments: InstallmentPlan[]) {
  const downPayment = installments.find(inst => inst.isDownPayment);
  const regularInstallments = installments.filter(inst => !inst.isDownPayment);
  
  const total = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const averageInstallment = regularInstallments.length > 0 
    ? regularInstallments.reduce((sum, inst) => sum + inst.amount, 0) / regularInstallments.length
    : 0;

  const firstPaymentDate = installments.length > 0 
    ? new Date(Math.min(...installments.map(inst => inst.dueDate.getTime())))
    : null;
  
  const lastPaymentDate = installments.length > 0 
    ? new Date(Math.max(...installments.map(inst => inst.dueDate.getTime())))
    : null;

  return {
    totalAmount: total,
    downPaymentAmount: downPayment?.amount || 0,
    downPaymentPercentage: downPayment ? (downPayment.amount / total) * 100 : 0,
    installmentCount: regularInstallments.length,
    averageInstallment,
    firstPaymentDate,
    lastPaymentDate,
    paymentPeriodMonths: firstPaymentDate && lastPaymentDate 
      ? Math.round((lastPaymentDate.getTime() - firstPaymentDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
      : 0,
  };
}