import React from 'react';

export interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  className = '', 
  lines = 3 
}) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        ))}
      </div>
    </div>
  );
};