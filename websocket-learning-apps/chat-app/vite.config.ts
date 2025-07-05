import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		host: true
	},
	preview: {
		port: 4173,
		host: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	// PWA Configuration
	build: {
		rollupOptions: {
			output: {
				// Ensure service worker is not bundled
				manualChunks: (id) => {
					if (id.includes('sw.js')) {
						return null;
					}
				}
			}
		}
	}
});
