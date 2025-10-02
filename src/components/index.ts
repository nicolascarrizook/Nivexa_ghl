// Functional Components (keep these for app functionality)

// Authentication & Setup
export { AuthSetupVerifier } from "./AuthSetupVerifier";
export { SupabaseAuthDiagnostic } from "./SupabaseAuthDiagnostic";

// Testing & Development
export { TestDatabaseConnection } from "./TestDatabaseConnection";

// Error Handling
export { ErrorBoundary } from "./ErrorBoundary";

// Basic UI Components (temporary - will be replaced by design system)
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
export { CardSkeleton } from "./CardSkeleton";
export type { CardSkeletonProps } from "./CardSkeleton";

// NOTE: All UI components should be imported from the design-system:
// import { StatCard, DataTable, ActivityFeed } from '@/design-system/components/data-display';
// import { SearchCommand, FilterBar, MoneyInput } from '@/design-system/components/inputs';
// import { DashboardLayout, PageContainer } from '@/design-system/components/layout';
// import { ClientCard, ProjectCard, TaskList } from '@/design-system/components/business';
// import { SuccessModal, ProgressTracker } from '@/design-system/components/feedback';