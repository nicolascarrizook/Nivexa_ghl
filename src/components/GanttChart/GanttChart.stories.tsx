import type { Meta, StoryObj } from '@storybook/react';
import GanttChart from './GanttChart';
import type { GanttStage } from './GanttChart';

const meta = {
  title: 'Components/GanttChart',
  component: GanttChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Enhanced Gantt Chart component using gantt-task-react library for professional project timeline visualization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showDependencies: {
      control: 'boolean',
      description: 'Show dependency lines between tasks',
    },
    showProgress: {
      control: 'boolean',
      description: 'Show progress bars within tasks',
    },
    isEditable: {
      control: 'boolean',
      description: 'Allow drag and resize interactions',
    },
    onStageClick: { action: 'stage-clicked' },
    onStageUpdate: { action: 'stage-updated' },
  },
} satisfies Meta<typeof GanttChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample project stages for demonstrations
const sampleStages: GanttStage[] = [
  {
    id: 'stage-1',
    name: 'Planificación y Diseño',
    description: 'Desarrollo de planos y obtención de permisos',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'completed',
    progress: 100,
    color: '#10b981',
  },
  {
    id: 'stage-2',
    name: 'Excavación y Cimientos',
    description: 'Preparación del terreno y construcción de cimientos',
    startDate: '2024-02-16',
    endDate: '2024-03-15',
    status: 'completed',
    progress: 100,
    dependencies: ['stage-1'],
  },
  {
    id: 'stage-3',
    name: 'Estructura Principal',
    description: 'Construcción de columnas, vigas y losa',
    startDate: '2024-03-16',
    endDate: '2024-05-15',
    status: 'in-progress',
    progress: 65,
    dependencies: ['stage-2'],
  },
  {
    id: 'stage-4',
    name: 'Instalaciones',
    description: 'Plomería, electricidad y gas',
    startDate: '2024-04-01',
    endDate: '2024-06-15',
    status: 'in-progress',
    progress: 30,
    dependencies: ['stage-3'],
  },
  {
    id: 'stage-5',
    name: 'Terminaciones',
    description: 'Pintura, pisos y acabados finales',
    startDate: '2024-06-01',
    endDate: '2024-07-30',
    status: 'pending',
    progress: 0,
    dependencies: ['stage-4'],
  },
  {
    id: 'stage-6',
    name: 'Entrega Final',
    description: 'Limpieza final y entrega de llaves',
    startDate: '2024-07-25',
    endDate: '2024-08-05',
    status: 'pending',
    progress: 0,
    dependencies: ['stage-5'],
  },
];

export const Default: Story = {
  args: {
    stages: sampleStages,
    showDependencies: true,
    showProgress: true,
    isEditable: false,
  },
};

export const WithoutDependencies: Story = {
  args: {
    stages: sampleStages,
    showDependencies: false,
    showProgress: true,
    isEditable: false,
  },
};

export const WithoutProgress: Story = {
  args: {
    stages: sampleStages,
    showDependencies: true,
    showProgress: false,
    isEditable: false,
  },
};

export const Editable: Story = {
  args: {
    stages: sampleStages,
    showDependencies: true,
    showProgress: true,
    isEditable: true,
  },
};

export const MinimalData: Story = {
  args: {
    stages: [
      {
        id: 'stage-1',
        name: 'Fase Inicial',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'in-progress',
        progress: 50,
      },
      {
        id: 'stage-2',
        name: 'Fase Final',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        status: 'pending',
        progress: 0,
      },
    ],
    showDependencies: true,
    showProgress: true,
    isEditable: false,
  },
};

export const Empty: Story = {
  args: {
    stages: [],
    showDependencies: true,
    showProgress: true,
    isEditable: false,
  },
};

export const OverdueProject: Story = {
  args: {
    stages: [
      {
        id: 'stage-1',
        name: 'Etapa Retrasada',
        description: 'Esta etapa está fuera de plazo',
        startDate: '2023-11-01',
        endDate: '2023-12-01',
        status: 'overdue',
        progress: 80,
      },
      {
        id: 'stage-2',
        name: 'Etapa Crítica',
        description: 'Etapa que requiere atención inmediata',
        startDate: '2023-12-15',
        endDate: '2024-01-15',
        status: 'in-progress',
        progress: 45,
        dependencies: ['stage-1'],
      },
    ],
    showDependencies: true,
    showProgress: true,
    isEditable: true,
  },
};