/**
 * Google Analytics 4 (GA4) Helpers
 */

export function initGA() {
  if (typeof window === 'undefined') return;

  // Check if we are running in an iframe, and skip if so (as GA is often blocked)
  let isIframe = false;
  try {
    isIframe = window.self !== window.parent;
  } catch (e) {
    isIframe = true;
  }

  if (isIframe) {
    console.log('Analytics: Running inside iframe sandbox. Skipping GA script injection to prevent cross-origin script error.');
    return;
  }

  try {
    // Dynamically inject the google tag script tag with error handling
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-BZ69JY3ECN';
    script.onerror = () => {
      console.warn('Analytics: GA script failed to load (blocked by ad-blocker or CSP).');
    };
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', 'G-BZ69JY3ECN');
    console.log('Analytics: GA dynamically initialized safely.');
  } catch (error) {
    console.error('Analytics: Failed to initialize GA:', error);
  }
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
