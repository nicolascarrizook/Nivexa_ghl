// Project Components
export { ProjectCard } from './ProjectCard';
export { ProjectStatusBadge, useProjectStatusConfig, isValidProjectStatus } from './ProjectStatusBadge';
export { ProgressIndicator, CircularProgress } from './ProgressIndicator';
export { EmptyState } from './EmptyState';
export { SearchBar } from './SearchBar';
export { ProjectWizardModal } from './ProjectWizardModal';
export { ProjectList } from './ProjectList';
export { ProjectCreationWizard } from './ProjectCreationWizard';
export { StreamlinedPaymentModal } from './StreamlinedPaymentModal';
export { CashFlowHealthDashboard } from './CashFlowHealthDashboard';
export type { ProjectHealthData } from './CashFlowHealthDashboard';

// Skeleton Loaders
export { 
  default as Skeleton,
  ProjectCardSkeleton,
  ProjectsListSkeleton,
  ProjectDetailsSkeleton
} from './SkeletonLoader';

// Re-export types if needed
// Note: These interfaces are internal to components
// Add exports if types need to be used externally

// Utility exports for project status
export const PROJECT_STATUSES = [
  'active',
  'completed', 
  'on_hold',
  'cancelled',
  'draft'
] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number];