import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Button } from './Button'

// Icons for demo purposes
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const meta: Meta<typeof Button> = {
  title: 'Design System/Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente de botón profesional con múltiples variantes, estados de carga, iconos y soporte completo para modo oscuro. Diseñado para el CRM Nivexa con etiquetas en español.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Variante visual del botón',
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg', 'icon'],
      description: 'Tamaño del botón',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga con spinner',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Ancho completo del contenedor',
    },
    children: {
      control: 'text',
      description: 'Contenido del botón',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

// Basic variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Guardar Proyecto',
    onClick: action('primary-clicked'),
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancelar',
    onClick: action('secondary-clicked'),
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Editar Información',
    onClick: action('outline-clicked'),
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ver Detalles',
    onClick: action('ghost-clicked'),
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Eliminar Cliente',
    onClick: action('destructive-clicked'),
  },
}

// Sizes
export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Botón Pequeño',
    onClick: action('small-clicked'),
  },
}

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Botón Mediano',
    onClick: action('medium-clicked'),
  },
}

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Botón Grande',
    onClick: action('large-clicked'),
  },
}

// With Icons
export const WithLeftIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Guardar Cambios',
    leftIcon: <SaveIcon />,
    onClick: action('left-icon-clicked'),
  },
}

export const WithRightIcon: Story = {
  args: {
    variant: 'outline',
    children: 'Continuar',
    rightIcon: <ArrowRightIcon />,
    onClick: action('right-icon-clicked'),
  },
}

export const WithBothIcons: Story = {
  args: {
    variant: 'secondary',
    children: 'Descargar Reporte',
    leftIcon: <DownloadIcon />,
    rightIcon: <ArrowRightIcon />,
    onClick: action('both-icons-clicked'),
  },
}

// Icon only buttons
export const IconOnly: Story = {
  args: {
    variant: 'primary',
    size: 'icon',
    leftIcon: <EditIcon />,
    'aria-label': 'Editar elemento',
    onClick: action('icon-only-clicked'),
  },
}

export const IconOnlySecondary: Story = {
  args: {
    variant: 'secondary',
    size: 'icon',
    leftIcon: <PlusIcon />,
    'aria-label': 'Agregar nuevo',
    onClick: action('icon-only-secondary-clicked'),
  },
}

export const IconOnlyDestructive: Story = {
  args: {
    variant: 'destructive',
    size: 'icon',
    leftIcon: <TrashIcon />,
    'aria-label': 'Eliminar elemento',
    onClick: action('icon-only-destructive-clicked'),
  },
}

// States
export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Guardando...',
    loading: true,
    onClick: action('loading-clicked'),
  },
}

export const LoadingWithIcon: Story = {
  args: {
    variant: 'outline',
    children: 'Procesando Pago',
    leftIcon: <SaveIcon />,
    loading: true,
    onClick: action('loading-icon-clicked'),
  },
}

export const LoadingIconOnly: Story = {
  args: {
    variant: 'primary',
    size: 'icon',
    loading: true,
    'aria-label': 'Procesando',
    onClick: action('loading-icon-only-clicked'),
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Acción No Disponible',
    disabled: true,
    onClick: action('disabled-clicked'),
  },
}

export const DisabledWithIcon: Story = {
  args: {
    variant: 'outline',
    children: 'Editar (Bloqueado)',
    leftIcon: <EditIcon />,
    disabled: true,
    onClick: action('disabled-icon-clicked'),
  },
}

// Full width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Crear Nueva Propuesta',
    fullWidth: true,
    onClick: action('full-width-clicked'),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export const FullWidthWithIcon: Story = {
  args: {
    variant: 'secondary',
    children: 'Exportar Lista de Clientes',
    leftIcon: <DownloadIcon />,
    fullWidth: true,
    onClick: action('full-width-icon-clicked'),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

// Business context examples
export const SaveClient: Story = {
  args: {
    variant: 'primary',
    children: 'Guardar Cliente',
    leftIcon: <SaveIcon />,
    onClick: action('save-client-clicked'),
  },
}

export const EditProject: Story = {
  args: {
    variant: 'outline',
    children: 'Editar Proyecto',
    leftIcon: <EditIcon />,
    onClick: action('edit-project-clicked'),
  },
}

export const DeleteInvoice: Story = {
  args: {
    variant: 'destructive',
    children: 'Eliminar Factura',
    leftIcon: <TrashIcon />,
    onClick: action('delete-invoice-clicked'),
  },
}

export const CreateProposal: Story = {
  args: {
    variant: 'primary',
    children: 'Crear Propuesta',
    leftIcon: <PlusIcon />,
    rightIcon: <ArrowRightIcon />,
    size: 'lg',
    onClick: action('create-proposal-clicked'),
  },
}

export const ProcessingPayment: Story = {
  args: {
    variant: 'primary',
    children: 'Procesando Pago...',
    loading: true,
    disabled: true,
    onClick: action('processing-payment-clicked'),
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Todas las Variantes
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button variant="primary" onClick={action('primary-showcase')}>
          Primario
        </Button>
        <Button variant="secondary" onClick={action('secondary-showcase')}>
          Secundario
        </Button>
        <Button variant="outline" onClick={action('outline-showcase')}>
          Contorno
        </Button>
        <Button variant="ghost" onClick={action('ghost-showcase')}>
          Fantasma
        </Button>
        <Button variant="destructive" onClick={action('destructive-showcase')}>
          Destructivo
        </Button>
      </div>
    </div>
  ),
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Todos los Tamaños
      </h3>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary" size="sm" onClick={action('small-showcase')}>
          Pequeño
        </Button>
        <Button variant="primary" size="md" onClick={action('medium-showcase')}>
          Mediano
        </Button>
        <Button variant="primary" size="lg" onClick={action('large-showcase')}>
          Grande
        </Button>
        <Button variant="primary" size="icon" leftIcon={<EditIcon />} aria-label="Icono" onClick={action('icon-showcase')} />
      </div>
    </div>
  ),
}

// Interactive examples
export const InteractiveExample: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)
    const [count, setCount] = React.useState(0)

    const handleSave = () => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setCount(count + 1)
      }, 2000)
    }

    return (
      <div className="space-y-4 p-6 max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ejemplo Interactivo
        </h3>
        <div className="space-y-3">
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSave}
            leftIcon={!loading ? <SaveIcon /> : undefined}
            fullWidth
          >
            {loading ? 'Guardando...' : 'Guardar Proyecto'}
          </Button>
          
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setCount(count + 1)}
            leftIcon={<PlusIcon />}
            fullWidth
          >
            Incrementar Contador
          </Button>
          
          <Button
            variant="ghost"
            disabled={loading || count === 0}
            onClick={() => setCount(Math.max(0, count - 1))}
            fullWidth
          >
            Decrementar Contador
          </Button>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Estado:
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <div><strong>Contador:</strong> {count}</div>
              <div><strong>Cargando:</strong> {loading ? 'Sí' : 'No'}</div>
              <div><strong>Veces guardado:</strong> {Math.floor(count / 2)}</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
}