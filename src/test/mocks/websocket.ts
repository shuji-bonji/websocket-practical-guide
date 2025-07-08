import { vi } from 'vitest';
import type { Mock } from 'vitest';

export interface MockWebSocketInstance {
  url: string;
  readyState: number;
  onopen: Mock | null;
  onclose: Mock | null;
  onerror: Mock | null;
  onmessage: Mock | null;
  send: Mock;
  close: Mock;
  // Test helpers
  simulateOpen: () => void;
  simulateMessage: (data: string) => void;
  simulateError: (error?: Error) => void;
  simulateClose: (code?: number, reason?: string) => void;
}

export class WebSocketMock {
  private static instances: MockWebSocketInstance[] = [];
  private static mockConstructor = vi.fn();

  static create(): void {
    const MockWebSocket = vi
      .fn()
      .mockImplementation((url: string, protocols?: string | string[]) => {
        const instance: MockWebSocketInstance = {
          url,
          readyState: 0, // CONNECTING
          onopen: null,
          onclose: null,
          onerror: null,
          onmessage: null,
          send: vi.fn(),
          close: vi.fn(),
          // Test helpers
          simulateOpen() {
            this.readyState = 1; // OPEN
            if (this.onopen) {
              this.onopen(new Event('open'));
            }
          },
          simulateMessage(data: string) {
            if (this.onmessage) {
              this.onmessage(new MessageEvent('message', { data }));
            }
          },
          simulateError() {
            if (this.onerror) {
              this.onerror(new Event('error'));
            }
          },
          simulateClose(code = 1000, reason = '') {
            this.readyState = 3; // CLOSED
            if (this.onclose) {
              this.onclose(new CloseEvent('close', { code, reason }));
            }
          }
        };

        WebSocketMock.instances.push(instance);
        WebSocketMock.mockConstructor(url, protocols);
        return instance;
      });

    // Add static properties
    Object.defineProperty(MockWebSocket, 'CONNECTING', { value: 0 });
    Object.defineProperty(MockWebSocket, 'OPEN', { value: 1 });
    Object.defineProperty(MockWebSocket, 'CLOSING', { value: 2 });
    Object.defineProperty(MockWebSocket, 'CLOSED', { value: 3 });

    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  }

  static getLastInstance(): MockWebSocketInstance | undefined {
    return this.instances[this.instances.length - 1];
  }

  static getAllInstances(): MockWebSocketInstance[] {
    return this.instances;
  }

  static getMockConstructor() {
    return this.mockConstructor;
  }

  static reset(): void {
    this.instances = [];
    this.mockConstructor.mockClear();
  }
}

// Helper to create a controlled WebSocket test environment
export function createWebSocketTestEnvironment() {
  // Note: beforeEach/afterEach should be called in test files that import this
  return {
    getLastInstance: () => WebSocketMock.getLastInstance(),
    getAllInstances: () => WebSocketMock.getAllInstances(),
    expectConnectionTo: (url: string) => {
      const constructor = WebSocketMock.getMockConstructor();
      // Note: This method should be called from within test context where expect is available
      // The actual expectation should be written in the test file
      return { constructor, url };
    }
  };
}
