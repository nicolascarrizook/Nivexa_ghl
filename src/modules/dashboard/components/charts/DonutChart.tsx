import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { clsx } from 'clsx';

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

const defaultFormatValue = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.03) return null; // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
      style={{ fontSize: '11px' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, formatValue }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white p-3 border border-gray-200 shadow-sm">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          {formatValue(payload[0].value)}
        </p>
        <p className="text-xs text-gray-500">
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% del total
        </p>
      </div>
    );
  }
  return null;
};

export function DonutChart({
  data,
  title,
  subtitle,
  height = 300,
  loading = false,
  formatValue = defaultFormatValue,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 80,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        <div
          className="mt-4 animate-pulse rounded-full bg-gray-200 mx-auto"
          style={{ height: height - 50, width: height - 50 }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-4"
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="relative flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              innerRadius={55}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              paddingAngle={2}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            
            <Tooltip
              content={<CustomTooltip formatValue={formatValue} />}
            />
          </PieChart>
        </ResponsiveContainer>

        {(centerLabel || centerValue) && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            {centerLabel && (
              <p className="text-[10px] font-medium text-gray-400">{centerLabel}</p>
            )}
            {centerValue && (
              <p className="text-xs font-semibold text-gray-700 mt-0.5">{centerValue}</p>
            )}
          </div>
        )}
      </div>

      {/* Legend with values */}
      <div className="mt-4 pt-3 space-y-1.5 border-t border-gray-100">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{percentage}%</span>
                <span className="text-xs font-medium text-gray-900 min-w-[80px] text-right">
                  {formatValue(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}