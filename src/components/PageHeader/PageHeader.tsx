import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/design-system/components/inputs/Button';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions,
  className 
}: PageHeaderProps) {
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <div className={cn(
      'bg-white border-b border-gray-200 px-6 py-4',
      className
    )}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Home className="h-4 w-4" />
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(item)}
                className={cn(
                  'hover:text-gray-700 transition-colors',
                  index === breadcrumbs.length - 1 
                    ? 'text-gray-900 font-medium cursor-default' 
                    : 'cursor-pointer'
                )}
                disabled={index === breadcrumbs.length - 1}
              >
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;