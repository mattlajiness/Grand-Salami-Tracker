import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

// Standard VAPID public key
const VAPID_PUBLIC_KEY = 'BInaZqckVfeKtJQagbrCl-tWTWvcyPG-oAm_JAOXEgvlaAzYnZiAFd5A7fPMPaEbB0-Qwge-mXZUvDf9ffWpT8k';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker and sets up the active push subscriptions
 */
export async function registerServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const isDev = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('run.app')
      );

      let isIframe = false;
      try {
        isIframe = typeof window !== 'undefined' && window.self !== window.parent;
      } catch (e) {
        isIframe = true;
      }

      if (isDev || isIframe) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('Successfully de-registered development/preview Service Worker scope:', registration.scope);
          }
        } catch (e) {
          console.warn('Sandbox or browser policy blocked unregistering dev Service Workers:', e);
        }
        return null;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Salami SW Registered successfully. Scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Salami SW Registration failed:', error);
        return null;
      }
    }
  } catch (globalError) {
    console.warn('Silent fallback: service worker registration caught top-level exception:', globalError);
  }
  return null;
}

/**
 * Subscribes the current user or guest to Push Notifications
 */
export async function subscribeUserToPush(userId?: string) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push Notifications not supported in this browser.');
      return null;
    }

    const isDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('run.app')
    );

    let isIframe = false;
    try {
      isIframe = typeof window !== 'undefined' && window.self !== window.parent;
    } catch (e) {
      isIframe = true;
    }

    if (isDev || isIframe) {
      console.log('Skipping push subscription active registration in dev/preview/iframe environment.');
      return null;
    }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if permission is already granted, if default we can't subscribe
    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied by user.');
      return null;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted.');
        return null;
      }
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    console.log('User successfully subscribed to Salami Tracker Push API:', subscription);

    // Save Subscription info
    if (userId) {
      await saveSubscriptionToFirestore(userId, subscription);
    } else {
      localStorage.setItem('salami_push_subscription', JSON.stringify(subscription));
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe user to Push Notifications:', error);
    return null;
  }
  } catch (globalError) {
    console.warn('Silent fallback: push subscription caught top-level exception:', globalError);
    return null;
  }
}

/**
 * Saves subscription details to Firestore under the user profile
 */
async function saveSubscriptionToFirestore(userId: string, subscription: PushSubscription) {
  const rawSub = JSON.parse(JSON.stringify(subscription));
  const endpointHash = btoa(subscription.endpoint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
  const path = `users/${userId}/push_subscriptions/${endpointHash}`;
  try {
    const subDocRef = doc(db, 'users', userId, 'push_subscriptions', endpointHash);
    
    await setDoc(subDocRef, {
      endpoint: subscription.endpoint,
      keys: rawSub.keys || {},
      status: 'active',
      subscribedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      platform: navigator.userAgent
    }, { merge: true });

    console.log('Successfully synchronized push subscription configuration in Cloud.');
  } catch (error) {
    console.error('Cloud Sync failed for push subscription:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Unsubscribes the current user from push notifications
 */
export async function unsubscribeUserFromPush(userId?: string) {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Successfully unsubscribed from Push Manager.');

      if (userId) {
        const endpointHash = btoa(subscription.endpoint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
        const path = `users/${userId}/push_subscriptions/${endpointHash}`;
        try {
          const subDocRef = doc(db, 'users', userId, 'push_subscriptions', endpointHash);
          await setDoc(subDocRef, {
            status: 'inactive',
            unsubscribedAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          }, { merge: true });
        } catch (error) {
          console.error('Error unsubscribing customer from push in Cloud:', error);
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      } else {
        localStorage.removeItem('salami_push_subscription');
      }
    }
  } catch (error) {
    console.error('Error unsubscribing customer from push:', error);
  }
}
