// Simple Analytics Service - can be replaced with GA4, Mixpanel, Amplitude, etc.

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface UserProperties {
  userId?: string;
  email?: string;
  plan?: string;
  [key: string]: any;
}

class AnalyticsService {
  private isInitialized = false;
  private queue: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};

  /**
   * Initialize analytics with Google Analytics 4
   */
  initGA4(measurementId: string) {
    if (!measurementId || this.isInitialized) return;

    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // We'll track page views manually
      debug_mode: import.meta.env.DEV
    });

    this.isInitialized = true;

    // Process queued events
    this.processQueue();
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string) {
    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href
      }
    };

    this.track(event.name, event.properties);
  }

  /**
   * Track custom event
   */
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        ...this.userProperties,
        timestamp: Date.now()
      }
    };

    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    this.sendEvent(event);
  }

  /**
   * Track user actions
   */
  trackAction(category: string, action: string, label?: string, value?: number) {
    this.track('user_action', {
      event_category: category,
      event_action: action,
      event_label: label,
      value: value
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, fatal = false) {
    this.track('exception', {
      description: error.message,
      fatal: fatal,
      error_name: error.name,
      stack_trace: error.stack
    });
  }

  /**
   * Track timing (performance)
   */
  trackTiming(category: string, variable: string, time: number, label?: string) {
    this.track('timing_complete', {
      event_category: category,
      name: variable,
      value: time,
      event_label: label
    });
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: UserProperties) {
    this.userProperties = {
      ...this.userProperties,
      userId,
      ...properties
    };

    if (this.isInitialized && window.gtag) {
      window.gtag('set', {
        user_id: userId,
        user_properties: properties
      });
    }
  }

  /**
   * Reset user (on logout)
   */
  reset() {
    this.userProperties = {};
    
    if (this.isInitialized && window.gtag) {
      window.gtag('set', {
        user_id: null,
        user_properties: null
      });
    }
  }

  /**
   * Track conversion/goal
   */
  trackConversion(conversionId: string, value?: number, currency = 'USD') {
    this.track('conversion', {
      send_to: conversionId,
      value: value,
      currency: currency
    });
  }

  /**
   * Track e-commerce events
   */
  trackPurchase(transactionData: {
    transactionId: string;
    value: number;
    currency?: string;
    items?: any[];
  }) {
    this.track('purchase', {
      transaction_id: transactionData.transactionId,
      value: transactionData.value,
      currency: transactionData.currency || 'USD',
      items: transactionData.items
    });
  }

  /**
   * Private methods
   */
  private sendEvent(event: AnalyticsEvent) {
    if (!window.gtag) return;

    // Send to Google Analytics
    window.gtag('event', event.name, event.properties);

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event.name, event.properties);
    }
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Helper hooks for React components
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Track page views on route change
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);
}

/**
 * Track component mount/unmount
 */
export function useComponentTracking(componentName: string) {
  useEffect(() => {
    analytics.track('component_view', { component: componentName });

    return () => {
      analytics.track('component_leave', { component: componentName });
    };
  }, [componentName]);
}

/**
 * Track user interactions
 */
export function useInteractionTracking() {
  return {
    trackClick: (element: string, properties?: Record<string, any>) => {
      analytics.track('click', { element, ...properties });
    },
    trackSubmit: (form: string, properties?: Record<string, any>) => {
      analytics.track('form_submit', { form, ...properties });
    },
    trackSearch: (query: string, results?: number) => {
      analytics.track('search', { query, results });
    },
    trackShare: (content: string, method: string) => {
      analytics.track('share', { content, method });
    }
  };
}

// Type declarations for window
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}