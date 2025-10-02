import React from 'react';
import { FileText, Upload, FolderOpen, Search, Filter, Archive } from 'lucide-react';

// Design System Components
import { PageContainer, SectionCard } from '@/design-system/components/layout';
import { EmptyState } from '@/design-system/components/feedback';

// Simple PageHeader component inline
function PageHeader({ title, subtitle, primaryAction, secondaryActions }: any) {
  return (
    <div className="border-b border-gray-200 pb-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex space-x-2">
          {secondaryActions && secondaryActions.map((action: any, index: number) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </button>
            );
          })}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DocumentsPage() {
  return (
      <PageContainer>
        {/* Page Header */}
        <PageHeader
          title="Documentos"
          subtitle="Gestión centralizada de archivos y documentos"
          primaryAction={{
            label: "Subir Documento",
            icon: Upload,
            onClick: () => {},
            variant: "primary"
          }}
          secondaryActions={[
            {
              label: "Filtros",
              icon: Filter,
              onClick: () => {},
              variant: "secondary"
            },
            {
              label: "Buscar",
              icon: Search,
              onClick: () => {},
              variant: "ghost"
            }
          ]}
        />

        {/* Content Area */}
        <div className="space-y-6">
          {/* Development State */}
          <SectionCard className="p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Documentos en Desarrollo</h3>
              <p className="text-sm text-gray-500">
                Próximamente: almacenamiento de contratos, planos, certificados y documentación técnica
              </p>
            </div>
          </SectionCard>

          {/* Feature Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SectionCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Contratos y Documentos Legales</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Almacenamiento seguro de documentación contractual</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                  <span>Control de versiones</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                  <span>Firmas digitales</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <FolderOpen className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Archivos de Proyecto</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Organización por proyecto y cliente</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-100 rounded-full mr-2"></div>
                  <span>Clasificación automática</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-100 rounded-full mr-2"></div>
                  <span>Acceso por cliente</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <Archive className="h-5 w-5 text-gray-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Certificados y Documentación</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Certificados técnicos y documentación oficial</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <span>Búsqueda avanzada</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <span>Archivo histórico</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </PageContainer>
  );
}