import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileText, Users, Palette, Code, TestTube, Rocket } from 'lucide-react';
import ProgressTracker, { ProgressStep } from './ProgressTracker';

const meta: Meta<typeof ProgressTracker> = {
  title: 'Design System/Feedback/ProgressTracker',
  component: ProgressTracker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente para mostrar el progreso de procesos multi-paso con navegación opcional.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientación del tracker',
    },
    allowNavigation: {
      control: 'boolean',
      description: 'Permitir navegación clickeable a pasos completados',
    },
    showDetails: {
      control: 'boolean',
      description: 'Mostrar información adicional',
    },
    variant: {
      control: 'select',
      options: ['default', 'minimal', 'detailed'],
      description: 'Variante visual',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del componente',
    },
    showProgress: {
      control: 'boolean',
      description: 'Mostrar barra de progreso global',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample steps for project creation
const projectCreationSteps: ProgressStep[] = [
  {
    id: 'client-info',
    title: 'Información del cliente',
    description: 'Datos básicos del cliente y contacto',
    status: 'completed',
    icon: <Users className="w-4 h-4" />,
    data: {
      timeEstimate: '5 min',
      lastUpdated: 'Completado hace 2 horas',
    },
  },
  {
    id: 'project-details',
    title: 'Detalles del proyecto',
    description: 'Alcance, objetivos y cronograma',
    status: 'completed',
    icon: <FileText className="w-4 h-4" />,
    data: {
      timeEstimate: '10 min',
      lastUpdated: 'Completado hace 1 hora',
    },
  },
  {
    id: 'design-phase',
    title: 'Fase de diseño',
    description: 'Creación de mockups y prototipos',
    status: 'current',
    icon: <Palette className="w-4 h-4" />,
    data: {
      timeEstimate: '2-3 días',
    },
  },
  {
    id: 'development',
    title: 'Desarrollo',
    description: 'Implementación del diseño',
    status: 'pending',
    icon: <Code className="w-4 h-4" />,
    data: {
      timeEstimate: '1-2 semanas',
    },
  },
  {
    id: 'testing',
    title: 'Pruebas',
    description: 'Control de calidad y testing',
    status: 'pending',
    optional: true,
    icon: <TestTube className="w-4 h-4" />,
    data: {
      timeEstimate: '2-3 días',
    },
  },
  {
    id: 'deployment',
    title: 'Lanzamiento',
    description: 'Publicación y entrega',
    status: 'pending',
    icon: <Rocket className="w-4 h-4" />,
    data: {
      timeEstimate: '1 día',
    },
  },
];

// Wrapper component for interactive stories
const ProgressTrackerWrapper = (args: any) => {
  const [steps, setSteps] = useState<ProgressStep[]>(args.steps || projectCreationSteps);

  const handleStepClick = (stepId: string) => {
    console.log(`Navegando al paso: ${stepId}`);
    // In a real app, you would navigate to the step
  };

  return (
    <div className="w-full max-w-4xl">
      <ProgressTracker
        {...args}
        steps={steps}
        onStepClick={args.allowNavigation ? handleStepClick : undefined}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: projectCreationSteps,
    orientation: 'horizontal',
    allowNavigation: false,
    showDetails: true,
    variant: 'default',
    size: 'md',
    showProgress: true,
  },
};

export const Vertical: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: projectCreationSteps,
    orientation: 'vertical',
    allowNavigation: true,
    showDetails: true,
    variant: 'default',
    size: 'md',
    showProgress: false,
  },
};

export const WithNavigation: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: projectCreationSteps,
    orientation: 'horizontal',
    allowNavigation: true,
    showDetails: true,
    variant: 'default',
    size: 'md',
    showProgress: true,
  },
};

export const Minimal: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: projectCreationSteps,
    orientation: 'horizontal',
    allowNavigation: false,
    showDetails: false,
    variant: 'minimal',
    size: 'sm',
    showProgress: true,
  },
};

export const Detailed: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: projectCreationSteps,
    orientation: 'vertical',
    allowNavigation: true,
    showDetails: true,
    variant: 'detailed',
    size: 'lg',
    showProgress: false,
  },
};

