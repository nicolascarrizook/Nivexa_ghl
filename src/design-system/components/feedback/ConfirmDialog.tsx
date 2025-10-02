import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  X, 
  AlertCircle,
  Info,
  HelpCircle,
  Trash2,
  Power,
  Archive
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export interface ConfirmDialogProps {
  /** Control de visibilidad del modal */
  open: boolean;
  /** Callback cuando se cierra el modal */
  onOpenChange: (open: boolean) => void;
  /** Callback cuando se confirma la acción */
  onConfirm: () => void;
  /** Callback cuando se cancela la acción */
  onCancel?: () => void;
  /** Título del diálogo */
  title: string;
  /** Descripción de la acción */
  description: string;
  /** Variante que determina el estilo y nivel de riesgo */
  variant?: 'default' | 'danger' | 'warning' | 'info';
  /** Tipo de acción para iconografía contextual */
  actionType?: 'delete' | 'archive' | 'disable' | 'custom';
  /** Icono personalizado */
  customIcon?: React.ReactNode;
  /** Configuración de botones */
  buttons?: {
    cancel?: {
      label?: string;
      variant?: 'ghost' | 'outline';
    };
    confirm?: {
      label?: string;
      loading?: boolean;
      loadingText?: string;
    };
  };
  /** Mensaje adicional de consecuencias */
  consequences?: string;
  /** Información adicional o contexto */
  details?: {
    label: string;
    value: string;
  }[];
  /** Checkbox de confirmación adicional */
  requireConfirmation?: {
    text: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
  /** Deshabilitado mientras se procesa */
  disabled?: boolean;
  className?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  variant = 'default',
  actionType = 'custom',
  customIcon,
  buttons,
  consequences,
  details,
  requireConfirmation,
  disabled = false,
  className = '',
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-primary-100 dark:bg-primary-900/20',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-neutral-900 dark:text-neutral-100',
      descriptionColor: 'text-neutral-600 dark:text-neutral-300',
      confirmButton: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white',
      border: 'border-primary-200 dark:border-primary-800',
    },
    danger: {
      iconBg: 'bg-error-100 dark:bg-error-900/20',
      iconColor: 'text-error-600 dark:text-error-400',
      titleColor: 'text-error-900 dark:text-error-100',
      descriptionColor: 'text-error-700 dark:text-error-300',
      confirmButton: 'bg-error-600 hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-700 text-white',
      border: 'border-error-200 dark:border-error-800',
    },
    warning: {
      iconBg: 'bg-warning-100 dark:bg-warning-900/20',
      iconColor: 'text-warning-600 dark:text-warning-400',
      titleColor: 'text-warning-900 dark:text-warning-100',
      descriptionColor: 'text-warning-700 dark:text-warning-300',
      confirmButton: 'bg-warning-600 hover:bg-warning-700 dark:bg-warning-600 dark:hover:bg-warning-700 text-white',
      border: 'border-warning-200 dark:border-warning-800',
    },
    info: {
      iconBg: 'bg-info-100 dark:bg-info-900/20',
      iconColor: 'text-info-600 dark:text-info-400',
      titleColor: 'text-neutral-900 dark:text-neutral-100',
      descriptionColor: 'text-neutral-600 dark:text-neutral-300',
      confirmButton: 'bg-info-600 hover:bg-info-700 dark:bg-info-600 dark:hover:bg-info-700 text-white',
      border: 'border-info-200 dark:border-info-800',
    },
  };

  const currentStyles = variantStyles[variant];

  const getDefaultIcon = () => {
    if (customIcon) return customIcon;

    // Icon based on action type
    const actionIcons = {
      delete: Trash2,
      archive: Archive,
      disable: Power,
      custom: HelpCircle,
    };

    // Icon based on variant
    const variantIcons = {
      default: Info,
      danger: AlertTriangle,
      warning: AlertCircle,
      info: Info,
    };

    const ActionIcon = actionIcons[actionType] || variantIcons[variant];
    return <ActionIcon className={`w-6 h-6 ${currentStyles.iconColor}`} />;
  };

  const getDefaultLabels = () => {
    const cancelLabel = buttons?.cancel?.label || 'Cancelar';
    
    let confirmLabel = buttons?.confirm?.label;
    if (!confirmLabel) {
      switch (actionType) {
        case 'delete':
          confirmLabel = 'Eliminar';
          break;
        case 'archive':
          confirmLabel = 'Archivar';
          break;
        case 'disable':
          confirmLabel = 'Desactivar';
          break;
        default:
          confirmLabel = 'Confirmar';
      }
    }

    return { cancelLabel, confirmLabel };
  };

  const { cancelLabel, confirmLabel } = getDefaultLabels();
  const isConfirmDisabled = disabled || 
    (requireConfirmation && !requireConfirmation.checked) ||
    buttons?.confirm?.loading;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                  fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                  w-full max-w-md mx-4 p-6
                  bg-white dark:bg-neutral-900
                  border ${currentStyles.border}
                  rounded-2xl shadow-xl
                  ${className}
                `}
              >
                {/* Close Button */}
                <Dialog.Close asChild>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </Dialog.Close>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-12 h-12 rounded-full ${currentStyles.iconBg} flex items-center justify-center`}
                  >
                    {getDefaultIcon()}
                  </motion.div>
                </div>

                {/* Title */}
                <Dialog.Title asChild>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-lg font-semibold text-center ${currentStyles.titleColor} mb-3`}
                  >
                    {title}
                  </motion.h2>
                </Dialog.Title>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-sm text-center ${currentStyles.descriptionColor} mb-4`}
                >
                  {description}
                </motion.p>

                {/* Consequences Warning */}
                {consequences && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-3 rounded-lg mb-4 ${
                      variant === 'danger' 
                        ? 'bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <p className={`text-xs ${
                      variant === 'danger' 
                        ? 'text-error-700 dark:text-error-300'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <strong>Nota:</strong> {consequences}
                    </p>
                  </motion.div>
                )}

                {/* Details */}
                {details && details.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                  >
                    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Información del elemento
                    </h4>
                    <dl className="space-y-1">
                      {details.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <dt className="text-neutral-600 dark:text-neutral-400">
                            {item.label}
                          </dt>
                          <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                )}

                {/* Confirmation Checkbox */}
                {requireConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireConfirmation.checked}
                        onChange={(e) => requireConfirmation.onChange(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                      />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {requireConfirmation.text}
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col-reverse sm:flex-row gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={disabled}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                      buttons?.cancel?.variant === 'ghost'
                        ? 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        : 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {cancelLabel}
                  </motion.button>

                  <motion.button
                    whileHover={!isConfirmDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isConfirmDisabled ? { scale: 0.98 } : {}}
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${currentStyles.confirmButton} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {buttons?.confirm?.loading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    )}
                    {buttons?.confirm?.loading 
                      ? (buttons?.confirm?.loadingText || 'Procesando...')
                      : confirmLabel
                    }
                  </motion.button>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default ConfirmDialog;