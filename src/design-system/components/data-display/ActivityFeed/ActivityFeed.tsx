import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, 
  RefreshCw,
  CheckCircle,
  Info,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  FileText,
  Users,
  Filter
} from 'lucide-react';

export interface ActivityItem {
  /** ID único de la actividad */
  id: string;
  /** Tipo de actividad */
  type: 'contact' | 'deal' | 'task' | 'note' | 'email' | 'call' | 'meeting' | 'system' | 'payment';
  /** Título/descripción principal */
  title: string;
  /** Descripción adicional opcional */
  description?: string;
  /** Usuario que realizó la actividad */
  user: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  /** Timestamp de la actividad */
  timestamp: string | Date;
  /** Estado de la actividad */
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  /** Metadatos adicionales */
  metadata?: {
    /** Cliente/empresa relacionada */
    client?: string;
    /** Valor monetario (para deals/payments) */
    amount?: number;
    /** Archivos adjuntos */
    attachments?: number;
    /** Prioridad */
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
  /** Acciones disponibles para este item */
  actions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
}

export interface ActivityFeedProps {
  /** Items de actividad a mostrar */
  activities: ActivityItem[];
  /** Estado de carga */
  loading?: boolean;
  /** Mensaje cuando no hay actividades */
  emptyText?: string;
  /** Función para refrescar */
  onRefresh?: () => void;
  /** Función para cargar más actividades */
  onLoadMore?: () => void;
  /** Si hay más actividades por cargar */
  hasMore?: boolean;
  /** Filtros disponibles */
  filters?: {
    types?: string[];
    users?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  /** Callback cuando cambian los filtros */
  onFiltersChange?: (filters: any) => void;
  /** Mostrar avatares de usuario */
  showAvatars?: boolean;
  /** Mostrar timestamps relativos */
  showRelativeTime?: boolean;
  /** Agrupar por fecha */
  groupByDate?: boolean;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Máxima altura del contenedor */
  maxHeight?: string;
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  emptyText = 'No hay actividades recientes',
  onRefresh,
  onLoadMore,
  hasMore = false,
  showAvatars = true,
  showRelativeTime = true,
  size = 'md',
  maxHeight = '500px',
  className = '',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClasses = 'w-4 h-4';
    
    switch (type) {
      case 'contact':
        return <Users className={iconClasses} />;
      case 'deal':
        return <DollarSign className={iconClasses} />;
      case 'task':
        return <CheckCircle className={iconClasses} />;
      case 'note':
        return <FileText className={iconClasses} />;
      case 'email':
        return <Mail className={iconClasses} />;
      case 'call':
        return <Phone className={iconClasses} />;
      case 'meeting':
        return <Calendar className={iconClasses} />;
      case 'payment':
        return <DollarSign className={iconClasses} />;
      case 'system':
      default:
        return <Info className={iconClasses} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    if (status === 'failed' || status === 'cancelled') {
      return 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/20';
    }
    
    switch (type) {
      case 'contact':
        return 'text-info-600 dark:text-info-400 bg-info-50 dark:bg-info-900/20';
      case 'deal':
      case 'payment':
        return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20';
      case 'task':
        return status === 'completed' 
          ? 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20'
          : 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20';
      case 'note':
      case 'email':
      case 'call':
      case 'meeting':
        return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20';
      case 'system':
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/20';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (showRelativeTime) {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Ahora mismo';
      if (minutes < 60) return `Hace ${minutes}m`;
      if (hours < 24) return `Hace ${hours}h`;
      if (days < 7) return `Hace ${days}d`;
    }
    
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          text: 'text-xs',
          spacing: 'space-y-2',
          padding: 'p-3',
          avatar: 'w-6 h-6 text-xs',
          icon: 'w-6 h-6',
        };
      case 'lg':
        return {
          text: 'text-base',
          spacing: 'space-y-4',
          padding: 'p-5',
          avatar: 'w-10 h-10 text-sm',
          icon: 'w-10 h-10',
        };
      default:
        return {
          text: 'text-sm',
          spacing: 'space-y-3',
          padding: 'p-4',
          avatar: 'w-8 h-8 text-xs',
          icon: 'w-8 h-8',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderAvatar = (user: ActivityItem['user']) => {
    if (!showAvatars) return null;

    return (
      <div className={`${sizeClasses.avatar} rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0`}>
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className={`${sizeClasses.avatar} rounded-full object-cover`}
          />
        ) : (
          <span className={`font-medium text-primary-700 dark:text-primary-300 ${sizeClasses.text}`}>
            {user.initials || getInitials(user.name)}
          </span>
        )}
      </div>
    );
  };

