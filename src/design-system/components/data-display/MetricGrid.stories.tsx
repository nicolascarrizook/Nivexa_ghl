import type { Meta, StoryObj } from '@storybook/react';
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  ShoppingCart, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  Target,
  Clock,
  Award 
} from 'lucide-react';
import MetricGrid from './MetricGrid/MetricGrid';
import type { StatCardProps } from './StatCard/StatCard';

const meta = {
  title: 'Design System/Data Display/MetricGrid',
  component: MetricGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Grilla responsiva para mostrar múltiples métricas del CRM con layout automático y animaciones.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Número de columnas en desktop',
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Espaciado entre elementos',
    },
    responsive: {
      control: 'boolean',
      description: 'Layout responsivo automático',
    },
    animated: {
      control: 'boolean',
      description: 'Animaciones de entrada',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
} satisfies Meta<typeof MetricGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Métricas de ejemplo para CRM
const crmMetrics: StatCardProps[] = [
  {
    title: 'Clientes Totales',
    value: '15,234',
    change: { value: 12.5, period: 'vs mes anterior' },
    trend: 'up',
    icon: Users,
    description: 'Base total de clientes registrados',
  },
  {
    title: 'Ingresos del Mes',
    value: '$127,500',
    change: { value: 8.2, period: 'vs mes anterior' },
    trend: 'up',
    icon: DollarSign,
    description: 'Ingresos recurrentes mensuales',
    sparklineData: [85, 92, 78, 95, 108, 115, 127],
  },
  {
    title: 'Tasa de Conversión',
    value: '4.2%',
    change: { value: -0.8, period: 'vs mes anterior' },
    trend: 'down',
    icon: Activity,
    description: 'Leads convertidos a clientes',
  },
  {
    title: 'Tickets Abiertos',
    value: '23',
    change: { value: -15.2, period: 'vs semana anterior' },
    trend: 'down',
    icon: TrendingUp,
    description: 'Casos de soporte pendientes',
  },
];

const salesMetrics: StatCardProps[] = [
  {
    title: 'Ventas del Día',
    value: '$4,250',
    change: { value: 15.3, period: 'vs ayer' },
    trend: 'up',
    icon: DollarSign,
    variant: 'success',
  },
  {
    title: 'Productos Vendidos',
    value: '127',
    change: { value: 8.1, period: 'vs ayer' },
    trend: 'up',
    icon: ShoppingCart,
    variant: 'info',
  },
  {
    title: 'Tasa de Cierre',
    value: '23.5%',
    change: { value: 2.1, period: 'vs semana anterior' },
    trend: 'up',
    icon: Target,
    variant: 'warning',
  },
];

const marketingMetrics: StatCardProps[] = [
  {
    title: 'Visitas Web',
    value: '12,543',
    change: { value: 18.7, period: 'vs semana anterior' },
    trend: 'up',
    icon: Eye,
    sparklineData: [89, 95, 102, 87, 94, 108, 125],
  },
  {
    title: 'Leads Generados',
    value: '456',
    change: { value: 12.3, period: 'vs semana anterior' },
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Tasa de Apertura Email',
    value: '24.5%',
    change: { value: 3.2, period: 'vs campaña anterior' },
    trend: 'up',
    icon: Mail,
  },
  {
    title: 'Llamadas Realizadas',
    value: '89',
    change: { value: -5.1, period: 'vs semana anterior' },
    trend: 'down',
    icon: Phone,
  },
  {
    title: 'Citas Programadas',
    value: '34',
    change: { value: 21.4, period: 'vs semana anterior' },
    trend: 'up',
    icon: Calendar,
  },
  {
    title: 'Tiempo Resp. Promedio',
    value: '2.3h',
    change: { value: -12.5, period: 'vs mes anterior' },
    trend: 'down',
    icon: Clock,
  },
];

