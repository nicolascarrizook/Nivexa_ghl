import type { Meta, StoryObj } from '@storybook/react';
import { Share, Settings, Eye, BarChart3 } from 'lucide-react';
import ChartCard from './ChartCard/ChartCard';

const meta = {
  title: 'Design System/Data Display/ChartCard',
  component: ChartCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tarjeta de gráfico con integración de Recharts, controles de exportación y múltiples tipos de visualización.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    chartType: {
      control: 'select',
      options: ['line', 'area', 'bar', 'pie', 'donut'],
      description: 'Tipo de gráfico',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del componente',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Variante de color',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
} satisfies Meta<typeof ChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Datos de ejemplo para ventas mensuales
const salesData = [
  { month: 'Ene', ventas: 4000, leads: 2400, conversion: 15 },
  { month: 'Feb', ventas: 3000, leads: 1398, conversion: 12 },
  { month: 'Mar', ventas: 2000, leads: 9800, conversion: 18 },
  { month: 'Abr', ventas: 2780, leads: 3908, conversion: 22 },
  { month: 'May', ventas: 1890, leads: 4800, conversion: 16 },
  { month: 'Jun', ventas: 2390, leads: 3800, conversion: 19 },
  { month: 'Jul', ventas: 3490, leads: 4300, conversion: 25 },
];

// Datos para ingresos trimestrales
const revenueData = [
  { quarter: 'Q1 2023', ingresos: 85000, gastos: 45000 },
  { quarter: 'Q2 2023', ingresos: 92000, gastos: 48000 },
  { quarter: 'Q3 2023', ingresos: 78000, gastos: 52000 },
  { quarter: 'Q4 2023', ingresos: 105000, gastos: 55000 },
  { quarter: 'Q1 2024', ingresos: 118000, gastos: 58000 },
];

// Datos para distribución de clientes
const clientsData = [
  { categoria: 'Empresas', cantidad: 245, color: '#6366f1' },
  { categoria: 'Startups', cantidad: 156, color: '#10b981' },
  { categoria: 'Freelancers', cantidad: 89, color: '#f59e0b' },
  { categoria: 'Agencias', cantidad: 67, color: '#ef4444' },
  { categoria: 'Otros', cantidad: 34, color: '#8b5cf6' },
];

// Datos para análisis semanal
const weeklyData = [
  { dia: 'Lun', visitas: 1200, conversiones: 24 },
  { dia: 'Mar', visitas: 1100, conversiones: 22 },
  { dia: 'Mié', visitas: 1400, conversiones: 35 },
  { dia: 'Jue', visitas: 1350, conversiones: 28 },
  { dia: 'Vie', visitas: 1600, conversiones: 42 },
  { dia: 'Sáb', visitas: 900, conversiones: 18 },
  { dia: 'Dom', visitas: 800, conversiones: 15 },
];

const baseChartConfig = {
  showGrid: true,
  showTooltip: true,
  showLegend: false,
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
};

export const LineChart: Story = {
  args: {
    title: 'Ventas Mensuales',
    description: 'Evolución de ventas e leads durante los últimos 7 meses',
    data: salesData,
    chartType: 'line',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [
        {
          key: 'ventas',
          name: 'Ventas',
          color: '#6366f1',
          type: 'monotone',
        },
        {
          key: 'leads',
          name: 'Leads',
          color: '#10b981',
          type: 'monotone',
        },
      ],
      showLegend: true,
    },
    highlightValue: {
      label: 'ventas este mes',
      value: '€3,490',
      change: 12.5,
      trend: 'up',
    },
    dateRange: 'Ene - Jul 2024',
  },
};

export const AreaChart: Story = {
  args: {
    title: 'Ingresos vs Gastos',
    description: 'Comparación trimestral de ingresos y gastos',
    data: revenueData,
    chartType: 'area',
    config: {
      ...baseChartConfig,
      xAxisKey: 'quarter',
      series: [
        {
          key: 'ingresos',
          name: 'Ingresos',
          color: '#10b981',
        },
        {
          key: 'gastos',
          name: 'Gastos',
          color: '#ef4444',
        },
      ],
      showLegend: true,
    },
    highlightValue: {
      label: 'margen este trimestre',
      value: '€60,000',
      change: 8.2,
      trend: 'up',
    },
    variant: 'success',
  },
};

