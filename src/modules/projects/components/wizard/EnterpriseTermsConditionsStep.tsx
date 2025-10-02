import { useState } from "react";
import { useProjectWizard } from "../../hooks/useProjectWizard";
import type { ProjectPhase } from "../../types/project.types";

export function EnterpriseTermsConditionsStep() {
  const { formData, updateFormData } = useProjectWizard();
  const [projectPhases, setProjectPhases] = useState<ProjectPhase[]>(
    formData.projectPhases || []
  );

  const addProjectPhase = () => {
    const newPhase: ProjectPhase = {
      name: "",
      duration: "",
      startDate: "",
      endDate: "",
    };
    const updated = [...projectPhases, newPhase];
    setProjectPhases(updated);
    updateFormData({ projectPhases: updated });
  };

  const updateProjectPhase = (
    index: number,
    field: keyof ProjectPhase,
    value: string
  ) => {
    const updated = [...projectPhases];
    updated[index] = { ...updated[index], [field]: value };
    setProjectPhases(updated);
    updateFormData({ projectPhases: updated });
  };

  const removeProjectPhase = (index: number) => {
    const updated = projectPhases.filter((_, i) => i !== index);
    setProjectPhases(updated);
    updateFormData({ projectPhases: updated });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-xl text-gray-900 mb-2">Términos y Condiciones</h2>
        <p className="text-sm text-gray-600">
          Cronograma del proyecto, fases y términos contractuales
        </p>
      </div>

      <div className="space-y-8">
        {/* Project Timeline */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Cronograma del Proyecto
            </h3>
            <p className="text-xs text-gray-600">
              Fechas de inicio y finalización estimadas generales
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm text-gray-700">
                Fecha de Inicio del Proyecto
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate || ""}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              />
              <p className="text-xs text-gray-500">
                Cuándo se espera que comience el trabajo del proyecto
              </p>
            </div>

            {/* Estimated End Date */}
            <div className="space-y-2">
              <label
                htmlFor="estimatedEndDate"
                className="text-sm text-gray-700"
              >
                Fecha de Finalización Estimada
              </label>
              <input
                type="date"
                id="estimatedEndDate"
                value={formData.estimatedEndDate || ""}
                onChange={(e) =>
                  updateFormData({ estimatedEndDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              />
              <p className="text-xs text-gray-500">
                Fecha esperada de finalización del proyecto
              </p>
            </div>
          </div>
        </div>

        {/* Project Phases */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Fases del Proyecto
              </h3>
              <p className="text-xs text-gray-600">
                Desglose opcional del proyecto en fases o hitos
              </p>
            </div>
            <button
              type="button"
              onClick={addProjectPhase}
              className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Agregar Fase
            </button>
          </div>

          {projectPhases.map((phase, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Fase {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeProjectPhase(index)}
                  className="text-sm text-gray-600 hover:text-gray-600"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">
                    Nombre de la Fase
                  </label>
                  <input
                    type="text"
                    value={phase.name}
                    onChange={(e) =>
                      updateProjectPhase(index, "name", e.target.value)
                    }
                    placeholder="ej., Fundación, Estructura, Techado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Duración</label>
                  <input
                    type="text"
                    value={phase.duration}
                    onChange={(e) =>
                      updateProjectPhase(index, "duration", e.target.value)
                    }
                    placeholder="ej., 2 semanas, 1 mes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={phase.startDate || ""}
                    onChange={(e) =>
                      updateProjectPhase(index, "startDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Fecha de Fin</label>
                  <input
                    type="date"
                    value={phase.endDate || ""}
                    onChange={(e) =>
                      updateProjectPhase(index, "endDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}

          {projectPhases.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm">No se han definido fases del proyecto</p>
              <p className="text-xs mt-1">
                Agregue fases para desglosar el cronograma del proyecto
              </p>
            </div>
          )}
        </div>

        {/* Payment Terms */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Términos de Pago
            </h3>
            <p className="text-xs text-gray-600">
              Calendario de pagos y condiciones
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="paymentTerms" className="text-sm text-gray-700">
                Términos y Condiciones de Pago
              </label>
              <textarea
                id="paymentTerms"
                value={formData.paymentTerms || ""}
                onChange={(e) =>
                  updateFormData({ paymentTerms: e.target.value })
                }
                placeholder="Especifique los términos de pago, fechas de vencimiento, métodos de pago aceptados, políticas de pagos tardíos..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white resize-none"
              />
              <p className="text-xs text-gray-500">
                Condiciones de pago detalladas que se incluirán en el contrato
              </p>
            </div>

            {/* Standard Payment Terms Template */}
            <div className="bg-gray-100 border border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Plantilla de Términos de Pago Estándar
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  • El anticipo se debe pagar al momento de firmar el contrato
                </p>
                <p>
                  • Los pagos de las cuotas vencen en la misma fecha cada
                  período
                </p>
                <p>
                  • Se aceptan pagos mediante cheque, transferencia bancaria o
                  métodos de pago aprobados
                </p>
                <p>
                  • Se aplican recargos por mora después de que expire el
                  período de gracia
                </p>
                <p>
                  • El trabajo puede suspenderse por pagos vencidos que excedan
                  los 30 días
                </p>
                <p>
                  • Todos los pagos son no reembolsables una vez que el trabajo
                  haya comenzado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Conditions */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Condiciones Especiales
            </h3>
            <p className="text-xs text-gray-600">
              Términos y condiciones adicionales específicos de este proyecto
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="specialConditions"
                className="text-sm text-gray-700"
              >
                Términos Específicos del Proyecto
              </label>
              <textarea
                id="specialConditions"
                value={formData.specialConditions || ""}
                onChange={(e) =>
                  updateFormData({ specialConditions: e.target.value })
                }
                placeholder="Cualquier condición especial, garantías, políticas de órdenes de cambio, especificaciones de materiales o requisitos específicos del proyecto..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white resize-none"
              />
              <p className="text-xs text-gray-500">
                Estas condiciones se incorporarán al contrato del proyecto
              </p>
            </div>

            {/* Common Special Conditions Examples */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Condiciones Especiales Comunes
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  • Ajustes de costos de materiales para aumentos de precio que
                  excedan el 10%
                </p>
                <p>
                  • Disposiciones de demora por clima para trabajos de
                  construcción al aire libre
                </p>
                <p>
                  • Las órdenes de cambio deben aprobarse por escrito antes de
                  la implementación
                </p>
                <p>
                  • Los retrasos en permisos e inspecciones no son motivo de
                  extensión del contrato
                </p>
                <p>
                  • Los materiales suministrados por el cliente deben cumplir
                  con los estándares de calidad especificados
                </p>
                <p>
                  • Limpieza y remoción de escombros incluidos en el alcance del
                  proyecto
                </p>
                <p>• Garantía de un año en mano de obra y materiales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal and Compliance Notice */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="text-sm">
            <div className="text-gray-600 font-medium mb-2">
              Aviso de Cumplimiento Legal
            </div>
            <div className="text-gray-600 text-xs space-y-1">
              <p>
                Estos términos y condiciones forman parte del contrato del
                proyecto. Asegúrese de que cumplan con los códigos de
                construcción locales, los requisitos de licencia y las leyes de
                protección al consumidor.
              </p>
              <p>
                Considere hacer que un abogado revise los contratos complejos
                antes de la firma del cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
