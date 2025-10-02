import { useState, useCallback, useEffect, useRef } from 'react';

interface UseProjectWizardModalOptions {
  onProjectCreated?: (projectId: string) => void;
  onCancel?: () => void;
}

interface UseProjectWizardModalResult {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  confirmClose: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  isAutoSaving: boolean;
  setIsAutoSaving: (value: boolean) => void;
}

export function useProjectWizardModal(options: UseProjectWizardModalOptions = {}): UseProjectWizardModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const { onProjectCreated, onCancel } = options;
  
  // Track if we're in the process of closing to prevent double confirmation
  const isClosingRef = useRef(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setHasUnsavedChanges(false);
    isClosingRef.current = false;
  }, []);

  const closeModal = useCallback(() => {
    // Prevent double confirmation dialogs
    if (isClosingRef.current) {
      return;
    }

    // If there are unsaved changes and we're not auto-saving, ask for confirmation
    if (hasUnsavedChanges && !isAutoSaving) {
      isClosingRef.current = true;
      
      const shouldClose = window.confirm(
        "¿Estás seguro de que deseas cerrar? Los cambios se guardan automáticamente, pero el proyecto quedará como borrador."
      );
      
      if (shouldClose) {
        setIsOpen(false);
        setHasUnsavedChanges(false);
        onCancel?.();
      }
      
      isClosingRef.current = false;
    } else {
      // No unsaved changes or currently auto-saving, close immediately
      setIsOpen(false);
      setHasUnsavedChanges(false);
      onCancel?.();
    }
  }, [hasUnsavedChanges, isAutoSaving, onCancel]);

  const confirmClose = useCallback(() => {
    // Force close without confirmation (used for successful project creation)
    setIsOpen(false);
    setHasUnsavedChanges(false);
    isClosingRef.current = false;
  }, []);

  // Reset closing flag when modal state changes
  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false;
    }
  }, [isOpen]);

  // Auto-save tracking - set unsaved changes to false when auto-save completes
  useEffect(() => {
    if (isAutoSaving) {
      // When auto-save starts, we can consider changes as being saved
      const timeoutId = setTimeout(() => {
        setHasUnsavedChanges(false);
      }, 1000); // Give it 1 second to complete

      return () => clearTimeout(timeoutId);
    }
  }, [isAutoSaving]);

  return {
    isOpen,
    openModal,
    closeModal,
    confirmClose,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isAutoSaving,
    setIsAutoSaving,
  };
}