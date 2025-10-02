import { FileText, Upload, Download, Folder } from 'lucide-react';
import type { ProjectWithDetails } from '@/modules/projects/services/ProjectService';

interface ProjectDocumentsTabProps {
  project: ProjectWithDetails;
}

export function ProjectDocumentsTab({ project }: ProjectDocumentsTabProps) {
  return (
    <div className="bg-white rounded-lg  border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Documentos del Proyecto</h2>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Gestión de documentos en desarrollo</p>
        <p className="text-sm mt-2">Aquí podrás gestionar contratos, planos y otros documentos</p>
      </div>
    </div>
  );
}