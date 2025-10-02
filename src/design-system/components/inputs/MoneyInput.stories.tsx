import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { MoneyInput } from './MoneyInput'

const meta: Meta<typeof MoneyInput> = {
  title: 'Design System/Inputs/MoneyInput',
  component: MoneyInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input especializado para montos monetarios con soporte para Peso Mexicano, formateo automático y validación.',
      },
    },
  },
  argTypes: {
    currency: {
      control: 'select',
      options: ['MXN', 'USD', 'EUR'],
      description: 'Moneda a utilizar',
    },
    placeholder: {
      control: 'text',
      description: 'Texto placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el input',
    },
    required: {
      control: 'boolean',
      description: 'Campo requerido',
    },
    allowNegative: {
      control: 'boolean',
      description: 'Permitir números negativos',
    },
    percentageMode: {
      control: 'boolean',
      description: 'Modo porcentaje en lugar de moneda',
    },
    showCurrencySymbol: {
      control: 'boolean',
      description: 'Mostrar símbolo de moneda',
    },
    decimalPlaces: {
      control: 'number',
      min: 0,
      max: 4,
      description: 'Número de decimales',
    },
    min: {
      control: 'number',
      description: 'Valor mínimo permitido',
    },
    max: {
      control: 'number',
      description: 'Valor máximo permitido',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MoneyInput>

// Interactive wrapper component
function MoneyInputWrapper(args: any) {
  const [value, setValue] = useState<number | null>(args.value || null)

  const handleChange = (newValue: number | null) => {
    setValue(newValue)
    console.log('Money value changed:', newValue)
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <MoneyInput
        {...args}
        value={value}
        onChange={handleChange}
      />
      
      {/* Value display */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Valor actual:
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {value !== null ? (
            <>
              <div><strong>Numérico:</strong> {value}</div>
              <div><strong>Formateado:</strong> {
                args.percentageMode 
                  ? `${value}%`
                  : new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: args.currency || 'MXN'
                    }).format(value)
              }</div>
            </>
          ) : (
            'Sin valor'
          )}
        </div>
      </div>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Ingrese el monto',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
  },
}

export const PesoMexicano: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto en pesos mexicanos',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    value: 1250000, // $1,250,000 MXN
  },
}

export const DollarAmericano: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'USD',
    placeholder: 'Amount in US Dollars',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    value: 75000, // $75,000 USD
  },
}

export const Euro: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'EUR',
    placeholder: 'Betrag in Euro',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    value: 65000, // €65,000 EUR
  },
}

export const PercentageMode: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Porcentaje de comisión',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: true,
    showCurrencySymbol: false,
    decimalPlaces: 2,
    value: 15.5, // 15.5%
  },
}

export const WithNegatives: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Pérdida o ganancia',
    disabled: false,
    required: false,
    allowNegative: true,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    value: -25000, // -$25,000 MXN
  },
}

export const WithMinMax: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Presupuesto del proyecto',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    min: 100000, // $100,000 MXN minimum
    max: 50000000, // $50,000,000 MXN maximum
    value: 2500000, // $2,500,000 MXN
  },
}

export const Required: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto requerido *',
    disabled: false,
    required: true,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
  },
}

export const Disabled: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto no editable',
    disabled: true,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    value: 1000000, // $1,000,000 MXN
  },
}

export const Loading: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Calculando...',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    loading: true,
    value: 850000,
  },
}

export const WithError: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto del contrato',
    disabled: false,
    required: true,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    error: 'El monto debe ser mayor a $100,000 MXN',
    value: 50000,
  },
}

export const WithSuccess: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto aprobado',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 2,
    success: 'Monto válido y dentro del presupuesto',
    value: 3250000,
  },
}

export const NoDecimals: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto en pesos enteros',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 0,
    value: 1500000, // $1,500,000 MXN (no decimals)
  },
}

export const WithoutCurrencySymbol: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Solo número',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: false,
    decimalPlaces: 2,
    value: 750000,
  },
}

export const HighPrecision: Story = {
  render: (args) => <MoneyInputWrapper {...args} />,
  args: {
    currency: 'MXN',
    placeholder: 'Monto con alta precisión',
    disabled: false,
    required: false,
    allowNegative: false,
    percentageMode: false,
    showCurrencySymbol: true,
    decimalPlaces: 4,
    value: 1234.5678, // $1,234.5678 MXN
  },
}