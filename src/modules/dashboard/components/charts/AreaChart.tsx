import { motion } from 'framer-motion';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataPoint {
  date: string;
  [key: string]: any;
}

interface AreaChartProps {
  data: DataPoint[];
  dataKeys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  title?: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

const defaultFormatValue = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function AreaChart({
  data,
  dataKeys,
  title,
  subtitle,
  height = 300,
  loading = false,
  formatValue = defaultFormatValue,
  showLegend = true,
  showGrid = true,
  stacked = true,
}: AreaChartProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        <div
          className="mt-4 animate-pulse rounded bg-gray-200"
          style={{ height }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full p-4"
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" opacity={0.8} />
          )}
          
          <XAxis
            dataKey="date"
            stroke="#D1D5DB"
            style={{ fontSize: 12 }}
            tickFormatter={(value) => {
              try {
                const date = new Date(value);
                return format(date, 'dd MMM', { locale: es });
              } catch {
                return value;
              }
            }}
          />
          
          <YAxis
            stroke="#D1D5DB"
            style={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              }
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={(label) => {
              try {
                const date = new Date(label);
                return format(date, "d 'de' MMMM, yyyy", { locale: es });
              } catch {
                return label;
              }
            }}
            formatter={(value: number) => formatValue(value)}
          />
          
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
          )}
          
          <defs>
            {dataKeys.map((dataKey) => (
              <linearGradient
                key={dataKey.key}
                id={`gradient-${dataKey.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={dataKey.color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={dataKey.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          
          {dataKeys.map((dataKey, index) => (
            <Area
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stackId={stacked ? '1' : undefined}
              stroke={dataKey.color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey.key})`}
              animationDuration={500 + index * 100}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}