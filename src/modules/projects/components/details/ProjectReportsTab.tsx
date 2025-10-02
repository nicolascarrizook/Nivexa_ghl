import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import type { ProjectWithDetails } from '@/modules/projects/services/ProjectService';

interface ProjectReportsTabProps {
  project: ProjectWithDetails;
}

export function ProjectReportsTab({ project }: ProjectReportsTabProps) {
  return (
    <div className="bg-white rounded-lg  border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Reportes del Proyecto</h2>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Generar Reporte
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Sistema de reportes en desarrollo</p>
        <p className="text-sm mt-2">Aquí podrás generar reportes de progreso y financieros</p>
      </div>
    </div>
  );
}