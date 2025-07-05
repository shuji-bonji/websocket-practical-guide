<!-- PWA Update Notification Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { applyServiceWorkerUpdate, isUpdateAvailable } from '$lib/pwa/service-worker';

	let showUpdateNotification = $state(false);
	let isUpdating = $state(false);

	onMount(() => {
		// Check if update is already available
		if (isUpdateAvailable()) {
			showUpdateNotification = true;
		}

		// Listen for service worker updates
		window.addEventListener('sw-update-available', () => {
			showUpdateNotification = true;
		});

		// Listen for service worker installation
		window.addEventListener('sw-installed', () => {
			showUpdateNotification = false;
		});
	});

	async function handleUpdate() {
		isUpdating = true;

		try {
			applyServiceWorkerUpdate();
			// The page will reload automatically when the update is applied
		} catch (error) {
			console.error('Update failed:', error);
			isUpdating = false;
		}
	}

	function dismissUpdate() {
		showUpdateNotification = false;
	}
</script>

{#if showUpdateNotification}
	<div class="update-notification">
		<div class="update-content">
			<div class="update-icon">🔄</div>

			<div class="update-text">
				<h3>App Update Available</h3>
				<p>A new version is ready. Update now for the latest features!</p>
			</div>

			<div class="update-actions">
				<button
					onclick={handleUpdate}
					disabled={isUpdating}
					class="update-btn"
					aria-label="Update app"
				>
					{#if isUpdating}
						<svg class="spinner" viewBox="0 0 24 24">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
							<path
								d="M12 2a10 10 0 0 1 10 10"
								stroke="currentColor"
								stroke-width="4"
								fill="none"
								stroke-linecap="round"
							/>
						</svg>
						Updating...
					{:else}
						Update
					{/if}
				</button>

				<button
					onclick={dismissUpdate}
					class="dismiss-btn"
					aria-label="Dismiss update notification"
				>
					Later
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.update-notification {
		position: fixed;
		top: 1rem;
		right: 1rem;
		max-width: 400px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		border: 1px solid #e5e7eb;
		z-index: 1001;
		animation: slideDown 0.3s ease-out;
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

	.update-content {
		display: flex;
		align-items: center;
		padding: 1rem;
		gap: 1rem;
	}

	.update-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.update-text {
		flex: 1;
		min-width: 0;
	}

	.update-text h3 {
		margin: 0 0 0.25rem 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: #1f2937;
	}

	.update-text p {
		margin: 0;
		font-size: 0.825rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.update-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.update-btn {
		background: #059669;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.825rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 80px;
	}

	.update-btn:hover:not(:disabled) {
		background: #047857;
	}

	.update-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.dismiss-btn {
		background: transparent;
		color: #6b7280;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 0.4rem 0.75rem;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.dismiss-btn:hover {
		background: #f3f4f6;
		color: #374151;
		border-color: #9ca3af;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Mobile responsive adjustments */
	@media (max-width: 640px) {
		.update-notification {
			top: 0.5rem;
			right: 0.5rem;
			left: 0.5rem;
			max-width: none;
		}

		.update-content {
			padding: 0.875rem;
		}

		.update-text h3 {
			font-size: 0.9rem;
		}

		.update-text p {
			font-size: 0.8rem;
		}

		.update-actions {
			flex-direction: row;
		}

		.update-btn {
			padding: 0.45rem 0.875rem;
			font-size: 0.8rem;
			min-width: 70px;
		}

		.dismiss-btn {
			padding: 0.45rem 0.75rem;
			font-size: 0.75rem;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.update-notification {
			background: #1f2937;
			border-color: #374151;
		}

		.update-text h3 {
			color: #f9fafb;
		}

		.update-text p {
			color: #d1d5db;
		}

		.dismiss-btn {
			color: #d1d5db;
			border-color: #4b5563;
		}

		.dismiss-btn:hover {
			background: #374151;
			color: #f9fafb;
			border-color: #6b7280;
		}
	}

	/* High contrast accessibility */
	@media (prefers-contrast: high) {
		.update-notification {
			border-width: 2px;
		}

		.update-btn {
			border: 2px solid transparent;
		}

		.update-btn:focus {
			outline: 2px solid #059669;
			outline-offset: 2px;
		}

		.dismiss-btn:focus {
			outline: 2px solid #6b7280;
			outline-offset: 2px;
		}
	}
</style>
