import { useContext } from 'react';
import { ProjectWizardContext, type ProjectWizardContextType } from '../contexts/ProjectWizardContext';

export function useProjectWizardContext(): ProjectWizardContextType {
  const context = useContext(ProjectWizardContext);
  if (!context) {
    throw new Error(
      'useProjectWizardContext must be used within ProjectWizardProvider'
    );
  }
  return context;
}