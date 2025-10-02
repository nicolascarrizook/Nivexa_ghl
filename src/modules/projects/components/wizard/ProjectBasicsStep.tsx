import { useEffect } from 'react';
import { useProjectWizard } from '../../hooks/useProjectWizard';
import { Input } from '@/design-system/components/inputs/Input';
import { formatCurrency, parseCurrency } from '@/utils/formatters';

const PROJECT_TYPE_OPTIONS = [
  { value: 'construction', label: 'Construcción Nueva', icon: '🏗️' },
  { value: 'renovation', label: 'Remodelación', icon: '🔨' },
  { value: 'design', label: 'Diseño', icon: '📐' },
  { value: 'other', label: 'Otro', icon: '📋' },
];

export function ProjectBasicsStep() {
  const { formData, updateFormData } = useProjectWizard();

  // Set default values on mount
  useEffect(() => {
    if (!formData.projectType) {
      updateFormData({ projectType: 'construction' });
    }
  }, []);

  const handleAmountChange = (value: string) => {
    const numValue = parseCurrency(value);
    updateFormData({ 
      estimatedValue: numValue,
      totalAmount: numValue // Also update total amount
    });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-light text-primary mb-2">Información Básica del Proyecto</h2>
        <p className="text-sm text-tertiary">
          Define los datos principales del proyecto que vas a crear
        </p>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-normal text-secondary mb-2">
          Nombre del Proyecto <span className="text-gray-600">*</span>
        </label>
        <input
          type="text"
          value={formData.projectName || ''}
          onChange={(e) => updateFormData({ projectName: e.target.value })}
          className="input-field w-full"
          placeholder="Ej: Casa Familia González - Barrio Norte"
        />
        <p className="text-xs text-tertiary mt-2">
          Un nombre descriptivo que te ayude a identificar el proyecto fácilmente
        </p>
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-sm font-normal text-secondary mb-3">
          Tipo de Proyecto <span className="text-gray-600">*</span>
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PROJECT_TYPE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFormData({ projectType: option.value as any })}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${formData.projectType === option.value
                  ? 'bg-gray-100/20 border-gray-200/50 text-gray-600'
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600/50'
                }
              `}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="text-sm font-normal">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Value */}
      <div>
        <label className="block text-sm font-normal text-secondary mb-2">
          Valor Estimado del Proyecto <span className="text-gray-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="text"
            value={formData.estimatedValue ? formatCurrency(formData.estimatedValue).replace('$', '').trim() : ''}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="input-field w-full pl-8 text-lg font-light"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-tertiary mt-2">
          Incluye materiales, mano de obra y honorarios profesionales
        </p>
        {formData.estimatedValue && formData.estimatedValue > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Total: {formatCurrency(formData.estimatedValue)}
          </p>
        )}
      </div>

      {/* Project Description */}
      <div>
        <label className="block text-sm font-normal text-secondary mb-2">
          Descripción del Proyecto
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          className="textarea-field w-full"
          placeholder="Describe el alcance del trabajo, materiales principales y cualquier requerimiento especial..."
          rows={4}
        />
        <p className="text-xs text-tertiary mt-2">
          Opcional: Agrega detalles que te ayuden a recordar el alcance del proyecto
        </p>
      </div>

      {/* Quick Tips */}
      <div className="p-4 bg-gray-900/10 border border-gray-200/30 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-normal text-gray-600 mb-1">Consejo</h4>
            <p className="text-xs text-gray-600/70">
              El valor estimado te ayudará a calcular automáticamente los planes de pago en el siguiente paso. 
              Puedes ajustarlo más adelante si es necesario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}