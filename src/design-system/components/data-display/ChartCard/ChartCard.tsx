import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { 
  Download, 
  Maximize2, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Info
} from 'lucide-react';

export interface ChartData {
  [key: string]: any;
}

export interface ChartCardProps {
  /** Título del gráfico */
  title: string;
  /** Descripción opcional */
  description?: string;
  /** Datos para el gráfico */
  data: ChartData[];
  /** Tipo de gráfico */
  chartType: 'line' | 'area' | 'bar' | 'pie' | 'donut';
  /** Configuración del gráfico */
  config: {
    /** Clave para el eje X */
    xAxisKey: string;
    /** Configuración de las series de datos */
    series: Array<{
      key: string;
      name: string;
      color: string;
      type?: 'monotone' | 'linear' | 'step';
    }>;
    /** Mostrar grid */
    showGrid?: boolean;
    /** Mostrar tooltip */
    showTooltip?: boolean;
    /** Mostrar leyenda */
    showLegend?: boolean;
    /** Altura del gráfico */
    height?: number;
    /** Márgenes del gráfico */
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
  /** Valor destacado */
  highlightValue?: {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  };
  /** Estado de carga */
  loading?: boolean;
  /** Estado de error */
  error?: string;
  /** Función para exportar */
  onExport?: () => void;
  /** Función para maximizar */
  onMaximize?: () => void;
  /** Acciones adicionales */
  actions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Variante de color */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Rango de fechas */
  dateRange?: string;
  /** Callback cuando se hace clic en el gráfico */
  onChartClick?: (data: any) => void;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  data,
  chartType,
  config,
  highlightValue,
  loading = false,
  error,
  onExport,
  onMaximize,
  actions = [],
  size = 'md',
  variant = 'default',
  dateRange,
  onChartClick,
  className = '',
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const sizeConfig = {
    sm: {
      height: config.height || 200,
      padding: 'p-4',
      titleSize: 'text-sm',
      valueSize: 'text-lg',
      descSize: 'text-xs',
    },
    md: {
      height: config.height || 300,
      padding: 'p-6',
      titleSize: 'text-base',
      valueSize: 'text-xl',
      descSize: 'text-sm',
    },
    lg: {
      height: config.height || 400,
      padding: 'p-8',
      titleSize: 'text-lg',
      valueSize: 'text-2xl',
      descSize: 'text-base',
    },
  };

  const variantColors = {
    default: {
      border: 'border-neutral-200 dark:border-neutral-700',
      bg: 'bg-white dark:bg-neutral-900',
    },
    success: {
      border: 'border-success-200 dark:border-success-700',
      bg: 'bg-white dark:bg-neutral-900',
    },
    warning: {
      border: 'border-warning-200 dark:border-warning-700',
      bg: 'bg-white dark:bg-neutral-900',
    },
    error: {
      border: 'border-error-200 dark:border-error-700',
      bg: 'bg-white dark:bg-neutral-900',
    },
    info: {
      border: 'border-info-200 dark:border-info-700',
      bg: 'bg-white dark:bg-neutral-900',
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantColors[variant];

  // Configuración de colores para el modo oscuro
  const chartConfig = useMemo(() => ({
    ...config,
    margin: {
      top: 5,
      right: 5,
      left: 5,
      bottom: 5,
      ...config.margin,
    },
  }), [config]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center" style={{ height: currentSize.height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center flex-col gap-2" style={{ height: currentSize.height }}>
          <AlertCircle className="w-8 h-8 text-error-500" />
          <p className="text-sm text-error-600 dark:text-error-400 text-center">{error}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center flex-col gap-2" style={{ height: currentSize.height }}>
          <Info className="w-8 h-8 text-neutral-400" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No hay datos para mostrar</p>
        </div>
      );
    }

    const commonProps = {
      data,
      height: currentSize.height,
      onClick: onChartClick,
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={currentSize.height}>
            <LineChart {...commonProps} margin={chartConfig.margin}>
              {chartConfig.showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
              )}
              <XAxis 
                dataKey={chartConfig.xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-neutral-500 dark:text-neutral-400"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-neutral-500 dark:text-neutral-400"
              />
              {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.series.map((series) => (
                <Line
                  key={series.key}
                  type={series.type || 'monotone'}
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: series.color }}
                  activeDot={{ r: 5, fill: series.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={currentSize.height}>
            <AreaChart {...commonProps} margin={chartConfig.margin}>
              {chartConfig.showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
              )}
              <XAxis 
                dataKey={chartConfig.xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-neutral-500 dark:text-neutral-400"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-neutral-500 dark:text-neutral-400"
              />
              {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.series.map((series) => (
                <Area
                  key={series.key}
                  type={series.type || 'monotone'}
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  fill={series.color}
                  fillOpacity={0.1}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={currentSize.height}>
            <BarChart {...commonProps} margin={chartConfig.margin}>
              {chartConfig.showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
              )}
              <XAxis 
                dataKey={chartConfig.xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-neutral-500 dark:text-neutral-400"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-neutral-500 dark:text-neutral-400"
              />
              {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.series.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.name}
                  fill={series.color}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={currentSize.height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={chartType === 'donut' ? 40 : 0}
                outerRadius={Math.min(currentSize.height, 300) / 3}
                paddingAngle={2}
                dataKey={chartConfig.series[0]?.key}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartConfig.series[index % chartConfig.series.length]?.color || '#8884d8'} 
                  />
                ))}
              </Pie>
              {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {chartConfig.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getTrendIcon = () => {
    if (!highlightValue?.trend) return null;
    
    switch (highlightValue.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-600 dark:text-success-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-error-600 dark:text-error-400" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${currentVariant.border} ${currentVariant.bg} ${currentSize.padding} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${currentSize.titleSize}`}>
              {title}
            </h3>
            {dateRange && (
              <span className={`text-neutral-500 dark:text-neutral-400 ${currentSize.descSize}`}>
                {dateRange}
              </span>
            )}
          </div>
          
          {description && (
            <p className={`text-neutral-600 dark:text-neutral-400 ${currentSize.descSize}`}>
              {description}
            </p>
          )}
          
          {highlightValue && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`font-bold text-neutral-900 dark:text-neutral-100 ${currentSize.valueSize}`}>
                {highlightValue.value}
              </span>
              <span className={`text-neutral-600 dark:text-neutral-400 ${currentSize.descSize}`}>
                {highlightValue.label}
              </span>
              {highlightValue.change !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className={`${currentSize.descSize} ${
                    highlightValue.trend === 'up' 
                      ? 'text-success-600 dark:text-success-400'
                      : highlightValue.trend === 'down'
                        ? 'text-error-600 dark:text-error-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {highlightValue.change > 0 ? '+' : ''}{highlightValue.change}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1">
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Exportar"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Maximizar"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          
          {actions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Más acciones"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-10 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10 min-w-[150px]"
                >
                  {actions.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => {
                        action.onClick();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico */}
      {renderChart()}
    </motion.div>
  );
};

export default ChartCard;