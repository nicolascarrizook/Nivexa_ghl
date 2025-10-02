import React, { useState } from 'react'
import { Button } from './Button'

// Example icons (you can replace with your preferred icon library)
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

/**
 * Example demonstrating the Button component usage in a CRM context
 */
export function ButtonExample() {
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    alert('¡Proyecto guardado exitosamente!')
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setDeleted(true)
      alert('Cliente eliminado')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Button Component Examples
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ejemplos de uso del componente Button en el contexto del CRM Nivexa
        </p>
      </div>

      {/* Action Buttons */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Botones de Acción Principales
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            leftIcon={<SaveIcon />}
            loading={loading}
            onClick={handleSave}
          >
            {loading ? 'Guardando...' : 'Guardar Proyecto'}
          </Button>

          <Button variant="secondary">
            Cancelar
          </Button>

          <Button
            variant="outline"
            leftIcon={<PlusIcon />}
          >
            Nuevo Cliente
          </Button>

          <Button variant="ghost">
            Ver Detalles
          </Button>

          <Button
            variant="destructive"
            leftIcon={<TrashIcon />}
            disabled={deleted}
            onClick={handleDelete}
          >
            {deleted ? 'Cliente Eliminado' : 'Eliminar Cliente'}
          </Button>
        </div>
      </section>

      {/* Size Variations */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Variaciones de Tamaño
        </h3>
        <div className="flex items-center gap-4">
          <Button size="sm" variant="primary">
            Pequeño
          </Button>
          <Button size="md" variant="primary">
            Mediano
          </Button>
          <Button size="lg" variant="primary">
            Grande
          </Button>
          <Button size="icon" variant="primary" leftIcon={<PlusIcon />} aria-label="Agregar" />
        </div>
      </section>

      {/* Form Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Acciones de Formulario
        </h3>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Cliente
              </label>
              <input
                id="client-name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Ingrese el nombre del cliente"
              />
            </div>
            
            <div className="flex gap-3">
              <Button variant="primary" fullWidth leftIcon={<SaveIcon />}>
                Guardar Cliente
              </Button>
              <Button variant="outline" fullWidth>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Only Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Botones de Solo Ícono
        </h3>
        <div className="flex gap-2">
          <Button size="icon" variant="primary" leftIcon={<PlusIcon />} aria-label="Agregar nuevo" />
          <Button size="icon" variant="secondary" leftIcon={<SaveIcon />} aria-label="Guardar" />
          <Button size="icon" variant="outline" leftIcon={<TrashIcon />} aria-label="Eliminar" />
          <Button size="icon" variant="ghost" leftIcon={<PlusIcon />} aria-label="Más opciones" />
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Estados de Carga
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" loading>
            Procesando Pago...
          </Button>
          <Button variant="secondary" loading leftIcon={<SaveIcon />}>
            Guardando Cambios...
          </Button>
          <Button size="icon" variant="outline" loading aria-label="Cargando" />
        </div>
      </section>

      {/* Disabled States */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Estados Deshabilitados
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" disabled>
            Acción No Disponible
          </Button>
          <Button variant="secondary" disabled leftIcon={<SaveIcon />}>
            Función Bloqueada
          </Button>
          <Button variant="destructive" disabled>
            Eliminar (Protegido)
          </Button>
        </div>
      </section>

      {/* Business Context Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Contexto de Negocio CRM
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Gestión de Clientes</h4>
            <div className="space-y-2">
              <Button variant="primary" fullWidth leftIcon={<PlusIcon />}>
                Nuevo Cliente
              </Button>
              <Button variant="outline" fullWidth>
                Importar Clientes
              </Button>
              <Button variant="ghost" fullWidth>
                Exportar Lista
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Acciones de Proyecto</h4>
            <div className="space-y-2">
              <Button variant="primary" fullWidth leftIcon={<SaveIcon />}>
                Crear Propuesta
              </Button>
              <Button variant="secondary" fullWidth>
                Programar Cita
              </Button>
              <Button variant="destructive" fullWidth>
                Cancelar Proyecto
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ButtonExample