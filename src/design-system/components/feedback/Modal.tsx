import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full mx-4'
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'lg',
  hideCloseButton = false,
  closeOnBackdropClick = true,
  closeOnEscape = true
}: ModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop - semi-transparent */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={closeOnBackdropClick ? onClose : undefined}
        />

        {/* Modal Content */}
        <div className={`relative z-10 bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full transform transition-all`}>
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}