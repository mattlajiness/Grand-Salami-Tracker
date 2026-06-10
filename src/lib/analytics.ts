/**
 * Google Analytics 4 (GA4) Helpers
 */

// Generate or fetch a persistent Client ID in localStorage to support iframe sandboxes and cookieless setups
function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'ga_client_id_v2';
  try {
    let cid = localStorage.getItem(key);
    if (!cid) {
      // Generate a stable UUID-like Client ID for GA4
      const randHex = (len: number) => {
        let text = '';
        const possible = '0123456789abcdef';
        for (let i = 0; i < len; i++) {
          text += possible.charAt(Math.floor(Math.random() * 16));
        }
        return text;
      };
      const uuid = `${randHex(8)}-${randHex(4)}-4${randHex(3)}-a${randHex(3)}-${randHex(12)}`;
      // Add timestamp to ensure additional uniqueness
      cid = `${uuid}.${Math.round(Date.now() / 1000)}`;
      localStorage.setItem(key, cid);
    }
    return cid;
  } catch (e) {
    // Fallback if localStorage is blocked or throws an error (e.g. sandboxed iframe)
    return `temp.${Math.round(Math.random() * 1000000000)}.${Math.round(Date.now() / 1000)}`;
  }
}

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
    // 1. Establish the standard dataLayer array
    window.dataLayer = window.dataLayer || [];

    // 2. IMPORTANT: Define gtag utilizing the standard arguments object.
    // Google Analytics and GTM loop through the dataLayer and strictly expect 
    // an 'Arguments' object ([object Arguments]) for historical gtag commands.
    // If we push a standard Array (e.g. from an ES6 rest-parameter arrow function),
    // GA4's gtag.js script will SILENTLY IGNORE the initial 'js' and 'config' calls,
    // resulting in no connections or analytics data being recorded.
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // 3. Queue essential baseline telemetry configuration
    window.gtag('js', new Date());

    const clientId = getOrCreateClientId();

    // 4. Configure tracking with optimal flags for both standard and iframe sandbox environments.
    // By specifying 'client_storage': 'none' and passing a manual 'client_id',
    // we bypass strict third-party cookie blocking in sandboxed dynamic previews and iframes!
    const configOptions: Record<string, any> = {
      'cookie_flags': 'max-age=7200;secure;samesite=none',
      'is_iframe': isIframe ? 'yes' : 'no',
    };

    if (clientId) {
      configOptions['client_storage'] = 'none';
      configOptions['client_id'] = clientId;
    }

    window.gtag('config', 'G-BZ69JY3ECN', configOptions);

    // 5. Dynamically inject the google tag gtag.js script from Google CDN
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-BZ69JY3ECN';
    script.onerror = () => {
      console.warn('Analytics: GA script failed to load. This is expected if the browser utilizes brave shields, ad-blockers, or disconnect origin blockers.');
    };

    document.head.appendChild(script);
    console.log(`Analytics: GA4 dynamically initialized successfully. (Client ID: ${clientId}, Mode: ${isIframe ? 'Sandbox/Iframe' : 'Tab/Standalone'})`);
  } catch (error) {
    console.error('Analytics: Critical error during GA4 initialization:', error);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log(`Analytics: Tracking event "${eventName}"`, params);
    window.gtag('event', eventName, params);
  } else {
    console.warn(`Analytics: gtag not found on window. Event "${eventName}" not tracked.`);
  }
}

// Type definitions for window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