export const BarChart: Story = {
  args: {
    title: 'Análisis Semanal',
    description: 'Visitas y conversiones por día de la semana',
    data: weeklyData,
    chartType: 'bar',
    config: {
      ...baseChartConfig,
      xAxisKey: 'dia',
      series: [
        {
          key: 'visitas',
          name: 'Visitas',
          color: '#6366f1',
        },
        {
          key: 'conversiones',
          name: 'Conversiones',
          color: '#f59e0b',
        },
      ],
      showLegend: true,
    },
    highlightValue: {
      label: 'conversiones promedio',
      value: '26.3',
      change: -2.1,
      trend: 'down',
    },
    variant: 'info',
  },
};

export const PieChart: Story = {
  args: {
    title: 'Distribución de Clientes',
    description: 'Segmentación por tipo de cliente',
    data: clientsData,
    chartType: 'pie',
    config: {
      ...baseChartConfig,
      xAxisKey: 'categoria',
      series: [
        {
          key: 'cantidad',
          name: 'Clientes',
          color: '#6366f1',
        },
      ],
      showLegend: true,
      showGrid: false,
    },
    highlightValue: {
      label: 'total de clientes',
      value: '591',
      change: 15.4,
      trend: 'up',
    },
  },
};

export const DonutChart: Story = {
  args: {
    title: 'Fuentes de Tráfico',
    description: 'Origen de visitantes del sitio web',
    data: [
      { fuente: 'Orgánico', porcentaje: 45 },
      { fuente: 'Directo', porcentaje: 25 },
      { fuente: 'Social', porcentaje: 15 },
      { fuente: 'Email', porcentaje: 10 },
      { fuente: 'Otros', porcentaje: 5 },
    ],
    chartType: 'donut',
    config: {
      ...baseChartConfig,
      xAxisKey: 'fuente',
      series: [
        {
          key: 'porcentaje',
          name: 'Porcentaje',
          color: '#6366f1',
        },
      ],
      showLegend: true,
      showGrid: false,
    },
    highlightValue: {
      label: 'tráfico orgánico',
      value: '45%',
      change: 3.2,
      trend: 'up',
    },
    variant: 'info',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Rendimiento de Ventas',
    description: 'Métricas clave con acciones disponibles',
    data: salesData,
    chartType: 'area',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [
        {
          key: 'ventas',
          name: 'Ventas',
          color: '#10b981',
        },
      ],
    },
    highlightValue: {
      label: 'ventas totales',
      value: '€21,550',
      change: 18.7,
      trend: 'up',
    },
    onExport: () => alert('Exportando gráfico...'),
    onMaximize: () => alert('Maximizando vista...'),
    actions: [
      {
        key: 'details',
        label: 'Ver detalles',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => alert('Mostrando detalles...'),
      },
      {
        key: 'config',
        label: 'Configurar',
        icon: <Settings className="w-4 h-4" />,
        onClick: () => alert('Abriendo configuración...'),
      },
      {
        key: 'share',
        label: 'Compartir',
        icon: <Share className="w-4 h-4" />,
        onClick: () => alert('Compartiendo gráfico...'),
      },
    ],
  },
};

export const SmallSize: Story = {
  args: {
    title: 'KPI Compacto',
    data: weeklyData.slice(0, 4),
    chartType: 'line',
    size: 'sm',
    config: {
      ...baseChartConfig,
      xAxisKey: 'dia',
      series: [
        {
          key: 'conversiones',
          name: 'Conversiones',
          color: '#6366f1',
        },
      ],
      height: 150,
    },
    highlightValue: {
      value: '27',
      label: 'conversiones',
      change: 5.2,
      trend: 'up',
    },
  },
};

export const LargeSize: Story = {
  args: {
    title: 'Dashboard Principal',
    description: 'Análisis detallado con múltiples métricas',
    data: salesData,
    chartType: 'bar',
    size: 'lg',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [
        {
          key: 'ventas',
          name: 'Ventas',
          color: '#6366f1',
        },
        {
          key: 'leads',
          name: 'Leads',
          color: '#10b981',
        },
        {
          key: 'conversion',
          name: 'Conversión %',
          color: '#f59e0b',
        },
      ],
      showLegend: true,
      height: 350,
    },
    highlightValue: {
      label: 'crecimiento mensual',
      value: '+25%',
      change: 12.8,
      trend: 'up',
    },
    dateRange: 'Período: Ene - Jul 2024',
    onExport: () => console.log('Exportar'),
    onMaximize: () => console.log('Maximizar'),
  },
};

