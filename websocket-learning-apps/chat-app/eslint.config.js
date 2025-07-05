import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module'
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				URL: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'no-console': 'off',
			'no-inner-declarations': 'off'
		}
	},
	{
		files: ['**/*.svelte', 'src/**/*.ts'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.svelte']
			},
			globals: {
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
				fetch: 'readonly',
				WebSocket: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				KeyboardEvent: 'readonly',
				ClipboardEvent: 'readonly',
				HTMLElement: 'readonly',
				HTMLTextAreaElement: 'readonly',
				NodeJS: 'readonly',
				$state: 'readonly',
				$derived: 'readonly',
				$effect: 'readonly',
				$props: 'readonly',
				// Browser APIs for PWA
				navigator: 'readonly',
				ServiceWorkerRegistration: 'readonly',
				Event: 'readonly',
				CustomEvent: 'readonly',
				Notification: 'readonly',
				NotificationOptions: 'readonly',
				Window: 'readonly'
			}
		},
		plugins: {
			svelte,
			'@typescript-eslint': ts
		},
		rules: {
			...svelte.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'no-inner-declarations': 'off',
			'no-unused-vars': 'off',
			'svelte/valid-compile': 'warn'
		}
	},
	{
		files: ['static/sw.js', '**/sw.js'],
		languageOptions: {
			globals: {
				console: 'readonly',
				self: 'readonly',
				caches: 'readonly',
				fetch: 'readonly',
				Response: 'readonly',
				clients: 'readonly',
				location: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				Promise: 'readonly',
				JSON: 'readonly',
				Date: 'readonly',
				URL: 'readonly'
			}
		},
		rules: {
			'no-undef': 'error',
			'no-unused-vars': 'error'
		}
	},
	{
		ignores: [
			'**/.DS_Store',
			'**/node_modules',
			'build',
			'.svelte-kit',
			'package',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock',
			'.vercel/**/*',
			'server/dist/**/*'
		]
	},
	prettier
];
