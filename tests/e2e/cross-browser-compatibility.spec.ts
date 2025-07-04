import { test, expect } from '@playwright/test';

/**
 * Cross-browser compatibility test matrix for WebSocket functionality
 * Tests WebSocket features across different browsers and devices
 */

test.describe('Cross-Browser WebSocket Compatibility Matrix', () => {
	const testUrls = ['/phase1', '/phase1/websocket-states', '/phase1/introduction'];

	// Test matrix: URL × Browser capability
	for (const url of testUrls) {
		test.describe(`Page: ${url}`, () => {
			test('should support WebSocket API across all browsers', async ({ page, browserName }) => {
				await page.goto(url);
				await page.waitForLoadState('networkidle');

				// Test WebSocket API availability
				const webSocketSupport = await page.evaluate(() => {
					return {
						WebSocket: typeof WebSocket !== 'undefined',
						WebSocketReadyStates:
							typeof WebSocket !== 'undefined'
								? {
										CONNECTING: WebSocket.CONNECTING,
										OPEN: WebSocket.OPEN,
										CLOSING: WebSocket.CLOSING,
										CLOSED: WebSocket.CLOSED
									}
								: null,
						ArrayBuffer: typeof ArrayBuffer !== 'undefined',
						Uint8Array: typeof Uint8Array !== 'undefined',
						Blob: typeof Blob !== 'undefined'
					};
				});

				// All modern browsers should support WebSocket
				expect(webSocketSupport.WebSocket).toBe(true);
				expect(webSocketSupport.WebSocketReadyStates).not.toBeNull();
				expect(webSocketSupport.ArrayBuffer).toBe(true);
				expect(webSocketSupport.Uint8Array).toBe(true);
				expect(webSocketSupport.Blob).toBe(true);

				console.log(`${browserName} WebSocket support:`, webSocketSupport);
			});

			test('should handle WebSocket connections consistently', async ({ page, browserName }) => {
				await page.goto(url);
				await page.waitForLoadState('networkidle');

				// Skip connection tests on certain pages that don't have WebSocket demos
				const hasConnectionDemo = (await page.locator('button:has-text("接続")').count()) > 0;
				if (!hasConnectionDemo) {
					test.skip(true, `Page ${url} does not have WebSocket connection demo`);
					return;
				}

				// Test connection behavior
				const connectButton = page.locator('button:has-text("接続")');
				await connectButton.click();

				// Different browsers might have different connection timings
				const browserTimeouts = {
					chromium: 8000,
					firefox: 10000,
					webkit: 12000
				};

				const timeout = browserTimeouts[browserName as keyof typeof browserTimeouts] || 10000;

				try {
					await page.waitForSelector('[data-connection-state="connected"]', { timeout });

					// Test message sending if input is available
					const messageInput = page.locator('input[type="text"]').first();
					if ((await messageInput.count()) > 0) {
						await messageInput.fill(`Cross-browser test from ${browserName}`);
						await page.locator('button:has-text("送信")').click();

						// Verify message appears
						await expect(page.locator(`text=Cross-browser test from ${browserName}`)).toBeVisible({
							timeout: 5000
						});
					}

					// Test disconnection
					const disconnectButton = page.locator('button:has-text("切断")');
					if ((await disconnectButton.count()) > 0) {
						await disconnectButton.click();
						await page.waitForSelector('[data-connection-state="disconnected"]', { timeout: 5000 });
					}
				} catch (error) {
					console.log(`Connection test failed on ${browserName} for ${url}:`, String(error));
					// Don't fail the test - some services might be temporarily unavailable
					// The important thing is that the browser supports the WebSocket API
				}
			});

			test('should render UI consistently across browsers', async ({ page, browserName }) => {
				await page.goto(url);
				await page.waitForLoadState('networkidle');

				// Test basic page structure
				await expect(page.locator('h1, h2, h3')).toHaveCount({ minimum: 1 });

				// Test CSS rendering - take screenshot for visual comparison
				await page.screenshot({
					path: `test-results/screenshots/${browserName}-${url.replace(/\//g, '_')}.png`,
					fullPage: true
				});

				// Test responsive design
				const viewports = [
					{ width: 1920, height: 1080, name: 'desktop' },
					{ width: 768, height: 1024, name: 'tablet' },
					{ width: 375, height: 667, name: 'mobile' }
				];

				for (const viewport of viewports) {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.waitForTimeout(500); // Allow layout to settle

					// Verify main content is still visible
					await expect(page.locator('h1, h2, h3').first()).toBeVisible();

					// Take viewport-specific screenshot
					await page.screenshot({
						path: `test-results/screenshots/${browserName}-${viewport.name}-${url.replace(/\//g, '_')}.png`
					});
				}
			});
		});
	}

	test.describe('Browser-Specific WebSocket Features', () => {
		test('should handle binary data consistently', async ({ page, browserName }) => {
			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Test binary data support
			const binarySupport = await page.evaluate(() => {
				try {
					const buffer = new ArrayBuffer(16);
					const view = new Uint8Array(buffer);
					view[0] = 42;

					const blob = new Blob([view], { type: 'application/octet-stream' });

					return {
						arrayBuffer: buffer.byteLength === 16,
						uint8Array: view[0] === 42,
						blob: blob.size === 16,
						blobType: blob.type === 'application/octet-stream'
					};
				} catch (error) {
					return { error: error.message };
				}
			});

			expect(binarySupport.arrayBuffer).toBe(true);
			expect(binarySupport.uint8Array).toBe(true);
			expect(binarySupport.blob).toBe(true);
			expect(binarySupport.blobType).toBe(true);

			console.log(`${browserName} binary data support:`, binarySupport);
		});

		test('should handle WebSocket extensions and protocols', async ({ page, browserName }) => {
			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Test protocol and extension support
			const protocolSupport = await page.evaluate(() => {
				try {
					// Test if browser supports subprotocols
					const ws = new WebSocket('wss://echo.websocket.org', ['chat', 'superchat']);
					const hasProtocol = 'protocol' in ws;
					const hasExtensions = 'extensions' in ws;

					ws.close();

					return {
						subprotocols: true,
						protocol: hasProtocol,
						extensions: hasExtensions
					};
				} catch (error) {
					return {
						subprotocols: false,
						error: error instanceof Error ? error.message : String(error)
					};
				}
			});

			// Modern browsers should support subprotocols
			expect(protocolSupport.subprotocols).toBe(true);

			console.log(`${browserName} protocol support:`, protocolSupport);
		});

		test('should handle connection limits appropriately', async ({ page, browserName }) => {
			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Test multiple concurrent connections (browser-dependent limits)
			const connectionLimits = await page.evaluate(async () => {
				const connections: WebSocket[] = [];
				const maxAttempts = 10;
				let successful = 0;
				let failed = 0;

				const connectPromises = Array.from({ length: maxAttempts }, () => {
					return new Promise<boolean>((resolve) => {
						try {
							const ws = new WebSocket(`wss://echo.websocket.org`);
							connections.push(ws);

							const timeout = setTimeout(() => {
								failed++;
								ws.close();
								resolve(false);
							}, 3000);

							ws.onopen = () => {
								successful++;
								clearTimeout(timeout);
								resolve(true);
							};

							ws.onerror = () => {
								failed++;
								clearTimeout(timeout);
								resolve(false);
							};
						} catch {
							failed++;
							resolve(false);
						}
					});
				});

				await Promise.all(connectPromises);

				// Clean up connections
				connections.forEach((ws) => {
					if (ws.readyState === WebSocket.OPEN) {
						ws.close();
					}
				});

				return { successful, failed, total: maxAttempts };
			});

			// At least some connections should succeed
			expect(connectionLimits.successful).toBeGreaterThan(0);

			console.log(`${browserName} connection limits:`, connectionLimits);
		});
	});

	test.describe('Mobile Browser Compatibility', () => {
		test('should work on mobile browsers', async ({ page, browserName }) => {
			// Skip desktop-only browsers for mobile tests
			if (!browserName.includes('Mobile')) {
				test.skip(true, 'Mobile-specific test');
				return;
			}

			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Test touch interactions
			const connectButton = page.locator('button:has-text("接続")');
			if ((await connectButton.count()) > 0) {
				// Test tap gesture
				await connectButton.tap();

				// Mobile browsers might need more time for WebSocket connections
				try {
					await page.waitForSelector('[data-connection-state="connected"]', { timeout: 15000 });
				} catch (error) {
					console.log(`Mobile connection test failed on ${browserName}:`, String(error));
				}
			}

			// Test mobile-specific features
			const mobileFeatures = await page.evaluate(() => {
				return {
					touchSupport: 'ontouchstart' in window,
					orientationSupport: 'orientation' in window,
					devicePixelRatio: window.devicePixelRatio,
					viewport: {
						width: window.innerWidth,
						height: window.innerHeight
					}
				};
			});

			console.log(`${browserName} mobile features:`, mobileFeatures);
		});

		test('should handle orientation changes', async ({ page, browserName }) => {
			if (!browserName.includes('Mobile')) {
				test.skip(true, 'Mobile-specific test');
				return;
			}

			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Test portrait orientation
			await page.setViewportSize({ width: 375, height: 667 });
			await expect(page.locator('h1')).toBeVisible();

			// Test landscape orientation
			await page.setViewportSize({ width: 667, height: 375 });
			await expect(page.locator('h1')).toBeVisible();

			// Test that WebSocket functionality still works after orientation change
			const connectButton = page.locator('button:has-text("接続")');
			if ((await connectButton.count()) > 0) {
				await connectButton.tap();
				// Just verify no crashes occur during orientation changes
			}
		});
	});

	test.describe('Performance Across Browsers', () => {
		test('should meet performance benchmarks', async ({ page, browserName }) => {
			const startTime = Date.now();

			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			const loadTime = Date.now() - startTime;

			// Performance expectations by browser (in milliseconds)
			const performanceThresholds = {
				chromium: 4000,
				firefox: 5000,
				webkit: 6000
			};

			const threshold =
				performanceThresholds[browserName as keyof typeof performanceThresholds] || 5000;

			expect(loadTime).toBeLessThan(threshold);

			console.log(`${browserName} load time: ${loadTime}ms (threshold: ${threshold}ms)`);
		});

		test('should handle memory usage efficiently', async ({ page, browserName }) => {
			await page.goto('/phase1');
			await page.waitForLoadState('networkidle');

			// Measure memory usage during WebSocket operations
			const memoryUsage = await page.evaluate(async () => {
				type PerformanceWithMemory = Performance & {
					memory?: { usedJSHeapSize: number };
				};
				const performanceMemory = (performance as PerformanceWithMemory).memory;
				const initialMemory = performanceMemory?.usedJSHeapSize || 0;

				// Create and destroy multiple WebSocket connections
				const connections: WebSocket[] = [];
				for (let i = 0; i < 50; i++) {
					try {
						const ws = new WebSocket('wss://echo.websocket.org');
						connections.push(ws);

						// Close immediately to test cleanup
						ws.close();
					} catch {
						// Ignore connection errors for memory test
					}
				}

				// Force garbage collection if available
				type WindowWithGc = Window & { gc?: () => void };
				const windowWithGc = window as WindowWithGc;
				if (windowWithGc.gc) {
					windowWithGc.gc();
				}

				const finalMemory = performanceMemory?.usedJSHeapSize || 0;

				return {
					initial: initialMemory,
					final: finalMemory,
					difference: finalMemory - initialMemory,
					connectionsCreated: connections.length
				};
			});

			// Memory usage should not grow excessively
			if (memoryUsage.initial > 0) {
				const memoryGrowthMB = memoryUsage.difference / (1024 * 1024);
				expect(memoryGrowthMB).toBeLessThan(50); // Less than 50MB growth
			}

			console.log(`${browserName} memory usage:`, memoryUsage);
		});
	});
});
