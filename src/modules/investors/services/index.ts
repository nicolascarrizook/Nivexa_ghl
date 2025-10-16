// Export all investor services
export { investorService, default as InvestorService } from './InvestorService';
export { projectInvestorService, default as ProjectInvestorService } from './ProjectInvestorService';
export { investorAccessService, default as InvestorAccessService } from './InvestorAccessService';

// Re-export types for convenience
export type { InvestorWithStats } from './InvestorService';
export type {
  ProjectInvestorWithDetails,
  AddInvestorData,
  InvestmentType,
} from './ProjectInvestorService';
