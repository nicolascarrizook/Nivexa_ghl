import { FileText, Upload, Download, Folder, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { ProjectWithDetails } from '@/modules/projects/services/ProjectService';
import { contractStorageService } from '@/modules/projects/services/ContractStorageService';

interface ProjectDocumentsTabProps {
  project: ProjectWithDetails;
}

export function ProjectDocumentsTab({ project }: ProjectDocumentsTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const contractInfo = project.metadata?.contract as {
    pdfPath?: string;
    pdfUrl?: string;
    signedBy?: string;
    signedAt?: string;
    generatedAt?: string;
  } | undefined;

  const hasContract = !!contractInfo?.pdfPath;

  const handleDownloadContract = async () => {
    if (!contractInfo?.pdfPath) return;

    try {
      setIsDownloading(true);
      const blob = await contractStorageService.downloadContract(contractInfo.pdfPath);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-${project.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Error al descargar el contrato. Por favor intente nuevamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewContract = async () => {
    if (!contractInfo?.pdfPath) return;

    try {
      const signedUrl = await contractStorageService.getSignedUrl(contractInfo.pdfPath, 3600);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing contract:', error);
      alert('Error al abrir el contrato. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Documentos del Proyecto</h2>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center transition-colors">
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </button>
      </div>

      <div className="space-y-4">
        {/* Signed Contract */}
        {hasContract && contractInfo ? (
          <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      Contrato Firmado
                    </h3>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Firmado por: <span className="font-medium">{contractInfo.signedBy}</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Fecha de firma: {contractInfo.signedAt
                        ? new Date(contractInfo.signedAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                    <span>•</span>
                    <span>
                      Generado: {contractInfo.generatedAt
                        ? new Date(contractInfo.generatedAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewContract}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Ver en nueva pestaña"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDownloadContract}
                  disabled={isDownloading}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar PDF"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Empty State */}
        {!hasContract && (
          <div className="text-center py-12 text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No hay documentos disponibles</p>
            <p className="text-sm mt-2">El contrato se generará automáticamente al crear el proyecto</p>
          </div>
        )}
      </div>
    </div>
  );
}