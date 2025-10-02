import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SearchCommand, type SearchCommandItem } from './SearchCommand'

const meta: Meta<typeof SearchCommand> = {
  title: 'Design System/Inputs/SearchCommand',
  component: SearchCommand,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente de búsqueda global con paleta de comandos estilo Cmd+K para navegación rápida en CRM.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Texto placeholder del input de búsqueda',
    },
    isLoading: {
      control: 'boolean',
      description: 'Estado de carga durante la búsqueda',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el componente',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SearchCommand>

// Sample data for stories
const sampleItems: SearchCommandItem[] = [
  // Clientes
  {
    id: 'cliente-1',
    title: 'Alejandro Martínez',
    description: 'Construcción Los Pinos - alejandro@lospinos.mx',
    category: 'clientes',
    keywords: ['construccion', 'pinos', 'contratista'],
    data: { type: 'cliente', companyId: '123' }
  },
  {
    id: 'cliente-2',
    title: 'María González',
    description: 'Desarrollos Urbanos SA - maria@urbanos.mx',
    category: 'clientes',
    keywords: ['desarrollos', 'urbanos', 'inmobiliaria'],
    data: { type: 'cliente', companyId: '124' }
  },
  {
    id: 'cliente-3',
    title: 'Carlos Rodríguez',
    description: 'Constructora del Norte - carlos@norte.mx',
    category: 'clientes',
    keywords: ['constructora', 'norte', 'industrial'],
    data: { type: 'cliente', companyId: '125' }
  },
  
  // Proyectos
  {
    id: 'proyecto-1',
    title: 'Torre Residencial Polanco',
    description: 'Proyecto de 20 pisos - $45,000,000 MXN',
    category: 'proyectos',
    keywords: ['torre', 'residencial', 'polanco', 'lujo'],
    data: { type: 'proyecto', budget: 45000000 }
  },
  {
    id: 'proyecto-2',
    title: 'Centro Comercial Santa Fe',
    description: 'Complejo comercial - $120,000,000 MXN',
    category: 'proyectos',
    keywords: ['centro', 'comercial', 'santa fe', 'retail'],
    data: { type: 'proyecto', budget: 120000000 }
  },
  {
    id: 'proyecto-3',
    title: 'Oficinas Corporativas Insurgentes',
    description: 'Edificio de oficinas - $80,000,000 MXN',
    category: 'proyectos',
    keywords: ['oficinas', 'corporativas', 'insurgentes', 'corporativo'],
    data: { type: 'proyecto', budget: 80000000 }
  },
  
  // Facturas
  {
    id: 'factura-1',
    title: 'FAC-2024-001',
    description: 'Factura por $250,000 MXN - Vencida',
    category: 'facturas',
    keywords: ['vencida', 'pendiente', 'pago'],
    data: { type: 'factura', amount: 250000, status: 'vencida' }
  },
  {
    id: 'factura-2',
    title: 'FAC-2024-002',
    description: 'Factura por $180,000 MXN - Pagada',
    category: 'facturas',
    keywords: ['pagada', 'completada'],
    data: { type: 'factura', amount: 180000, status: 'pagada' }
  },
  {
    id: 'factura-3',
    title: 'FAC-2024-003',
    description: 'Factura por $95,000 MXN - Pendiente',
    category: 'facturas',
    keywords: ['pendiente', 'revision'],
    data: { type: 'factura', amount: 95000, status: 'pendiente' }
  }
]

const recentSearches: SearchCommandItem[] = [
  sampleItems[0], // Alejandro Martínez
  sampleItems[3], // Torre Residencial Polanco
  sampleItems[6], // FAC-2024-001
]

const aiSuggestions: SearchCommandItem[] = [
  {
    id: 'ai-1',
    title: 'Clientes con facturas vencidas',
    description: 'Revisar clientes con pagos pendientes',
    category: 'clientes',
    keywords: ['vencidas', 'pendientes', 'cobranza'],
    data: { type: 'ai-suggestion', action: 'filter-overdue' }
  },
  {
    id: 'ai-2',
    title: 'Proyectos próximos a vencer',
    description: 'Proyectos que requieren atención urgente',
    category: 'proyectos',
    keywords: ['urgentes', 'vencimiento', 'deadline'],
    data: { type: 'ai-suggestion', action: 'filter-deadline' }
  }
]

// Interactive wrapper component
function SearchCommandWrapper(args: any) {
  const [selectedItem, setSelectedItem] = useState<SearchCommandItem | null>(null)

  const handleSelect = (item: SearchCommandItem) => {
    setSelectedItem(item)
    console.log('Selected item:', item)
  }

  return (
    <div className="w-full max-w-md">
      <SearchCommand
        {...args}
        onSelect={handleSelect}
      />
      
      {/* Selection feedback */}
      {selectedItem && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Seleccionado: {selectedItem.title}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Categoría: {selectedItem.category} | ID: {selectedItem.id}
          </div>
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: sampleItems,
    placeholder: 'Buscar clientes, proyectos, facturas...',
    isLoading: false,
    disabled: false,
  },
}

export const WithRecentSearches: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: sampleItems,
    recentSearches: recentSearches,
    placeholder: 'Buscar clientes, proyectos, facturas...',
    isLoading: false,
    disabled: false,
  },
}

export const WithAISuggestions: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: sampleItems,
    recentSearches: recentSearches,
    aiSuggestions: aiSuggestions,
    placeholder: 'Buscar clientes, proyectos, facturas...',
    isLoading: false,
    disabled: false,
  },
}

export const Loading: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: sampleItems,
    placeholder: 'Buscando...',
    isLoading: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: sampleItems,
    placeholder: 'Búsqueda no disponible',
    isLoading: false,
    disabled: true,
  },
}

export const EmptyResults: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: [],
    placeholder: 'Buscar clientes, proyectos, facturas...',
    isLoading: false,
    disabled: false,
  },
}

export const CustomPlaceholder: Story = {
  render: (args) => <SearchCommandWrapper {...args} />,
  args: {
    items: sampleItems,
    placeholder: 'Presiona ⌘K para buscar en tu CRM...',
    isLoading: false,
    disabled: false,
  },
}