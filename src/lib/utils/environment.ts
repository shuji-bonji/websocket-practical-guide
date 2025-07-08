/**
 * Environment utilities for WebSocket learning project
 *
 * Provides browser detection and environment checks
 * compatible with SvelteKit SSR.
 */

/**
 * Check if code is running in browser environment
 */
export const browser = typeof window !== 'undefined';

/**
 * Check if code is running in development mode
 */
export const dev = browser && window.location.hostname === 'localhost';

/**
 * Check if code is running in CI environment
 */
export const ci =
  (browser && window.location.hostname === 'localhost' && window.location.port === '4173') || // Preview server port
  (typeof navigator !== 'undefined' && navigator.webdriver === true); // Playwright/Selenium detection

/**
 * Safe window reference for browser-only operations
 */
export const safeWindow = browser ? window : undefined;

/**
 * Safe document reference for browser-only operations
 */
export const safeDocument = browser ? document : undefined;

/**
 * Check if WebSocket is available in current environment
 */
export const isWebSocketSupported = browser && 'WebSocket' in window;

/**
 * Get current environment type
 */
export function getEnvironmentType(): 'browser' | 'server' {
  return browser ? 'browser' : 'server';
}

/**
 * Safely execute browser-only code
 */
export function runInBrowser<T>(fn: () => T, fallback?: T): T | undefined {
  if (browser) {
    try {
      return fn();
    } catch (error) {
      console.warn('Browser operation failed:', error);
      return fallback;
    }
  }
  return fallback;
}
