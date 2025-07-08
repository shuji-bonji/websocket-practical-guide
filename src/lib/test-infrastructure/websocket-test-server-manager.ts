import { MockWebSocketServer } from './mock-websocket-server.js';
import type { MockServerConfig, TestScenario } from './mock-websocket-server.js';

export interface ServerInstance {
  id: string;
  name: string;
  server: MockWebSocketServer;
  config: MockServerConfig;
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  error?: string;
  createdAt: Date;
  lastStarted?: Date;
  lastStopped?: Date;
}

export interface TestSession {
  id: string;
  name: string;
  description: string;
  servers: string[];
  scenarios: string[];
  status: 'inactive' | 'active' | 'completed';
  startTime?: Date;
  endTime?: Date;
  results?: TestSessionResults;
}

export interface TestSessionResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errors: string[];
  performance: {
    averageLatency: number;
    messagesThroughput: number;
    connectionsHandled: number;
  };
}

export class WebSocketTestServerManager {
  private servers: Map<string, ServerInstance>;
  private sessions: Map<string, TestSession>;
  private eventHandlers: Map<string, (data: unknown) => void>;
  private activeSession: string | null;

  constructor() {
    this.servers = new Map();
    this.sessions = new Map();
    this.eventHandlers = new Map();
    this.activeSession = null;
  }

  // Server Management
  public createServer(id: string, name: string, config: MockServerConfig): ServerInstance {
    if (this.servers.has(id)) {
      throw new Error(`Server with id '${id}' already exists`);
    }

    const server = new MockWebSocketServer(config);
    const instance: ServerInstance = {
      id,
      name,
      server,
      config,
      status: 'stopped',
      createdAt: new Date()
    };

    // Set up server event handlers
    this.setupServerEventHandlers(instance);

    this.servers.set(id, instance);
    this.emit('serverCreated', { serverId: id, instance });

    return instance;
  }

  public async startServer(serverId: string): Promise<void> {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    if (instance.status === 'running') {
      return;
    }

    instance.status = 'starting';
    instance.error = undefined;
    this.emit('serverStatusChanged', { serverId, status: 'starting' });

    try {
      await instance.server.start();
      instance.status = 'running';
      instance.lastStarted = new Date();
      this.emit('serverStatusChanged', { serverId, status: 'running' });
    } catch (error) {
      instance.status = 'error';
      instance.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('serverStatusChanged', { serverId, status: 'error', error: instance.error });
      throw error;
    }
  }

  public async stopServer(serverId: string): Promise<void> {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    if (instance.status === 'stopped') {
      return;
    }

    instance.status = 'stopping';
    this.emit('serverStatusChanged', { serverId, status: 'stopping' });

    try {
      await instance.server.stop();
      instance.status = 'stopped';
      instance.lastStopped = new Date();
      this.emit('serverStatusChanged', { serverId, status: 'stopped' });
    } catch (error) {
      instance.status = 'error';
      instance.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('serverStatusChanged', { serverId, status: 'error', error: instance.error });
      throw error;
    }
  }

  public async restartServer(serverId: string): Promise<void> {
    await this.stopServer(serverId);
    await this.startServer(serverId);
  }

  public removeServer(serverId: string): void {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    if (instance.status === 'running') {
      throw new Error(`Cannot remove running server '${serverId}'. Stop it first.`);
    }

    this.servers.delete(serverId);
    this.emit('serverRemoved', { serverId });
  }

  public getServer(serverId: string): ServerInstance | undefined {
    return this.servers.get(serverId);
  }

  public getServers(): ServerInstance[] {
    return Array.from(this.servers.values());
  }

  public getRunningServers(): ServerInstance[] {
    return this.getServers().filter((server) => server.status === 'running');
  }

  // Test Session Management
  public createTestSession(
    id: string,
    name: string,
    description: string,
    serverIds: string[],
    scenarios: string[]
  ): TestSession {
    if (this.sessions.has(id)) {
      throw new Error(`Test session with id '${id}' already exists`);
    }

    // Validate servers exist
    for (const serverId of serverIds) {
      if (!this.servers.has(serverId)) {
        throw new Error(`Server '${serverId}' not found`);
      }
    }

    const session: TestSession = {
      id,
      name,
      description,
      servers: serverIds,
      scenarios,
      status: 'inactive'
    };

    this.sessions.set(id, session);
    this.emit('sessionCreated', { sessionId: id, session });

    return session;
  }