// Invoice generation process
const invoiceSteps: ProgressStep[] = [
  {
    id: 'client-selection',
    title: 'Seleccionar cliente',
    description: 'Elegir el cliente para la facturación',
    status: 'completed',
    data: {
      lastUpdated: 'Completado',
    },
  },
  {
    id: 'items-services',
    title: 'Productos y servicios',
    description: 'Agregar elementos a facturar',
    status: 'completed',
    data: {
      lastUpdated: 'Completado',
    },
  },
  {
    id: 'tax-calculation',
    title: 'Cálculo de impuestos',
    description: 'Aplicar impuestos correspondientes',
    status: 'completed',
    data: {
      lastUpdated: 'Completado',
    },
  },
  {
    id: 'review',
    title: 'Revisión final',
    description: 'Verificar datos antes de generar',
    status: 'current',
  },
  {
    id: 'generation',
    title: 'Generar factura',
    description: 'Crear PDF y registrar en sistema',
    status: 'pending',
  },
  {
    id: 'delivery',
    title: 'Envío',
    description: 'Enviar por correo al cliente',
    status: 'pending',
    optional: true,
  },
];

export const InvoiceGeneration: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: invoiceSteps,
    orientation: 'horizontal',
    allowNavigation: true,
    showDetails: true,
    variant: 'default',
    size: 'md',
    showProgress: true,
  },
};

// Onboarding process with error
const onboardingSteps: ProgressStep[] = [
  {
    id: 'account-creation',
    title: 'Crear cuenta',
    description: 'Registro de usuario',
    status: 'completed',
  },
  {
    id: 'email-verification',
    title: 'Verificar email',
    description: 'Confirmar dirección de correo',
    status: 'completed',
  },
  {
    id: 'profile-setup',
    title: 'Configurar perfil',
    description: 'Información personal y empresa',
    status: 'error',
    data: {
      errorMessage: 'Error al guardar la información de la empresa',
    },
  },
  {
    id: 'preferences',
    title: 'Preferencias',
    description: 'Configurar notificaciones y tema',
    status: 'pending',
  },
  {
    id: 'tutorial',
    title: 'Tutorial',
    description: 'Recorrido por las funciones principales',
    status: 'pending',
    optional: true,
  },
];

export const OnboardingWithError: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: onboardingSteps,
    orientation: 'vertical',
    allowNavigation: false,
    showDetails: true,
    variant: 'detailed',
    size: 'md',
    showProgress: false,
  },
};

// Simple 3-step process
const simpleSteps: ProgressStep[] = [
  {
    id: 'step1',
    title: 'Configuración inicial',
    status: 'completed',
  },
  {
    id: 'step2',
    title: 'Procesamiento',
    status: 'current',
  },
  {
    id: 'step3',
    title: 'Finalización',
    status: 'pending',
  },
];

export const SimpleProcess: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: simpleSteps,
    orientation: 'horizontal',
    allowNavigation: false,
    showDetails: false,
    variant: 'minimal',
    size: 'sm',
    showProgress: true,
  },
};

// Backup process
const backupSteps: ProgressStep[] = [
  {
    id: 'prepare',
    title: 'Preparar datos',
    description: 'Recopilando información a respaldar',
    status: 'completed',
    data: {
      timeEstimate: '2 min',
      lastUpdated: 'Completado hace 5 min',
    },
  },
  {
    id: 'compress',
    title: 'Comprimir archivos',
    description: 'Optimizando el tamaño del respaldo',
    status: 'completed',
    data: {
      timeEstimate: '3 min',
      lastUpdated: 'Completado hace 2 min',
    },
  },
  {
    id: 'encrypt',
    title: 'Cifrar datos',
    description: 'Aplicando cifrado de seguridad',
    status: 'current',
    data: {
      timeEstimate: '1 min',
    },
  },
  {
    id: 'upload',
    title: 'Subir a la nube',
    description: 'Transferir al almacenamiento seguro',
    status: 'pending',
    data: {
      timeEstimate: '5 min',
    },
  },
];

export const BackupProcess: Story = {
  render: (args) => <ProgressTrackerWrapper {...args} />,
  args: {
    steps: backupSteps,
    orientation: 'vertical',
    allowNavigation: false,
    showDetails: true,
    variant: 'detailed',
    size: 'md',
    showProgress: false,
  },
};