# GitHub Repository Configuration

This directory contains GitHub-specific configuration files for the WebSocket Learning project.

## Files Overview

### Branch Protection & Security

- **`BRANCH_PROTECTION.md`** - Documentation for branch protection settings
- **`SETUP_BRANCH_PROTECTION.md`** - Step-by-step setup guide
- **`CODEOWNERS`** - Code ownership configuration

### CI/CD & Automation

- **`workflows/ci.yml`** - Continuous Integration pipeline
- **`workflows/test.yml`** - Comprehensive test suite (existing)
- **`workflows/capacity-management.yml`** - Repository size management (existing)

### Issue & PR Templates

- **`pull_request_template.md`** - Standard PR template
- **`ISSUE_TEMPLATE/bug_report.yml`** - Bug report form
- **`ISSUE_TEMPLATE/feature_request.yml`** - Feature request form

## Quick Setup Checklist

### 1. Enable Branch Protection

Follow the steps in `SETUP_BRANCH_PROTECTION.md`:

1. ✅ Files created in repository
2. ⏳ Configure branch protection in GitHub UI
3. ⏳ Test protection rules
4. ⏳ Verify status checks

### 2. Required Status Checks

The CI workflow provides these status checks:

- `build` - Application builds successfully
- `type-check` - TypeScript compilation passes
- `lint` - ESLint and Prettier checks pass
- `e2e-tests (essential)` - Essential E2E tests pass
- `ci-status` - Overall CI status summary

### 3. Code Review Process

With branch protection enabled:

- All changes require pull requests
- PRs need 1 approval
- All status checks must pass
- Code owners must review relevant changes

## Repository Standards

### Commit Messages

Follow conventional commit format:

```
type(scope): description

feat(phase1): add WebSocket connection demo
fix(tests): resolve timeout issues in CI
docs(readme): update installation instructions
```

### Branch Naming

Use descriptive branch names:

```
feature/websocket-state-visualizer
fix/ci-timeout-issues
docs/branch-protection-setup
refactor/svelte5-migration
```

### Code Quality Gates

All code must pass:

- ✅ TypeScript compilation (`npm run check`)
- ✅ ESLint and Prettier (`npm run lint`)
- ✅ Unit tests (`npm run test:run`)
- ✅ E2E tests (essential subset)
- ✅ Production build (`npm run build`)

## Security Features

### Branch Protection

- 🛡️ Force push protection
- 🛡️ Deletion protection
- 🛡️ Required status checks
- 🛡️ Required code review
- 🛡️ Administrator inclusion

### Automated Security

- 🔒 Dependency vulnerability scanning
- 🔒 File size restrictions (100MB limit)
- 🔒 Code owner review requirements

## Workflow Automation

### On Every Push/PR

1. Build verification
2. Type checking
3. Linting validation
4. Unit test execution
5. Security audit
6. Essential E2E testing

### On Main Branch Changes

- Full test suite execution
- Cross-browser compatibility testing
- Visual regression testing
- Performance benchmarking

## Emergency Procedures

### Bypass Protection (Emergency Only)

1. Go to Repository Settings > Branches
2. Edit the protection rule
3. Temporarily uncheck "Include administrators"
4. Make emergency changes
5. **Immediately re-enable protection**
6. Document the override in issues

### Hotfix Process

1. Create hotfix branch from main
2. Make minimal necessary changes
3. Create PR with "HOTFIX" label
4. Get expedited review
5. Merge after all checks pass

## Maintenance

### Monthly Reviews

- [ ] Review protection settings
- [ ] Update required status checks
- [ ] Verify code owners list
- [ ] Check workflow performance
- [ ] Update documentation

### Quarterly Updates

- [ ] Review and update templates
- [ ] Assess new security features
- [ ] Update CI/CD dependencies
- [ ] Performance optimization

## Support & Documentation

### Getting Help

- 📖 Read setup guides in this directory
- 🐛 File issues using provided templates
- 💡 Submit feature requests through templates
- 🔧 Check Actions tab for CI/CD issues

### Learning Resources

- **Branch Protection**: GitHub Docs on branch protection
- **Status Checks**: GitHub Actions documentation
- **Code Owners**: CODEOWNERS file documentation
- **Security**: Repository security best practices

## Educational Value

This configuration demonstrates:

- **Professional Git workflows**
- **CI/CD best practices**
- **Code quality automation**
- **Collaborative development**
- **Security-first approach**

These practices prepare developers for professional software development environments and establish a foundation for scaling the WebSocket learning project.
