import type { Meta, StoryObj } from '@storybook/react';
import { Users, DollarSign, Activity, TrendingUp, ShoppingCart, Eye } from 'lucide-react';
import StatCard from './StatCard/StatCard';

const meta = {
  title: 'Design System/Data Display/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tarjeta de estadísticas para mostrar métricas clave del CRM con indicadores de tendencia, iconos y mini gráficos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título de la métrica',
    },
    value: {
      control: 'text',
      description: 'Valor principal de la métrica',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Variante de color',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del componente',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Tendencia de la métrica',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
    error: {
      control: 'boolean',
      description: 'Estado de error',
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Clientes Activos',
    value: '2,543',
    change: {
      value: 12,
      period: 'vs mes anterior',
    },
    trend: 'up',
    icon: Users,
    description: 'Clientes que han interactuado en los últimos 30 días',
  },
};

export const Revenue: Story = {
  args: {
    title: 'Ingresos Mensuales',
    value: '$45,231',
    change: {
      value: 8.5,
      period: 'vs mes anterior',
    },
    trend: 'up',
    icon: DollarSign,
    variant: 'success',
    description: 'Ingresos totales del mes actual',
  },
};

export const ConversionRate: Story = {
  args: {
    title: 'Tasa de Conversión',
    value: '3.2%',
    change: {
      value: -2.1,
      period: 'vs mes anterior',
    },
    trend: 'down',
    icon: Activity,
    variant: 'warning',
    description: 'Porcentaje de leads convertidos a clientes',
  },
};

export const WithSparkline: Story = {
  args: {
    title: 'Visitas del Sitio',
    value: '12,543',
    change: {
      value: 15.3,
      period: 'vs semana anterior',
    },
    trend: 'up',
    icon: Eye,
    variant: 'info',
    sparklineData: [23, 45, 56, 78, 43, 56, 67, 89, 45, 67, 89, 90],
    description: 'Visitas únicas a la página principal',
  },
};

export const SmallSize: Story = {
  args: {
    title: 'Productos',
    value: '156',
    icon: ShoppingCart,
    size: 'sm',
    variant: 'default',
  },
};

export const LargeSize: Story = {
  args: {
    title: 'Ventas Totales',
    value: '$1.2M',
    change: {
      value: 25.6,
      period: 'vs trimestre anterior',
    },
    trend: 'up',
    icon: TrendingUp,
    size: 'lg',
    variant: 'success',
    description: 'Ventas acumuladas del trimestre',
    sparklineData: [100, 120, 80, 140, 160, 180, 150, 200, 220, 190, 210, 250],
  },
};

export const Loading: Story = {
  args: {
    title: 'Cargando...',
    value: '',
    loading: true,
    icon: Users,
  },
};

export const Error: Story = {
  args: {
    title: 'Datos no disponibles',
    value: '',
    error: true,
    icon: Users,
    variant: 'error',
  },
};

export const Clickable: Story = {
  args: {
    title: 'Leads Activos',
    value: '847',
    change: {
      value: 5.2,
      period: 'vs mes anterior',
    },
    trend: 'up',
    icon: Users,
    variant: 'default',
    description: 'Haz clic para ver más detalles',
    onClick: () => alert('Navegando a detalles de leads...'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4">
      <StatCard
        title="Default"
        value="1,234"
        icon={Users}
        variant="default"
        change={{ value: 12, period: 'vs anterior' }}
        trend="up"
      />
      <StatCard
        title="Success"
        value="$5,678"
        icon={DollarSign}
        variant="success"
        change={{ value: 8.5, period: 'vs anterior' }}
        trend="up"
      />
      <StatCard
        title="Warning"
        value="2.1%"
        icon={Activity}
        variant="warning"
        change={{ value: -1.2, period: 'vs anterior' }}
        trend="down"
      />
      <StatCard
        title="Error"
        value="0"
        icon={TrendingUp}
        variant="error"
        change={{ value: -15, period: 'vs anterior' }}
        trend="down"
      />
      <StatCard
        title="Info"
        value="999"
        icon={Eye}
        variant="info"
        change={{ value: 3.4, period: 'vs anterior' }}
        trend="up"
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const CRMDashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-neutral-50 dark:bg-neutral-950">
      <StatCard
        title="Clientes Totales"
        value="15,234"
        change={{ value: 12.5, period: 'vs mes anterior' }}
        trend="up"
        icon={Users}
        variant="default"
        description="Base total de clientes registrados"
        onClick={() => console.log('Ver clientes')}
      />
      <StatCard
        title="Ingresos del Mes"
        value="$127,500"
        change={{ value: 8.2, period: 'vs mes anterior' }}
        trend="up"
        icon={DollarSign}
        variant="success"
        description="Ingresos recurrentes mensuales"
        sparklineData={[85, 92, 78, 95, 108, 115, 127]}
        onClick={() => console.log('Ver ingresos')}
      />
      <StatCard
        title="Tasa de Conversión"
        value="4.2%"
        change={{ value: -0.8, period: 'vs mes anterior' }}
        trend="down"
        icon={Activity}
        variant="warning"
        description="Leads convertidos a clientes"
        onClick={() => console.log('Ver conversiones')}
      />
      <StatCard
        title="Tickets Abiertos"
        value="23"
        change={{ value: -15.2, period: 'vs semana anterior' }}
        trend="down"
        icon={TrendingUp}
        variant="info"
        description="Casos de soporte pendientes"
        onClick={() => console.log('Ver tickets')}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Ejemplo de un dashboard de CRM con múltiples métricas clave.',
      },
    },
  },
};