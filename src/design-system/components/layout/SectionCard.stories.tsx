/**
 * SectionCard Stories for Nivexa CRM Design System
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SectionCard } from './SectionCard'
import type { PageAction } from './types'

const meta: Meta<typeof SectionCard> = {
  title: 'Design System/Layout/SectionCard',
  component: SectionCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tarjeta de sección para agrupar contenido relacionado con funcionalidad colapsable, headers, acciones y divisores. Perfecta para organizar información en secciones dentro de páginas.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SectionCard>

// Sample actions
const sampleActions: PageAction[] = [
  {
    id: 'edit',
    label: 'Editar',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    onClick: () => console.log('Editar'),
    variant: 'ghost'
  },
  {
    id: 'delete',
    label: 'Eliminar',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    onClick: () => console.log('Eliminar'),
    variant: 'danger'
  }
]

const sampleIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

// Default story
export const Default: Story = {
  args: {
    title: 'Información del Cliente',
    subtitle: 'Datos básicos y de contacto',
    icon: sampleIcon,
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la empresa
            </label>
            <div className="text-sm text-gray-900 dark:text-gray-100">TechCorp Solutions</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email de contacto
            </label>
            <div className="text-sm text-gray-900 dark:text-gray-100">contacto@techcorp.com</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <div className="text-sm text-gray-900 dark:text-gray-100">+1 (555) 123-4567</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Activo
            </span>
          </div>
        </div>
      </div>
    )
  }
}

// With actions
export const WithActions: Story = {
  args: {
    ...Default.args,
    actions: sampleActions
  }
}

// Collapsible
export const Collapsible: Story = {
  args: {
    ...Default.args,
    title: 'Sección Colapsable',
    subtitle: 'Esta sección puede expandirse y contraerse',
    collapsible: true,
    actions: sampleActions
  }
}

// Default collapsed
export const DefaultCollapsed: Story = {
  args: {
    ...Collapsible.args,
    defaultCollapsed: true
  }
}

// With badge
export const WithBadge: Story = {
  args: {
    ...Default.args,
    title: 'Proyectos Activos',
    badge: '3',
    badgeVariant: 'info'
  }
}

// Badge variants
export const BadgeVariants: Story = {
  args: {
    title: 'Estado del Sistema',
    children: (
      <div className="space-y-4">
        <SectionCard
          title="Todo funcionando"
          badge="OK"
          badgeVariant="success"
          padding="sm"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Todos los servicios están operativos.
          </p>
        </SectionCard>
        
        <SectionCard
          title="Advertencia detectada"
          badge="!"
          badgeVariant="warning"
          padding="sm"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uso elevado de CPU en el servidor.
          </p>
        </SectionCard>
        
        <SectionCard
          title="Error crítico"
          badge="Error"
          badgeVariant="error"
          padding="sm"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fallo en la conexión a la base de datos.
          </p>
        </SectionCard>
        
        <SectionCard
          title="Información general"
          badge="Info"
          badgeVariant="info"
          padding="sm"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mantenimiento programado para el domingo.
          </p>
        </SectionCard>
      </div>
    )
  }
}

// With help text
export const WithHelpText: Story = {
  args: {
    ...Default.args,
    helpText: 'Los datos mostrados se actualizan automáticamente. Los cambios pueden tardar hasta 5 minutos en reflejarse.'
  }
}

// Loading state
export const Loading: Story = {
  args: {
    title: 'Cargando Datos',
    subtitle: 'Obteniendo información del servidor',
    loading: true
  }
}

// Empty state
export const Empty: Story = {
  args: {
    title: 'Proyectos Recientes',
    subtitle: 'Últimos proyectos trabajados',
    empty: true,
    emptyMessage: 'No se han encontrado proyectos recientes',
    emptyAction: {
      id: 'create',
      label: 'Crear Proyecto',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => console.log('Crear proyecto'),
      variant: 'primary'
    }
  }
}

// Different backgrounds
export const TransparentBackground: Story = {
  args: {
    ...Default.args,
    background: 'transparent',
    border: false,
    shadow: 'none'
  }
}

export const GrayBackground: Story = {
  args: {
    ...Default.args,
    background: 'gray'
  }
}

// Different padding
export const CompactPadding: Story = {
  args: {
    ...Default.args,
    padding: 'sm',
    title: 'Sección Compacta'
  }
}

export const LargePadding: Story = {
  args: {
    ...Default.args,
    padding: 'xl',
    title: 'Sección Espaciosa'
  }
}

export const NoPadding: Story = {
  args: {
    title: 'Sin Espaciado Interno',
    subtitle: 'El contenido llega hasta los bordes',
    padding: 'none',
    children: (
      <div className="bg-gray-100 dark:bg-gray-700 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este contenido no tiene padding de la sección.
        </p>
      </div>
    )
  }
}

// Different shadows
export const NoShadow: Story = {
  args: {
    ...Default.args,
    shadow: 'none',
    title: 'Sin Sombra'
  }
}

export const LargeShadow: Story = {
  args: {
    ...Default.args,
    shadow: 'xl',
    title: 'Sombra Grande'
  }
}

// With footer
export const WithFooter: Story = {
  args: {
    ...Default.args,
    title: 'Factura #FAC-2024-001',
    subtitle: 'Factura emitida el 15 de diciembre de 2024',
    footerContent: (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: 15 Dic 2024, 10:30 AM
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            Descargar PDF
          </button>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
            Enviar por Email
          </button>
        </div>
      </div>
    )
  }
}

// With header content
export const WithHeaderContent: Story = {
  args: {
    ...Default.args,
    title: 'Configuración de Notificaciones',
    headerContent: (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Los cambios en las notificaciones se aplicarán inmediatamente.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

// With divider
export const WithDivider: Story = {
  args: {
    ...Default.args,
    showDivider: true
  }
}

// Controlled collapsed state
export const ControlledCollapsed: Story = {
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            {collapsed ? 'Expandir' : 'Contraer'} Sección
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Estado: {collapsed ? 'Contraída' : 'Expandida'}
          </span>
        </div>
        
        <SectionCard
          {...args}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    title: 'Sección Controlada',
    subtitle: 'El estado colapsado es controlado externamente',
    collapsible: true
  }
}

// Complex content example
export const ComplexContent: Story = {
  args: {
    title: 'Dashboard de Ventas',
    subtitle: 'Métricas y KPIs principales',
    badge: 'En vivo',
    badgeVariant: 'success',
    actions: [
      {
        id: 'refresh',
        label: 'Actualizar',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        onClick: () => console.log('Actualizar'),
        variant: 'ghost'
      }
    ],
    children: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">$124,532</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Ventas del mes</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">+12.5%</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Clientes activos</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">+5.2%</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">89%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Satisfacción</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">+2.1%</div>
        </div>
      </div>
    ),
    footerContent: (
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Última actualización: hace 2 minutos
      </div>
    )
  }
}

// Nested sections example
export const NestedSections: Story = {
  args: {
    title: 'Configuración del Sistema',
    subtitle: 'Ajustes generales y específicos',
    collapsible: true,
    children: (
      <div className="space-y-4">
        <SectionCard
          title="Configuración General"
          subtitle="Ajustes básicos del sistema"
          padding="sm"
          shadow="none"
          border={true}
        >
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
              <span className="ml-2 text-sm">Habilitar notificaciones</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" defaultChecked />
              <span className="ml-2 text-sm">Backup automático</span>
            </label>
          </div>
        </SectionCard>
        
        <SectionCard
          title="Configuración Avanzada"
          subtitle="Opciones para usuarios expertos"
          padding="sm"
          shadow="none"
          border={true}
          collapsible={true}
          defaultCollapsed={true}
        >
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
              <span className="ml-2 text-sm">Modo debug</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
              <span className="ml-2 text-sm">Logs detallados</span>
            </label>
          </div>
        </SectionCard>
      </div>
    )
  }
}