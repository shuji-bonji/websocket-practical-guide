// Service Worker registration and management
import { browser } from '$app/environment';

// Type definition for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let swRegistration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!browser || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return null;
  }

  try {
    console.log('[PWA] Registering Service Worker');

    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered successfully');

    // Handle updates
    swRegistration.addEventListener('updatefound', handleUpdateFound);

    // Check for existing service worker
    if (swRegistration.waiting) {
      handleWaitingServiceWorker();
    }

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Controller changed - reloading page');
      window.location.reload();
    });

    return swRegistration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

// Handle service worker updates
function handleUpdateFound() {
  console.log('[PWA] Service Worker update found');

  if (!swRegistration?.installing) return;

  const newWorker = swRegistration.installing;

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed') {
      if (navigator.serviceWorker.controller) {
        // New update available
        console.log('[PWA] New Service Worker available');
        updateAvailable = true;
        showUpdateNotification();
      } else {
        // First time installation
        console.log('[PWA] Service Worker installed for the first time');
        showInstallSuccess();
      }
    }
  });
}

// Handle waiting service worker
function handleWaitingServiceWorker() {
  console.log('[PWA] Service Worker waiting');
  updateAvailable = true;
  showUpdateNotification();
}

// Show update notification
function showUpdateNotification() {
  // This could be integrated with your app's notification system
  console.log('[PWA] App update available');

  // You could dispatch a custom event or update a store here
  const event = new CustomEvent('sw-update-available', {
    detail: { updateAvailable: true }
  });
  window.dispatchEvent(event);
}

// Show install success message
function showInstallSuccess() {
  console.log('[PWA] App installed successfully');

  const event = new CustomEvent('sw-installed', {
    detail: { installed: true }
  });
  window.dispatchEvent(event);
}

// Apply service worker update
export function applyServiceWorkerUpdate() {
  if (!swRegistration?.waiting) {
    console.log('[PWA] No service worker waiting');
    return;
  }

  console.log('[PWA] Applying service worker update');

  // Tell the waiting service worker to skip waiting
  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

// Check if update is available
export function isUpdateAvailable(): boolean {
  return updateAvailable;
}

// Get service worker registration
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

// Unregister service worker (for development/testing)
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!browser || !swRegistration) {
    return false;
  }

  try {
    const result = await swRegistration.unregister();
    console.log('[PWA] Service Worker unregistered:', result);
    swRegistration = null;
    updateAvailable = false;
    return result;
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error);
    return false;
  }
}

// Check if app is running in standalone mode (PWA)
export function isStandalone(): boolean {
  if (!browser) return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - Safari specific property
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Check if device supports installation
export function canInstall(): boolean {
  if (!browser) return false;

  // This will be set by the beforeinstallprompt event
  return !!(window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
}

// Trigger PWA installation
export async function installPWA(): Promise<boolean> {
  if (!browser) return false;

  const deferredPrompt = (window as Window & { deferredPrompt?: BeforeInstallPromptEvent })
    .deferredPrompt;

  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    console.log('[PWA] Install prompt outcome:', outcome);

    // Clear the deferred prompt
    (window as Window & { deferredPrompt?: BeforeInstallPromptEvent | null }).deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
}

// Listen for install prompt
export function listenForInstallPrompt() {
  if (!browser) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('[PWA] Install prompt available');

    // Prevent the mini-infobar from appearing
    event.preventDefault();

    // Save the event for later use
    (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = event;

    // Dispatch custom event
    const customEvent = new CustomEvent('pwa-install-available', {
      detail: { canInstall: true }
    });
    window.dispatchEvent(customEvent);
  });

  // Listen for app installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');

    // Clear the deferred prompt
    (window as Window & { deferredPrompt?: BeforeInstallPromptEvent | null }).deferredPrompt = null;

    // Dispatch custom event
    const event = new CustomEvent('pwa-installed', {
      detail: { installed: true }
    });
    window.dispatchEvent(event);
  });
}

// Enable background sync for offline messages
export async function enableBackgroundSync(tag: string): Promise<boolean> {
  if (!swRegistration || !('sync' in swRegistration)) {
    console.log('[PWA] Background Sync not supported');
    return false;
  }

  try {
    // @ts-expect-error - Background Sync API not in TS lib yet
    await swRegistration.sync.register(tag);
    console.log('[PWA] Background sync registered:', tag);
    return true;
  } catch (error) {
    console.error('[PWA] Background sync registration failed:', error);
    return false;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!browser || !('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('[PWA] Notification permission denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[PWA] Notification permission request failed:', error);
    return false;
  }
}

// Show local notification
export function showNotification(title: string, options?: NotificationOptions): boolean {
  if (!browser || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'chat-notification',
      renotify: true,
      ...options
    });

    return true;
  } catch (error) {
    console.error('[PWA] Failed to show notification:', error);
    return false;
  }
}

// Check if online
export function isOnline(): boolean {
  if (!browser) return true;
  return navigator.onLine;
}

// Listen for online/offline events
export function listenForNetworkChanges(onOnline?: () => void, onOffline?: () => void) {
  if (!browser) return;

  window.addEventListener('online', () => {
    console.log('[PWA] Back online');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Gone offline');
    onOffline?.();
  });
}
