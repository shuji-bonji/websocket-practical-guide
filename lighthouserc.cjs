module.exports = {
	ci: {
		collect: {
			url: [
				'http://localhost:4173/',
				'http://localhost:4173/phase1/introduction',
				'http://localhost:4173/phase2/basic-websocket',
				'http://localhost:4173/phase3/mock-server',
				'http://localhost:4173/phase4/production-ready'
			],
			startServerCommand: 'npm run preview',
			startServerReadyPattern: 'Local:   http://localhost:4173/',
			startServerReadyTimeout: 30000,
			numberOfRuns: 3,
			settings: {
				onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
				skipAudits: ['uses-http2', 'is-on-https']
			}
		},
		assert: {
			preset: 'lighthouse:no-pwa',
			assertions: {
				'categories:performance': ['warn', { minScore: 0.8 }],
				'categories:accessibility': ['error', { minScore: 0.9 }],
				'categories:best-practices': ['warn', { minScore: 0.8 }],
				'categories:seo': ['warn', { minScore: 0.8 }],
				'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
				'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
				'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
				'total-blocking-time': ['warn', { maxNumericValue: 300 }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
