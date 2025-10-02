import React from 'react';
import { Calendar, Plus, Clock, Users, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

// Design System Components
import { PageContainer, SectionCard } from '@/design-system/components/layout';
import { Badge } from '@/design-system/components/data-display';

// Simple PageHeader component inline
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<any>;
    onClick?: () => void;
    variant?: string;
  };
  secondaryActions?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick?: () => void;
    variant?: string;
  }>;
}

function PageHeader({ title, subtitle, primaryAction, secondaryActions }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex space-x-2">
          {secondaryActions && secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </button>
            );
          })}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

export function CalendarPage() {
  return (
      <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Calendario"
        subtitle="Gestiona tus citas, eventos y recordatorios"
        primaryAction={{
          label: "Nueva Cita",
          icon: Plus,
          onClick: () => {},
          variant: "primary"
        }}
        secondaryActions={[
          {
            label: "Hoy",
            icon: Clock,
            onClick: () => {},
            variant: "secondary"
          }
        ]}
      />

        {/* Content Area */}
        <div className="space-y-6">
          {/* Calendar Controls */}
          <SectionCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-lg font-medium text-gray-900">Enero 2024</h3>
                <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-900 rounded-md">Mes</button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Semana</button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Día</button>
              </div>
            </div>
          </SectionCard>

          {/* Development State */}
          <SectionCard className="p-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calendario en Desarrollo</h3>
              <p className="text-sm text-gray-500">
                Próximamente: gestión completa de citas, eventos del proyecto y recordatorios
              </p>
            </div>
          </SectionCard>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SectionCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Citas con Clientes</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Programa y gestiona reuniones</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                  <span>Sincronización automática</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                  <span>Confirmaciones por email</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Hitos de Proyecto</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Fechas importantes de entrega</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-100 rounded-full mr-2"></div>
                  <span>Seguimiento automático</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-100 rounded-full mr-2"></div>
                  <span>Integración con proyectos</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Recordatorios</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Nunca olvides tareas importantes</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                  <span>Notificaciones push</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                  <span>Configuración flexible</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </PageContainer>
  );
}