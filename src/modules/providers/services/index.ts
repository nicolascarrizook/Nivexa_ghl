/**
 * Módulo de servicios para gestión de proveedores y contractors
 *
 * Este módulo proporciona servicios completos para:
 * - Asignación de proveedores a proyectos
 * - Gestión de presupuestos detallados
 * - Registro y seguimiento de pagos
 * - Monitoreo de progreso y avances
 */

export {
  ProjectContractorService,
  projectContractorService,
  type ProjectContractorWithDetails
} from './ProjectContractorService';

export {
  ContractorBudgetService,
  contractorBudgetService,
  type BudgetSummary
} from './ContractorBudgetService';

export {
  ContractorPaymentService,
  contractorPaymentService,
  type PaymentSummary,
  type ContractorAccountStatement
} from './ContractorPaymentService';

export {
  ContractorProgressService,
  contractorProgressService,
  type ProgressTimeline,
  type ProgressStats
} from './ContractorProgressService';