import React from 'react';
// TODO: Restore when CRM components are migrated to design-system
// import { 
//   ProjectCard, 
//   ProjectGrid,
//   StatusBadge, 
//   ProgressBar, 
//   FinancialProgress,
//   CircularProgress 
// } from '@/components/crm';
// import type { Project } from '@/components/crm';

// Temporary type definition
interface Project {
  id: string;
  projectName: string;
  client_name: string;
  status: string;
  totalAmount: number;
  total_collected: number;
  [key: string]: any;
}

// Sample data for showcase
const sampleProjects: Project[] = [
  {
    id: '1',
    projectName: 'Torre Residencial Palermo',
    client_name: 'Desarrollos Urbanos SA',
    status: 'active',
    totalAmount: 2500000,
    total_collected: 1750000,
    projectType: 'residential',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    projectName: 'Centro Comercial Norte',
    client_name: 'Inversiones del Plata',
    status: 'completed',
    totalAmount: 5000000,
    total_collected: 5000000,
    projectType: 'commercial',
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: '3',
    projectName: 'Renovación Hotel Premium',
    client_name: 'Hotelería Internacional',
    status: 'on_hold',
    totalAmount: 1500000,
    total_collected: 750000,
    projectType: 'renovation',
    created_at: '2024-03-10T10:00:00Z'
  },
  {
    id: '4',
    projectName: 'Diseño Interior Oficinas',
    client_name: 'Tech Solutions Inc',
    status: 'draft',
    totalAmount: 350000,
    total_collected: 0,
    projectType: 'design',
    created_at: '2024-03-15T10:00:00Z'
  }
];

export function ProjectShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Nuevo Diseño CRM Enterprise
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema minimalista y profesional para gestión de proyectos
          </p>
        </div>

        {/* Status Badges Showcase */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Estados del Proyecto</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Variante Dot (Ultra Minimalista)</p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="active" variant="dot" />
                  <StatusBadge status="completed" variant="dot" />
                  <StatusBadge status="on_hold" variant="dot" />
                  <StatusBadge status="draft" variant="dot" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Variante Pill (Standard)</p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="active" variant="pill" />
                  <StatusBadge status="completed" variant="pill" />
                  <StatusBadge status="on_hold" variant="pill" />
                  <StatusBadge status="draft" variant="pill" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Indicators */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Indicadores de Progreso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Barras de Progreso</h3>
              <div className="space-y-4">
                <ProgressBar value={25} variant="minimal" />
                <ProgressBar value={50} variant="compact" label="Progreso del Proyecto" />
                <ProgressBar value={75} variant="detailed" label="Completado" gradient />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Progreso Financiero</h3>
              <div className="space-y-4">
                <FinancialProgress
                  current={1750000}
                  total={2500000}
                  label="Cobrado"
                  showPercentage
                />
                <div className="flex justify-around pt-4">
                  <CircularProgress value={25} size="sm" />
                  <CircularProgress value={50} size="md" />
                  <CircularProgress value={75} size="lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Cards Grid */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Tarjetas de Proyecto - Vista Grid</h2>
          <ProjectGrid
            projects={sampleProjects}
            onProjectClick={(project) => console.log('Clicked:', project.projectName)}
            variant="default"
          />
        </section>

        {/* Project Cards Compact */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Tarjetas de Proyecto - Vista Compacta</h2>
          <ProjectGrid
            projects={sampleProjects.slice(0, 2)}
            onProjectClick={(project) => console.log('Clicked:', project.projectName)}
            variant="compact"
          />
        </section>

        {/* Design Principles */}
        <section className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Principios de Diseño</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <div className="w-6 h-0.5 bg-gray-400"></div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Minimalismo</h3>
              <p className="text-sm text-gray-600">
                90% colores neutros, sin decoraciones innecesarias
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-3 h-3 bg-gray-400"></div>
                  <div className="w-3 h-3 bg-gray-400"></div>
                  <div className="w-3 h-3 bg-gray-400"></div>
                  <div className="w-3 h-3 bg-gray-400"></div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Consistencia</h3>
              <p className="text-sm text-gray-600">
                Espaciado de 8px, tipografía uniforme
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <div className="w-6 h-6 border border-gray-400 rounded"></div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Elegancia</h3>
              <p className="text-sm text-gray-600">
                Transiciones sutiles, jerarquía clara
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Paleta de Colores</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 h-10 bg-gray-50 rounded border border-gray-200"></div>
              <div className="w-20 h-10 bg-gray-100 rounded border border-gray-200"></div>
              <div className="w-20 h-10 bg-gray-200 rounded border border-gray-200"></div>
              <div className="w-20 h-10 bg-gray-300 rounded border border-gray-200"></div>
              <div className="w-20 h-10 bg-gray-400 rounded"></div>
              <div className="w-20 h-10 bg-gray-500 rounded"></div>
              <div className="w-20 h-10 bg-gray-600 rounded"></div>
              <div className="w-20 h-10 bg-gray-700 rounded"></div>
              <div className="w-20 h-10 bg-gray-900 rounded"></div>
              <span className="text-sm text-gray-600 ml-3">Grises Neutros (90%)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-10 bg-gray-900 rounded border border-gray-200"></div>
              <div className="w-20 h-10 bg-gray-900 rounded"></div>
              <div className="w-20 h-10 bg-gray-900 rounded"></div>
              <span className="text-sm text-gray-600 ml-3">Azul Acento (CTAs únicamente)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-10 bg-gray-100 rounded border border-gray-200"></div>
              <div className="w-20 h-10 bg-gray-100 rounded"></div>
              <span className="text-sm text-gray-600 ml-3">Verde (Estados positivos)</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}