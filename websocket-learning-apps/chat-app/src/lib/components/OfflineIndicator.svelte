<!-- Offline Indicator Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { isOnline, listenForNetworkChanges } from '$lib/pwa/service-worker';

	let online = $state(true);
	let showOfflineMessage = $state(false);
	let offlineStartTime = 0;

	onMount(() => {
		// Check initial online status
		online = isOnline();

		// Listen for network changes
		listenForNetworkChanges(
			() => {
				online = true;
				showOfflineMessage = false;

				// Show reconnection message briefly
				if (offlineStartTime > 0) {
					const offlineDuration = Date.now() - offlineStartTime;
					console.log(`[PWA] Back online after ${Math.round(offlineDuration / 1000)}s`);
					showReconnectedMessage();
				}
			},
			() => {
				online = false;
				offlineStartTime = Date.now();

				// Show offline message after a short delay
				setTimeout(() => {
					if (!online) {
						showOfflineMessage = true;
					}
				}, 2000);
			}
		);

		// Initial check for offline state
		if (!online) {
			setTimeout(() => {
				if (!online) {
					showOfflineMessage = true;
				}
			}, 1000);
		}
	});

	function showReconnectedMessage() {
		// Create a temporary "back online" notification
		const notification = document.createElement('div');
		notification.textContent = '🟢 Back online';
		notification.style.cssText = `
			position: fixed;
			top: 1rem;
			left: 50%;
			transform: translateX(-50%);
			background: #059669;
			color: white;
			padding: 0.5rem 1rem;
			border-radius: 6px;
			font-size: 0.875rem;
			font-weight: 500;
			z-index: 1002;
			animation: slideDown 0.3s ease-out;
		`;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.style.animation = 'slideUp 0.3s ease-out forwards';
			setTimeout(() => {
				document.body.removeChild(notification);
			}, 300);
		}, 2000);
	}

	function dismissOfflineMessage() {
		showOfflineMessage = false;
	}
</script>

{#if showOfflineMessage && !online}
	<div class="offline-indicator">
		<div class="offline-content">
			<div class="offline-icon">📡</div>

			<div class="offline-text">
				<h3>You're Offline</h3>
				<p>Check your internet connection. Messages will sync when you're back online.</p>
			</div>

			<button
				onclick={dismissOfflineMessage}
				class="dismiss-btn"
				aria-label="Dismiss offline notification"
			>
				✕
			</button>
		</div>

		<div class="offline-status">
			<div class="status-dot offline"></div>
			<span>No internet connection</span>
		</div>
	</div>
{/if}

<!-- Minimal status indicator when online -->
{#if online}
	<div class="online-indicator">
		<div class="status-dot online"></div>
	</div>
{/if}

<style>
	.offline-indicator {
		position: fixed;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 12px;
		z-index: 1001;
		animation: slideDown 0.3s ease-out;
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(0);
			opacity: 1;
		}
		to {
			transform: translateY(-100%);
			opacity: 0;
		}
	}

	.offline-content {
		display: flex;
		align-items: flex-start;
		padding: 1rem;
		gap: 1rem;
	}

	.offline-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.offline-text {
		flex: 1;
		min-width: 0;
	}

	.offline-text h3 {
		margin: 0 0 0.25rem 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: #92400e;
	}

	.offline-text p {
		margin: 0;
		font-size: 0.825rem;
		color: #b45309;
		line-height: 1.4;
	}

	.dismiss-btn {
		background: transparent;
		border: none;
		color: #b45309;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: background-color 0.2s;
		flex-shrink: 0;
		font-size: 0.875rem;
		line-height: 1;
	}

	.dismiss-btn:hover {
		background: rgba(180, 83, 9, 0.1);
	}

	.offline-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid #f59e0b;
		background: rgba(245, 158, 11, 0.05);
		border-radius: 0 0 12px 12px;
		font-size: 0.8rem;
		color: #b45309;
		font-weight: 500;
	}

	.online-indicator {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 100;
		pointer-events: none;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
		animation: pulse 2s infinite;
	}

	.status-dot.online {
		background: #10b981;
	}

	.status-dot.offline {
		background: #ef4444;
		animation: blink 1s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0.3;
		}
	}

	/* Mobile responsive adjustments */
	@media (max-width: 640px) {
		.offline-indicator {
			top: 0.5rem;
			left: 0.5rem;
			right: 0.5rem;
		}

		.offline-content {
			padding: 0.875rem;
		}

		.offline-text h3 {
			font-size: 0.9rem;
		}

		.offline-text p {
			font-size: 0.8rem;
		}

		.offline-status {
			padding: 0.625rem 0.875rem;
			font-size: 0.75rem;
		}

		.online-indicator {
			bottom: 0.5rem;
			right: 0.5rem;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.offline-indicator {
			border-width: 2px;
		}

		.status-dot.online {
			border: 2px solid #065f46;
		}

		.status-dot.offline {
			border: 2px solid #991b1b;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.offline-indicator {
			animation: none;
		}

		.status-dot {
			animation: none;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.offline-indicator {
			background: #451a03;
			border-color: #f59e0b;
		}

		.offline-text h3 {
			color: #fbbf24;
		}

		.offline-text p {
			color: #fcd34d;
		}

		.dismiss-btn {
			color: #fcd34d;
		}

		.dismiss-btn:hover {
			background: rgba(252, 211, 77, 0.1);
		}

		.offline-status {
			border-color: #f59e0b;
			background: rgba(245, 158, 11, 0.1);
			color: #fcd34d;
		}
	}
</style>
