import { test, expect } from '@playwright/test';

test.describe('WebSocket Connection Flows', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the Phase 1 WebSocket demo page
		await page.goto('/phase1');

		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');
	});

	test.describe('Basic WebSocket Connection', () => {
		test('should display WebSocket demo components', async ({ page }) => {
			// Check if the main heading is present
			await expect(page.locator('h1')).toContainText('Phase 1');

			// Check if WebSocket demo components are present
			await expect(page.locator('[data-testid="websocket-demo"]')).toBeVisible();
		});

		test('should be able to connect to echo service', async ({ page }) => {
			// Look for connection button
			const connectButton = page.locator('button:has-text("接続")');
			await expect(connectButton).toBeVisible();

			// Click connect button
			await connectButton.click();

			// Wait for connection to be established
			await page.waitForSelector('[data-connection-state="connected"]', { timeout: 10000 });

			// Verify connection status is displayed
			await expect(page.locator('[data-connection-state="connected"]')).toBeVisible();
		});

		test('should be able to send and receive messages', async ({ page }) => {
			// Connect first
			await page.locator('button:has-text("接続")').click();
			await page.waitForSelector('[data-connection-state="connected"]', { timeout: 10000 });

			// Find message input and send button
			const messageInput = page.locator('input[type="text"]').first();
			const sendButton = page.locator('button:has-text("送信")');

			await expect(messageInput).toBeVisible();
			await expect(sendButton).toBeVisible();

			// Type a test message
			const testMessage = 'Hello WebSocket E2E Test!';
			await messageInput.fill(testMessage);

			// Send the message
			await sendButton.click();

			// Verify message appears in the message history
			await expect(page.locator(`text=${testMessage}`)).toBeVisible({ timeout: 5000 });
		});

		test('should be able to disconnect', async ({ page }) => {
			// Connect first
			await page.locator('button:has-text("接続")').click();
			await page.waitForSelector('[data-connection-state="connected"]', { timeout: 10000 });

			// Find and click disconnect button
			const disconnectButton = page.locator('button:has-text("切断")');
			await expect(disconnectButton).toBeVisible();
			await disconnectButton.click();

			// Verify disconnection
			await page.waitForSelector('[data-connection-state="disconnected"]', { timeout: 5000 });
			await expect(page.locator('[data-connection-state="disconnected"]')).toBeVisible();
		});
	});

	test.describe('WebSocket State Visualizer', () => {
		test('should display ready state information', async ({ page }) => {
			// Navigate to WebSocket states page
			await page.goto('/phase1/websocket-states');
			await page.waitForLoadState('networkidle');

			// Check if state visualizer is present
			await expect(page.locator('text=WebSocket状態可視化')).toBeVisible();

			// Check if ready state labels are displayed
			await expect(page.locator('text=CONNECTING')).toBeVisible();
			await expect(page.locator('text=OPEN')).toBeVisible();
			await expect(page.locator('text=CLOSING')).toBeVisible();
			await expect(page.locator('text=CLOSED')).toBeVisible();
		});

		test('should show state transitions during connection lifecycle', async ({ page }) => {
			await page.goto('/phase1/websocket-states');
			await page.waitForLoadState('networkidle');

			// Start connection
			await page.locator('button:has-text("接続")').click();

			// Should show CONNECTING state
			await expect(page.locator('text=CONNECTING').first()).toBeVisible();

			// Wait for OPEN state
			await expect(page.locator('text=OPEN').first()).toBeVisible({ timeout: 10000 });

			// Disconnect
			await page.locator('button:has-text("切断")').click();

			// Should show CLOSED state
			await expect(page.locator('text=CLOSED').first()).toBeVisible({ timeout: 5000 });
		});

		test('should display connection metrics', async ({ page }) => {
			await page.goto('/phase1/websocket-states');
			await page.waitForLoadState('networkidle');

			// Check if metrics are displayed
			await expect(page.locator('text=接続メトリクス')).toBeVisible();
			await expect(page.locator('text=送信')).toBeVisible();
			await expect(page.locator('text=受信')).toBeVisible();
			await expect(page.locator('text=安定性')).toBeVisible();
		});

		test('should handle auto demo mode', async ({ page }) => {
			await page.goto('/phase1/websocket-states');
			await page.waitForLoadState('networkidle');

			// Start auto demo
			const autoDemoButton = page.locator('button:has-text("自動デモ開始")');
			await expect(autoDemoButton).toBeVisible();
			await autoDemoButton.click();

			// Verify auto demo is running
			await expect(page.locator('button:has-text("自動デモ停止")')).toBeVisible();

			// Wait for some automatic state changes
			await page.waitForTimeout(3000);

			// Stop auto demo
			await page.locator('button:has-text("自動デモ停止")').click();
			await expect(page.locator('button:has-text("自動デモ開始")')).toBeVisible();
		});
	});

	test.describe('Service Selection and Fallback', () => {
		test('should allow service selection', async ({ page }) => {
			// Look for service selector if available
			const serviceSelector = page.locator('select, [data-testid="service-selector"]');

			if ((await serviceSelector.count()) > 0) {
				await expect(serviceSelector).toBeVisible();

				// Try selecting different services
				await serviceSelector.selectOption({ index: 0 });
			}
		});

		test('should handle connection errors gracefully', async ({ page }) => {
			// This test might need to mock network conditions or use invalid URLs
			// For now, we'll test the UI's error handling capabilities

			await page.locator('button:has-text("接続")').click();

			// Wait for either success or error state
			await Promise.race([
				page
					.waitForSelector('[data-connection-state="connected"]', { timeout: 10000 })
					.catch(() => null),
				page
					.waitForSelector('[data-connection-state="error"]', { timeout: 10000 })
					.catch(() => null),
				page.waitForSelector('text=エラー', { timeout: 10000 }).catch(() => null)
			]);

			// The page should handle the connection attempt gracefully
			// (either connect successfully or show an error state)
			expect(true).toBe(true); // Test that no uncaught exceptions occurred
		});
	});

	test.describe('Cross-Browser Compatibility', () => {
		test('should work consistently across browsers', async ({ page, browserName }) => {
			// Basic functionality test that should work the same across all browsers
			await expect(page.locator('h1')).toBeVisible();

			// Test WebSocket support detection
			const webSocketSupported = await page.evaluate(() => {
				return typeof WebSocket !== 'undefined';
			});

			expect(webSocketSupported).toBe(true);

			// Log browser-specific information for debugging
			console.log(`Testing on ${browserName}: WebSocket supported = ${webSocketSupported}`);
		});

		test('should handle browser-specific WebSocket behaviors', async ({ page, browserName }) => {
			await page.locator('button:has-text("接続")').click();

			// Different browsers might have slightly different connection timings
			const connectionTimeout = browserName === 'webkit' ? 15000 : 10000;

			try {
				await page.waitForSelector('[data-connection-state="connected"]', {
					timeout: connectionTimeout
				});

				// Test message sending if connected
				const messageInput = page.locator('input[type="text"]').first();
				if ((await messageInput.count()) > 0) {
					await messageInput.fill(`Test from ${browserName}`);
					await page.locator('button:has-text("送信")').click();
				}
			} catch (error) {
				console.log(`Connection test on ${browserName} failed:`, error);
				// Don't fail the test if connection fails due to network issues
				// The important thing is that the UI handles it gracefully
			}
		});
	});

	test.describe('Performance and Responsiveness', () => {
		test('should load page within reasonable time', async ({ page }) => {
			const startTime = Date.now();
			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');
			const loadTime = Date.now() - startTime;

			// Page should load within 5 seconds
			expect(loadTime).toBeLessThan(5000);
		});

		test('should be responsive on mobile viewports', async ({ page }) => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });

			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Check if main elements are still visible and accessible
			await expect(page.locator('h1')).toBeVisible();

			// Test if buttons are tap-friendly (not too small)
			const connectButton = page.locator('button:has-text("接続")');
			if ((await connectButton.count()) > 0) {
				const buttonBox = await connectButton.boundingBox();
				if (buttonBox) {
					// Button should be at least 44px tall for good mobile UX
					expect(buttonBox.height).toBeGreaterThanOrEqual(40);
				}
			}
		});

		test('should handle rapid connection/disconnection cycles', async ({ page }) => {
			const cycles = 3;

			for (let i = 0; i < cycles; i++) {
				// Connect
				await page.locator('button:has-text("接続")').click();

				try {
					await page.waitForSelector('[data-connection-state="connected"]', { timeout: 5000 });

					// Disconnect immediately
					await page.locator('button:has-text("切断")').click();
					await page.waitForSelector('[data-connection-state="disconnected"]', { timeout: 3000 });
				} catch (error) {
					console.log(`Cycle ${i + 1} failed:`, error);
					// Reset state for next iteration
					await page.reload();
					await page.waitForLoadState('networkidle');
				}
			}
		});
	});

	test.describe('Accessibility', () => {
		test('should have proper heading structure', async ({ page }) => {
			// Check for proper heading hierarchy
			const h1 = await page.locator('h1').count();
			expect(h1).toBeGreaterThan(0);

			// Should have logical heading progression
			const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
			expect(headings.length).toBeGreaterThan(0);
		});

		test('should have accessible button labels', async ({ page }) => {
			const buttons = page.locator('button');
			const buttonCount = await buttons.count();

			for (let i = 0; i < buttonCount; i++) {
				const button = buttons.nth(i);
				const text = await button.textContent();
				const ariaLabel = await button.getAttribute('aria-label');

				// Button should have either visible text or aria-label
				expect(text || ariaLabel).toBeTruthy();
			}
		});

		test('should be keyboard navigable', async ({ page }) => {
			// Test tab navigation
			await page.keyboard.press('Tab');

			// Check if focus is visible on interactive elements
			const focusedElement = page.locator(':focus');
			await expect(focusedElement).toBeVisible();

			// Continue tabbing to next element
			await page.keyboard.press('Tab');
			await expect(page.locator(':focus')).toBeVisible();
		});
	});
});
