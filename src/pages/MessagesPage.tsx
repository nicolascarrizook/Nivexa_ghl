import React from 'react';
import { MessageCircle, Bell, Users, Plus, Search } from 'lucide-react';

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

export function MessagesPage() {
  return (
    <div className="crm-page-minimal">
      {/* Page Header */}
      <PageHeader
        title="Mensajes"
        subtitle="Comunicación con clientes y equipo"
        primaryAction={{
          label: "Nuevo Mensaje",
          icon: Plus,
          onClick: () => {},
          variant: "primary"
        }}
        secondaryActions={[
          {
            label: "Buscar",
            icon: Search,
            onClick: () => {},
            variant: "ghost"
          }
        ]}
      />

      {/* Content Area */}
      <div className="crm-content-area-minimal">
        {/* Development State */}
        <div className="crm-card-minimal">
          <div className="crm-empty-state">
            <MessageCircle className="crm-empty-state-icon" />
            <h3 className="crm-empty-state-title">Sistema de Mensajería en Desarrollo</h3>
            <p className="crm-empty-state-description">
              Próximamente: chat con clientes, notificaciones y comunicación interna
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="crm-card-minimal">
            <div className="crm-card-body-minimal text-center">
              <div className="crm-icon-container crm-icon-container-blue mx-auto mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h4 className="crm-heading-xs mb-2">Chat con Clientes</h4>
              <p className="crm-body-sm">Comunicación directa y segura</p>
            </div>
          </div>

          <div className="crm-card-minimal">
            <div className="crm-card-body-minimal text-center">
              <div className="crm-icon-container crm-icon-container-amber mx-auto mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h4 className="crm-heading-xs mb-2">Notificaciones</h4>
              <p className="crm-body-sm">Alertas de proyectos y pagos</p>
            </div>
          </div>

          <div className="crm-card-minimal">
            <div className="crm-card-body-minimal text-center">
              <div className="crm-icon-container crm-icon-container-green mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="crm-heading-xs mb-2">Equipo Interno</h4>
              <p className="crm-body-sm">Coordinación entre colaboradores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}