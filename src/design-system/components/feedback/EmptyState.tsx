import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileX,
  Search,
  AlertCircle,
  Wifi,
  Database,
  Plus,
  RefreshCw,
  ArrowLeft,
  Users,
  FileText,
  ShoppingCart,
  Calendar,
  Settings,
  FolderOpen,
  Filter,
  Clock
} from 'lucide-react';

export interface EmptyStateProps {
  /** Tipo de estado vacío que determina el contenido predeterminado */
  variant: 
    | 'no-data' 
    | 'no-results' 
    | 'no-access' 
    | 'error' 
    | 'offline' 
    | 'loading-error'
    | 'no-clients'
    | 'no-projects'
    | 'no-invoices'
    | 'no-tasks'
    | 'no-appointments'
    | 'no-notifications'
    | 'empty-folder'
    | 'no-search-results'
    | 'filtered-empty';
  /** Título personalizado */
  title?: string;
  /** Descripción personalizada */
  description?: string;
  /** Ilustración/icono personalizado */
  illustration?: React.ReactNode;
  /** Acciones disponibles */
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    };
    tertiary?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    };
  };
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Variante de diseño */
  design?: 'default' | 'minimal' | 'card';
  /** Mostrar animación de entrada */
  animated?: boolean;
  /** Información adicional o tips */
  tips?: string[];
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  description,
  illustration,
  actions,
  size = 'md',
  design = 'default',
  animated = true,
  tips,
  className = '',
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-8',
      illustration: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
      tips: 'text-xs',
    },
    md: {
      container: 'py-12',
      illustration: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-6 py-2.5 text-sm',
      tips: 'text-sm',
    },
    lg: {
      container: 'py-16',
      illustration: 'w-32 h-32',
      title: 'text-2xl',
      description: 'text-lg',
      button: 'px-8 py-3 text-base',
      tips: 'text-base',
    },
  };

  const currentSize = sizeStyles[size];

  const variantConfigs = {
    'no-data': {
      title: 'No hay datos disponibles',
      description: 'Aún no hay información para mostrar. Comienza agregando tu primer elemento.',
      icon: Database,
      color: 'text-neutral-400 dark:text-neutral-500',
    },
    'no-results': {
      title: 'No se encontraron resultados',
      description: 'Tu búsqueda no arrojó resultados. Intenta con términos diferentes.',
      icon: Search,
      color: 'text-neutral-400 dark:text-neutral-500',
    },
    'no-access': {
      title: 'Acceso denegado',
      description: 'No tienes permisos para ver este contenido. Contacta al administrador.',
      icon: AlertCircle,
      color: 'text-warning-500 dark:text-warning-400',
    },
    'error': {
      title: 'Algo salió mal',
      description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
      icon: AlertCircle,
      color: 'text-error-500 dark:text-error-400',
    },
    'offline': {
      title: 'Sin conexión',
      description: 'Verifica tu conexión a internet e inténtalo nuevamente.',
      icon: Wifi,
      color: 'text-warning-500 dark:text-warning-400',
    },
    'loading-error': {
      title: 'Error al cargar',
      description: 'No pudimos cargar la información. Refresca la página para intentar de nuevo.',
      icon: RefreshCw,
      color: 'text-error-500 dark:text-error-400',
    },
    'no-clients': {
      title: 'No tienes clientes aún',
      description: 'Agrega tu primer cliente para comenzar a gestionar tus proyectos y facturación.',
      icon: Users,
      color: 'text-primary-500 dark:text-primary-400',
    },
    'no-projects': {
      title: 'No hay proyectos activos',
      description: 'Crea tu primer proyecto y comienza a organizar tu trabajo de manera eficiente.',
      icon: FolderOpen,
      color: 'text-primary-500 dark:text-primary-400',
    },
    'no-invoices': {
      title: 'No hay facturas generadas',
      description: 'Crea tu primera factura para comenzar a gestionar tus cobros.',
      icon: FileText,
      color: 'text-success-500 dark:text-success-400',
    },
    'no-tasks': {
      title: 'No hay tareas pendientes',
      description: '¡Excelente! Has completado todas tus tareas o no tienes ninguna asignada.',
      icon: Calendar,
      color: 'text-success-500 dark:text-success-400',
    },
    'no-appointments': {
      title: 'No hay citas programadas',
      description: 'Tu agenda está libre. Programa reuniones con tus clientes cuando lo necesites.',
      icon: Clock,
      color: 'text-info-500 dark:text-info-400',
    },
    'no-notifications': {
      title: 'No hay notificaciones',
      description: 'Estás al día. Te notificaremos cuando haya novedades importantes.',
      icon: Settings,
      color: 'text-success-500 dark:text-success-400',
    },
    'empty-folder': {
      title: 'Carpeta vacía',
      description: 'Esta carpeta no contiene archivos. Sube documentos para comenzar.',
      icon: FolderOpen,
      color: 'text-neutral-400 dark:text-neutral-500',
    },
    'no-search-results': {
      title: 'Sin resultados de búsqueda',
      description: 'No encontramos lo que buscas. Verifica la ortografía o usa términos más amplios.',
      icon: Search,
      color: 'text-neutral-400 dark:text-neutral-500',
    },
    'filtered-empty': {
      title: 'No hay resultados con estos filtros',
      description: 'Ajusta los filtros aplicados para ver más elementos.',
      icon: Filter,
      color: 'text-neutral-400 dark:text-neutral-500',
    },
  };

  const config = variantConfigs[variant];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  const renderIllustration = () => {
    if (illustration) return illustration;
    
    const IconComponent = config.icon;
    return (
      <motion.div
        initial={animated ? { scale: 0, rotate: -10 } : {}}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
        className={`${currentSize.illustration} ${config.color} mx-auto mb-6`}
      >
        <IconComponent className="w-full h-full" />
      </motion.div>
    );
  };

  const renderActions = () => {
    if (!actions) return null;

    return (
      <motion.div
        initial={animated ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
      >
        {actions.primary && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={actions.primary.onClick}
            disabled={actions.primary.loading}
            className={`
              inline-flex items-center justify-center gap-2 rounded-lg font-medium
              bg-primary-600 text-white hover:bg-primary-700 
              dark:bg-primary-600 dark:hover:bg-primary-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors ${currentSize.button}
            `}
          >
            {actions.primary.loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              actions.primary.icon
            )}
            {actions.primary.label}
          </motion.button>
        )}

        {actions.secondary && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={actions.secondary.onClick}
            className={`
              inline-flex items-center justify-center gap-2 rounded-lg font-medium
              border border-neutral-300 dark:border-neutral-600 
              text-neutral-700 dark:text-neutral-300
              hover:bg-neutral-50 dark:hover:bg-neutral-800
              transition-colors ${currentSize.button}
            `}
          >
            {actions.secondary.icon}
            {actions.secondary.label}
          </motion.button>
        )}

        {actions.tertiary && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={actions.tertiary.onClick}
            className={`
              inline-flex items-center justify-center gap-2 rounded-lg font-medium
              text-neutral-600 dark:text-neutral-400 
              hover:text-neutral-900 dark:hover:text-neutral-200
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              transition-colors ${currentSize.button}
            `}
          >
            {actions.tertiary.icon}
            {actions.tertiary.label}
          </motion.button>
        )}
      </motion.div>
    );
  };

  const renderTips = () => {
    if (!tips || tips.length === 0) return null;

    return (
      <motion.div
        initial={animated ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
      >
        <h4 className={`font-medium text-neutral-900 dark:text-neutral-100 mb-3 ${currentSize.tips}`}>
          Consejos útiles
        </h4>
        <ul className={`space-y-2 text-neutral-600 dark:text-neutral-400 ${currentSize.tips}`}>
          {tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={animated ? { opacity: 0, x: -10 } : {}}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-2"
            >
              <span className="text-primary-500 dark:text-primary-400 mt-0.5">•</span>
              {tip}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    );
  };

  const content = (
    <>
      {/* Illustration */}
      {renderIllustration()}

      {/* Title */}
      <motion.h3
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`font-semibold text-neutral-900 dark:text-neutral-100 text-center mb-3 ${currentSize.title}`}
      >
        {finalTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-neutral-600 dark:text-neutral-400 text-center max-w-md mx-auto ${currentSize.description}`}
      >
        {finalDescription}
      </motion.p>

      {/* Actions */}
      {renderActions()}

      {/* Tips */}
      {renderTips()}
    </>
  );

  if (design === 'card') {
    return (
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.95 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`
          bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700
          rounded-xl p-8 text-center ${currentSize.container} ${className}
        `}
      >
        {content}
      </motion.div>
    );
  }

  if (design === 'minimal') {
    return (
      <motion.div
        initial={animated ? { opacity: 0 } : {}}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`text-center ${currentSize.container} ${className}`}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`text-center ${currentSize.container} ${className}`}
    >
      {content}
    </motion.div>
  );
};

export default EmptyState;