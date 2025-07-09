<script lang="ts">
  let selectedTab = $state('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🚀' },
    { id: 'deployment', label: 'Deployment', icon: '☁️' },
    { id: 'applications', label: 'Applications', icon: '📱' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' }
  ];

  const deploymentTargets = [
    {
      name: 'Vercel',
      description: 'Deploy WebSocket applications with Vercel Functions',
      icon: '▲',
      features: ['Edge Functions', 'Serverless WebSocket', 'Global CDN', 'Auto-scaling'],
      status: 'ready'
    },
    {
      name: 'Railway',
      description: 'Full-stack deployment with persistent WebSocket connections',
      icon: '🚂',
      features: ['Persistent connections', 'Docker support', 'Database integration', 'Monitoring'],
      status: 'ready'
    },
    {
      name: 'Cloudflare',
      description: 'Edge computing with Durable Objects for WebSocket',
      icon: '☁️',
      features: ['Durable Objects', 'Workers', 'Global network', 'DDoS protection'],
      status: 'coming-soon'
    }
  ];

  const applications = [
    {
      id: 'chat-app',
      name: 'Real-time Chat Application',
      description: 'Production-ready chat with user authentication and message history',
      technologies: ['SvelteKit', 'WebSocket', 'Redis', 'PostgreSQL'],
      features: [
        'User authentication',
        'Message persistence',
        'Real-time typing indicators',
        'File sharing'
      ]
    },
    {
      id: 'collaborative-editor',
      name: 'Collaborative Text Editor',
      description: 'Multi-user document editing with conflict resolution',
      technologies: ['SvelteKit', 'Y.js', 'WebSocket', 'CRDT'],
      features: [
        'Real-time collaboration',
        'Conflict resolution',
        'Version history',
        'Offline support'
      ]
    },
    {
      id: 'live-dashboard',
      name: 'Live Analytics Dashboard',
      description: 'Real-time data visualization and monitoring',
      technologies: ['SvelteKit', 'WebSocket', 'Chart.js', 'TimescaleDB'],
      features: ['Live data streaming', 'Interactive charts', 'Alert system', 'Data export']
    }
  ];
</script>

<svelte:head>
  <title>Phase 4: Production Development - WebSocket Learning</title>
  <meta
    name="description"
    content="Deploy production-ready WebSocket applications with cloud platforms and monitoring"
  />
</svelte:head>

