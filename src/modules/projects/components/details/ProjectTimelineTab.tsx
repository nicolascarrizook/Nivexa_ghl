import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { ProjectWithDetails } from '@/modules/projects/services/ProjectService';

interface ProjectTimelineTabProps {
  project: ProjectWithDetails;
}

export function ProjectTimelineTab({ project }: ProjectTimelineTabProps) {
  return (
    <div className="bg-white rounded-lg  border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 text-gray-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Timeline del Proyecto</h2>
      </div>
      <div className="text-center py-12 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Timeline en desarrollo</p>
        <p className="text-sm mt-2">Aquí se mostrará el cronograma visual del proyecto</p>
      </div>
    </div>
  );
}