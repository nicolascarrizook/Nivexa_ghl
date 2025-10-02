import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DateRangePicker, type DateRange } from './DateRangePicker'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Design System/Inputs/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Selector de rangos de fechas con presets comunes y soporte para año fiscal mexicano.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Texto placeholder cuando no hay selección',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el componente',
    },
    required: {
      control: 'boolean',
      description: 'Campo requerido',
    },
    showPresets: {
      control: 'boolean',
      description: 'Mostrar presets de fechas comunes',
    },
    showFiscalQuarters: {
      control: 'boolean',
      description: 'Mostrar trimestres del año fiscal',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

// Interactive wrapper component
function DateRangePickerWrapper(args: any) {
  const [dateRange, setDateRange] = useState<DateRange | null>(args.value || null)

  const handleChange = (range: DateRange) => {
    setDateRange(range)
    console.log('Date range changed:', range)
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <DateRangePicker
        {...args}
        value={dateRange}
        onChange={handleChange}
      />
      
      {/* Selection display */}
      {dateRange && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Rango Seleccionado:
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            <div><strong>Desde:</strong> {dateRange.start?.toLocaleDateString('es-MX') || 'Sin fecha'}</div>
            <div><strong>Hasta:</strong> {dateRange.end?.toLocaleDateString('es-MX') || 'Sin fecha'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Seleccionar rango de fechas',
    disabled: false,
    required: false,
    showPresets: true,
    showFiscalQuarters: true,
  },
}

export const WithoutPresets: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Seleccionar fechas',
    disabled: false,
    required: false,
    showPresets: false,
    showFiscalQuarters: false,
  },
}

export const OnlyFiscalQuarters: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Seleccionar trimestre fiscal',
    disabled: false,
    required: false,
    showPresets: false,
    showFiscalQuarters: true,
  },
}

export const WithInitialValue: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    value: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    placeholder: 'Seleccionar rango de fechas',
    disabled: false,
    required: false,
    showPresets: true,
    showFiscalQuarters: true,
  },
}

export const Required: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Seleccionar rango de fechas *',
    disabled: false,
    required: true,
    showPresets: true,
    showFiscalQuarters: true,
  },
}

export const Disabled: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Fechas no disponibles',
    disabled: true,
    required: false,
    showPresets: true,
    showFiscalQuarters: true,
  },
}

export const WithError: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Seleccionar rango de fechas',
    disabled: false,
    required: true,
    showPresets: true,
    showFiscalQuarters: true,
    error: 'Debe seleccionar un rango de fechas válido',
  },
}

export const WithSuccess: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    value: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date()
    },
    placeholder: 'Seleccionar rango de fechas',
    disabled: false,
    required: false,
    showPresets: true,
    showFiscalQuarters: true,
    success: 'Rango de fechas válido seleccionado',
  },
}

export const Loading: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Cargando fechas...',
    disabled: false,
    required: false,
    showPresets: true,
    showFiscalQuarters: true,
    loading: true,
  },
}

export const CustomPlaceholder: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Período de reporte - Año fiscal mexicano',
    disabled: false,
    required: false,
    showPresets: true,
    showFiscalQuarters: true,
  },
}

export const BusinessQuartersOnly: Story = {
  render: (args) => <DateRangePickerWrapper {...args} />,
  args: {
    placeholder: 'Seleccionar trimestre comercial',
    disabled: false,
    required: false,
    showPresets: false,
    showFiscalQuarters: true,
  },
}