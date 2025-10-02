import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle, Clock, AlertTriangle, User, Star, TrendingUp, TrendingDown } from 'lucide-react';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Data Display/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componente de badge para mostrar etiquetas, estados y categorías en el CRM mexicano con soporte para diferentes variantes y tamaños.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
      description: 'Variante visual del badge'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del badge'
    },
    dot: {
      control: 'boolean',
      description: 'Mostrar solo como punto de color'
    },
    pill: {
      control: 'boolean',
      description: 'Forma redondeada completa (pill)'
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Posición del icono'
    },
    pulse: {
      control: 'boolean',
      description: 'Animación de pulso'
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia básica
export const Default: Story = {
  args: {
    children: 'Etiqueta'
  }
};

// Variantes
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Por Defecto</Badge>
      <Badge variant="primary">Principal</Badge>
      <Badge variant="success">Éxito</Badge>
      <Badge variant="warning">Advertencia</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Información</Badge>
    </div>
  )
};

// Tamaños
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-600">Pequeño</div>
        <Badge size="sm" variant="primary">SM</Badge>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-600">Mediano</div>
        <Badge size="md" variant="primary">MD</Badge>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-600">Grande</div>
        <Badge size="lg" variant="primary">LG</Badge>
      </div>
    </div>
  )
};

// Estados CRM mexicanos
export const CRMStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Estados de Cliente</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<CheckCircle />}>Activo</Badge>
          <Badge variant="warning" icon={<Clock />}>Pendiente</Badge>
          <Badge variant="error">Inactivo</Badge>
          <Badge variant="info">Prospecto</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Estados de Proyecto</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">En Progreso</Badge>
          <Badge variant="success">Completado</Badge>
          <Badge variant="warning">En Revisión</Badge>
          <Badge variant="error">Cancelado</Badge>
          <Badge variant="info">Propuesta</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Estados de Facturación</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Pagado</Badge>
          <Badge variant="warning">Vencido</Badge>
          <Badge variant="error">Cancelado</Badge>
          <Badge variant="info">Borrador</Badge>
          <Badge variant="primary">Enviado</Badge>
        </div>
      </div>
    </div>
  )
};

// Con iconos
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Iconos a la izquierda</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<CheckCircle />}>Verificado</Badge>
          <Badge variant="warning" icon={<AlertTriangle />}>Pendiente</Badge>
          <Badge variant="info" icon={<User />}>Cliente VIP</Badge>
          <Badge variant="primary" icon={<Star />}>Premium</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Iconos a la derecha</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<TrendingUp />} iconPosition="right">+15%</Badge>
          <Badge variant="error" icon={<TrendingDown />} iconPosition="right">-8%</Badge>
          <Badge variant="info" icon={<User />} iconPosition="right">Asignado</Badge>
        </div>
      </div>
    </div>
  )
};

// Formas
export const Shapes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Forma normal</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">Rectangular</Badge>
          <Badge variant="success">Esquinas redondeadas</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Forma pill</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary" pill>Completamente redondeado</Badge>
          <Badge variant="success" pill>Forma pill</Badge>
        </div>
      </div>
    </div>
  )
};

// Puntos de estado
export const StatusDots: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Indicadores de estado</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge dot variant="success" />
            <span className="text-sm">Sistema operativo</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge dot variant="warning" />
            <span className="text-sm">Mantenimiento programado</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge dot variant="error" />
            <span className="text-sm">Fuera de servicio</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge dot variant="info" />
            <span className="text-sm">Información disponible</span>
          </div>
        </div>
      </div>
    </div>
  )
};

// Interactivos
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Badges clickeables</h3>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="primary" 
            onClick={() => alert('Badge clickeado!')}
          >
            Clickeame
          </Badge>
          <Badge 
            variant="success" 
            icon={<CheckCircle />}
            onClick={() => alert('Acción ejecutada!')}
          >
            Ejecutar acción
          </Badge>
          <Badge 
            variant="warning"
            disabled
            onClick={() => alert('No debería ejecutarse')}
          >
            Deshabilitado
          </Badge>
        </div>
      </div>
    </div>
  )
};

// Contexto mexicano específico
export const MexicanContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Categorías de Cliente</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">PYME</Badge>
          <Badge variant="success">Empresa Grande</Badge>
          <Badge variant="info">Gobierno</Badge>
          <Badge variant="warning">Persona Física</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Estados Fiscales</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">RFC Válido</Badge>
          <Badge variant="error">RFC Inválido</Badge>
          <Badge variant="warning">Pendiente SAT</Badge>
          <Badge variant="info">En Trámite</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Regiones</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary" pill>CDMX</Badge>
          <Badge variant="primary" pill>Jalisco</Badge>
          <Badge variant="primary" pill>Nuevo León</Badge>
          <Badge variant="primary" pill>Yucatán</Badge>
          <Badge variant="primary" pill>Quintana Roo</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Montos de Venta</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<TrendingUp />}>Alto ($500K+ MXN)</Badge>
          <Badge variant="warning" icon={<TrendingUp />}>Medio ($100K-500K MXN)</Badge>
          <Badge variant="info" icon={<TrendingUp />}>Bajo (menos de $100K MXN)</Badge>
        </div>
      </div>
    </div>
  )
};

// Con animaciones
export const Animated: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" pulse>En vivo</Badge>
      <Badge variant="warning" pulse>Procesando</Badge>
      <Badge variant="primary" pulse>Nuevo</Badge>
    </div>
  )
};