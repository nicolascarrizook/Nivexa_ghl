import React from 'react';

export interface ComponentShowcaseProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({
  title = "Component Showcase",
  description = "Demonstración de componentes del sistema de diseño",
  children
}) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="space-y-8">
        {children || (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-center">
              Los componentes del sistema de diseño se mostrarán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};