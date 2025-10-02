import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ProgressIndicatorProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const VARIANT_CONFIG = {
  default: {
    bg: 'bg-gray-200',
    fill: 'bg-gray-900',
    text: 'text-gray-600',
  },
  success: {
    bg: 'bg-gray-100',
    fill: 'bg-gray-100',
    text: 'text-gray-600',
  },
  warning: {
    bg: 'bg-amber-100',
    fill: 'bg-amber-500',
    text: 'text-amber-600',
  },
  danger: {
    bg: 'bg-gray-100',
    fill: 'bg-gray-100',
    text: 'text-gray-600',
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    container: 'h-1.5',
    text: 'text-xs',
  },
  md: {
    container: 'h-2.5',
    text: 'text-sm',
  },
  lg: {
    container: 'h-3',
    text: 'text-base',
  },
} as const;

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = 'md',
  variant = 'default',
  showLabel = true,
  label,
  animated = true,
  className,
}) => {
  const variantConfig = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Determine variant based on progress if not specified
  const getAutoVariant = (progress: number) => {
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'default';
    if (progress >= 40) return 'warning';
    return 'danger';
  };

  const finalVariant = variant === 'default' && progress > 0 ? getAutoVariant(progress) : variant;
  const finalVariantConfig = VARIANT_CONFIG[finalVariant];

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className={clsx(
            'font-medium',
            sizeConfig.text,
            finalVariantConfig.text
          )}>
            {label || 'Progreso'}
          </span>
          <span className={clsx(
            'font-semibold tabular-nums',
            sizeConfig.text,
            finalVariantConfig.text
          )}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      
      <div className={clsx(
        'w-full rounded-full overflow-hidden',
        sizeConfig.container,
        finalVariantConfig.bg,
        ''
      )}>
        <motion.div
          className={clsx(
            'h-full rounded-full transition-all duration-300 ease-out',
            finalVariantConfig.fill,
            ''
          )}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${clampedProgress}%` }}
          transition={animated ? {
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 15
          } : undefined}
        >
          {/* Shimmer effect for active progress */}
          {clampedProgress > 0 && clampedProgress < 100 && (
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Progress milestones */}
      {size === 'lg' && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};

// Circular progress variant
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className,
}) => {
  const variantConfig = VARIANT_CONFIG[variant];
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-gray-200"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={variantConfig.fill.replace('bg-', 'stroke-')}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx(
            'font-semibold tabular-nums',
            size > 80 ? 'text-lg' : size > 60 ? 'text-base' : 'text-sm',
            variantConfig.text
          )}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};