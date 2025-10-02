import * as Sentry from '@sentry/react';

// Sentry configuration
export function initSentry() {
  // Only initialize in production or staging
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SENTRY === 'true') {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn) {
      console.warn('Sentry DSN not configured. Error tracking disabled.');
      return;
    }

    Sentry.init({
      dsn,
      integrations: [
        // React integration (includes error boundary and profiler)
        // Sentry.reactIntegration(), // May not be available in current version
        // HTTP request tracking
        Sentry.httpClientIntegration(),
        // Browser console integration
        Sentry.captureConsoleIntegration({
          levels: ['error', 'warn']
        })
      ],
      
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in staging
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Session tracking
      // autoSessionTracking: true, // May not be available in current version
      
      // Only send errors in production
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;
          
          // Don't send network errors in development
          if (!import.meta.env.PROD && (error as any)?.message?.includes('NetworkError')) {
            return null;
          }
          
          // Don't send cancelled requests
          if ((error as any)?.message?.includes('AbortError')) {
            return null;
          }
        }
        
        // Remove sensitive data
        if (event.request) {
          // Remove auth headers
          if (event.request.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }
          
          // Remove sensitive query params
          if (event.request.query_string) {
            const params = new URLSearchParams(event.request.query_string);
            params.delete('token');
            params.delete('api_key');
            params.delete('secret');
            event.request.query_string = params.toString();
          }
        }
        
        // Remove user emails in development
        if (!import.meta.env.PROD && event.user) {
          delete event.user.email;
        }
        
        return event;
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Network errors
        'NetworkError',
        'Failed to fetch',
        // User cancellations
        'AbortError',
        'cancelled'
      ]
    });
  }
}

// Helper functions for manual error tracking

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id?: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb(breadcrumb);
}

export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, () => {});
}

// React ErrorBoundary wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Performance profiler
export const SentryProfiler = Sentry.Profiler;

// Route tracking
export function trackRoute(routeName: string) {
  addBreadcrumb({
    message: `Navigated to ${routeName}`,
    category: 'navigation',
    level: 'info'
  });
}