<script>
  let selectedTab = $state('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🧪' },
    { id: 'environment', label: 'Test Environment', icon: '⚙️' },
    { id: 'scenarios', label: 'Test Scenarios', icon: '📋' },
    { id: 'evaluation', label: 'Evaluation', icon: '📊' }
  ];

  const testingFeatures = [
    {
      title: 'Mock WebSocket Servers',
      description: 'Simulate various WebSocket server behaviors for comprehensive testing',
      icon: '🖥️',
      status: 'available'
    },
    {
      title: 'Protocol Testing',
      description: 'Test different WebSocket subprotocols and message formats',
      icon: '📡',
      status: 'available'
    },
    {
      title: 'Connection Failure Simulation',
      description: 'Test how your application handles various connection failures',
      icon: '⚠️',
      status: 'available'
    },
    {
      title: 'Performance Testing',
      description: 'Benchmark WebSocket performance with various message patterns',
      icon: '⚡',
      status: 'available'
    },
    {
      title: 'Coverage Analysis',
      description: 'Analyze test coverage and identify untested code paths',
      icon: '📈',
      status: 'available'
    }
  ];
</script>

<svelte:head>
  <title>Phase 3: Testing & Evaluation - WebSocket Learning</title>
  <meta
    name="description"
    content="Learn WebSocket testing with mock servers, test scenarios, and comprehensive evaluation tools"
  />
</svelte:head>

<div class="phase3-container">
  <header class="phase-header">
    <div class="phase-badge">
      <span class="phase-number">3</span>
      <span class="phase-title">Testing & Evaluation</span>
    </div>
    <h1>WebSocket Testing Infrastructure</h1>
    <p class="phase-description">
      Master WebSocket testing with mock servers, comprehensive test scenarios, and evaluation
      tools. This phase focuses on quality assurance and testing methodologies for WebSocket
      applications.
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
            <li>Understand WebSocket testing strategies and best practices</li>
            <li>Learn to create and use mock WebSocket servers</li>
            <li>Master testing different WebSocket protocols and failure scenarios</li>
            <li>Implement comprehensive test coverage for WebSocket applications</li>
            <li>Evaluate WebSocket performance and connection reliability</li>
          </ul>
        </div>

        <div class="testing-features">
          <h2>Testing Features</h2>
          <div class="features-grid">
            {#each testingFeatures as feature (feature.title)}
              <div class="feature-card">
                <div class="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span class="feature-status status-{feature.status}">{feature.status}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="quick-start">
          <h2>Quick Start</h2>
          <div class="quick-start-grid">
            <a href="/phase3/test-environment" class="quick-start-card">
              <div class="card-icon">⚙️</div>
              <h3>Setup Test Environment</h3>
              <p>Configure mock servers and testing infrastructure</p>
            </a>
            <a href="/phase3/test-scenarios" class="quick-start-card">
              <div class="card-icon">📋</div>
              <h3>Explore Test Scenarios</h3>
              <p>Browse and run predefined WebSocket test scenarios</p>
            </a>
            <a href="/phase3/evaluation" class="quick-start-card">
              <div class="card-icon">📊</div>
              <h3>Evaluate Results</h3>
              <p>Analyze test results and coverage metrics</p>
            </a>
          </div>
        </div>
      </section>
    {:else if selectedTab === 'environment'}
      <section class="environment-section">
        <h2>Test Environment Setup</h2>
        <p>Configure your testing environment with mock servers and testing tools.</p>
        <a href="/phase3/test-environment" class="cta-button"> Setup Test Environment → </a>
      </section>
    {:else if selectedTab === 'scenarios'}
      <section class="scenarios-section">
        <h2>Test Scenarios</h2>
        <p>Explore comprehensive test scenarios for WebSocket applications.</p>
        <a href="/phase3/test-scenarios" class="cta-button"> Browse Test Scenarios → </a>
      </section>
    {:else if selectedTab === 'evaluation'}
      <section class="evaluation-section">
        <h2>Test Evaluation</h2>
        <p>Analyze test results, coverage metrics, and performance data.</p>
        <a href="/phase3/evaluation" class="cta-button"> View Evaluation Dashboard → </a>
      </section>
    {/if}
  </main>
</div>

<style>
  .phase3-container {
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

  .testing-features {
    margin-bottom: 3rem;
  }

  .testing-features h2 {
    color: #1a1a1a;
    margin-bottom: 1.5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    position: relative;
    transition: transform 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-2px);
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    color: #1a1a1a;
    margin: 0 0 0.5rem 0;
  }

  .feature-card p {
    color: #666;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .feature-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-available {
    background: #d4edda;
    color: #155724;
  }

  .quick-start h2 {
    color: #1a1a1a;
    margin-bottom: 1.5rem;
  }

  .quick-start-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .quick-start-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: transform 0.2s;
    text-align: center;
  }

  .quick-start-card:hover {
    transform: translateY(-3px);
  }

  .quick-start-card .card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .quick-start-card h3 {
    color: white;
    margin: 0 0 0.5rem 0;
  }

  .quick-start-card p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    line-height: 1.4;
  }

  .cta-button {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
    margin-top: 1rem;
  }

  .cta-button:hover {
    background: #5a67d8;
  }

  @media (max-width: 768px) {
    .phase3-container {
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

    .features-grid,
    .quick-start-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
