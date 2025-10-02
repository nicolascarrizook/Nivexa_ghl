import React from 'react';

export interface ProjectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onSuccess?: () => void;
}

export const ProjectPaymentModal: React.FC<ProjectPaymentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Pago del Proyecto</h2>
        <p className="text-gray-600 mb-4">
          Funcionalidad de pago en desarrollo para el proyecto {projectId}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSuccess?.();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
};