<div class="phase4-container">
  <header class="phase-header">
    <div class="phase-badge">
      <span class="phase-number">4</span>
      <span class="phase-title">Production Development</span>
    </div>
    <h1>Production WebSocket Deployment</h1>
    <p class="phase-description">
      Deploy and scale WebSocket applications in production environments. Learn cloud deployment,
      monitoring, and building real-world applications.
    </p>
  </header>

  <nav class="phase-nav">
    {#each tabs as tab (tab.id)}
      <button
        class="nav-tab"
        class:active={selectedTab === tab.id}
        onclick={() => (selectedTab = tab.id)}
      >
        <span class="tab-icon">{tab.icon}</span>
        <span class="tab-label">{tab.label}</span>
      </button>
    {/each}
  </nav>

  <main class="phase-content">
    {#if selectedTab === 'overview'}
      <section class="overview-section">
        <div class="learning-objectives">
          <h2>Learning Objectives</h2>
          <ul>
            <li>Deploy WebSocket applications to cloud platforms</li>
            <li>Implement production-grade error handling and monitoring</li>
            <li>Scale WebSocket connections across multiple servers</li>
            <li>Build complete real-world applications</li>
            <li>Optimize performance and security for production</li>
          </ul>
        </div>

        <div class="deployment-targets">
          <h2>Deployment Platforms</h2>
          <div class="targets-grid">
            {#each deploymentTargets as target (target.name)}
              <div class="target-card">
                <div class="target-header">
                  <span class="target-icon">{target.icon}</span>
                  <h3>{target.name}</h3>
                </div>
                <p>{target.description}</p>
                <div class="target-features">
                  {#each target.features as feature, index (index)}
                    <span class="feature-tag">{feature}</span>
                  {/each}
                </div>
                <span class="target-status status-{target.status}">
                  {target.status === 'ready' ? 'Available' : 'Coming Soon'}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <div class="production-checklist">
          <h2>Production Checklist</h2>
          <div class="checklist-items">
            <label class="checklist-item">
              <input type="checkbox" />
              <span>SSL/TLS encryption (WSS)</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Authentication & authorization</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Connection scaling strategy</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Error handling & recovery</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Monitoring & logging</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Performance optimization</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Security hardening</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" />
              <span>Documentation</span>
            </label>
          </div>
        </div>
      </section>
    {:else if selectedTab === 'deployment'}
      <section class="deployment-section">
        <h2>Cloud Deployment Guides</h2>
        <div class="deployment-guides">
          <a href="/phase4/deployment/vercel" class="guide-card">
            <h3>▲ Deploy to Vercel</h3>
            <p>Learn to deploy WebSocket apps with Vercel Functions and Edge runtime</p>
          </a>
          <a href="/phase4/deployment/railway" class="guide-card">
            <h3>🚂 Deploy to Railway</h3>
            <p>Full-stack deployment with persistent connections and databases</p>
          </a>
          <a href="/phase4/deployment/aws" class="guide-card coming-soon">
            <h3>☁️ Deploy to AWS</h3>
            <p>Enterprise deployment with API Gateway and Lambda</p>
            <span class="coming-soon-badge">Coming Soon</span>
          </a>
        </div>
      </section>
    {:else if selectedTab === 'applications'}
      <section class="applications-section">
        <h2>Production Applications</h2>
        <div class="applications-grid">
          {#each applications as app (app.id)}
            <div class="application-card">
              <h3>{app.name}</h3>
              <p>{app.description}</p>

              <div class="app-technologies">
                <h4>Technologies:</h4>
                <div class="tech-tags">
                  {#each app.technologies as tech, index (index)}
                    <span class="tech-tag">{tech}</span>
                  {/each}
                </div>
              </div>

              <div class="app-features">
                <h4>Features:</h4>
                <ul>
                  {#each app.features as feature, index (index)}
                    <li>{feature}</li>
                  {/each}
                </ul>
              </div>

              <div class="app-actions">
                <a href="/phase4/apps/{app.id}" class="btn btn-primary"> View Application </a>
                <a
                  href="https://github.com/yourusername/websocket-practical-guide-apps/{app.id}"
                  class="btn btn-outline"
                >
                  Source Code
                </a>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {:else if selectedTab === 'monitoring'}
      <section class="monitoring-section">
        <h2>Production Monitoring</h2>
        <div class="monitoring-tools">
          <div class="tool-card">
            <h3>📊 Metrics & Analytics</h3>
            <p>Monitor connection counts, message rates, and performance metrics</p>
            <a href="/phase4/monitoring/metrics" class="btn btn-primary">Setup Metrics</a>
          </div>
          <div class="tool-card">
            <h3>🚨 Error Tracking</h3>
            <p>Track and analyze WebSocket errors and connection failures</p>
            <a href="/phase4/monitoring/errors" class="btn btn-primary">Configure Errors</a>
          </div>
          <div class="tool-card">
            <h3>📝 Logging</h3>
            <p>Centralized logging for WebSocket events and debugging</p>
            <a href="/phase4/monitoring/logging" class="btn btn-primary">Setup Logging</a>
          </div>
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
  .phase4-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .phase-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .phase-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .phase-number {
    width: 2rem;
    height: 2rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .phase-title {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .phase-header h1 {
    font-size: 2.5rem;
    margin: 0 0 1rem 0;
    color: #1a1a1a;
  }

  .phase-description {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .phase-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
  }

  .nav-tab {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
    font-weight: 500;
  }

  .nav-tab:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  .nav-tab.active {
    background: #667eea;
    color: white;
  }

  .tab-icon {
    font-size: 1.2rem;
  }

  .phase-content {
    background: white;
    border-radius: 0.5rem;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .learning-objectives {
    margin-bottom: 3rem;
  }

  .learning-objectives h2 {
    color: #1a1a1a;
    margin-bottom: 1rem;
  }

  .learning-objectives ul {
    list-style: none;
    padding: 0;
  }

  .learning-objectives li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
  }

  .learning-objectives li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: 600;
  }

  .deployment-targets {
    margin-bottom: 3rem;
  }

  .deployment-targets h2 {
    color: #1a1a1a;
    margin-bottom: 1.5rem;
  }

  .targets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .target-card {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    position: relative;
  }

  .target-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .target-icon {
    font-size: 1.5rem;
  }

  .target-card h3 {
    margin: 0;
    color: #1a1a1a;
  }

  .target-card p {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .target-features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .feature-tag {
    background: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    color: #495057;
  }

  .target-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-ready {
    background: #d4edda;
    color: #155724;
  }

  .status-coming-soon {
    background: #fff3cd;
    color: #856404;
  }

  .production-checklist h2 {
    color: #1a1a1a;
    margin-bottom: 1.5rem;
  }

  .checklist-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background 0.2s;
  }

  .checklist-item:hover {
    background: #f8f9fa;
  }

  .checklist-item input[type='checkbox'] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }

  .deployment-guides {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .guide-card {
    display: block;
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-decoration: none;
    transition: transform 0.2s;
    position: relative;
  }

  .guide-card:hover {
    transform: translateY(-2px);
  }

  .guide-card h3 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }

  .guide-card p {
    margin: 0;
    color: #666;
    line-height: 1.5;
  }

  .guide-card.coming-soon {
    opacity: 0.7;
    pointer-events: none;
  }

  .coming-soon-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #ffc107;
    color: #856404;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .applications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .application-card {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .application-card h3 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }

  .application-card p {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .app-technologies,
  .app-features {
    margin-bottom: 1rem;
  }

  .app-technologies h4,
  .app-features h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #495057;
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tech-tag {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }

  .app-features ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .app-features li {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .app-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #667eea;
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background: #5a67d8;
  }

  .btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  .monitoring-tools {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .tool-card {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: center;
  }

  .tool-card h3 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }

  .tool-card p {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .phase4-container {
      padding: 1rem;
    }

    .phase-header h1 {
      font-size: 2rem;
    }

    .phase-nav {
      flex-direction: column;
    }

    .nav-tab {
      justify-content: center;
    }

    .targets-grid,
    .deployment-guides,
    .applications-grid,
    .monitoring-tools {
      grid-template-columns: 1fr;
    }

    .checklist-items {
      grid-template-columns: 1fr;
    }
  }
</style>
