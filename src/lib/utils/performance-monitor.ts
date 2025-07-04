/**
 * Performance monitoring utilities for WebSocket operations
 */

export interface PerformanceMetric {
	name: string;
	value: number;
	unit: 'ms' | 'bytes' | 'count' | 'percentage';
	timestamp: number;
}

export interface PerformanceSnapshot {
	timestamp: number;
	metrics: Record<string, PerformanceMetric>;
}

/**
 * WebSocket Performance Monitor
 * Tracks and analyzes WebSocket connection performance
 */
export class WebSocketPerformanceMonitor {
	private metrics: Map<string, PerformanceMetric[]> = new Map();
	private marks: Map<string, number> = new Map();
	private enabled: boolean;

	constructor(enabled = true) {
		this.enabled = enabled && typeof performance !== 'undefined';
	}

	/**
	 * Start timing an operation
	 */
	startTimer(name: string): void {
		if (!this.enabled) return;
		this.marks.set(name, performance.now());
	}

	/**
	 * End timing and record the duration
	 */
	endTimer(name: string): number {
		if (!this.enabled) return 0;

		const startTime = this.marks.get(name);
		if (!startTime) {
			console.warn(`No start time found for timer: ${name}`);
			return 0;
		}

		const duration = performance.now() - startTime;
		this.marks.delete(name);

		this.recordMetric({
			name: `${name}_duration`,
			value: duration,
			unit: 'ms',
			timestamp: Date.now()
		});

		return duration;
	}

	/**
	 * Record a performance metric
	 */
	recordMetric(metric: PerformanceMetric): void {
		if (!this.enabled) return;

		const metrics = this.metrics.get(metric.name) || [];
		metrics.push(metric);

		// Keep only last 100 metrics per name to prevent memory issues
		if (metrics.length > 100) {
			metrics.shift();
		}

		this.metrics.set(metric.name, metrics);
	}

	/**
	 * Get average value for a metric
	 */
	getAverage(metricName: string): number | null {
		const metrics = this.metrics.get(metricName);
		if (!metrics || metrics.length === 0) return null;

		const sum = metrics.reduce((acc, m) => acc + m.value, 0);
		return sum / metrics.length;
	}

	/**
	 * Get percentile value for a metric
	 */
	getPercentile(metricName: string, percentile: number): number | null {
		const metrics = this.metrics.get(metricName);
		if (!metrics || metrics.length === 0) return null;

		const sorted = [...metrics].sort((a, b) => a.value - b.value);
		const index = Math.floor((percentile / 100) * (sorted.length - 1));
		return sorted[index].value;
	}

	/**
	 * Get current performance snapshot
	 */
	getSnapshot(): PerformanceSnapshot {
		const snapshot: PerformanceSnapshot = {
			timestamp: Date.now(),
			metrics: {}
		};

		for (const [name, metrics] of this.metrics.entries()) {
			if (metrics.length === 0) continue;

			const latest = metrics[metrics.length - 1];
			snapshot.metrics[name] = latest;
		}

		return snapshot;
	}

	/**
	 * Get performance summary
	 */
	getSummary(): Record<
		string,
		{
			count: number;
			average: number | null;
			min: number;
			max: number;
			p50: number | null;
			p95: number | null;
			p99: number | null;
			unit: string;
		}
	> {
		const summary: Record<
			string,
			{
				count: number;
				average: number | null;
				min: number;
				max: number;
				p50: number | null;
				p95: number | null;
				p99: number | null;
				unit: string;
			}
		> = {};

		for (const [name, metrics] of this.metrics.entries()) {
			if (metrics.length === 0) continue;

			const values = metrics.map((m) => m.value);

			summary[name] = {
				count: metrics.length,
				average: this.getAverage(name),
				min: Math.min(...values),
				max: Math.max(...values),
				p50: this.getPercentile(name, 50),
				p95: this.getPercentile(name, 95),
				p99: this.getPercentile(name, 99),
				unit: metrics[0].unit
			};
		}

		return summary;
	}

	/**
	 * Clear all metrics
	 */
	clear(): void {
		this.metrics.clear();
		this.marks.clear();
	}

	/**
	 * Enable or disable monitoring
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled && typeof performance !== 'undefined';
	}
}

/**
 * WebSocket-specific performance metrics
 */
export class WebSocketMetrics {
	private monitor: WebSocketPerformanceMonitor;
	private connectionStartTime: number | null = null;
	private messageTimestamps: number[] = [];

