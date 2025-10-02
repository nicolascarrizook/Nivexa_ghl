import { useProjectWizard } from '../../hooks/useProjectWizard';

export function EnterpriseProjectBasicsStep() {
  const { formData, updateFormData } = useProjectWizard();

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Información del Proyecto</h2>
        <p className="text-sm text-gray-600">
          Datos básicos del proyecto para el desarrollo de propiedades del cliente
        </p>
      </div>

      <div className="space-y-5">
        {/* Project Name */}
        <div className="space-y-2">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
            Nombre del Proyecto <span className="text-gray-600">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            value={formData.projectName || ''}
            onChange={(e) => updateFormData({ projectName: e.target.value })}
            placeholder="Ingrese el nombre del proyecto"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white transition-colors duration-300"
          />
        </div>

        {/* Project Type */}
        <div className="space-y-2">
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
            Tipo de Proyecto <span className="text-gray-600">*</span>
          </label>
          <select
            id="projectType"
            value={formData.projectType || ''}
            onChange={(e) => updateFormData({ projectType: e.target.value as 'construction' | 'renovation' | 'design' | 'other' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white transition-colors duration-300"
          >
            <option value="">Seleccione el tipo de proyecto</option>
            <option value="construction">Construcción</option>
            <option value="renovation">Renovación</option>
            <option value="design">Diseño y Planificación</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción del Proyecto
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Breve descripción del alcance y objetivos del proyecto"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white resize-none transition-colors duration-300"
          />
          <p className="text-xs text-gray-500">Descripción opcional del proyecto para referencia interna</p>
        </div>

        {/* Information Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm">
            <div className="text-gray-900 font-medium mb-2">Siguiente Paso</div>
            <div className="text-gray-600">
              En los próximos pasos configurará los datos del cliente, el valor del proyecto, 
              la forma de pago y los términos del contrato. Todos estos detalles pueden 
              modificarse antes de confirmar la creación del proyecto.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}