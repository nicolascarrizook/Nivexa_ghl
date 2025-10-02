import React from 'react';

export interface ProviderManagementProps {
  projectId?: string;
}

export const ProviderManagement: React.FC<ProviderManagementProps> = ({ projectId }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Gestión de Proveedores</h2>
      <p className="text-gray-600">
        Sistema de gestión de proveedores en desarrollo para el proyecto {projectId}
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700">Total Proveedores</h3>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700">Activos</h3>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700">Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-600">0</p>
        </div>
      </div>
    </div>
  );
};