# GitHub Branch Protection Setup Guide

This guide walks through setting up branch protection rules manually in GitHub after the supporting files have been created.

## Prerequisites

Ensure these files exist in the repository:

- [x] `.github/BRANCH_PROTECTION.md` (documentation)
- [x] `.github/CODEOWNERS` (code ownership)
- [x] `.github/pull_request_template.md` (PR template)
- [x] `.github/workflows/ci.yml` (CI status checks)

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your repository on GitHub
2. Click the **Settings** tab
3. In the left sidebar, click **Branches**

### 2. Add Branch Protection Rule

1. Click **Add rule** button
2. In **Branch name pattern**, enter: `main`

### 3. Configure Protection Settings

#### Pull Request Requirements

✅ **Require a pull request before merging**

- ✅ **Required number of reviews before merging**: `1`
- ✅ **Dismiss stale PR reviews when new commits are pushed**
- ✅ **Require review from code owners**
- ✅ **Restrict pushes that create files larger than 100MB**

#### Status Check Requirements

✅ **Require status checks to pass before merging**

- ✅ **Require branches to be up to date before merging**

**In the status checks search box, add these required checks:**

- `build`
- `type-check`
- `lint`
- `e2e-tests (essential)`
- `ci-status` (summary check)

> **Note**: Status checks will only appear in the list after they've run at least once. You may need to trigger the CI workflow first.

#### Additional Restrictions

✅ **Require conversation resolution before merging**
✅ **Require signed commits** (optional, for enhanced security)
✅ **Restrict pushes that create files larger than 100MB**
✅ **Restrict force pushes**
✅ **Restrict deletions**

#### Rules Applied To Administrators

✅ **Include administrators**

This ensures even repository administrators follow the same rules, promoting consistency.

### 4. Save Protection Rule

Click **Create** to save the branch protection rule.

## Verification Steps

### Test 1: Verify Protection is Active

```bash
# This should be blocked
git push --force origin main
# Expected: Error message about force push being blocked
```

### Test 2: Create Test Pull Request

```bash
# Create a test branch
git checkout -b test-protection-rules
echo "# Test file" > test-protection.md
git add test-protection.md
git commit -m "test: verify branch protection"
git push origin test-protection-rules
```

Then create a PR through GitHub UI and verify:

- Status checks run automatically
- PR requires approval before merging
- All status checks must pass

### Test 3: Verify Status Checks

The CI workflow should provide these status checks:

- ✅ `build` - Application builds successfully
- ✅ `type-check` - TypeScript compilation passes
- ✅ `lint` - ESLint and Prettier checks pass
- ✅ `e2e-tests (essential)` - Essential E2E tests pass
- ✅ `ci-status` - Overall CI status summary

## Troubleshooting

### Status Checks Not Appearing

- Status checks only appear after running at least once
- Push a commit to trigger the CI workflow
- Check Actions tab for workflow execution

### Workflow Failing

- Check the Actions tab for detailed error logs
- Ensure all dependencies are properly installed
- Verify test files are not corrupted

### CODEOWNERS Not Working

- Ensure `CODEOWNERS` file is in `.github/` directory
- Verify username format: `@username`
- Check that the specified users have repository access

### Emergency Access

If you need to bypass protection temporarily:

1. Go to **Settings > Branches**
2. Click **Edit** on the protection rule
3. Temporarily uncheck **Include administrators**
4. Make necessary changes
5. **Immediately re-enable** the protection

## Success Indicators

✅ Repository shows "Protected" badge next to main branch
✅ Force push attempts are blocked
✅ Direct pushes to main are blocked
✅ PRs require approval and passing status checks
✅ Warning "Your main branch isn't protected" disappears

## Maintenance

### Regular Reviews

- Monthly review of protection settings
- Verify status checks are still relevant
- Update required reviewers as team changes

### Adding New Status Checks

1. Add check to CI workflow
2. Let it run once to appear in GitHub
3. Add to required status checks list
4. Update documentation

## Benefits Achieved

🛡️ **Security**: Prevents destructive Git operations
📋 **Quality**: Ensures code review and testing
🤝 **Collaboration**: Enforces peer review process
🚀 **Reliability**: Only tested code reaches main branch
📖 **Educational**: Demonstrates professional Git workflows

## Next Steps

After successful setup:

1. Update team documentation
2. Train collaborators on the new workflow
3. Consider additional security measures (signed commits, etc.)
4. Set up automated dependency updates with protection
5. Consider implementing semantic versioning automation
