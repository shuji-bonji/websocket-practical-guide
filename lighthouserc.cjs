module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/websocket-practical-guide/',
        'http://localhost:4173/websocket-practical-guide/phase1/introduction/',
        'http://localhost:4173/websocket-practical-guide/phase1/websocket-states/',
        'http://localhost:4173/websocket-practical-guide/phase2/',
        'http://localhost:4173/websocket-practical-guide/phase3/',
        'http://localhost:4173/websocket-practical-guide/phase4/'
      ],
      startServerCommand: 'npm run preview -- --host',
      startServerReadyPattern: 'Local:.*http://localhost:4173',
      startServerReadyTimeout: 30000,
      numberOfRuns: 1,
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
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['warn', { minScore: 0.7 }],
        'categories:best-practices': ['warn', { minScore: 0.6 }],
        'categories:seo': ['warn', { minScore: 0.6 }],
        // More lenient thresholds for development
        'first-contentful-paint': ['warn', { maxNumericValue: 6000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 8000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.3 }],
        'total-blocking-time': ['warn', { maxNumericValue: 800 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
