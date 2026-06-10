/**
 * Google Analytics 4 (GA4) Helpers
 */

export function initGA() {
  if (typeof window === 'undefined') return;

  // Check if we are running in an iframe, and use optimized configuration
  let isIframe = false;
  try {
    isIframe = window.self !== window.parent;
  } catch (e) {
    isIframe = true;
  }

  try {
    // 1. Setup the shared analytics data queue immediately so trackEvent calls never fail
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    // 2. Queue structural telemetry init actions
    window.gtag('js', new Date());
    
    // Configure tracking ID with custom flags for cross-origin or sandboxed iframe environments
    window.gtag('config', 'G-BZ69JY3ECN', {
      cookie_flags: 'max-age=7200;secure;samesite=none',
      is_iframe: isIframe ? 'yes' : 'no'
    });

    // 3. Dynamically inject the google tag script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-BZ69JY3ECN';
    script.onerror = () => {
      console.warn('Analytics: GA script failed to load (possibly blocked by an ad-blocker or brave shields).');
    };
    
    document.head.appendChild(script);
    console.log(`Analytics: GA dynamically initialized safely. (Context: ${isIframe ? 'Iframe Embedded' : 'Direct Standalone'})`);
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
