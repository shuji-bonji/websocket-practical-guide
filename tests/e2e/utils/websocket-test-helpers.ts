/**
 * WebSocket test utility functions for E2E testing
 * Provides resilient connection testing and service availability checks
 */

import type { Page } from '@playwright/test';

export interface WebSocketTestOptions {
	/** Timeout for connection attempts in milliseconds */
	connectionTimeout?: number;
	/** Whether to skip tests if service is unavailable */
	skipOnUnavailable?: boolean;
	/** Maximum retries for connection attempts */
	maxRetries?: number;
}

/**
 * Check if WebSocket service is available
 */
export async function checkWebSocketServiceAvailability(page: Page): Promise<boolean> {
	try {
		// Test basic connectivity to echo service
		const result = await page.evaluate(async () => {
			return new Promise<boolean>((resolve) => {
				try {
					const ws = new WebSocket('wss://echo.websocket.org');
					const timeout = setTimeout(() => {
						ws.close();
						resolve(false);
					}, 5000);

					ws.onopen = () => {
						clearTimeout(timeout);
						ws.close();
						resolve(true);
					};

					ws.onerror = () => {
						clearTimeout(timeout);
						resolve(false);
					};
				} catch {
					resolve(false);
				}
			});
		});

		return result;
	} catch {
		return false;
	}
}

/**
 * Wait for WebSocket connection with resilient timeout handling
 */
export async function waitForWebSocketConnection(
	page: Page,
	options: WebSocketTestOptions = {}
): Promise<'connected' | 'error' | 'timeout'> {
	const { connectionTimeout = process.env.CI ? 20000 : 10000, maxRetries = 1 } = options;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			console.log(`WebSocket connection attempt ${attempt + 1}/${maxRetries + 1}`);

			// Wait for any connection state change
			await page.waitForSelector(
				'[data-connection-state="connected"], [data-connection-state="error"]',
				{ timeout: connectionTimeout }
			);

			// Check the actual state
			const connectionState = await page
				.locator('[data-connection-state]')
				.getAttribute('data-connection-state');

			if (connectionState === 'connected') {
				console.log('WebSocket connection established successfully');
				return 'connected';
			} else if (connectionState === 'error') {
				console.log('WebSocket connection failed with error state');
				return 'error';
			}
		} catch {
			console.log(`WebSocket connection attempt ${attempt + 1} timed out`);

			if (attempt < maxRetries) {
				// Wait before retry
				await page.waitForTimeout(2000);
				// Wait for button to be enabled and click connect button again
				const connectBtn = page.locator('button:has-text("接続")');
				await connectBtn.waitFor({ state: 'visible' });
				// Wait for button to be enabled (not disabled) with longer timeout
				try {
					await page.waitForFunction(
						() => {
							const btn = document.querySelector('button[data-testid="connect-button"]');
							return btn && !btn.hasAttribute('disabled');
						},
						{ timeout: 15000 }
					);
					await connectBtn.click();
				} catch {
					console.log('Connect button did not become enabled in time - proceeding with test');
					// If button doesn't become enabled, that's likely due to external service unavailability
					// which is expected in CI environment, so we continue the test
				}
			}
		}
	}

	console.log('All WebSocket connection attempts failed');
	return 'timeout';
}

/**
 * Test WebSocket functionality with graceful fallbacks
 */
export async function testWebSocketWithFallback(
	page: Page,
	testFunction: (connected: boolean) => Promise<void>,
	options: WebSocketTestOptions = {}
): Promise<void> {
	const { skipOnUnavailable = false } = options;

	// First check if service is available
	const serviceAvailable = await checkWebSocketServiceAvailability(page);

	if (!serviceAvailable && skipOnUnavailable) {
		console.log('WebSocket service unavailable - skipping test');
		return;
	}

	// Wait for button to be enabled and click connect button
	const connectButton = page.locator('button:has-text("接続")');
	await connectButton.waitFor({ state: 'visible' });

	// Wait for button to be enabled (not disabled)
	await page
		.waitForFunction(
			() => {
				const btn = document.querySelector('button[data-testid="connect-button"]');
				return btn && !btn.hasAttribute('disabled');
			},
			{ timeout: 5000 }
		)
		.catch(() => {
			console.log('Connect button did not become enabled in time');
		});

	await connectButton.click();

	// Wait for connection result
	const connectionResult = await waitForWebSocketConnection(page, options);

	// Run the test with connection status
	await testFunction(connectionResult === 'connected');
}

/**
 * Get appropriate timeouts for current environment
 */
export function getWebSocketTimeouts() {
	const isCI = !!process.env.CI;

	return {
		connection: isCI ? 20000 : 10000,
		message: isCI ? 8000 : 5000,
		disconnect: isCI ? 8000 : 5000,
		stateTransition: isCI ? 15000 : 8000
	};
}

/**
 * Log WebSocket test environment information
 */
export function logWebSocketTestEnvironment() {
	const isCI = !!process.env.CI;
	const timeouts = getWebSocketTimeouts();

	console.log('WebSocket Test Environment:', {
		environment: isCI ? 'CI' : 'Local',
		timeouts,
		userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
	});
}
