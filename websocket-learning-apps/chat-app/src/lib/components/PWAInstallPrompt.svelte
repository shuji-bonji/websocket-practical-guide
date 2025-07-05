<!-- PWA Install Prompt Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { installPWA, canInstall, isStandalone } from '$lib/pwa/service-worker';

	let showInstallPrompt = $state(false);
	let isInstalling = $state(false);
	let standalone = $state(false);

	onMount(() => {
		// Check if running in standalone mode
		standalone = isStandalone();

		// Listen for install prompt availability
		window.addEventListener('pwa-install-available', () => {
			if (!standalone) {
				showInstallPrompt = true;
			}
		});

		// Listen for app installation
		window.addEventListener('pwa-installed', () => {
			showInstallPrompt = false;
			standalone = true;
		});

		// Initial check for install availability
		if (canInstall() && !standalone) {
			showInstallPrompt = true;
		}
	});

	async function handleInstall() {
		isInstalling = true;

		try {
			const installed = await installPWA();
			if (installed) {
				showInstallPrompt = false;
				standalone = true;
			}
		} catch (error) {
			console.error('Installation failed:', error);
		} finally {
			isInstalling = false;
		}
	}

	function dismissPrompt() {
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt && !standalone}
	<div class="pwa-install-prompt">
		<div class="install-content">
			<div class="install-icon">📱</div>

			<div class="install-text">
				<h3>Install Chat App</h3>
				<p>Add to your home screen for a better experience!</p>
			</div>

			<div class="install-actions">
				<button
					onclick={handleInstall}
					disabled={isInstalling}
					class="install-btn"
					aria-label="Install PWA"
				>
					{#if isInstalling}
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
						Installing...
					{:else}
						Install
					{/if}
				</button>

				<button onclick={dismissPrompt} class="dismiss-btn" aria-label="Dismiss install prompt">
					✕
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.pwa-install-prompt {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		right: 1rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		border: 1px solid #e5e7eb;
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.install-content {
		display: flex;
		align-items: center;
		padding: 1rem;
		gap: 1rem;
	}

	.install-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.install-text {
		flex: 1;
		min-width: 0;
	}

	.install-text h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.install-text p {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.install-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.install-btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 80px;
		justify-content: center;
	}

	.install-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.install-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.dismiss-btn {
		background: #f3f4f6;
		color: #6b7280;
		border: none;
		border-radius: 6px;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background-color 0.2s;
		font-size: 0.875rem;
	}

	.dismiss-btn:hover {
		background: #e5e7eb;
		color: #374151;
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
		.pwa-install-prompt {
			left: 0.5rem;
			right: 0.5rem;
			bottom: 0.5rem;
		}

		.install-content {
			padding: 0.875rem;
		}

		.install-text h3 {
			font-size: 0.925rem;
		}

		.install-text p {
			font-size: 0.8rem;
		}

		.install-btn {
			padding: 0.45rem 0.875rem;
			font-size: 0.8rem;
			min-width: 70px;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.pwa-install-prompt {
			background: #1f2937;
			border-color: #374151;
		}

		.install-text h3 {
			color: #f9fafb;
		}

		.install-text p {
			color: #d1d5db;
		}

		.dismiss-btn {
			background: #374151;
			color: #d1d5db;
		}

		.dismiss-btn:hover {
			background: #4b5563;
			color: #f9fafb;
		}
	}
</style>
