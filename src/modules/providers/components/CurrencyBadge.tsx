import { DollarSign } from 'lucide-react';

interface CurrencyBadgeProps {
  currency: 'ARS' | 'USD';
  size?: 'sm' | 'md';
}

export function CurrencyBadge({ currency, size = 'sm' }: CurrencyBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const colorClasses = {
    ARS: 'bg-blue-100 text-blue-800 border-blue-200',
    USD: 'bg-green-100 text-green-800 border-green-200',
  };

  const symbolMap = {
    ARS: '$',
    USD: 'US$',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[currency]}`}
    >
      <DollarSign className="w-3 h-3" />
      {symbolMap[currency]}
    </span>
  );
}
