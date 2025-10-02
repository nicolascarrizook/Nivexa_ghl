import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  Check,
  CheckCheck,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Settings,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'proyecto' | 'pago' | 'tarea' | 'sistema' | 'cliente' | 'documento';
  isRead: boolean;
  createdAt: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedEntity?: {
    id: string;
    type: 'project' | 'client' | 'invoice' | 'task';
    name: string;
  };
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationCenterProps {
  /** Lista de notificaciones */
  notifications: Notification[];
  /** Título del componente */
  title?: string;
  /** Mostrar agrupación por fecha */
  groupByDate?: boolean;
  /** Mostrar filtros */
  showFilters?: boolean;
  /** Mostrar acciones masivas */
  showBulkActions?: boolean;
  /** Callback cuando se marca como leída una notificación */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback cuando se marcan todas como leídas */
  onMarkAllAsRead?: () => void;
  /** Callback cuando se elimina una notificación */
  onDeleteNotification?: (notificationId: string) => void;
  /** Callback cuando se eliminan todas las notificaciones */
  onClearAll?: () => void;
  /** Callback cuando se hace clic en una notificación */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback cuando se ejecuta una acción */
  onActionClick?: (notificationId: string, actionId: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Máximo número de notificaciones a mostrar */
  maxNotifications?: number;
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  title = 'Notificaciones',
  groupByDate = true,
  showFilters = true,
  showBulkActions = true,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onNotificationClick,
  onActionClick,
  loading = false,
  size = 'md',
  maxNotifications,
  className = '',
}) => {
  const [typeFilter, setTypeFilter] = useState<Notification['type'] | 'todas'>('todas');
  const [categoryFilter, setCategoryFilter] = useState<Notification['category'] | 'todas'>('todas');
  const [readFilter, setReadFilter] = useState<'todas' | 'leidas' | 'no-leidas'>('todas');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const typeConfig = {
    info: {
      bg: 'bg-info-50 dark:bg-info-900/20',
      text: 'text-info-700 dark:text-info-400',
      border: 'border-info-200 dark:border-info-700',
      icon: Info,
      label: 'Información',
    },
    success: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-700 dark:text-success-400',
      border: 'border-success-200 dark:border-success-700',
      icon: CheckCircle,
      label: 'Éxito',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-700 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-700',
      icon: AlertTriangle,
      label: 'Advertencia',
    },
    error: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-700 dark:text-error-400',
      border: 'border-error-200 dark:border-error-700',
      icon: XCircle,
      label: 'Error',
    },
  };

  const categoryConfig = {
    proyecto: { icon: FileText, label: 'Proyecto', color: 'text-primary-600' },
    pago: { icon: DollarSign, label: 'Pago', color: 'text-success-600' },
    tarea: { icon: CheckCircle, label: 'Tarea', color: 'text-info-600' },
    sistema: { icon: Settings, label: 'Sistema', color: 'text-neutral-600' },
    cliente: { icon: Users, label: 'Cliente', color: 'text-warning-600' },
    documento: { icon: FileText, label: 'Documento', color: 'text-error-600' },
  };

  const priorityConfig = {
    baja: { color: 'border-l-neutral-300', indicator: '●' },
    media: { color: 'border-l-info-500', indicator: '●' },
    alta: { color: 'border-l-warning-500', indicator: '●' },
    critica: { color: 'border-l-error-500', indicator: '●' },
  };

  const sizeConfig = {
    sm: {
      padding: 'p-3',
      textSize: 'text-xs',
      titleSize: 'text-sm',
      itemPadding: 'p-3',
    },
    md: {
      padding: 'p-4',
      textSize: 'text-sm',
      titleSize: 'text-base',
      itemPadding: 'p-4',
    },
    lg: {
      padding: 'p-6',
      textSize: 'text-base',
      titleSize: 'text-lg',
      itemPadding: 'p-6',
    },
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = typeFilter === 'todas' || notification.type === typeFilter;
    const matchesCategory = categoryFilter === 'todas' || notification.category === categoryFilter;
    const matchesRead = readFilter === 'todas' || 
                        (readFilter === 'leidas' && notification.isRead) ||
                        (readFilter === 'no-leidas' && !notification.isRead);
    
    return matchesType && matchesCategory && matchesRead;
  });

  const displayNotifications = maxNotifications ? 
    filteredNotifications.slice(0, maxNotifications) : 
    filteredNotifications;

  const groupedNotifications = groupByDate ? 
    displayNotifications.reduce((groups, notification) => {
      const date = getDateGroup(notification.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {} as Record<string, Notification[]>) : 
    { todas: displayNotifications };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  function getDateGroup(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else if (date >= weekAgo) {
      return 'Esta semana';
    } else {
      return 'Anteriores';
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const handleNotificationSelect = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === displayNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(displayNotifications.map(n => n.id)));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      onMarkAsRead?.(id);
    });
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => {
      onDeleteNotification?.(id);
    });
    setSelectedNotifications(new Set());
  };

  const renderSenderAvatar = (sender: Notification['sender']) => {
    if (!sender) return null;

    if (sender.avatar) {
      return (
        <img
          src={sender.avatar}
          alt={sender.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    const initials = sender.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <span className="text-primary-700 dark:text-primary-300 font-medium text-xs">
          {initials}
        </span>
      </div>
    );
  };

  const renderNotificationActions = (notification: Notification) => {
    if (!notification.actions || notification.actions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {notification.actions.map((action) => (
          <button
            key={action.id}
            onClick={(e) => {
              e.stopPropagation();
              onActionClick?.(notification.id, action.id);
              action.onClick();
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              action.type === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' :
              action.type === 'danger' ? 'bg-error-600 text-white hover:bg-error-700' :
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderNotificationItem = (notification: Notification) => {
    const typeInfo = typeConfig[notification.type];
    const categoryInfo = categoryConfig[notification.category];
    const priorityInfo = priorityConfig[notification.priority];
    const TypeIcon = typeInfo.icon;
    const CategoryIcon = categoryInfo.icon;

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`
          relative border-l-4 ${priorityInfo.color} bg-white dark:bg-neutral-900 
          border border-neutral-200 dark:border-neutral-700 rounded-r-lg
          hover:shadow-md dark:hover:shadow-neutral-900/25 transition-all duration-200
          ${!notification.isRead ? 'ring-2 ring-primary-500/20' : ''}
          ${selectedNotifications.has(notification.id) ? 'ring-2 ring-primary-500' : ''}
        `}
      >
        <div 
          className={`${sizeConfig[size].itemPadding} cursor-pointer`}
          onClick={() => onNotificationClick?.(notification)}
        >
          <div className="flex items-start gap-3">
            {/* Selection Checkbox */}
            {showBulkActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationSelect(notification.id);
                }}
                className="mt-1 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className={`w-4 h-4 border-2 rounded ${
                  selectedNotifications.has(notification.id) 
                    ? 'bg-primary-600 border-primary-600' 
                    : 'border-neutral-300 dark:border-neutral-600'
                }`}>
                  {selectedNotifications.has(notification.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            )}

            {/* Type Icon */}
            <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
              <TypeIcon className={`w-4 h-4 ${typeInfo.text}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize} ${
                      !notification.isRead ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </div>
                  
                  <p className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize} line-clamp-2`}>
                    {notification.message}
                  </p>
                </div>

                {/* Actions Menu */}
                <div className="flex items-center gap-1">
                  {onMarkAsRead && !notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Marcar como leída"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {notification.relatedEntity && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle navigation to related entity
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title={`Ver ${notification.relatedEntity.name}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  
                  {onDeleteNotification && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notification.id);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors"
                      title="Eliminar notificación"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Sender */}
                  {notification.sender && (
                    <div className="flex items-center gap-2">
                      {renderSenderAvatar(notification.sender)}
                      <span className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                        {notification.sender.name}
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  <div className="flex items-center gap-1">
                    <CategoryIcon className={`w-4 h-4 ${categoryInfo.color}`} />
                    <span className={`text-neutral-500 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                      {categoryInfo.label}
                    </span>
                  </div>

                  {/* Related Entity */}
                  {notification.relatedEntity && (
                    <span className={`text-neutral-500 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                      • {notification.relatedEntity.name}
                    </span>
                  )}
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {renderNotificationActions(notification)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value as typeof readFilter)}
          className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
        >
          <option value="todas">Todas</option>
          <option value="no-leidas">No leídas</option>
          <option value="leidas">Leídas</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
        >
          <option value="todas">Todos los tipos</option>
          <option value="info">Información</option>
          <option value="success">Éxito</option>
          <option value="warning">Advertencia</option>
          <option value="error">Error</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
          className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
        >
          <option value="todas">Todas las categorías</option>
          <option value="proyecto">Proyecto</option>
          <option value="pago">Pago</option>
          <option value="tarea">Tarea</option>
          <option value="sistema">Sistema</option>
          <option value="cliente">Cliente</option>
          <option value="documento">Documento</option>
        </select>
      </div>
    );
  };

  const renderBulkActions = () => {
    if (!showBulkActions || selectedNotifications.size === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
        <span className="text-sm text-primary-700 dark:text-primary-300">
          {selectedNotifications.size} seleccionada{selectedNotifications.size > 1 ? 's' : ''}
        </span>
        
        <div className="flex items-center gap-2 ml-auto">
          {onMarkAsRead && (
            <button
              onClick={handleBulkMarkAsRead}
              className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Marcar como leídas
            </button>
          )}
          
          {onDeleteNotification && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1 bg-error-600 text-white rounded-md hover:bg-error-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl ${sizeConfig[size].padding} ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl ${sizeConfig[size].padding} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
          <h2 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize}`}>
            {title}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {showBulkActions && displayNotifications.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1 px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              {selectedNotifications.size === displayNotifications.length ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              {selectedNotifications.size === displayNotifications.length ? 'Deseleccionar' : 'Seleccionar'} todo
            </button>
          )}
          
          {onMarkAllAsRead && unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </button>
          )}
          
          {onClearAll && notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-1 text-sm text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Bulk Actions */}
      {renderBulkActions()}

      {/* Notification Groups */}
      <div className="space-y-6">
        {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
          <div key={dateGroup}>
            {groupByDate && dateGroup !== 'todas' && (
              <h3 className={`font-medium text-neutral-700 dark:text-neutral-300 mb-3 ${sizeConfig[size].titleSize}`}>
                {dateGroup} ({groupNotifications.length})
              </h3>
            )}
            
            <div className="space-y-3">
              <AnimatePresence>
                {groupNotifications.map(renderNotificationItem)}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayNotifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No hay notificaciones
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {filteredNotifications.length === 0 && notifications.length > 0 
              ? 'No hay notificaciones que coincidan con los filtros aplicados'
              : 'Te notificaremos cuando haya actividad importante'
            }
          </p>
        </div>
      )}

      {/* Show more indicator */}
      {maxNotifications && filteredNotifications.length > maxNotifications && (
        <div className="text-center mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Mostrando {maxNotifications} de {filteredNotifications.length} notificaciones
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;