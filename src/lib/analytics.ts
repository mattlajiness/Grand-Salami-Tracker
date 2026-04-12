/**
 * Google Analytics 4 (GA4) Helpers
 */

export function initGA() {
  // Already initialized in index.html
  console.log('Analytics: Using GA initialized in index.html');
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    console.log(`Analytics: Tracking event "${eventName}"`, params);
    (window as any).gtag('event', eventName, params);
  } else {
    console.warn(`Analytics: gtag not found. Could not track "${eventName}"`);
  }
}

// Type definitions for window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
