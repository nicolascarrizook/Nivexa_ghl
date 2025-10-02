import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded-md';
      case 'circular':
        return 'rounded-full aspect-square';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  if (animation === 'wave') {
    return (
      <div
        className={clsx(baseClasses, getVariantClasses(), 'relative overflow-hidden', className)}
        style={style}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (animation === 'none') {
    return (
      <div
        className={clsx('bg-gray-200', getVariantClasses(), className)}
        style={style}
      />
    );
  }

  return (
    <div
      className={clsx(baseClasses, getVariantClasses(), className)}
      style={style}
    />
  );
};

// Project Card Skeleton
export const ProjectCardSkeleton: React.FC<{ variant?: 'default' | 'compact' }> = ({
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <Skeleton variant="rounded" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2" height={12} />
            </div>
          </div>
          <Skeleton variant="rounded" width={60} height={24} />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center space-y-1">
            <Skeleton variant="text" width={80} height={20} className="mx-auto" />
            <Skeleton variant="text" width={40} height={12} className="mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton variant="text" width={60} height={20} className="mx-auto" />
            <Skeleton variant="text" width={50} height={12} className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton variant="rounded" width={48} height={48} />
            <div className="space-y-2">
              <Skeleton variant="text" width={180} height={20} />
              <Skeleton variant="text" width={120} height={16} />
            </div>
          </div>
          <Skeleton variant="rounded" width={32} height={32} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Client Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={120} />
          </div>
          <Skeleton variant="rounded" width={70} height={24} />
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={100} height={20} />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width={70} />
            <Skeleton variant="text" width={90} />
          </div>
          <Skeleton variant="rectangular" className="w-full h-2 rounded-full" />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={40} />
          </div>
          <Skeleton variant="rectangular" className="w-full h-2 rounded-full" />
        </div>

        {/* Next Payment */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width={100} />
            </div>
            <Skeleton variant="text" width={80} />
          </div>
          <Skeleton variant="text" width={150} height={12} />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Skeleton variant="text" width={80} />
          <div className="flex space-x-2">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Projects List Skeleton
export const ProjectsListSkeleton: React.FC<{ count?: number; variant?: 'grid' | 'table' }> = ({
  count = 6,
  variant = 'grid',
}) => {
  if (variant === 'table') {
    return (
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-3 text-left">
                    <Skeleton variant="text" width={80} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: count }).map((_, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Skeleton variant="text" width={150} />
                      <Skeleton variant="text" width={100} height={12} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton variant="text" width={120} />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton variant="rounded" width={70} height={24} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Skeleton variant="text" width={90} />
                      <Skeleton variant="text" width={80} height={12} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="rectangular" width={60} height={4} className="rounded-full" />
                      <Skeleton variant="text" width={30} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Skeleton variant="text" width={80} />
                      <Skeleton variant="text" width={70} height={12} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <ProjectCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

// Project Details Skeleton
export const ProjectDetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Skeleton variant="text" width={100} />
              <span className="mx-2">/</span>
              <Skeleton variant="text" width={150} />
            </div>

            {/* Project Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Skeleton variant="rounded" width={64} height={64} />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton variant="text" width={300} height={28} />
                    <Skeleton variant="rounded" width={80} height={28} />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={150} />
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between w-96">
                      <Skeleton variant="text" width={120} />
                      <Skeleton variant="text" width={40} />
                    </div>
                    <Skeleton variant="rectangular" width={384} height={8} className="rounded-full" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" width={40} height={40} />
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-t border-gray-200 -mb-px mt-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <Skeleton variant="text" width={80} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg  border border-gray-200 p-6">
              <Skeleton variant="text" width={200} height={24} className="mb-4" />
              <div className="space-y-3">
                <Skeleton variant="text" className="w-full" />
                <Skeleton variant="text" className="w-5/6" />
                <Skeleton variant="text" className="w-4/6" />
              </div>
            </div>

            <div className="bg-white rounded-lg  border border-gray-200 p-6">
              <Skeleton variant="text" width={150} height={24} className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={80} height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg  border border-gray-200 p-4">
              <Skeleton variant="text" width={120} height={20} className="mb-3" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={80} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg  border border-gray-200 p-4">
              <Skeleton variant="text" width={120} height={20} className="mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" className="w-full h-10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;