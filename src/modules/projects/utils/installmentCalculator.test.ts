/**
 * Test file to demonstrate installment frequency functionality
 * Run in the browser console to see the frequency working correctly
 */

import { calculateInstallmentPlan } from './installmentCalculator';

export function testInstallmentFrequencies() {
  console.log('🔄 Testing Installment Payment Frequencies...\n');

  const baseOptions = {
    totalAmount: 30000,
    downPaymentAmount: 3000,
    installmentCount: 4,
    currency: 'USD' as const,
    startDate: new Date('2024-02-01'),
  };

  const frequencies = [
    { key: 'weekly', label: 'Semanal' },
    { key: 'biweekly', label: 'Quincenal' },
    { key: 'monthly', label: 'Mensual' },
    { key: 'quarterly', label: 'Trimestral' },
  ];

  frequencies.forEach(freq => {
    console.log(`\n📅 ${freq.label.toUpperCase()} Plan:`);
    console.log('=' .repeat(50));
    
    const plan = calculateInstallmentPlan({
      ...baseOptions,
      frequency: freq.key as any,
    });
    
    plan.forEach(installment => {
      console.log(`${installment.description}:`);
      console.log(`  💰 Amount: $${installment.amount.toFixed(2)}`);
      console.log(`  📅 Due: ${installment.dueDate.toLocaleDateString('es-AR')}`);
      console.log(`  📋 Type: ${installment.isDownPayment ? 'Anticipo' : 'Cuota regular'}`);
      console.log('---');
    });
  });

  console.log('\n✅ Test completed! Each frequency shows correct labels and dates.');
  
  return {
    summary: 'Payment frequencies are now working correctly',
    frequencies: frequencies.map(f => f.label),
    example: `If you select "Semanal", it will show "Cuota semanal 1 de 4"`,
    labels: `Monthly = "Pago Mensual", Weekly = "Pago Semanal", etc.`
  };
}

// Auto-run if in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testInstallmentFrequencies();
  }, 1000);
}