export const Loading: Story = {
  args: {
    title: 'Cargando Datos',
    data: [],
    chartType: 'line',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [],
    },
    loading: true,
  },
};

export const Error: Story = {
  args: {
    title: 'Error en Datos',
    data: [],
    chartType: 'line',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [],
    },
    error: 'No se pudieron cargar los datos del servidor',
    variant: 'error',
  },
};

export const Empty: Story = {
  args: {
    title: 'Sin Datos',
    description: 'No hay información disponible para el período seleccionado',
    data: [],
    chartType: 'line',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [
        {
          key: 'ventas',
          name: 'Ventas',
          color: '#6366f1',
        },
      ],
    },
  },
};

export const Interactive: Story = {
  args: {
    title: 'Gráfico Interactivo',
    description: 'Haz clic en los puntos para más información',
    data: salesData,
    chartType: 'line',
    config: {
      ...baseChartConfig,
      xAxisKey: 'month',
      series: [
        {
          key: 'ventas',
          name: 'Ventas',
          color: '#6366f1',
          type: 'monotone',
        },
      ],
    },
    highlightValue: {
      label: 'último mes',
      value: '€3,490',
      change: 46.1,
      trend: 'up',
    },
    onChartClick: (data) => {
      alert(`Datos del punto: ${JSON.stringify(data, null, 2)}`);
    },
    onExport: () => alert('Descargando como PNG...'),
  },
};

export const DashboardExample: Story = {
  args: {
    title: 'Dashboard Example',
    data: [],
    chartType: 'area',
    config: { xAxisKey: 'month', series: [] }
  },
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <ChartCard
        title="Ventas del Trimestre"
        description="Evolución trimestral de ingresos"
        data={revenueData}
        chartType="area"
        config={{
          ...baseChartConfig,
          xAxisKey: 'quarter',
          series: [
            {
              key: 'ingresos',
              name: 'Ingresos',
              color: '#10b981',
            },
          ],
          height: 250,
        }}
        highlightValue={{
          label: 'ingresos Q1',
          value: '€118K',
          change: 12.4,
          trend: 'up',
        }}
        variant="success"
        onExport={() => console.log('Exportar ingresos')}
      />
      
      <ChartCard
        title="Distribución de Clientes"
        description="Segmentación por categoría"
        data={clientsData}
        chartType="donut"
        config={{
          ...baseChartConfig,
          xAxisKey: 'categoria',
          series: [
            {
              key: 'cantidad',
              name: 'Clientes',
              color: '#6366f1',
            },
          ],
          showLegend: true,
          showGrid: false,
          height: 250,
        }}
        highlightValue={{
          label: 'total clientes',
          value: '591',
          change: 8.5,
          trend: 'up',
        }}
        variant="info"
      />
      
      <ChartCard
        title="Performance Semanal"
        description="Métricas de conversión diaria"
        data={weeklyData}
        chartType="bar"
        config={{
          ...baseChartConfig,
          xAxisKey: 'dia',
          series: [
            {
              key: 'conversiones',
              name: 'Conversiones',
              color: '#f59e0b',
            },
          ],
          height: 250,
        }}
        highlightValue={{
          label: 'conversiones hoy',
          value: '42',
          change: 15.2,
          trend: 'up',
        }}
        variant="warning"
        actions={[
          {
            key: 'analyze',
            label: 'Análisis detallado',
            icon: <BarChart3 className="w-4 h-4" />,
            onClick: () => console.log('Análisis'),
          },
        ]}
      />
      
      <ChartCard
        title="Tendencia de Ventas"
        description="Últimos 7 meses de actividad"
        data={salesData}
        chartType="line"
        config={{
          ...baseChartConfig,
          xAxisKey: 'month',
          series: [
            {
              key: 'ventas',
              name: 'Ventas',
              color: '#6366f1',
              type: 'monotone',
            },
            {
              key: 'leads',
              name: 'Leads',
              color: '#10b981',
              type: 'monotone',
            },
          ],
          showLegend: true,
          height: 250,
        }}
        highlightValue={{
          label: 'crecimiento mensual',
          value: '+25%',
          change: 25.4,
          trend: 'up',
        }}
        dateRange='Ene - Jul 2024'
        onMaximize={() => console.log('Maximizar ventas')}
        onExport={() => console.log('Exportar ventas')}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Dashboard completo con múltiples gráficos mostrando diferentes tipos de visualización.',
      },
    },
  },
};