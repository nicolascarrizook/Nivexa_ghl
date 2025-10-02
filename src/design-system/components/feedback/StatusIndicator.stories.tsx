import type { Meta, StoryObj } from '@storybook/react';
import { Heart, Wifi, Database, Shield, Zap } from 'lucide-react';
import StatusIndicator from './StatusIndicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Design System/Feedback/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Indicador visual de estado con soporte para animaciones, diferentes tamaños y variantes de color.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info', 'processing', 'pending', 'active', 'inactive'],
      description: 'Variante del estado',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del indicador',
    },
    labelPosition: {
      control: 'select',
      options: ['right', 'left', 'top', 'bottom'],
      description: 'Posición del texto relativo al indicador',
    },
    pulse: {
      control: 'boolean',
      description: 'Mostrar animación de pulso',
    },
    indicatorOnly: {
      control: 'boolean',
      description: 'Solo mostrar el indicador sin texto',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Todas las variantes
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <StatusIndicator variant="success" label="Éxito" />
        <StatusIndicator variant="error" label="Error" />
        <StatusIndicator variant="warning" label="Advertencia" />
        <StatusIndicator variant="info" label="Información" />
        <StatusIndicator variant="processing" label="Procesando" />
        <StatusIndicator variant="pending" label="Pendiente" />
        <StatusIndicator variant="active" label="Activo" pulse />
        <StatusIndicator variant="inactive" label="Inactivo" />
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Todos los tamaños
      </h3>
      <div className="flex items-center gap-6">
        <StatusIndicator variant="success" label="XS" size="xs" />
        <StatusIndicator variant="success" label="SM" size="sm" />
        <StatusIndicator variant="success" label="MD" size="md" />
        <StatusIndicator variant="success" label="LG" size="lg" />
        <StatusIndicator variant="success" label="XL" size="xl" />
      </div>
    </div>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Posiciones del texto
      </h3>
      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <StatusIndicator 
            variant="info" 
            label="Izquierda" 
            labelPosition="left" 
            size="lg" 
          />
        </div>
        <div className="text-center">
          <StatusIndicator 
            variant="info" 
            label="Derecha" 
            labelPosition="right" 
            size="lg" 
          />
        </div>
        <div className="text-center">
          <StatusIndicator 
            variant="info" 
            label="Arriba" 
            labelPosition="top" 
            size="lg" 
          />
        </div>
        <div className="text-center">
          <StatusIndicator 
            variant="info" 
            label="Abajo" 
            labelPosition="bottom" 
            size="lg" 
          />
        </div>
      </div>
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Con descripciones
      </h3>
      <div className="space-y-3">
        <StatusIndicator 
          variant="success" 
          label="Sistema operativo" 
          description="Todos los servicios funcionando correctamente"
          size="md" 
        />
        <StatusIndicator 
          variant="warning" 
          label="Base de datos" 
          description="Latencia elevada detectada"
          size="md" 
        />
        <StatusIndicator 
          variant="error" 
          label="API externa" 
          description="Servicio no disponible"
          size="md" 
        />
        <StatusIndicator 
          variant="processing" 
          label="Respaldo" 
          description="Creando copia de seguridad..."
          size="md" 
        />
      </div>
    </div>
  ),
};

export const IndicatorOnly: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Solo indicadores
      </h3>
      <div className="flex items-center gap-4">
        <StatusIndicator variant="success" indicatorOnly size="xs" />
        <StatusIndicator variant="warning" indicatorOnly size="sm" />
        <StatusIndicator variant="error" indicatorOnly size="md" />
        <StatusIndicator variant="processing" indicatorOnly size="lg" />
        <StatusIndicator variant="active" indicatorOnly pulse size="xl" />
      </div>
    </div>
  ),
};

export const WithCustomIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Iconos personalizados
      </h3>
      <div className="space-y-3">
        <StatusIndicator 
          variant="success" 
          label="Salud del sistema" 
          customIcon={<Heart className="w-4 h-4" />}
        />
        <StatusIndicator 
          variant="info" 
          label="Conexión WiFi" 
          customIcon={<Wifi className="w-4 h-4" />}
        />
        <StatusIndicator 
          variant="warning" 
          label="Base de datos" 
          customIcon={<Database className="w-4 h-4" />}
        />
        <StatusIndicator 
          variant="error" 
          label="Seguridad" 
          customIcon={<Shield className="w-4 h-4" />}
        />
        <StatusIndicator 
          variant="processing" 
          label="Rendimiento" 
          customIcon={<Zap className="w-4 h-4" />}
        />
      </div>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Indicadores clickeables
      </h3>
      <div className="space-y-3">
        <StatusIndicator 
          variant="success" 
          label="Servidor principal" 
          description="Hacer clic para ver detalles"
          onClick={() => alert('Ver detalles del servidor')}
        />
        <StatusIndicator 
          variant="warning" 
          label="Notificaciones" 
          description="3 alertas pendientes"
          onClick={() => alert('Abrir panel de notificaciones')}
        />
        <StatusIndicator 
          variant="processing" 
          label="Sincronización" 
          description="Hacer clic para pausar"
          onClick={() => alert('Pausar sincronización')}
        />
      </div>
    </div>
  ),
};

export const WithPulse: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Con animación de pulso
      </h3>
      <div className="flex items-center gap-6">
        <StatusIndicator 
          variant="success" 
          label="En línea" 
          pulse 
          size="lg" 
        />
        <StatusIndicator 
          variant="warning" 
          label="Alerta activa" 
          pulse 
          size="lg" 
        />
        <StatusIndicator 
          variant="processing" 
          label="Sincronizando" 
          size="lg" 
        />
        <StatusIndicator 
          variant="active" 
          label="Transmitiendo" 
          size="lg" 
        />
      </div>
    </div>
  ),
};

export const SystemStatus: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Estado del sistema
      </h3>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            API Principal
          </span>
          <StatusIndicator variant="success" label="Operativo" size="sm" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Base de Datos
          </span>
          <StatusIndicator variant="warning" label="Latencia alta" size="sm" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            CDN
          </span>
          <StatusIndicator variant="error" label="Sin conexión" size="sm" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Respaldo
          </span>
          <StatusIndicator variant="processing" label="En progreso" size="sm" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Monitoreo
          </span>
          <StatusIndicator variant="active" label="Activo" pulse size="sm" />
        </div>
      </div>
    </div>
  ),
};

export const UserStatus: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Estado de usuarios
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Ana García
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Diseñadora UX
            </div>
          </div>
          <StatusIndicator variant="active" label="En línea" size="sm" pulse />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Carlos López
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Desarrollador
            </div>
          </div>
          <StatusIndicator variant="warning" label="Ocupado" size="sm" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              María Rodríguez
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Project Manager
            </div>
          </div>
          <StatusIndicator variant="inactive" label="Ausente" size="sm" />
        </div>
      </div>
    </div>
  ),
};

export const Default: Story = {
  args: {
    variant: 'success',
    label: 'Sistema operativo',
    description: 'Todos los servicios funcionando correctamente',
    size: 'md',
    labelPosition: 'right',
    pulse: false,
    indicatorOnly: false,
    disabled: false,
  },
};