	constructor(monitor: WebSocketPerformanceMonitor) {
		this.monitor = monitor;
	}

	/**
	 * Track connection establishment time
	 */
	onConnectionStart(): void {
		this.connectionStartTime = Date.now();
		this.monitor.startTimer('connection_establishment');
	}

	/**
	 * Track successful connection
	 */
	onConnectionOpen(): void {
		this.monitor.endTimer('connection_establishment');

		if (this.connectionStartTime) {
			this.monitor.recordMetric({
				name: 'connection_time',
				value: Date.now() - this.connectionStartTime,
				unit: 'ms',
				timestamp: Date.now()
			});
		}
	}

	/**
	 * Track message send
	 */
	onMessageSend(size: number): void {
		this.monitor.recordMetric({
			name: 'message_size_sent',
			value: size,
			unit: 'bytes',
			timestamp: Date.now()
		});

		this.monitor.startTimer(`message_${Date.now()}`);
	}

	/**
	 * Track message receive
	 */
	onMessageReceive(size: number): void {
		this.monitor.recordMetric({
			name: 'message_size_received',
			value: size,
			unit: 'bytes',
			timestamp: Date.now()
		});

		// Calculate message rate
		const now = Date.now();
		this.messageTimestamps.push(now);

		// Keep only messages from last 10 seconds
		const cutoff = now - 10000;
		this.messageTimestamps = this.messageTimestamps.filter((ts) => ts > cutoff);

		const messageRate = this.messageTimestamps.length / 10; // messages per second
		this.monitor.recordMetric({
			name: 'message_rate',
			value: messageRate,
			unit: 'count',
			timestamp: now
		});
	}

	/**
	 * Track round-trip time (ping-pong)
	 */
	onPingSent(id: string): void {
		this.monitor.startTimer(`ping_${id}`);
	}

	onPongReceived(id: string): void {
		const rtt = this.monitor.endTimer(`ping_${id}`);

		this.monitor.recordMetric({
			name: 'round_trip_time',
			value: rtt,
			unit: 'ms',
			timestamp: Date.now()
		});
	}

	/**
	 * Track connection errors
	 */
	onError(): void {
		this.monitor.recordMetric({
			name: 'error_count',
			value: 1,
			unit: 'count',
			timestamp: Date.now()
		});
	}

	/**
	 * Get WebSocket performance report
	 */
	getReport(): {
		connectionMetrics: {
			averageConnectionTime: number;
			connectionAttempts: number;
		};
		messageMetrics: {
			totalSent: number;
			totalReceived: number;
			averageSendSize: number;
			averageReceiveSize: number;
			messageRate: number;
		};
		latencyMetrics: {
			averageRTT: number;
			p95RTT: number;
			p99RTT: number;
		};
		reliability: number;
	} {
		const summary = this.monitor.getSummary();

		const errorCount = summary.error_count?.count || 0;
		const messageCount =
			(summary.message_size_sent?.count || 0) + (summary.message_size_received?.count || 0);

		const reliability = messageCount > 0 ? ((messageCount - errorCount) / messageCount) * 100 : 100;

		return {
			connectionMetrics: {
				averageConnectionTime: summary.connection_time?.average || 0,
				connectionAttempts: summary.connection_establishment_duration?.count || 0
			},
			messageMetrics: {
				totalSent: summary.message_size_sent?.count || 0,
				totalReceived: summary.message_size_received?.count || 0,
				averageSendSize: summary.message_size_sent?.average || 0,
				averageReceiveSize: summary.message_size_received?.average || 0,
				messageRate: summary.message_rate?.average || 0
			},
			latencyMetrics: {
				averageRTT: summary.round_trip_time?.average || 0,
				p95RTT: summary.round_trip_time?.p95 || 0,
				p99RTT: summary.round_trip_time?.p99 || 0
			},
			reliability
		};
	}
}

/**
 * Create a performance monitor for WebSocket connections
 */
export function createWebSocketPerformanceMonitor(): {
	monitor: WebSocketPerformanceMonitor;
	metrics: WebSocketMetrics;
} {
	const monitor = new WebSocketPerformanceMonitor();
	const metrics = new WebSocketMetrics(monitor);

	return { monitor, metrics };
}
