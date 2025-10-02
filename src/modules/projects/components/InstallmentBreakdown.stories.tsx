import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InstallmentBreakdown } from './InstallmentBreakdown';
import { calculateInstallmentPlan, generateMilestonePaymentPlan, generateProgressivePaymentPlan } from '../utils/installmentCalculator';

const meta = {
  title: 'Modules/Projects/InstallmentBreakdown',
  component: InstallmentBreakdown,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    currency: {
      control: 'select',
      options: ['USD', 'ARS'],
      description: 'Currency for the installments',
    },
    exchangeRate: {
      control: { type: 'number', min: 1, max: 2000, step: 1 },
      description: 'Exchange rate for currency conversion display',
    },
  },
} satisfies Meta<typeof InstallmentBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const sampleInstallmentsARS = calculateInstallmentPlan({
  totalAmount: 5000000, // 5M ARS
  downPaymentAmount: 1000000, // 1M ARS down payment (20%)
  installmentCount: 6,
  currency: 'ARS',
  startDate: new Date('2024-02-01'),
  frequency: 'monthly',
});

const sampleInstallmentsUSD = calculateInstallmentPlan({
  totalAmount: 50000, // 50K USD
  downPaymentAmount: 10000, // 10K USD down payment (20%)
  installmentCount: 8,
  currency: 'USD',
  startDate: new Date('2024-02-01'),
  frequency: 'monthly',
});

const milestoneInstallments = generateMilestonePaymentPlan(
  75000, // 75K USD
  'USD',
  new Date('2024-01-15')
);

const progressiveInstallments = generateProgressivePaymentPlan(
  3000000, // 3M ARS
  5, // 5 installments
  'ARS',
  500000, // 500K ARS down payment
  new Date('2024-03-01'),
  1.15 // 15% increase per installment
);

// Interactive demo component
const InstallmentBreakdownDemo = () => {
  const [selectedPlan, setSelectedPlan] = React.useState<string>('standard');
  const [currency, setCurrency] = React.useState<'USD' | 'ARS'>('ARS');
  const [exchangeRate, setExchangeRate] = React.useState(1000);

  const getPlanData = () => {
    switch (selectedPlan) {
      case 'milestone':
        return {
          installments: milestoneInstallments,
          totalAmount: 75000,
          currency: 'USD' as const,
        };
      case 'progressive':
        return {
          installments: progressiveInstallments,
          totalAmount: 3000000,
          currency: 'ARS' as const,
        };
      case 'usd':
        return {
          installments: sampleInstallmentsUSD,
          totalAmount: 50000,
          currency: 'USD' as const,
        };
      default:
        return {
          installments: sampleInstallmentsARS,
          totalAmount: 5000000,
          currency: 'ARS' as const,
        };
    }
  };

  const planData = getPlanData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Interactive Installment Breakdown Demo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Plan Type
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="standard">Standard - ARS (6 cuotas)</option>
              <option value="usd">Standard - USD (8 cuotas)</option>
              <option value="milestone">Milestone-Based - USD</option>
              <option value="progressive">Progressive - ARS</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'USD' | 'ARS')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="ARS">Pesos Argentinos (ARS)</option>
              <option value="USD">US Dollars (USD)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange Rate (USD to ARS)
            </label>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              min="1"
              max="2000"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
        </div>
        
        <InstallmentBreakdown
          installments={planData.installments}
          totalAmount={planData.totalAmount}
          currency={planData.currency}
          exchangeRate={exchangeRate}
        />
      </div>

      <div className="bg-gray-900 border border-gray-200 rounded-lg p-4">
        <h3 className="text-gray-600 font-semibold mb-2">Component Features</h3>
        <div className="text-gray-600 text-sm space-y-1">
          <div>• <strong>Multiple payment plan types</strong>: Standard, milestone-based, progressive</div>
          <div>• <strong>Currency conversion display</strong>: Shows equivalent in other currency</div>
          <div>• <strong>Visual status indicators</strong>: Down payment, overdue, due soon</div>
          <div>• <strong>Comprehensive summary</strong>: Total amount, averages, payment period</div>
          <div>• <strong>Date calculations</strong>: Automatic due date generation</div>
          <div>• <strong>Progress indicators</strong>: Percentage of total for each payment</div>
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InstallmentBreakdownDemo />,
};

export const StandardPlanARS: Story = {
  args: {
    installments: sampleInstallmentsARS,
    totalAmount: 5000000,
    currency: 'ARS',
    exchangeRate: 1000,
  },
};

export const StandardPlanUSD: Story = {
  args: {
    installments: sampleInstallmentsUSD,
    totalAmount: 50000,
    currency: 'USD',
    exchangeRate: 1000,
  },
};

export const MilestoneBased: Story = {
  args: {
    installments: milestoneInstallments,
    totalAmount: 75000,
    currency: 'USD',
    exchangeRate: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Milestone-based payment plan typically used for construction and architectural projects, with payments tied to project phases.',
      },
    },
  },
};

export const ProgressivePlan: Story = {
  args: {
    installments: progressiveInstallments,
    totalAmount: 3000000,
    currency: 'ARS',
    exchangeRate: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progressive payment plan where each installment is larger than the previous one, accounting for inflation or cash flow preferences.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    installments: [],
    totalAmount: 0,
    currency: 'ARS',
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state shown when no payment plan has been configured yet.',
      },
    },
  },
};

// Small single payment
const singlePayment = calculateInstallmentPlan({
  totalAmount: 25000,
  downPaymentAmount: 25000, // 100% down payment
  installmentCount: 0,
  currency: 'USD',
  includeDownPaymentInSchedule: true,
});

export const SinglePayment: Story = {
  args: {
    installments: singlePayment,
    totalAmount: 25000,
    currency: 'USD',
    exchangeRate: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Single lump sum payment (100% down payment scenario).',
      },
    },
  },
};

// Large number of installments
const manyInstallments = calculateInstallmentPlan({
  totalAmount: 120000,
  downPaymentAmount: 20000,
  installmentCount: 24, // 2 years
  currency: 'USD',
  startDate: new Date('2024-01-01'),
});

export const ManyInstallments: Story = {
  args: {
    installments: manyInstallments,
    totalAmount: 120000,
    currency: 'USD',
    exchangeRate: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Payment plan with many installments (24 months) showing scrollable interface.',
      },
    },
  },
};