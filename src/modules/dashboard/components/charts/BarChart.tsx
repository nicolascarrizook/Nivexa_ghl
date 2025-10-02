import { motion } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  name: string;
  [key: string]: any;
}

interface BarChartProps {
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
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
}

const defaultFormatValue = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function BarChart({
  data,
  dataKeys,
  title,
  subtitle,
  height = 300,
  loading = false,
  formatValue = defaultFormatValue,
  showLegend = true,
  showGrid = true,
  layout = 'vertical',
  stacked = false,
}: BarChartProps) {
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

  const isHorizontal = layout === 'horizontal';

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
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 30, left: isHorizontal ? 80 : 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" opacity={0.8} />
          )}
          
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
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
              <YAxis
                dataKey="name"
                type="category"
                stroke="#D1D5DB"
                style={{ fontSize: 12 }}
                width={70}
                tick={{ fontSize: 11 }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                stroke="#D1D5DB"
                style={{ fontSize: 12 }}
                tick={{ fontSize: 11 }}
                angle={data.length > 8 ? -45 : 0}
                textAnchor={data.length > 8 ? 'end' : 'middle'}
                height={data.length > 8 ? 100 : undefined}
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
            </>
          )}
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px',
              backdropFilter: 'blur(8px)',
            }}
            formatter={(value: number, name: string) => [
              formatValue(value),
              name,
            ]}
          />
          
          {showLegend && dataKeys.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
          )}
          
          {dataKeys.map((dataKey, index) => (
            <Bar
              key={dataKey.key}
              dataKey={dataKey.key}
              name={dataKey.name}
              fill={dataKey.color}
              stackId={stacked ? 'stack' : undefined}
              animationDuration={500 + index * 100}
              radius={[6, 6, 0, 0]}
            >
              {!stacked && dataKeys.length === 1 && (
                data.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={dataKey.color}
                    fillOpacity={0.8 + (idx * 0.02)}
                  />
                ))
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}