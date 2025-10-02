import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const colorClasses = {
  blue: 'bg-gray-100 border-gray-200 text-gray-600',
  green: 'bg-gray-100 border-gray-200 text-gray-600',
  purple: 'bg-gray-100 border-gray-200 text-gray-600',
  orange: 'bg-gray-100 border-gray-200 text-gray-600',
  red: 'bg-gray-100 border-gray-200 text-gray-600',
};

const iconColorClasses = {
  blue: 'bg-gray-100 text-gray-600',
  green: 'bg-gray-100 text-gray-600',
  purple: 'bg-gray-100 text-gray-600',
  orange: 'bg-gray-100 text-gray-600',
  red: 'bg-gray-100 text-gray-600',
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function MetricCard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendLabel,
  icon,
  color = 'blue',
  size = 'md',
  loading = false,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) {
      return <Minus className="h-4 w-4" />;
    }
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-gray-600' : 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'relative overflow-hidden rounded-2xl bg-white transition-shadow border border-gray-200',
        sizeClasses[size]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          
          <div className="mt-2 flex items-baseline">
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {prefix}
                <CountUp
                  start={0}
                  end={value}
                  duration={1.5}
                  decimals={decimals}
                  separator=","
                />
                {suffix}
              </p>
            )}
          </div>

          {trend !== undefined && (
            <div className={clsx('mt-2 flex items-center gap-1', getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(trend).toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="text-sm text-gray-600">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={clsx(
              'rounded-xl p-2.5',
              iconColorClasses[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Decorative gradient */}
      <div
        className={clsx(
          'absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10',
          colorClasses[color].split(' ')[0]
        )}
        style={{
          background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}