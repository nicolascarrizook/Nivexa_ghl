import React from 'react';
import Modal from '@/design-system/components/feedback/Modal';
import GanttChart from './GanttChart';
import type { GanttChartProps } from './GanttChart';
import { Calendar, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/Button';

interface GanttChartModalProps extends Omit<GanttChartProps, 'className'> {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export function GanttChartModal({
  isOpen,
  onClose,
  projectName = 'Proyecto',
  stages,
  ...ganttProps
}: GanttChartModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      closeOnBackdropClick={true}
      closeOnEscape={true}
    >
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Cronograma del Proyecto
              </h2>
              <p className="text-sm text-gray-500">
                {projectName} • {stages.length} etapas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gantt Chart Container */}
        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <GanttChart
              stages={stages}
              {...ganttProps}
              className="h-full"
            />
          </div>
        </div>

        {/* Modal Footer with Stats */}
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Pendiente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">En progreso</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Retrasado</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {stages.length > 0 && (
                <span>
                  Duración total: {calculateTotalDuration(stages)} días
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Helper function to calculate total project duration
function calculateTotalDuration(stages: any[]): number {
  if (stages.length === 0) return 0;
  
  const dates = stages.flatMap(s => [
    s.startDate ? new Date(s.startDate) : null,
    s.endDate ? new Date(s.endDate) : null
  ]).filter(Boolean) as Date[];
  
  if (dates.length === 0) return 0;
  
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export default GanttChartModal;