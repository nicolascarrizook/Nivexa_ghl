import React from 'react';
import { ProjectsTableView } from '@/modules/projects/components/ProjectsTableView';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'Casa Moderna en Nordelta',
    client: 'Familia Rodríguez',
    type: 'residential',
    status: 'construction',
    budget: 12500000,
    spent: 8750000,
    startDate: '2024-01-15',
    endDate: '2024-08-15',
    progress: 70,
    team: ['Arquitecto Principal', 'Ing. Civil', 'Capataz', 'Electricista'],
    priority: 'high' as const
  },
  {
    id: '2',
    name: 'Oficinas Corporativas Centro',
    client: 'Tech Solutions S.A.',
    type: 'commercial',
    status: 'design',
    budget: 25000000,
    spent: 5000000,
    startDate: '2024-02-01',
    endDate: '2024-12-01',
    progress: 20,
    team: ['Arquitecto', 'Diseñador'],
    priority: 'medium' as const
  },
  {
    id: '3',
    name: 'Renovación Apartamento',
    client: 'María González',
    type: 'renovation',
    status: 'completed',
    budget: 3500000,
    spent: 3200000,
    startDate: '2023-10-01',
    endDate: '2024-01-30',
    progress: 100,
    team: ['Arquitecto', 'Contractor'],
    priority: 'low' as const
  },
  {
    id: '4',
    name: 'Escuela Primaria Municipal',
    client: 'Municipalidad de San Isidro',
    type: 'institutional',
    status: 'planning',
    budget: 45000000,
    spent: 0,
    startDate: '2024-06-01',
    endDate: '2025-03-01',
    progress: 5,
    team: ['Arquitecto Principal', 'Ing. Estructural'],
    priority: 'high' as const
  },
  {
    id: '5',
    name: 'Jardín Residencial Premium',
    client: 'Country Club Pilar',
    type: 'landscape',
    status: 'development',
    budget: 8900000,
    spent: 4200000,
    startDate: '2024-03-01',
    endDate: '2024-07-01',
    progress: 47,
    team: ['Paisajista', 'Jardinero', 'Riego'],
    priority: 'medium' as const
  },
  {
    id: '6',
    name: 'Centro Comercial Zona Norte',
    client: 'Inversiones Inmobiliarias S.R.L.',
    type: 'commercial',
    status: 'paused',
    budget: 89000000,
    spent: 22000000,
    startDate: '2023-08-01',
    endDate: '2025-05-01',
    progress: 25,
    team: ['Arquitecto Principal', 'Ing. Civil', 'Project Manager'],
    priority: 'high' as const
  }
];

export function ProjectsTableDemo() {
  const handleEdit = (project: any) => {
    console.log('Edit project:', project);
  };

  const handleDelete = (project: any) => {
    console.log('Delete project:', project);
  };

  return (
    <ProjectsTableView
      projects={mockProjects}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={false}
    />
  );
}

export default ProjectsTableDemo;