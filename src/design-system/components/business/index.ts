/**
 * Business Components for Nivexa Construction CRM
 * 
 * Specialized components for Mexican construction business context with
 * bilingual support, currency formatting, and industry-specific workflows.
 */

// Client Management
export { default as ClientCard } from './ClientCard';
export type { 
  ClientCardProps, 
  ClientContact, 
  ClientProject 
} from './ClientCard';

// Project Management
export { default as ProjectCard } from './ProjectCard';
export type { 
  ProjectCardProps, 
  ProjectTeamMember, 
  ProjectBudget, 
  ProjectTimeline 
} from './ProjectCard';

// Financial Management
export { default as InvoicePreview } from './InvoicePreview';
export type { 
  InvoicePreviewProps, 
  InvoiceItem, 
  PaymentRecord 
} from './InvoicePreview';

// Task Management
export { default as TaskList } from './TaskList';
export type { 
  TaskListProps, 
  Task, 
  TaskComment, 
  TaskAssignee 
} from './TaskList';

// Notification Management
export { default as NotificationCenter } from './NotificationCenter';
export type { 
  NotificationCenterProps, 
  Notification, 
  NotificationAction 
} from './NotificationCenter';