# Branch Protection Rules for WebSocket Learning Project

## Main Branch Protection Settings

### Status Checks Required

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging

**Required Status Checks:**

- `build` (Build process)
- `type-check` (TypeScript compilation)
- `lint` (ESLint validation)
- `e2e-tests / essential` (Essential E2E tests)

### Pull Request Requirements

- [x] Require a pull request before merging
- [x] Require approvals: 1
- [x] Dismiss stale PR reviews when new commits are pushed
- [x] Require review from code owners (if CODEOWNERS exists)

### Additional Restrictions

- [x] Restrict pushes that create files larger than 100MB
- [x] Restrict force pushes
- [x] Restrict deletions
- [ ] Allow force pushes (disabled for security)
- [ ] Allow deletions (disabled for safety)

### Admin Settings

- [x] Include administrators (recommended for consistency)
- [x] Allow bypass in emergency situations via admin override

## Rationale

1. **Code Quality**: Ensures all code passes tests and linting
2. **Collaboration**: Requires peer review for all changes
3. **Safety**: Prevents accidental force pushes or branch deletion
4. **CI/CD Integration**: Ensures deployment-ready code only

## Manual Configuration Required

After creating these files, configure branch protection manually in GitHub:

1. Navigate to: `Repository Settings > Branches > Add rule`
2. Branch name pattern: `main`
3. Enable all settings listed above
4. Add required status checks: `build`, `type-check`, `lint`, `e2e-tests (essential)`

## Testing Protection Rules

After setup, verify protection with:

```bash
# This should be blocked
git push --force origin main

# This should work
git checkout -b test-branch
git push origin test-branch
# Create PR through GitHub UI
```

## Emergency Override

In case of emergency, administrators can:

1. Temporarily disable branch protection
2. Push critical fixes
3. Re-enable protection immediately

Always document emergency overrides for audit purposes.

## Benefits

- **Safety**: Prevents destructive Git operations
- **Quality**: Ensures all code is reviewed and tested
- **Compliance**: Maintains professional development standards
- **Educational**: Demonstrates industry-standard Git workflows
- **Collaboration**: Encourages code review and knowledge sharing

## Future Enhancements

- Add semantic release automation
- Implement security scanning requirements
- Add automated dependency update protection
- Consider conventional commit enforcement