  public async startTestSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Test session '${sessionId}' not found`);
    }

    if (session.status === 'active') {
      return;
    }

    // Start all servers for this session
    for (const serverId of session.servers) {
      await this.startServer(serverId);
    }

    session.status = 'active';
    session.startTime = new Date();
    this.activeSession = sessionId;

    this.emit('sessionStarted', { sessionId, session });
  }

  public async stopTestSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Test session '${sessionId}' not found`);
    }

    if (session.status !== 'active') {
      return;
    }

    session.status = 'completed';
    session.endTime = new Date();

    if (this.activeSession === sessionId) {
      this.activeSession = null;
    }

    this.emit('sessionStopped', { sessionId, session });
  }

  public getTestSession(sessionId: string): TestSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getTestSessions(): TestSession[] {
    return Array.from(this.sessions.values());
  }

  public getActiveTestSession(): TestSession | null {
    return this.activeSession ? this.sessions.get(this.activeSession) || null : null;
  }

  // Scenario Management
  public applyScenario(serverId: string, scenarioId: string): void {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    instance.server.setScenario(scenarioId);
    this.emit('scenarioApplied', { serverId, scenarioId });
  }

  public getAvailableScenarios(serverId: string): TestScenario[] {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    return instance.server.getScenarios();
  }

  // Testing Utilities
  public simulateNetworkIssue(serverId: string, duration: number = 5000): void {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    instance.server.simulateNetworkIssue(duration);
    this.emit('networkIssueSimulated', { serverId, duration });
  }

  public simulateServerOverload(serverId: string): void {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    instance.server.simulateServerOverload();
    this.emit('serverOverloadSimulated', { serverId });
  }

  // Statistics and Monitoring
  public getServerStats(serverId: string) {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server '${serverId}' not found`);
    }

    return instance.server.getStats();
  }

  public getAllServerStats() {
    const stats: Record<string, unknown> = {};
    this.servers.forEach((instance, serverId) => {
      stats[serverId] = {
        ...instance.server.getStats(),
        status: instance.status,
        uptime: instance.server.getUptime()
      };
    });
    return stats;
  }

  // Predefined Test Configurations
  public createEchoTestEnvironment(): void {
    this.createServer('echo', 'Echo Server', {
      port: 9999,
      protocol: 'echo',
      latency: 50,
      errorRate: 0
    });
  }

  public createChatTestEnvironment(): void {
    this.createServer('chat', 'Chat Server', {
      port: 9998,
      protocol: 'chat',
      latency: 100,
      errorRate: 0.05,
      maxConnections: 100
    });
  }

  public createReliabilityTestEnvironment(): void {
    this.createServer('unreliable', 'Unreliable Server', {
      port: 9997,
      protocol: 'unreliable',
      latency: 200,
      errorRate: 0.3
    });

    this.createServer('slow', 'Slow Server', {
      port: 9996,
      protocol: 'slow',
      latency: 5000,
      errorRate: 0.1
    });
  }

  public createPerformanceTestEnvironment(): void {
    this.createServer('performance', 'Performance Server', {
      port: 9995,
      protocol: 'performance',
      latency: 10,
      errorRate: 0,
      maxConnections: 1000,
      messageBufferSize: 10000
    });
  }

  public createComprehensiveTestEnvironment(): void {
    this.createEchoTestEnvironment();
    this.createChatTestEnvironment();
    this.createReliabilityTestEnvironment();
    this.createPerformanceTestEnvironment();
  }

  // Event Handling
  public on(event: string, handler: (data: unknown) => void): void {
    this.eventHandlers.set(event, handler);
  }

  public off(event: string): void {
    this.eventHandlers.delete(event);
  }

  private emit(event: string, data: unknown): void {
    const handler = this.eventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  private setupServerEventHandlers(instance: ServerInstance): void {
    const { server } = instance;

    server.on('serverStarted', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'started', data });
    });

    server.on('serverStopped', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'stopped', data });
    });

    server.on('connectionCreated', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'connectionCreated', data });
    });

    server.on('connectionClosed', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'connectionClosed', data });
    });

    server.on('messageReceived', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'messageReceived', data });
    });

    server.on('messageSent', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'messageSent', data });
    });

    server.on('errorOccurred', (data) => {
      this.emit('serverEvent', { serverId: instance.id, event: 'errorOccurred', data });
    });
  }

  // Cleanup
  public async shutdown(): Promise<void> {
    const runningServers = this.getRunningServers();
    await Promise.all(runningServers.map((server) => this.stopServer(server.id)));

    this.servers.clear();
    this.sessions.clear();
    this.eventHandlers.clear();
    this.activeSession = null;

    this.emit('managerShutdown', {});
  }
}

// Singleton instance for global access
export const testServerManager = new WebSocketTestServerManager();
