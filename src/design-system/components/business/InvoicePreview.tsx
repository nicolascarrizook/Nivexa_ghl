import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  Eye,
  MoreVertical,
  History,
  CreditCard
} from 'lucide-react';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  reference?: string;
  status: 'confirmado' | 'pendiente' | 'rechazado';
}

export interface InvoicePreviewProps {
  /** ID único de la factura */
  id: string;
  /** Número de factura */
  invoiceNumber: string;
  /** Fecha de emisión */
  issueDate: string;
  /** Fecha de vencimiento */
  dueDate: string;
  /** Información del cliente */
  client: {
    id: string;
    name: string;
    rfc?: string;
    address?: string;
    type: 'empresa' | 'particular';
  };
  /** Estado de la factura */
  status: 'pagada' | 'pendiente' | 'vencida' | 'cancelada' | 'parcial';
  /** Artículos de la factura */
  items: InvoiceItem[];
  /** Subtotal antes de impuestos */
  subtotal: number;
  /** Monto de IVA */
  tax: number;
  /** Retenciones */
  withholdings?: number;
  /** Total de la factura */
  total: number;
  /** Moneda */
  currency: 'MXN' | 'USD';
  /** Proyecto relacionado */
  project?: {
    id: string;
    name: string;
  };
  /** Historial de pagos */
  paymentHistory: PaymentRecord[];
  /** Monto pagado */
  paidAmount: number;
  /** Monto pendiente */
  remainingAmount: number;
  /** Notas adicionales */
  notes?: string;
  /** Términos y condiciones */
  terms?: string;
  /** Callbacks para acciones */
  onDownload?: (invoiceId: string) => void;
  onSend?: (invoiceId: string) => void;
  onView?: (invoiceId: string) => void;
  onPrint?: (invoiceId: string) => void;
  onShare?: (invoiceId: string) => void;
  onViewPayments?: (invoiceId: string) => void;
  onAddPayment?: (invoiceId: string) => void;
  onViewClient?: (clientId: string) => void;
  onViewProject?: (projectId: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  id,
  invoiceNumber,
  issueDate,
  dueDate,
  client,
  status,
  items,
  subtotal,
  tax,
  withholdings = 0,
  total,
  currency,
  project,
  paymentHistory,
  paidAmount,
  remainingAmount,
  onDownload,
  onSend,
  onView,
  onViewPayments,
  onAddPayment,
  onViewClient,
  onViewProject,
  loading = false,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    pagada: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-700 dark:text-success-400',
      border: 'border-success-200 dark:border-success-700',
      icon: CheckCircle,
      label: 'Pagada',
    },
    pendiente: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-700 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-700',
      icon: Clock,
      label: 'Pendiente',
    },
    vencida: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-700 dark:text-error-400',
      border: 'border-error-200 dark:border-error-700',
      icon: AlertTriangle,
      label: 'Vencida',
    },
    cancelada: {
      bg: 'bg-neutral-50 dark:bg-neutral-800',
      text: 'text-neutral-600 dark:text-neutral-400',
      border: 'border-neutral-200 dark:border-neutral-600',
      icon: AlertTriangle,
      label: 'Cancelada',
    },
    parcial: {
      bg: 'bg-info-50 dark:bg-info-900/20',
      text: 'text-info-700 dark:text-info-400',
      border: 'border-info-200 dark:border-info-700',
      icon: CreditCard,
      label: 'Pago Parcial',
    },
  };

  const paymentMethodLabels = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cheque: 'Cheque',
    tarjeta: 'Tarjeta',
  };

  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-sm',
      textSize: 'text-xs',
      numberSize: 'text-lg',
    },
    md: {
      padding: 'p-6',
      titleSize: 'text-base',
      textSize: 'text-sm',
      numberSize: 'text-xl',
    },
    lg: {
      padding: 'p-8',
      titleSize: 'text-lg',
      textSize: 'text-base',
      numberSize: 'text-2xl',
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysOverdue = () => {
    if (status !== 'vencida') return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilDue = () => {
    if (status === 'pagada' || status === 'vencida') return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPaymentStatusSummary = () => {
    const percentage = (paidAmount / total) * 100;
    
    if (status === 'pagada') {
      return `100% pagada`;
    }
    
    if (status === 'parcial') {
      return `${Math.round(percentage)}% pagada`;
    }
    
    return null;
  };

  const renderQuickActions = () => (
    <div className="flex flex-wrap gap-2">
      {onView && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onView(id);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          title="Ver factura"
        >
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Ver</span>
        </motion.button>
      )}
      
      {onDownload && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(id);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-lg hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors"
          title="Descargar PDF"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs font-medium">PDF</span>
        </motion.button>
      )}
      
      {onSend && status !== 'pagada' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onSend(id);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400 rounded-lg hover:bg-info-100 dark:hover:bg-info-900/30 transition-colors"
          title="Enviar por email"
        >
          <Send className="w-4 h-4" />
          <span className="text-xs font-medium">Enviar</span>
        </motion.button>
      )}
      
      {onAddPayment && status !== 'pagada' && status !== 'cancelada' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddPayment(id);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 rounded-lg hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors"
          title="Registrar pago"
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-xs font-medium">Pago</span>
        </motion.button>
      )}
    </div>
  );

  const renderPaymentHistory = () => {
    if (paymentHistory.length === 0) return null;

    const recentPayments = paymentHistory.slice(0, 3);

    return (
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-medium text-neutral-700 dark:text-neutral-300 ${sizeConfig[size].textSize}`}>
            Historial de Pagos
          </h4>
          {onViewPayments && paymentHistory.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewPayments(id);
              }}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              Ver todos ({paymentHistory.length})
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-2 px-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div>
                <p className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(payment.date)} • {paymentMethodLabels[payment.method]}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                payment.status === 'confirmado' ? 'bg-success-100 text-success-700' :
                payment.status === 'pendiente' ? 'bg-warning-100 text-warning-700' :
                'bg-error-100 text-error-700'
              }`}>
                {payment.status === 'confirmado' ? 'Confirmado' :
                 payment.status === 'pendiente' ? 'Pendiente' : 'Rechazado'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-48" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </div>
      );
    }

    const daysOverdue = getDaysOverdue();
    const daysUntilDue = getDaysUntilDue();
    const paymentStatusSummary = getPaymentStatusSummary();

    return (
      <>
        {/* Header with invoice number and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize}`}>
                {invoiceNumber}
              </h3>
              <p className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                Emitida el {formatDate(issueDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} border`}>
              <StatusIcon className="w-3 h-3" />
              {currentStatus.label}
            </span>
            <button className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status-specific alerts */}
        {status === 'vencida' && daysOverdue > 0 && (
          <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error-600 dark:text-error-400" />
              <span className="text-sm text-error-700 dark:text-error-300 font-medium">
                Vencida hace {daysOverdue} día{daysOverdue > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {status === 'pendiente' && daysUntilDue <= 3 && daysUntilDue > 0 && (
          <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning-600 dark:text-warning-400" />
              <span className="text-sm text-warning-700 dark:text-warning-300 font-medium">
                Vence en {daysUntilDue} día{daysUntilDue > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Client Information */}
        <div 
          className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewClient?.(client.id);
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {client.type === 'empresa' ? (
              <Building2 className="w-4 h-4 text-neutral-400" />
            ) : (
              <User className="w-4 h-4 text-neutral-400" />
            )}
            <span className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
              {client.name}
            </span>
          </div>
          {client.rfc && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              RFC: {client.rfc}
            </p>
          )}
        </div>

        {/* Project Information */}
        {project && (
          <div 
            className="mb-4 p-3 bg-info-50 dark:bg-info-900/20 rounded-lg cursor-pointer hover:bg-info-100 dark:hover:bg-info-900/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewProject?.(project.id);
            }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-info-600 dark:text-info-400" />
              <span className={`font-medium text-info-900 dark:text-info-100 ${sizeConfig[size].textSize}`}>
                {project.name}
              </span>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
              Subtotal
            </span>
            <span className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
              {formatCurrency(subtotal)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
              IVA (16%)
            </span>
            <span className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
              {formatCurrency(tax)}
            </span>
          </div>
          
          {withholdings > 0 && (
            <div className="flex items-center justify-between">
              <span className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                Retenciones
              </span>
              <span className={`font-medium text-error-600 dark:text-error-400 ${sizeConfig[size].textSize}`}>
                -{formatCurrency(withholdings)}
              </span>
            </div>
          )}
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize}`}>
                Total
              </span>
              <span className={`font-bold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].numberSize}`}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatusSummary && (
          <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-700 dark:text-success-300">
                  {paymentStatusSummary}
                </p>
                {status === 'parcial' && (
                  <p className="text-xs text-success-600 dark:text-success-400">
                    Pagado: {formatCurrency(paidAmount)} • Pendiente: {formatCurrency(remainingAmount)}
                  </p>
                )}
              </div>
              {onViewPayments && paymentHistory.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPayments(id);
                  }}
                  className="p-1 text-success-600 dark:text-success-400 hover:text-success-700 dark:hover:text-success-300"
                >
                  <History className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        <div className="mb-4 flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <Calendar className="w-4 h-4" />
          <span className={sizeConfig[size].textSize}>
            Vence el {formatDate(dueDate)}
          </span>
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <h4 className={`font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${sizeConfig[size].textSize}`}>
            Artículos ({items.length})
          </h4>
          <div className="space-y-1">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400 truncate flex-1">
                  {item.description}
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 ml-2">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
            {items.length > 3 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                +{items.length - 3} artículo{items.length > 4 ? 's' : ''} más
              </p>
            )}
          </div>
        </div>

        {/* Payment History */}
        {renderPaymentHistory()}

        {/* Quick Actions */}
        {renderQuickActions()}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <div
        className={`
          relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700
          rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-neutral-900/25 
          transition-all duration-200 cursor-pointer overflow-hidden
          ${sizeConfig[size].padding}
        `}
        onClick={() => onView?.(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onView) {
            e.preventDefault();
            onView(id);
          }
        }}
        aria-label={`Factura ${invoiceNumber} - ${currentStatus.label} - ${formatCurrency(total)}`}
      >
        {renderContent()}
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default InvoicePreview;