  const renderActivityItem = (activity: ActivityItem, index: number) => {
    const isExpanded = expandedItems.has(activity.id);

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${sizeClasses.padding} hover:bg-neutral-25 dark:hover:bg-neutral-875 transition-colors ${
          index !== 0 ? 'border-t border-neutral-200 dark:border-neutral-700' : ''
        }`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          {renderAvatar(activity.user)}
          
          {/* Icono de actividad */}
          <div className={`${sizeClasses.icon} rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type, activity.status)}`}>
            {getActivityIcon(activity.type)}
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeClasses.text}`}>
                  {activity.title}
                </p>
                <p className={`text-neutral-600 dark:text-neutral-400 ${sizeClasses.text}`}>
                  por {activity.user.name}
                  {activity.metadata?.client && (
                    <span> • {activity.metadata.client}</span>
                  )}
                </p>
                
                {activity.description && (
                  <p className={`text-neutral-500 dark:text-neutral-400 mt-1 ${sizeClasses.text} ${!isExpanded && 'line-clamp-2'}`}>
                    {activity.description}
                  </p>
                )}
                
                {/* Metadata */}
                {activity.metadata && (
                  <div className="flex items-center gap-3 mt-2">
                    {activity.metadata.amount && (
                      <span className={`text-success-600 dark:text-success-400 font-medium ${sizeClasses.text}`}>
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(activity.metadata.amount)}
                      </span>
                    )}
                    
                    {activity.metadata.attachments && (
                      <span className={`text-neutral-500 dark:text-neutral-400 ${sizeClasses.text}`}>
                        {activity.metadata.attachments} archivo{activity.metadata.attachments !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {activity.metadata.priority && activity.metadata.priority !== 'low' && (
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${activity.metadata.priority === 'urgent' 
                          ? 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
                          : activity.metadata.priority === 'high'
                            ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
                            : 'bg-info-100 text-info-800 dark:bg-info-900/20 dark:text-info-400'
                        }
                      `}>
                        {activity.metadata.priority === 'urgent' ? 'Urgente' 
                         : activity.metadata.priority === 'high' ? 'Alta'
                         : 'Media'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Timestamp y acciones */}
              <div className="flex items-center gap-2 ml-2">
                <span className={`text-neutral-500 dark:text-neutral-400 ${sizeClasses.text} whitespace-nowrap`}>
                  {formatTimestamp(activity.timestamp)}
                </span>
                
                {activity.actions && activity.actions.length > 0 && (
                  <div className="relative">
                    <button
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
                      onClick={() => toggleExpanded(activity.id)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10 min-w-[150px]"
                      >
                        {activity.actions.map((action) => (
                          <button
                            key={action.key}
                            onClick={() => {
                              action.onClick();
                              setExpandedItems(new Set()); // Cerrar menú
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Actividad Reciente
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Filtros"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Filtros activos aparecerán aquí
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de actividades */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <AnimatePresence>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Cargando actividades...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              {emptyText}
            </div>
          ) : (
            <div>
              {activities.map((activity, index) => renderActivityItem(activity, index))}
            </div>
          )}
        </AnimatePresence>

        {/* Cargar más */}
        {hasMore && onLoadMore && !loading && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={onLoadMore}
              className="w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Cargar más actividades
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;