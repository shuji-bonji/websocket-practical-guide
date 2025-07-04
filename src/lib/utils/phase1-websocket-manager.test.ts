import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Phase1WebSocketManager } from './phase1-websocket-manager';
import { WebSocketMock, createWebSocketTestEnvironment } from '../../test/mocks/websocket';
import { PUBLIC_WEBSOCKET_SERVICES } from '$lib/types/websocket';

describe('Phase1WebSocketManager', () => {
	const wsEnv = createWebSocketTestEnvironment();
	let manager: Phase1WebSocketManager;

	beforeEach(() => {
		WebSocketMock.create();
		manager = new Phase1WebSocketManager({
			debug: true,
			enableFallback: true,
			connectionTimeout: 1000
		});
	});

	afterEach(() => {
		manager.disconnect();
		WebSocketMock.reset();
	});

	describe('Connection Management', () => {
		it('should connect to a WebSocket service', async () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const onOpen = vi.fn();
			const onEducationalEvent = vi.fn();

			manager.connect({
				service,
				onOpen,
				onEducationalEvent
			});

			// Simulate successful connection
			const wsInstance = wsEnv.getLastInstance();
			expect(wsInstance).toBeDefined();
			expect(wsInstance?.url).toBe(service.url);

			wsInstance?.simulateOpen();
			expect(onOpen).toHaveBeenCalled();
			expect(onEducationalEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'open',
					description: expect.stringContaining('established')
				})
			);
		});

		it('should handle connection errors and fallback', async () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const onError = vi.fn();
			const onEducationalEvent = vi.fn();

			manager.connect({
				service,
				onError,
				onEducationalEvent
			});

			// Simulate connection error
			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateError();

			expect(onError).toHaveBeenCalled();
			expect(onEducationalEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error'
				})
			);
		});

		it('should disconnect cleanly', () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const onClose = vi.fn();

			manager.connect({ service, onClose });
			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateOpen();

			// Disconnect
			manager.disconnect();
			expect(wsInstance?.close).toHaveBeenCalled();
		});
	});

	describe('Message Handling', () => {
		it('should send messages when connected', () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			manager.connect({ service });

			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateOpen();

			const message = 'Hello WebSocket!';
			manager.send(message);

			expect(wsInstance?.send).toHaveBeenCalledWith(message);
		});

		it('should not send messages when disconnected', () => {
			const message = 'Hello WebSocket!';
			const result = manager.send(message);

			expect(result).toBe(false);
			expect(wsEnv.getLastInstance()).toBeUndefined();
		});

		it('should handle received messages', () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const onMessage = vi.fn();
			const onEducationalEvent = vi.fn();

			manager.connect({ service, onMessage, onEducationalEvent });

			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateOpen();

			const testMessage = 'Test message from server';
			wsInstance?.simulateMessage(testMessage);

			expect(onMessage).toHaveBeenCalledWith(
				expect.objectContaining({
					data: testMessage
				})
			);
			expect(onEducationalEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'message',
					description: expect.stringContaining('Received')
				})
			);
		});
	});

	describe('State Management', () => {
		it('should track connection state correctly', () => {
			expect(manager.getState().status).toBe('disconnected');

			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			manager.connect({ service });
			expect(manager.getState().status).toBe('connecting');

			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateOpen();
			expect(manager.getState().status).toBe('connected');

			wsInstance?.simulateClose();
			expect(manager.getState().status).toBe('disconnected');
		});

		it('should update metrics during communication', () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			manager.connect({ service });

			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateOpen();

			const initialMetrics = manager.getMetrics();
			expect(initialMetrics.messagesSent).toBe(0);
			expect(initialMetrics.messagesReceived).toBe(0);

			// Send a message
			manager.send('test');
			const afterSendMetrics = manager.getMetrics();
			expect(afterSendMetrics.messagesSent).toBe(1);

			// Receive a message
			wsInstance?.simulateMessage('response');
			const afterReceiveMetrics = manager.getMetrics();
			expect(afterReceiveMetrics.messagesReceived).toBe(1);
		});
	});

	describe('Reconnection Logic', () => {
		it('should attempt reconnection on unexpected disconnect', async () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const onEducationalEvent = vi.fn();

			manager.connect({ service, onEducationalEvent });

			const wsInstance = wsEnv.getLastInstance();
			wsInstance?.simulateOpen();
			onEducationalEvent.mockClear();

			// Simulate unexpected disconnect
			wsInstance?.simulateClose(1006, 'Abnormal Closure');

			// Wait for reconnection attempt
			await vi.waitFor(() => {
				expect(onEducationalEvent).toHaveBeenCalledWith(
					expect.objectContaining({
						type: 'system',
						description: expect.stringContaining('Attempting reconnection')
					})
				);
			});
		});

		it('should respect max reconnection attempts', async () => {
			manager = new Phase1WebSocketManager({
				enableFallback: true,
				maxReconnectAttempts: 2,
				reconnectDelay: 10
			});

			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const onEducationalEvent = vi.fn();

			// Handle promise rejection
			manager.connect({ service, onEducationalEvent }).catch(() => {
				// Expected rejection for first connection attempt
			});

			// Simulate multiple failed connections
			for (let i = 0; i < 3; i++) {
				const wsInstance = wsEnv.getLastInstance();
				wsInstance?.simulateError();
				wsInstance?.simulateClose(1006);
				await new Promise((resolve) => setTimeout(resolve, 20));
			}

			const state = manager.getState();
			expect(state.reconnectAttempts).toBeLessThanOrEqual(2);
		});
	});

	describe('Educational Features', () => {
		it('should emit educational events for all WebSocket lifecycle stages', () => {
			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const educationalEvents: Array<{
				type: string;
				description: string;
			}> = [];

			manager.connect({
				service,
				onEducationalEvent: (event) => educationalEvents.push(event)
			});

			const wsInstance = wsEnv.getLastInstance();

			// Connection handshake
			expect(educationalEvents).toContainEqual(expect.objectContaining({ type: 'handshake' }));

			// Open event
			wsInstance?.simulateOpen();
			expect(educationalEvents).toContainEqual(expect.objectContaining({ type: 'open' }));

			// Message event
			wsInstance?.simulateMessage('test');
			expect(educationalEvents).toContainEqual(expect.objectContaining({ type: 'message' }));

			// Close event
			wsInstance?.simulateClose();
			expect(educationalEvents).toContainEqual(expect.objectContaining({ type: 'close' }));
		});

		it('should include educational hints in debug mode', () => {
			manager = new Phase1WebSocketManager({
				debug: true,
				showEducationalHints: true
			});

			const service = PUBLIC_WEBSOCKET_SERVICES[0];
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			manager.connect({ service });

			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Phase1WebSocket]'));

			consoleLogSpy.mockRestore();
		});
	});
});
