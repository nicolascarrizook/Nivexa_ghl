/**
 * Enhanced GanttChart Component for Nivexa CRM
 * 
 * Professional Gantt chart implementation using gantt-task-react library.
 * Provides interactive timeline representation with drag-to-resize, dependencies,
 * and multiple view modes.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Gantt, 
  Task, 
  ViewMode, 
  EventOption, 
  StylingOption,
  DisplayOption
} from 'gantt-task-react';
import { Calendar, Clock, ArrowRight, AlertCircle, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { Button } from '@/components/Button';
import 'gantt-task-react/dist/index.css';
import './GanttChart.css';

export interface GanttStage {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  dependencies?: string[];
  color?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress?: number;
}

export interface GanttChartProps {
  stages: GanttStage[];
  className?: string;
  showDependencies?: boolean;
  showProgress?: boolean;
  onStageClick?: (stage: GanttStage) => void;
  onStageUpdate?: (stage: GanttStage) => void;
  minDate?: string;
  maxDate?: string;
  isEditable?: boolean;
}

// Enhanced styling configuration for professional appearance
const GANTT_STYLING: StylingOption = {
  headerHeight: 50,
  columnWidth: 60,
  listCellWidth: "155px",
  rowHeight: 50,
  ganttHeight: 300,
  barCornerRadius: 4,
  handleWidth: 8,
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "12px",
  barFill: 60,
  barStroke: "none",
  barProgressColor: "#ffffff80",
  barProgressSelectedColor: "#ffffff60",
  barBackgroundColor: "#6b7280",
  barBackgroundSelectedColor: "#4b5563",
  projectProgressColor: "#ffffff80",
  projectProgressSelectedColor: "#ffffff60",
  projectBackgroundColor: "#374151",
  projectBackgroundSelectedColor: "#1f2937",
  milestoneBackgroundColor: "#059669",
  milestoneBackgroundSelectedColor: "#047857",
  rtlMode: false,
  locale: "es-AR",
};

// Display options for better UX
const GANTT_DISPLAY: DisplayOption = {
  viewMode: ViewMode.Day,
  preStepsCount: 1,
  postStepsCount: 1,
  locale: "es-AR",
};

const GanttChart: React.FC<GanttChartProps> = ({
  stages = [],
  className = '',
  showDependencies = true,
  showProgress = true,
  onStageClick,
  onStageUpdate,
  minDate,
  maxDate,
  isEditable = false
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert GanttStage to gantt-task-react Task format
  const tasks: Task[] = useMemo(() => {
    if (stages.length === 0) return [];

    return stages.map((stage, index) => {
      const startDate = new Date(stage.startDate);
      const endDate = new Date(stage.endDate);
      
      // Ensure valid dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn(`Invalid dates for stage ${stage.id}:`, stage.startDate, stage.endDate);
        return null;
      }

      const progress = showProgress ? (stage.progress || 0) : 0;
      
      // Color mapping based on status
      const getTaskColor = (status?: string) => {
        switch (status) {
          case 'completed':
            return '#10b981'; // green-500
          case 'in-progress':
            return '#3b82f6'; // blue-500
          case 'overdue':
            return '#ef4444'; // red-500
          default:
            return '#6b7280'; // gray-500
        }
      };

      return {
        start: startDate,
        end: endDate,
        name: stage.name,
        id: stage.id,
        type: 'task' as const,
        progress,
        isDisabled: !isEditable,
        styles: {
          backgroundColor: stage.color || getTaskColor(stage.status),
          backgroundSelectedColor: stage.color || getTaskColor(stage.status),
          progressColor: '#ffffff80',
          progressSelectedColor: '#ffffff60',
        },
        dependencies: showDependencies ? stage.dependencies : undefined,
      };
    }).filter(Boolean) as Task[];
  }, [stages, showProgress, showDependencies, isEditable]);

  // Handle task changes (drag, resize)
  const handleTaskChange = useCallback((task: Task) => {
    if (!onStageUpdate) return;

    const originalStage = stages.find(s => s.id === task.id);
    if (!originalStage) return;

    const updatedStage: GanttStage = {
      ...originalStage,
      startDate: task.start.toISOString().split('T')[0],
      endDate: task.end.toISOString().split('T')[0],
      progress: task.progress,
    };

    onStageUpdate(updatedStage);
  }, [stages, onStageUpdate]);

  // Handle task progress changes
  const handleProgressChange = useCallback((task: Task) => {
    if (!onStageUpdate) return;

    const originalStage = stages.find(s => s.id === task.id);
    if (!originalStage) return;

    const updatedStage: GanttStage = {
      ...originalStage,
      progress: task.progress,
    };

    onStageUpdate(updatedStage);
  }, [stages, onStageUpdate]);

  // Handle task selection
  const handleTaskClick = useCallback((task: Task) => {
    if (!onStageClick) return;

    const originalStage = stages.find(s => s.id === task.id);
    if (originalStage) {
      onStageClick(originalStage);
    }
  }, [stages, onStageClick]);

  // Event handlers configuration
  const eventHandlers: EventOption = useMemo(() => ({
    onDateChange: isEditable ? handleTaskChange : undefined,
    onProgressChange: isEditable && showProgress ? handleProgressChange : undefined,
    onDoubleClick: handleTaskClick,
    onSelect: handleTaskClick,
  }), [isEditable, showProgress, handleTaskChange, handleProgressChange, handleTaskClick]);

  // View mode controls
  const viewModeButtons = [
    { mode: ViewMode.Hour, label: 'Horas', icon: Clock },
    { mode: ViewMode.Day, label: 'Días', icon: Calendar },
    { mode: ViewMode.Week, label: 'Semanas', icon: Calendar },
    { mode: ViewMode.Month, label: 'Meses', icon: Calendar },
  ];

  // Enhanced styling with current view mode
  const currentStyling: StylingOption = {
    ...GANTT_STYLING,
    ganttHeight: isExpanded ? 500 : 300,
    columnWidth: viewMode === ViewMode.Hour ? 30 : viewMode === ViewMode.Day ? 60 : viewMode === ViewMode.Week ? 80 : 100,
  };

  if (stages.length === 0) {
    return (
      <div className={`border border-gray-200 rounded-lg p-8 text-center bg-white ${className}`}>
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">Sin etapas definidas</h3>
        <p className="text-sm text-gray-600">
          Agrega etapas del proyecto para visualizar el cronograma
        </p>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}>
      {/* Header with controls */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-semibold text-gray-900">Cronograma del Proyecto</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{stages.length} etapa{stages.length !== 1 ? 's' : ''}</span>
              {showProgress && (
                <span>
                  • Progreso promedio: {Math.round(
                    stages.reduce((acc, stage) => acc + (stage.progress || 0), 0) / stages.length
                  )}%
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View mode buttons */}
            <div className="flex items-center space-x-1 bg-white rounded-md border border-gray-200 p-1">
              {viewModeButtons.map(({ mode, label, icon: Icon }) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? "primary" : "ghost"}
                  onClick={() => setViewMode(mode)}
                  className="px-2 py-1 text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Expand/collapse button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              {isExpanded ? 'Contraer' : 'Expandir'}
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="gantt-container" style={{ overflowX: 'auto' }}>
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          {...eventHandlers}
          {...GANTT_DISPLAY}
          {...currentStyling}
          locale="es-AR"
        />
      </div>

      {/* Footer with legend and status info */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs text-gray-600">
            {/* Status legend */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Pendiente</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>En progreso</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Completado</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Retrasado</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {isEditable && (
              <span className="flex items-center">
                <ArrowRight className="w-3 h-3 mr-1" />
                Arrastra para mover • Redimensiona bordes para cambiar duración
              </span>
            )}
            {showDependencies && (
              <span className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Las líneas muestran dependencias
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default GanttChart;