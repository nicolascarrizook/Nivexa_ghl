import { clsx } from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import CountUp from "react-countup";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  sparklineData?: Array<{ value: number }>;
  icon?: ReactNode;
  description?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray" | "indigo";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
  green: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
  purple: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
  orange: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
  red: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
  indigo: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    spark: "#6B7280",
    icon: "bg-gray-100 text-gray-600",
  },
};

export function KPICard({
  title,
  value,
  previousValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  sparklineData,
  icon,
  description,
  color = "blue",
  loading = false,
}: KPICardProps) {
  const changePercentage = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  const isPositive = changePercentage >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white p-6 transition-all border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-col gap-3">
          {icon && (
            <div className={clsx("rounded-xl p-3", colorClasses[color].icon)}>
              {icon}
            </div>
          )}
          <p className="text-sm font-semibold text-gray-600">{title}</p>
        </div>
      </div>

      <div className="mb-3">
        {loading ? (
          <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
        ) : (
          <div className="flex items-end gap-2">
            <p className="text-xl font-semibold text-gray-900">
              {prefix}
              <CountUp
                start={previousValue || 0}
                end={value}
                duration={1.5}
                decimals={decimals}
                separator=","
              />
              {suffix}
            </p>
            {previousValue !== undefined && (
              <div
                className={clsx(
                  "mb-1 rounded-md px-2.5 py-1 text-xs font-semibold",
                  isPositive
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {isPositive ? "+" : ""}
                {changePercentage.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="mb-4 text-sm font-medium text-gray-500">
          {description}
        </p>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12 w-full -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient
                  id={`gradient-${color}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colorClasses[color].spark}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colorClasses[color].spark}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white">
                        {prefix}
                        {payload[0].value}
                        {suffix}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colorClasses[color].spark}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subtle background pattern */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, ${colorClasses[color].spark} 1px, transparent 1px)`,
          backgroundSize: "10px 10px",
        }}
      />
    </motion.div>
  );
}
