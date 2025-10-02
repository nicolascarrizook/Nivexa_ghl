import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Flag,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Search
} from 'lucide-react';

export interface TaskComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pendiente' | 'en-progreso' | 'completada' | 'cancelada';
  priority: 'baja' | 'media' | 'alta' | 'critica';
  assignee?: TaskAssignee;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
  project?: {
    id: string;
    name: string;
  };
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  category?: 'construccion' | 'diseno' | 'permisos' | 'materiales' | 'inspeccion' | 'administrativo';
}

export interface TaskListProps {
  /** Lista de tareas */
  tasks: Task[];
  /** Título de la lista */
  title?: string;
  /** Mostrar filtros */
  showFilters?: boolean;
  /** Mostrar buscador */
  showSearch?: boolean;
  /** Permitir agrupar por categoría */
  groupByCategory?: boolean;
  /** Mostrar estadísticas */
  showStats?: boolean;
  /** Callback cuando cambia el estado de una tarea */
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  /** Callback para editar tarea */
  onEditTask?: (taskId: string) => void;
  /** Callback para eliminar tarea */
  onDeleteTask?: (taskId: string) => void;
  /** Callback para agregar comentario */
  onAddComment?: (taskId: string, comment: string) => void;
  /** Callback para ver detalles de tarea */
  onViewTask?: (taskId: string) => void;
  /** Callback para crear nueva tarea */
  onCreateTask?: () => void;
  /** Callback para ver asignado */
  onViewAssignee?: (assigneeId: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title = 'Lista de Tareas',
  showFilters = true,
  showSearch = true,
  groupByCategory = false,
  showStats = true,
  onTaskStatusChange,
  onEditTask,
  onViewTask,
  onCreateTask,
  onViewAssignee,
  loading = false,
  size = 'md',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'todas'>('todas');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'todas'>('todas');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const statusConfig = {
    pendiente: {
      bg: 'bg-neutral-50 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-300',
      border: 'border-neutral-200 dark:border-neutral-600',
      icon: Circle,
      label: 'Pendiente',
    },
    'en-progreso': {
      bg: 'bg-info-50 dark:bg-info-900/20',
      text: 'text-info-700 dark:text-info-400',
      border: 'border-info-200 dark:border-info-700',
      icon: Clock,
      label: 'En Progreso',
    },
    completada: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-700 dark:text-success-400',
      border: 'border-success-200 dark:border-success-700',
      icon: CheckCircle,
      label: 'Completada',
    },
    cancelada: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-700 dark:text-error-400',
      border: 'border-error-200 dark:border-error-700',
      icon: AlertTriangle,
      label: 'Cancelada',
    },
  };

  const priorityConfig = {
    baja: { 
      color: 'text-neutral-500 dark:text-neutral-400', 
      bg: 'bg-neutral-100 dark:bg-neutral-700', 
      label: 'Baja',
      icon: '●'
    },
    media: { 
      color: 'text-info-600 dark:text-info-400', 
      bg: 'bg-info-100 dark:bg-info-900/30', 
      label: 'Media',
      icon: '●'
    },
    alta: { 
      color: 'text-warning-600 dark:text-warning-400', 
      bg: 'bg-warning-100 dark:bg-warning-900/30', 
      label: 'Alta',
      icon: '●'
    },
    critica: { 
      color: 'text-error-600 dark:text-error-400', 
      bg: 'bg-error-100 dark:bg-error-900/30', 
      label: 'Crítica',
      icon: '●'
    },
  };

  const categoryLabels = {
    construccion: 'Construcción',
    diseno: 'Diseño',
    permisos: 'Permisos',
    materiales: 'Materiales',
    inspeccion: 'Inspección',
    administrativo: 'Administrativo',
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todas' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'todas' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const groupedTasks = groupByCategory ? 
    filteredTasks.reduce((groups, task) => {
      const category = task.category || 'sin-categoria';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(task);
      return groups;
    }, {} as Record<string, Task[]>) : 
    { todas: filteredTasks };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completada').length;
    const inProgress = tasks.filter(t => t.status === 'en-progreso').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completada') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total, completed, inProgress, overdue };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completada') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTaskToggle = (task: Task) => {
    if (!onTaskStatusChange) return;
    
    const newStatus = task.status === 'completada' ? 'pendiente' : 
                     task.status === 'pendiente' ? 'en-progreso' : 'completada';
    onTaskStatusChange(task.id, newStatus);
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const renderAssigneeAvatar = (assignee: TaskAssignee) => {
    if (assignee.avatar) {
      return (
        <img
          src={assignee.avatar}
          alt={assignee.name}
          className="w-6 h-6 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onViewAssignee?.(assignee.id);
          }}
        />
      );
    }

    const initials = assignee.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div 
        className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          onViewAssignee?.(assignee.id);
        }}
        title={assignee.name}
      >
        <span className="text-primary-700 dark:text-primary-300 font-medium text-xs">
          {initials}
        </span>
      </div>
    );
  };

  const renderTaskItem = (task: Task) => {
    const currentStatus = statusConfig[task.status];
    const currentPriority = priorityConfig[task.priority];
    const StatusIcon = currentStatus.icon;
    const isExpanded = expandedTasks.has(task.id);
    const overdue = isOverdue(task);
    const daysUntilDue = task.dueDate ? getDaysUntilDue(task.dueDate) : null;

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700
          rounded-lg hover:shadow-md dark:hover:shadow-neutral-900/25 transition-all duration-200
          ${task.status === 'completada' ? 'opacity-75' : ''}
        `}
      >
        <div className={`${sizeConfig[size].itemPadding} cursor-pointer`} onClick={() => onViewTask?.(task.id)}>
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTaskToggle(task);
              }}
              className={`mt-1 p-1 rounded-full transition-colors ${
                task.status === 'completada' 
                  ? 'text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <StatusIcon className="w-5 h-5" />
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize} ${
                    task.status === 'completada' ? 'line-through opacity-75' : ''
                  }`}>
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize} mt-1 line-clamp-2`}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}>
                  <span>{currentPriority.icon}</span>
                  <span>{currentPriority.label}</span>
                </div>
              </div>

              {/* Task Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Assignee */}
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      {renderAssigneeAvatar(task.assignee)}
                      <span className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                        {task.assignee.name}
                      </span>
                    </div>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 ${
                      overdue ? 'text-error-600 dark:text-error-400' :
                      daysUntilDue !== null && daysUntilDue <= 3 ? 'text-warning-600 dark:text-warning-400' :
                      'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span className={sizeConfig[size].textSize}>
                        {formatDate(task.dueDate)}
                        {overdue && <span className="ml-1 font-medium">(Vencida)</span>}
                        {!overdue && daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue > 0 && (
                          <span className="ml-1 font-medium">({daysUntilDue}d)</span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Comments */}
                  {task.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className={sizeConfig[size].textSize}>
                        {task.comments.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {(task.description || task.comments.length > 0) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpansion(task.id);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                  
                  {onEditTask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task.id);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  {/* Project */}
                  {task.project && (
                    <div className="mb-3">
                      <span className={`text-neutral-500 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                        Proyecto: {task.project.name}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Comments */}
                  {task.comments.length > 0 && (
                    <div>
                      <h5 className={`font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${sizeConfig[size].textSize}`}>
                        Comentarios recientes
                      </h5>
                      <div className="space-y-2">
                        {task.comments.slice(-2).map((comment) => (
                          <div key={comment.id} className="flex gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
                                  {comment.author.name}
                                </span>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize}`}>
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Task['status'] | 'todas')}
          className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
        >
          <option value="todas">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en-progreso">En Progreso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Task['priority'] | 'todas')}
          className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
        >
          <option value="todas">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats) return null;

    const stats = getTaskStats();

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {stats.total}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total
          </div>
        </div>
        
        <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <div className="text-lg font-semibold text-success-700 dark:text-success-400">
            {stats.completed}
          </div>
          <div className="text-sm text-success-600 dark:text-success-400">
            Completadas
          </div>
        </div>
        
        <div className="p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
          <div className="text-lg font-semibold text-info-700 dark:text-info-400">
            {stats.inProgress}
          </div>
          <div className="text-sm text-info-600 dark:text-info-400">
            En Progreso
          </div>
        </div>
        
        <div className="p-3 bg-error-50 dark:bg-error-900/20 rounded-lg">
          <div className="text-lg font-semibold text-error-700 dark:text-error-400">
            {stats.overdue}
          </div>
          <div className="text-sm text-error-600 dark:text-error-400">
            Vencidas
          </div>
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
              <div key={i} className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
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
        <h2 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize}`}>
          {title}
        </h2>
        
        {onCreateTask && (
          <button
            onClick={onCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Nueva Tarea</span>
          </button>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Filters */}
      {renderFilters()}

      {/* Stats */}
      {renderStats()}

      {/* Task Groups */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
          <div key={category}>
            {groupByCategory && category !== 'todas' && (
              <h3 className={`font-medium text-neutral-700 dark:text-neutral-300 mb-3 ${sizeConfig[size].titleSize}`}>
                {categoryLabels[category as keyof typeof categoryLabels] || 'Sin Categoría'} ({categoryTasks.length})
              </h3>
            )}
            
            <div className="space-y-3">
              <AnimatePresence>
                {categoryTasks.map(renderTaskItem)}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <Flag className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No hay tareas
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {searchTerm ? 'No se encontraron tareas con los filtros aplicados' : 'Aún no hay tareas creadas'}
          </p>
          {onCreateTask && !searchTerm && (
            <button
              onClick={onCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primera tarea
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;