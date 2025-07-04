import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Test environment
		environment: 'jsdom',

		// Global test setup
		globals: true,
		setupFiles: ['./src/test/setup.ts'],

		// Include test files
		include: ['src/**/*.{test,spec}.{js,ts}'],

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'src/test/',
				'tests/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/.{eslint,prettier}rc.{js,cjs,yml}',
				'**/vite.config.*',
				'**/vitest.config.*',
				'**/playwright.config.*'
			],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80
				}
			}
		},

		// Test timeout for WebSocket operations
		testTimeout: 10000,
		hookTimeout: 10000,

		// Mock timers configuration
		unstubGlobals: true,
		restoreMocks: true
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$app: path.resolve('./src/app')
		}
	}
});
