import { Spinner } from "@/design-system/components/feedback";
import {
  useStudioSettings,
  useUpdateStudioSetting,
} from "@/hooks/useStudioSettings";
import {
  AlertCircle,
  Building2,
  DollarSign,
  Info,
  Monitor,
  Plug,
  Save,
} from "lucide-react";
import React, { useState } from "react";

// CRM Components
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

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("financial");
  const { data: financialSettings, isLoading } = useStudioSettings("financial");
  const updateSetting = useUpdateStudioSetting();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when settings load
  React.useEffect(() => {
    if (financialSettings) {
      const initialData: Record<string, any> = {};
      financialSettings.forEach((setting) => {
        initialData[setting.setting_key] = setting.formattedValue;
      });
      setFormData(initialData);
    }
  }, [financialSettings]);

  const handleInputChange = (key: string, value: any, type: string) => {
    let processedValue = value;

    // Process value based on type
    switch (type) {
      case "number":
      case "percentage":
        processedValue = value === "" ? 0 : Number(value);
        break;
      case "boolean":
        processedValue = Boolean(value);
        break;
      default:
        processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: processedValue,
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      for (const [key, value] of Object.entries(formData)) {
        const success = await updateSetting.mutateAsync({ key, value });
        if (!success) {
          console.error(`Failed to update setting: ${key}`);
        }
      }
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const validatePercentage = (value: number) => {
    return value >= 0 && value <= 100;
  };

  const renderFinancialSettings = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" color="primary" />
        </div>
      );
    }

    if (!financialSettings?.length) {
      return (
        <div className="text-center py-8">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No hay configuraciones financieras disponibles
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {financialSettings.map((setting) => (
          <div key={setting.setting_key} className="space-y-3">
            <label htmlFor={setting.setting_key} className="crm-label-lg">
              {setting.display_name}
            </label>

            {setting.description && (
              <p className="crm-body-sm">{setting.description}</p>
            )}

            <div className="relative">
              {setting.setting_type === "percentage" ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    id={setting.setting_key}
                    value={formData[setting.setting_key] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        setting.setting_key,
                        e.target.value,
                        setting.setting_type
                      )
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    className={`crm-input-field w-32 ${
                      !validatePercentage(formData[setting.setting_key] || 0)
                        ? "border-gray-200 focus:border-gray-200 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="0"
                  />
                  <span className="crm-body-sm">%</span>

                  {!validatePercentage(formData[setting.setting_key] || 0) && (
                    <div className="flex items-center text-gray-600 crm-body-xs">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Debe ser entre 0 y 100
                    </div>
                  )}
                </div>
              ) : setting.setting_type === "number" ? (
                <input
                  type="number"
                  id={setting.setting_key}
                  value={formData[setting.setting_key] || ""}
                  onChange={(e) =>
                    handleInputChange(
                      setting.setting_key,
                      e.target.value,
                      setting.setting_type
                    )
                  }
                  className="crm-input-field w-32"
                  placeholder="0"
                />
              ) : setting.validation_rules?.options ? (
                <select
                  id={setting.setting_key}
                  value={formData[setting.setting_key] || ""}
                  onChange={(e) =>
                    handleInputChange(
                      setting.setting_key,
                      e.target.value,
                      setting.setting_type
                    )
                  }
                  className="crm-select-field w-48"
                >
                  {setting.validation_rules.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id={setting.setting_key}
                  value={formData[setting.setting_key] || ""}
                  onChange={(e) =>
                    handleInputChange(
                      setting.setting_key,
                      e.target.value,
                      setting.setting_type
                    )
                  }
                  maxLength={setting.validation_rules?.maxLength}
                  className="crm-input-field"
                  placeholder={setting.description || ""}
                />
              )}
            </div>

            {/* Show current vs original value */}
            {formData[setting.setting_key] !== setting.formattedValue && (
              <div className="flex items-center crm-body-xs text-amber-600">
                <Info className="h-3 w-3 mr-1" />
                Valor original: {setting.formattedValue}
                {setting.setting_type === "percentage" && "%"}
              </div>
            )}
          </div>
        ))}

        {/* Changes notification */}
        {hasChanges && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center crm-body-sm text-gray-600">
                <Info className="h-4 w-4 mr-2" />
                Tienes cambios sin guardar
              </div>
              <button
                onClick={() => {
                  if (financialSettings) {
                    const resetData: Record<string, any> = {};
                    financialSettings.forEach((setting) => {
                      resetData[setting.setting_key] = setting.formattedValue;
                    });
                    setFormData(resetData);
                    setHasChanges(false);
                  }
                }}
                className="crm-btn-ghost text-sm"
              >
                Descartar Cambios
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: "financial", label: "Configuración Financiera", icon: DollarSign },
    { id: "studio", label: "Datos del Estudio", icon: Building2 },
    { id: "integrations", label: "Integraciones", icon: Plug },
    { id: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="crm-page-minimal">
      {/* Page Header */}
      <PageHeader
        title="Configuración"
        subtitle="Gestiona las configuraciones y preferencias del sistema"
        primaryAction={
          hasChanges
            ? {
                label: "Guardar Cambios",
                icon: Save,
                onClick: handleSaveChanges,
                loading: updateSetting.isPending,
                variant: "primary",
              }
            : undefined
        }
      />

      {/* Content Area */}
      <div className="crm-content-area-minimal">
        <div className="flex gap-6">
          {/* Settings Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="crm-card-minimal">
              <div className="crm-card-body-minimal">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          activeTab === tab.id
                            ? "bg-gray-900 text-gray-600"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="crm-card-minimal">
              <div className="crm-card-body-minimal">
                {activeTab === "financial" && (
                  <>
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="crm-heading-md">
                        Configuración Financiera
                      </h2>
                      <p className="crm-body-sm mt-1">
                        Configuraciones relacionadas con honorarios, monedas y
                        aspectos financieros
                      </p>
                    </div>
                    {renderFinancialSettings()}
                  </>
                )}

                {activeTab === "studio" && (
                  <div className="crm-empty-state">
                    <Building2 className="crm-empty-state-icon" />
                    <h3 className="crm-empty-state-title">Datos del Estudio</h3>
                    <p className="crm-empty-state-description">
                      Información del estudio, logotipo, datos fiscales
                    </p>
                    <p className="crm-body-xs mt-4">Próximamente</p>
                  </div>
                )}

                {activeTab === "integrations" && (
                  <div className="crm-empty-state">
                    <Plug className="crm-empty-state-icon" />
                    <h3 className="crm-empty-state-title">Integraciones</h3>
                    <p className="crm-empty-state-description">
                      Conecta con herramientas externas y servicios
                    </p>
                    <p className="crm-body-xs mt-4">Próximamente</p>
                  </div>
                )}

                {activeTab === "system" && (
                  <div className="crm-empty-state">
                    <Monitor className="crm-empty-state-icon" />
                    <h3 className="crm-empty-state-title">Sistema</h3>
                    <p className="crm-empty-state-description">
                      Configuraciones avanzadas del sistema
                    </p>
                    <p className="crm-body-xs mt-4">Próximamente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
