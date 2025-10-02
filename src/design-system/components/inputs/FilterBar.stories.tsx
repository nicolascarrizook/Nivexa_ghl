import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FilterBar, type FilterConfig, type ActiveFilter, type FilterPreset } from './FilterBar'

const meta: Meta<typeof FilterBar> = {
  title: 'Design System/Inputs/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Sistema avanzado de filtros con múltiples tipos, presets y gestión de estado para el CRM.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar todos los filtros',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FilterBar>

// Sample filter configurations for CRM
const crmFilters: FilterConfig[] = [
  {
    id: 'busqueda',
    label: 'Búsqueda',
    type: 'text',
    placeholder: 'Buscar por nombre, empresa...'
  },
  {
    id: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
      { id: 'activo', label: 'Activo', value: 'activo' },
      { id: 'inactivo', label: 'Inactivo', value: 'inactivo' },
      { id: 'prospecto', label: 'Prospecto', value: 'prospecto' },
      { id: 'cliente', label: 'Cliente', value: 'cliente' }
    ]
  },
  {
    id: 'fecha_creacion',
    label: 'Fecha de Creación',
    type: 'date'
  },
  {
    id: 'monto',
    label: 'Monto del Proyecto',
    type: 'numberRange',
    min: 0,
    max: 100000000
  },
  {
    id: 'ciudad',
    label: 'Ciudad',
    type: 'select',
    options: [
      { id: 'cdmx', label: 'Ciudad de México', value: 'cdmx' },
      { id: 'guadalajara', label: 'Guadalajara', value: 'guadalajara' },
      { id: 'monterrey', label: 'Monterrey', value: 'monterrey' },
      { id: 'puebla', label: 'Puebla', value: 'puebla' },
      { id: 'tijuana', label: 'Tijuana', value: 'tijuana' }
    ]
  }
]

// Sample filter presets
const samplePresets: FilterPreset[] = [
  {
    id: 'clientes-activos',
    name: 'Clientes Activos',
    filters: {
      estado: 'activo'
    }
  },
  {
    id: 'proyectos-grandes',
    name: 'Proyectos Grandes',
    filters: {
      monto: [10000000, 100000000],
      estado: 'activo'
    }
  },
  {
    id: 'residencial-cdmx',
    name: 'Residencial CDMX',
    filters: {
      ciudad: 'cdmx',
      estado: 'activo'
    }
  }
]

// Interactive wrapper component
function FilterBarWrapper(args: any) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const handleFiltersChange = (filters: ActiveFilter[]) => {
    setActiveFilters(filters)
    setActivePreset(null)
    console.log('Filters changed:', filters)
  }

  const handlePresetLoad = (preset: FilterPreset) => {
    // Convert preset to active filters
    const filters: ActiveFilter[] = Object.entries(preset.filters).map(([filterId, value]) => {
      const config = crmFilters.find(f => f.id === filterId)
      return {
        filterId,
        label: config?.label || filterId,
        value,
        displayValue: Array.isArray(value) ? value.join(', ') : String(value)
      }
    })
    setActiveFilters(filters)
    setActivePreset(preset.id)
    console.log('Preset loaded:', preset)
  }

  return (
    <div className="w-full space-y-4">
      <FilterBar
        {...args}
        activeFilters={activeFilters}
        onFiltersChange={handleFiltersChange}
        onLoadPreset={handlePresetLoad}
      />
      
      {/* Current filters display */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Filtros Activos:
        </h4>
        {activeFilters.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ningún filtro aplicado
          </p>
        ) : (
          <div className="space-y-2">
            {activeFilters.map((filter) => (
              <div key={filter.filterId} className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {filter.displayValue}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {activePreset && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            <span className="font-medium">Preset activo:</span> {samplePresets.find(p => p.id === activePreset)?.name}
          </div>
        )}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <FilterBarWrapper {...args} />,
  args: {
    filters: crmFilters,
    presets: samplePresets,
    disabled: false,
  },
}

export const WithoutPresets: Story = {
  render: (args) => <FilterBarWrapper {...args} />,
  args: {
    filters: crmFilters,
    presets: [],
    disabled: false,
  },
}

export const SimpleFilters: Story = {
  render: (args) => <FilterBarWrapper {...args} />,
  args: {
    config: [
      {
        id: 'busqueda',
        label: 'Búsqueda',
        type: 'text',
        placeholder: 'Buscar...',
        group: 'general'
      },
      {
        id: 'estado',
        label: 'Estado',
        type: 'select',
        options: [
          { value: 'activo', label: 'Activo' },
          { value: 'inactivo', label: 'Inactivo' }
        ],
        group: 'general'
      }
    ],
    presets: [],
    disabled: false,
  },
}

export const FinancialFilters: Story = {
  render: (args) => <FilterBarWrapper {...args} />,
  args: {
    config: [
      {
        id: 'monto_minimo',
        label: 'Monto Mínimo',
        type: 'range',
        min: 0,
        max: 50000000,
        step: 100000,
        formatValue: (value) => new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0
        }).format(value),
        group: 'financiero'
      },
      {
        id: 'moneda',
        label: 'Moneda',
        type: 'select',
        options: [
          { value: 'MXN', label: 'Peso Mexicano (MXN)' },
          { value: 'USD', label: 'Dólar Americano (USD)' },
          { value: 'EUR', label: 'Euro (EUR)' }
        ],
        group: 'financiero'
      },
      {
        id: 'fecha_pago',
        label: 'Fecha de Pago',
        type: 'date',
        group: 'fechas'
      }
    ],
    presets: [
      {
        id: 'grandes-proyectos',
        name: 'Grandes Proyectos',
        description: 'Proyectos > $20M MXN',
        filters: {
          monto_minimo: [20000000, 50000000],
          moneda: 'MXN'
        } as Record<string, FilterValue>
      }
    ],
    disabled: false,
  },
}

export const Disabled: Story = {
  render: (args) => <FilterBarWrapper {...args} />,
  args: {
    filters: crmFilters,
    presets: samplePresets,
    disabled: true,
  },
}

export const WithInitialFilters: Story = {
  render: (args) => {
    const [filters, setFilters] = useState<Record<string, FilterValue>>({
      estado: 'activo',
      ciudad: 'cdmx',
      tipo_proyecto: ['residencial', 'comercial']
    })
    const [activePreset, setActivePreset] = useState<string | null>(null)

    const handleFiltersChange = (newFilters: Record<string, FilterValue>) => {
      setFilters(newFilters)
      setActivePreset(null)
      console.log('Filters changed:', newFilters)
    }

    const handlePresetSelect = (presetId: string) => {
      const preset = samplePresets.find(p => p.id === presetId)
      if (preset) {
        setFilters(preset.filters)
        setActivePreset(presetId)
      }
    }

    return (
      <div className="w-full space-y-4">
        <FilterBar
          {...args}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPresetSelect={handlePresetSelect}
        />
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Filtros Activos:
          </h4>
          <div className="space-y-2">
            {Object.entries(filters).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {crmFilters.find(f => f.id === key)?.label || key}:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  args: {
    filters: crmFilters,
    presets: samplePresets,
    disabled: false,
  },
}