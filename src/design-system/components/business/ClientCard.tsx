import React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Building2, 
  MapPin, 
  User,
  Calendar,
  DollarSign,
  ExternalLink,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export interface ClientContact {
  name: string;
  phone: string;
  email: string;
  position?: string;
  whatsapp?: string;
  isPrimary?: boolean;
}

export interface ClientProject {
  id: string;
  name: string;
  status: 'en-curso' | 'completado' | 'pausado' | 'propuesta';
  value: number;
  startDate: string;
  progress?: number;
}

export interface ClientCardProps {
  /** ID único del cliente */
  id: string;
  /** Nombre o razón social del cliente */
  name: string;
  /** Tipo de cliente */
  type: 'empresa' | 'particular';
  /** Estado del cliente */
  status: 'activo' | 'inactivo' | 'prospecto';
  /** Información de contacto principal */
  contact: ClientContact;
  /** Contactos adicionales */
  additionalContacts?: ClientContact[];
  /** Información de la empresa (si aplica) */
  company?: {
    name: string;
    industry: string;
    size?: 'pequeña' | 'mediana' | 'grande';
    rfc?: string;
  };
  /** Dirección del cliente */
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  /** Proyectos recientes */
  recentProjects?: ClientProject[];
  /** Valor total de proyectos */
  totalValue?: number;
  /** Fecha de último contacto */
  lastContact?: string;
  /** Notas del cliente */
  notes?: string;
  /** Avatar del cliente */
  avatar?: string;
  /** Callback para acciones */
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
  onWhatsApp?: (phone: string) => void;
  onViewDetails?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Tamaño del card */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  id,
  name,
  type,
  status,
  contact,
  company,
  address,
  recentProjects = [],
  totalValue,
  lastContact,
  notes,
  avatar,
  onCall,
  onEmail,
  onWhatsApp,
  onViewDetails,
  onEditClient,
  loading = false,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    activo: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-700 dark:text-success-400',
      border: 'border-success-200 dark:border-success-700',
      icon: CheckCircle,
      label: 'Activo',
    },
    inactivo: {
      bg: 'bg-neutral-50 dark:bg-neutral-800',
      text: 'text-neutral-600 dark:text-neutral-400',
      border: 'border-neutral-200 dark:border-neutral-600',
      icon: Clock,
      label: 'Inactivo',
    },
    prospecto: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-700 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-700',
      icon: AlertCircle,
      label: 'Prospecto',
    },
  };

  const projectStatusConfig = {
    'en-curso': { label: 'En Curso', color: 'text-info-600 dark:text-info-400' },
    'completado': { label: 'Completado', color: 'text-success-600 dark:text-success-400' },
    'pausado': { label: 'Pausado', color: 'text-warning-600 dark:text-warning-400' },
    'propuesta': { label: 'Propuesta', color: 'text-neutral-600 dark:text-neutral-400' },
  };

  const sizeConfig = {
    sm: {
      padding: 'p-4',
      avatarSize: 'w-10 h-10',
      textSize: 'text-sm',
      titleSize: 'text-base',
    },
    md: {
      padding: 'p-6',
      avatarSize: 'w-12 h-12',
      textSize: 'text-sm',
      titleSize: 'text-lg',
    },
    lg: {
      padding: 'p-8',
      avatarSize: 'w-16 h-16',
      textSize: 'text-base',
      titleSize: 'text-xl',
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };


  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return `Hace ${Math.ceil(diffDays / 30)} meses`;
  };

  const renderAvatar = () => {
    if (avatar) {
      return (
        <img
          src={avatar}
          alt={name}
          className={`${sizeConfig[size].avatarSize} rounded-full object-cover`}
        />
      );
    }

    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className={`${sizeConfig[size].avatarSize} rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center`}>
        <span className="text-primary-700 dark:text-primary-300 font-semibold">
          {initials}
        </span>
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="flex gap-2">
      {contact.phone && onCall && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onCall(contact.phone);
          }}
          className="p-2 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors"
          title="Llamar"
        >
          <Phone className="w-4 h-4" />
        </motion.button>
      )}
      
      {contact.email && onEmail && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onEmail(contact.email);
          }}
          className="p-2 rounded-lg bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400 hover:bg-info-100 dark:hover:bg-info-900/30 transition-colors"
          title="Enviar email"
        >
          <Mail className="w-4 h-4" />
        </motion.button>
      )}
      
      {contact.whatsapp && onWhatsApp && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onWhatsApp(contact.whatsapp!);
          }}
          className="p-2 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </motion.button>
      )}
      
      {onViewDetails && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(id);
          }}
          className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          title="Ver detalles"
        >
          <ExternalLink className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className={`${sizeConfig[size].avatarSize} bg-neutral-200 dark:bg-neutral-700 rounded-full`} />
            <div className="flex-1">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Header with avatar, name, and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {renderAvatar()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize}`}>
                  {name}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} border`}>
                  <StatusIcon className="w-3 h-3" />
                  {currentStatus.label}
                </span>
              </div>
              
              {type === 'empresa' && company && (
                <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                  <Building2 className="w-4 h-4" />
                  <span className={sizeConfig[size].textSize}>{company.name}</span>
                </div>
              )}
              
              {type === 'particular' && (
                <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                  <User className="w-4 h-4" />
                  <span className={sizeConfig[size].textSize}>Cliente particular</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onEditClient && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClient(id);
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-neutral-400" />
            <span className={`text-neutral-600 dark:text-neutral-300 ${sizeConfig[size].textSize}`}>
              {contact.phone}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-400" />
            <span className={`text-neutral-600 dark:text-neutral-300 ${sizeConfig[size].textSize}`}>
              {contact.email}
            </span>
          </div>
          
          {address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
              <span className={`text-neutral-600 dark:text-neutral-300 ${sizeConfig[size].textSize}`}>
                {address.city}, {address.state}
              </span>
            </div>
          )}
        </div>

        {/* Projects Summary */}
        {recentProjects.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Proyectos Recientes
            </h4>
            <div className="space-y-2">
              {recentProjects.slice(0, 2).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900 dark:text-neutral-100 truncate">
                      {project.name}
                    </p>
                    <p className={`text-xs ${projectStatusConfig[project.status].color}`}>
                      {projectStatusConfig[project.status].label}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(project.value)}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentProjects.length > 2 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  +{recentProjects.length - 2} proyecto{recentProjects.length > 3 ? 's' : ''} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Financial Summary */}
        {totalValue && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Valor Total</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        )}

        {/* Last Contact */}
        {lastContact && (
          <div className="flex items-center gap-2 mb-4 text-neutral-500 dark:text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">
              Último contacto: {getTimeAgo(lastContact)}
            </span>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mb-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {notes}
            </p>
          </div>
        )}

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
        onClick={() => onViewDetails?.(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onViewDetails) {
            e.preventDefault();
            onViewDetails(id);
          }
        }}
        aria-label={`Cliente ${name} - ${currentStatus.label}`}
      >
        {renderContent()}
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default ClientCard;