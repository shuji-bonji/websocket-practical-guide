import { test, expect } from '@playwright/test';

/**
 * Visual regression testing for WebSocket components
 * Captures screenshots and compares them for visual consistency
 */

test.describe('Visual Regression Testing', () => {
	const pages = [
		{ url: '/phase1', name: 'phase1-homepage' },
		{ url: '/phase1/websocket-states', name: 'websocket-states-page' },
		{ url: '/phase1/introduction', name: 'introduction-page' }
	];

	test.describe('Desktop Screenshots', () => {
		test.beforeEach(async ({ page }) => {
			// Set consistent viewport for desktop testing
			await page.setViewportSize({ width: 1280, height: 720 });
		});

		for (const pageInfo of pages) {
			test(`should match screenshot for ${pageInfo.name}`, async ({ page }) => {
				await page.goto(pageInfo.url);
				await page.waitForLoadState('networkidle');

				// Wait for any animations to settle
				await page.waitForTimeout(500);

				// Take full page screenshot
				await expect(page).toHaveScreenshot(`${pageInfo.name}-desktop.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});

			test(`should match component screenshots for ${pageInfo.name}`, async ({ page }) => {
				await page.goto(pageInfo.url);
				await page.waitForLoadState('networkidle');

				// Test WebSocket demo component if present
				const demoComponent = page.locator('[data-testid="websocket-demo"]');
				if ((await demoComponent.count()) > 0) {
					await expect(demoComponent).toHaveScreenshot(`${pageInfo.name}-demo-component.png`, {
						animations: 'disabled'
					});
				}

				// Test WebSocket state visualizer if present
				const stateVisualizer = page.locator('[data-testid="websocket-state-visualizer"]');
				if ((await stateVisualizer.count()) > 0) {
					await expect(stateVisualizer).toHaveScreenshot(`${pageInfo.name}-state-visualizer.png`, {
						animations: 'disabled'
					});
				}
			});
		}
	});

	test.describe('Mobile Screenshots', () => {
		test.beforeEach(async ({ page }) => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });
		});

		for (const pageInfo of pages) {
			test(`should match mobile screenshot for ${pageInfo.name}`, async ({ page }) => {
				await page.goto(pageInfo.url);
				await page.waitForLoadState('networkidle');

				// Wait for responsive layout to settle
				await page.waitForTimeout(500);

				await expect(page).toHaveScreenshot(`${pageInfo.name}-mobile.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});
		}
	});

	test.describe('Tablet Screenshots', () => {
		test.beforeEach(async ({ page }) => {
			// Set tablet viewport
			await page.setViewportSize({ width: 768, height: 1024 });
		});

		for (const pageInfo of pages) {
			test(`should match tablet screenshot for ${pageInfo.name}`, async ({ page }) => {
				await page.goto(pageInfo.url);
				await page.waitForLoadState('networkidle');

				await page.waitForTimeout(500);

				await expect(page).toHaveScreenshot(`${pageInfo.name}-tablet.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});
		}
	});

	test.describe('Dark Mode Screenshots', () => {
		test.beforeEach(async ({ page }) => {
			// Enable dark mode if available
			await page.emulateMedia({ colorScheme: 'dark' });
			await page.setViewportSize({ width: 1280, height: 720 });
		});

		for (const pageInfo of pages) {
			test(`should match dark mode screenshot for ${pageInfo.name}`, async ({ page }) => {
				await page.goto(pageInfo.url);
				await page.waitForLoadState('networkidle');

				await page.waitForTimeout(500);

				await expect(page).toHaveScreenshot(`${pageInfo.name}-dark-mode.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});
		}
	});

	test.describe('Interactive State Screenshots', () => {
		test('should capture WebSocket connection states', async ({ page }) => {
			await page.goto('/phase1/websocket-states');
			await page.waitForLoadState('networkidle');

			// Screenshot initial disconnected state
			await expect(page.locator('[data-testid="websocket-state-visualizer"]')).toHaveScreenshot(
				'websocket-disconnected-state.png',
				{
					animations: 'disabled'
				}
			);

			// Try to connect and capture connecting state
			const connectButton = page.locator('[data-testid="connect-button"]');
			if ((await connectButton.count()) > 0) {
				await connectButton.click();

				// Wait a moment to capture connecting state
				await page.waitForTimeout(1000);

				await expect(page.locator('[data-testid="websocket-state-visualizer"]')).toHaveScreenshot(
					'websocket-connecting-state.png',
					{
						animations: 'disabled'
					}
				);

				// Try to wait for connection state change, but don't fail if external service is unavailable
				try {
					// Give external service a chance to connect, but use shorter timeout
					await page.waitForSelector(
						'[data-connection-state="connected"], [data-connection-state="error"]',
						{
							timeout: 3000
						}
					);

					// Check what state we ended up in
					const connectionState = await page
						.locator('[data-connection-state]')
						.getAttribute('data-connection-state');

					if (connectionState === 'connected') {
						await expect(
							page.locator('[data-testid="websocket-state-visualizer"]')
						).toHaveScreenshot('websocket-connected-state.png', {
							animations: 'disabled'
						});

						// Test message sending interface if connected
						const sendButton = page.locator('[data-testid="send-test-message-button"]');
						if ((await sendButton.count()) > 0 && (await sendButton.isEnabled())) {
							await sendButton.click();
							await page.waitForTimeout(500);

							await expect(
								page.locator('[data-testid="websocket-state-visualizer"]')
							).toHaveScreenshot('websocket-message-sent-state.png', {
								animations: 'disabled'
							});
						}
					} else {
						// Capture error/timeout state for visual consistency
						await expect(
							page.locator('[data-testid="websocket-state-visualizer"]')
						).toHaveScreenshot('websocket-error-state.png', {
							animations: 'disabled'
						});
					}
				} catch {
					// External service unavailable - capture timeout state for visual regression
					console.log(
						'External WebSocket service unavailable, capturing timeout state for visual consistency'
					);
					await expect(page.locator('[data-testid="websocket-state-visualizer"]')).toHaveScreenshot(
						'websocket-error-state.png',
						{
							animations: 'disabled'
						}
					);
				}
			}
		});

		test('should capture auto demo states', async ({ page }) => {
			await page.goto('/phase1/websocket-states');
			await page.waitForLoadState('networkidle');

			// Start auto demo
			const autoDemoButton = page.locator('[data-testid="auto-demo-toggle"]');
			if ((await autoDemoButton.count()) > 0) {
				await autoDemoButton.click();

				// Capture auto demo running state
				await page.waitForTimeout(1000);
				await expect(page.locator('[data-testid="websocket-state-visualizer"]')).toHaveScreenshot(
					'websocket-auto-demo-running.png',
					{
						animations: 'disabled'
					}
				);

				// Stop auto demo
				await autoDemoButton.click();
				await page.waitForTimeout(500);

				await expect(page.locator('[data-testid="websocket-state-visualizer"]')).toHaveScreenshot(
					'websocket-auto-demo-stopped.png',
					{
						animations: 'disabled'
					}
				);
			}
		});
	});

	test.describe('Error State Screenshots', () => {
		test('should capture form validation states', async ({ page }) => {
			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Test empty message sending (should be disabled)
			const demoComponent = page.locator('[data-testid="websocket-demo"]');
			if ((await demoComponent.count()) > 0) {
				const messageInput = page.locator('[data-testid="message-input"]');
				const sendButton = page.locator('[data-testid="send-button"]');

				if ((await messageInput.count()) > 0 && (await sendButton.count()) > 0) {
					// Clear input to test validation
					await messageInput.clear();

					await expect(demoComponent).toHaveScreenshot('websocket-demo-empty-input.png', {
						animations: 'disabled'
					});

					// Type message to show enabled state
					await messageInput.fill('Test message for visual regression');

					await expect(demoComponent).toHaveScreenshot('websocket-demo-filled-input.png', {
						animations: 'disabled'
					});
				}
			}
		});
	});

	test.describe('High Contrast Screenshots', () => {
		test.beforeEach(async ({ page }) => {
			// Enable high contrast mode
			await page.emulateMedia({ forcedColors: 'active' });
			await page.setViewportSize({ width: 1280, height: 720 });
		});

		for (const pageInfo of pages) {
			test(`should match high contrast screenshot for ${pageInfo.name}`, async ({ page }) => {
				await page.goto(pageInfo.url);
				await page.waitForLoadState('networkidle');

				await page.waitForTimeout(500);

				await expect(page).toHaveScreenshot(`${pageInfo.name}-high-contrast.png`, {
					fullPage: true,
					animations: 'disabled'
				});
			});
		}
	});
});
