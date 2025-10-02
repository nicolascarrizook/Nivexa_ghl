import { motion } from 'framer-motion';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataPoint {
  date: string;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  lines: Array<{
    key: string;
    color: string;
    name: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  }>;
  title?: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  showBrush?: boolean;
  referenceLines?: Array<{
    y: number;
    label: string;
    color: string;
  }>;
}

const defaultFormatValue = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(value);
};

export function LineChart({
  data,
  lines,
  title,
  subtitle,
  height = 300,
  loading = false,
  formatValue = defaultFormatValue,
  showLegend = true,
  showGrid = true,
  showBrush = false,
  referenceLines = [],
}: LineChartProps) {
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
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: showBrush ? 30 : 0 }}
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
                return format(date, 'dd/MM', { locale: es });
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px',
              backdropFilter: 'blur(8px)',
            }}
            labelFormatter={(label) => {
              try {
                const date = new Date(label);
                return format(date, "d 'de' MMMM, yyyy", { locale: es });
              } catch {
                return label;
              }
            }}
            formatter={(value: number, name: string) => [
              formatValue(value),
              name,
            ]}
          />
          
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
              iconType="line"
            />
          )}
          
          {referenceLines.map((refLine, index) => (
            <ReferenceLine
              key={index}
              y={refLine.y}
              label={{
                value: refLine.label,
                position: 'right',
                style: { fill: refLine.color, fontSize: 12 },
              }}
              stroke={refLine.color}
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
          ))}
          
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              dot={false}
              activeDot={{ r: 6, fill: line.color }}
              animationDuration={500 + index * 100}
            />
          ))}
          
          {showBrush && (
            <Brush
              dataKey="date"
              height={30}
              stroke="#D1D5DB"
              fill="#F3F4F6"
              tickFormatter={(value) => {
                try {
                  const date = new Date(value);
                  return format(date, 'dd/MM', { locale: es });
                } catch {
                  return value;
                }
              }}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}