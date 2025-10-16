import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  size?: 'sm' | 'md';
}

const statusConfig = {
  paid: {
    label: 'Pagado',
    icon: CheckCircle,
    colors: 'bg-green-100 text-green-800 border-green-200',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  overdue: {
    label: 'Vencido',
    icon: AlertCircle,
    colors: 'bg-red-100 text-red-800 border-red-200',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    colors: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function PaymentStatusBadge({ status, size = 'sm' }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${config.colors}`}
    >
      <Icon className={iconSizeClasses[size]} />
      {config.label}
    </span>
  );
}
