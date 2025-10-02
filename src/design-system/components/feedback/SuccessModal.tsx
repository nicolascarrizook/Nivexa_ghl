import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  X, 
  Eye, 
  Plus, 
  ExternalLink,
  Sparkles 
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export interface SuccessModalProps {
  /** Control de visibilidad del modal */
  open: boolean;
  /** Callback cuando se cierra el modal */
  onOpenChange: (open: boolean) => void;
  /** Título del éxito */
  title: string;
  /** Mensaje principal de éxito */
  message: string;
  /** Detalles adicionales opcionales */
  details?: string;
  /** Mostrar animación de confetti */
  showConfetti?: boolean;
  /** Tiempo de auto-cierre en milisegundos (0 = sin auto-cierre) */
  autoCloseDelay?: number;
  /** Acciones disponibles */
  actions?: {
    /** Acción para ver detalles */
    viewDetails?: {
      label?: string;
      onClick: () => void;
    };
    /** Acción para crear otro */
    createAnother?: {
      label?: string;
      onClick: () => void;
    };
    /** Acción personalizada */
    custom?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary';
      icon?: React.ReactNode;
    };
  };
  /** Variante visual */
  variant?: 'default' | 'celebration' | 'minimal';
  /** Icono personalizado */
  customIcon?: React.ReactNode;
  /** Datos relevantes para mostrar */
  data?: {
    label: string;
    value: string;
  }[];
  className?: string;
}

// Componente de confetti animado
const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    x: Math.random() * 100,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    color: ['bg-primary-400', 'bg-success-400', 'bg-warning-400', 'bg-info-400'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className={`absolute w-2 h-2 ${piece.color} rounded-sm`}
          initial={{ 
            x: `${piece.x}%`, 
            y: -20, 
            rotate: 0, 
            scale: 0 
          }}
          animate={{ 
            y: '120vh', 
            rotate: piece.rotation * 4, 
            scale: piece.scale 
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            delay: piece.delay,
            ease: "easeOut" 
          }}
        />
      ))}
    </div>
  );
};

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onOpenChange,
  title,
  message,
  details,
  showConfetti = false,
  autoCloseDelay = 0,
  actions,
  variant = 'default',
  customIcon,
  data,
  className = '',
}) => {
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (open && autoCloseDelay > 0) {
      setCountdown(autoCloseDelay / 1000);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onOpenChange(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open, autoCloseDelay, onOpenChange]);

  const variantStyles = {
    default: {
      iconBg: 'bg-success-100 dark:bg-success-900/20',
      iconColor: 'text-success-600 dark:text-success-400',
      titleColor: 'text-neutral-900 dark:text-neutral-100',
      messageColor: 'text-neutral-600 dark:text-neutral-300',
    },
    celebration: {
      iconBg: 'bg-gradient-to-br from-success-100 to-primary-100 dark:from-success-900/20 dark:to-primary-900/20',
      iconColor: 'text-success-600 dark:text-success-400',
      titleColor: 'text-neutral-900 dark:text-neutral-100',
      messageColor: 'text-neutral-600 dark:text-neutral-300',
    },
    minimal: {
      iconBg: 'bg-transparent',
      iconColor: 'text-success-500 dark:text-success-400',
      titleColor: 'text-neutral-900 dark:text-neutral-100',
      messageColor: 'text-neutral-600 dark:text-neutral-300',
    },
  };

  const currentStyles = variantStyles[variant];

  const renderIcon = () => {
    if (customIcon) return customIcon;
    
    if (variant === 'celebration') {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
          className={`w-16 h-16 rounded-full ${currentStyles.iconBg} flex items-center justify-center relative`}
        >
          <CheckCircle className={`w-8 h-8 ${currentStyles.iconColor}`} />
          {showConfetti && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-warning-500" />
            </motion.div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`w-12 h-12 rounded-full ${currentStyles.iconBg} flex items-center justify-center`}
      >
        <CheckCircle className={`w-6 h-6 ${currentStyles.iconColor}`} />
      </motion.div>
    );
  };

  const renderActions = () => {
    if (!actions) return null;

    return (
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {actions.viewDetails && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={actions.viewDetails.onClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium"
          >
            <Eye className="w-4 h-4" />
            {actions.viewDetails.label || 'Ver detalles'}
          </motion.button>
        )}
        
        {actions.createAnother && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={actions.createAnother.onClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {actions.createAnother.label || 'Crear otro'}
          </motion.button>
        )}

        {actions.custom && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={actions.custom.onClick}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium ${
              actions.custom.variant === 'primary'
                ? 'bg-primary-600 dark:bg-primary-600 text-white hover:bg-primary-700 dark:hover:bg-primary-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {actions.custom.icon}
            {actions.custom.label}
          </motion.button>
        )}
      </div>
    );
  };

  const renderData = () => {
    if (!data || data.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
          Información adicional
        </h4>
        <dl className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <dt className="text-sm text-neutral-600 dark:text-neutral-400">
                {item.label}
              </dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
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
                  border border-neutral-200 dark:border-neutral-700
                  rounded-2xl shadow-xl
                  ${className}
                `}
              >
                {/* Confetti Effect */}
                {showConfetti && variant === 'celebration' && <Confetti />}
                
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

                {/* Content */}
                <div className="text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    {renderIcon()}
                  </div>

                  {/* Title */}
                  <Dialog.Title asChild>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`text-lg font-semibold ${currentStyles.titleColor} mb-2`}
                    >
                      {title}
                    </motion.h2>
                  </Dialog.Title>

                  {/* Message */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-sm ${currentStyles.messageColor} mb-2`}
                  >
                    {message}
                  </motion.p>

                  {/* Details */}
                  {details && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      {details}
                    </motion.p>
                  )}

                  {/* Data */}
                  {renderData()}

                  {/* Auto-close countdown */}
                  {countdown > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      Se cerrará automáticamente en {countdown}s
                    </motion.div>
                  )}

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {renderActions()}
                  </motion.div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default SuccessModal;