const executiveMetrics: StatCardProps[] = [
  {
    title: 'Ingresos Anuales',
    value: '$2.4M',
    change: { value: 23.1, period: 'vs año anterior' },
    trend: 'up',
    icon: DollarSign,
    variant: 'success',
    size: 'lg',
    sparklineData: [180, 195, 210, 185, 220, 235, 240],
  },
  {
    title: 'Crecimiento Trimestral',
    value: '15.7%',
    change: { value: 4.2, period: 'vs trimestre anterior' },
    trend: 'up',
    icon: TrendingUp,
    variant: 'success',
    size: 'lg',
  },
  {
    title: 'Satisfacción Cliente',
    value: '94.5%',
    change: { value: 2.1, period: 'vs trimestre anterior' },
    trend: 'up',
    icon: Award,
    variant: 'info',
    size: 'lg',
  },
];

export const Default: Story = {
  args: {
    metrics: crmMetrics,
  },
  parameters: {
    layout: 'padded',
  },
};

export const TwoColumns: Story = {
  args: {
    metrics: salesMetrics,
    columns: 2,
    gap: 'lg',
  },
  parameters: {
    layout: 'padded',
  },
};

export const ThreeColumns: Story = {
  args: {
    metrics: salesMetrics,
    columns: 3,
    gap: 'md',
  },
  parameters: {
    layout: 'padded',
  },
};

export const SixColumns: Story = {
  args: {
    metrics: marketingMetrics,
    columns: 6,
    gap: 'sm',
  },
  parameters: {
    layout: 'padded',
  },
};

export const SmallGap: Story = {
  args: {
    metrics: crmMetrics,
    gap: 'sm',
  },
  parameters: {
    layout: 'padded',
  },
};

export const LargeGap: Story = {
  args: {
    metrics: crmMetrics,
    gap: 'lg',
  },
  parameters: {
    layout: 'padded',
  },
};

export const WithoutAnimation: Story = {
  args: {
    metrics: crmMetrics,
    animated: false,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Loading: Story = {
  args: {
    metrics: [],
    loading: true,
    columns: 4,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Empty: Story = {
  args: {
    metrics: [],
  },
  parameters: {
    layout: 'padded',
  },
};

export const ExecutiveDashboard: Story = {
  args: {
    metrics: executiveMetrics,
    columns: 3,
    gap: 'lg',
    onMetricClick: (metric, index) => {
      console.log('Métrica clickeada:', metric.title, 'Índice:', index);
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Dashboard ejecutivo con métricas de alto nivel y tamaños grandes.',
      },
    },
  },
};

export const MarketingDashboard: Story = {
  args: {
    metrics: marketingMetrics,
    columns: 6,
    responsive: true,
    animated: true,
    staggerDelay: 0.15,
    onMetricClick: (metric, index) => {
      alert(`Ver detalles de: ${metric.title}`);
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Dashboard de marketing con múltiples métricas en diseño compacto.',
      },
    },
  },
};

export const SalesDashboard: Story = {
  args: {
    metrics: salesMetrics,
    columns: 3,
    gap: 'md',
    animated: true,
    onMetricClick: (metric, index) => {
      console.log('Analizar:', metric.title);
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Dashboard de ventas con métricas clave del equipo comercial.',
      },
    },
  },
};

export const NonResponsive: Story = {
  args: {
    metrics: crmMetrics,
    columns: 4,
    responsive: false,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Grilla con layout fijo (no responsivo) para casos específicos.',
      },
    },
  },
};

export const CompleteDashboard: Story = {
  render: () => (
    <div className="p-6 space-y-8 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Dashboard Ejecutivo
        </h2>
        <MetricGrid
          metrics={executiveMetrics}
          columns={3}
          gap="lg"
          onMetricClick={(metric) => console.log('Ejecutivo:', metric.title)}
        />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Métricas de Ventas
        </h3>
        <MetricGrid
          metrics={salesMetrics}
          columns={3}
          gap="md"
          onMetricClick={(metric) => console.log('Ventas:', metric.title)}
        />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Métricas de Marketing
        </h3>
        <MetricGrid
          metrics={marketingMetrics}
          columns={6}
          gap="sm"
          staggerDelay={0.05}
          onMetricClick={(metric) => console.log('Marketing:', metric.title)}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Dashboard completo mostrando diferentes niveles de métricas organizadas por secciones.',
      },
    },
  },
};