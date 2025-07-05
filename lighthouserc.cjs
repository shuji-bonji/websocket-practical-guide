module.exports = {
	ci: {
		collect: {
			url: [
				'http://localhost:4173/',
				'http://localhost:4173/phase1/introduction',
				'http://localhost:4173/phase1/websocket-states',
				'http://localhost:4173/phase2',
				'http://localhost:4173/phase3',
				'http://localhost:4173/phase4'
			],
			startServerCommand: 'npm run preview',
			startServerReadyPattern: 'Local:   http://localhost:4173/',
			startServerReadyTimeout: 30000,
			numberOfRuns: 3,
			settings: {
				onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
				skipAudits: [
					'uses-http2',
					'is-on-https',
					'color-contrast',
					'link-name',
					'heading-order',
					'link-in-text-block',
					'errors-in-console',
					'network-dependency-tree-insight',
					'forced-reflow-insight',
					'dom-size-insight',
					'render-blocking-insight',
					'render-blocking-resources',
					'unused-javascript'
				]
			}
		},
		assert: {
			assertions: {
				'categories:performance': ['warn', { minScore: 0.7 }],
				'categories:accessibility': ['warn', { minScore: 0.8 }],
				'categories:best-practices': ['warn', { minScore: 0.7 }],
				'categories:seo': ['warn', { minScore: 0.7 }],
				// More lenient thresholds for development
				'first-contentful-paint': ['warn', { maxNumericValue: 4000 }],
				'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
				'cumulative-layout-shift': ['warn', { maxNumericValue: 0.2 }],
				'total-blocking-time': ['warn', { maxNumericValue: 500 }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
