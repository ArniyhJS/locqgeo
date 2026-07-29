# Sub-Project 5: GitHub Actions Automated CI Pipeline — Design Spec

## Overview

Configures an automated GitHub Actions CI workflow (`.github/workflows/ci.yml`) to run TypeScript type checking (`pnpm run check-types`) and unit tests (`pnpm run test`) on every push to `main` and pull request.

---

## 1. CI Workflow Specification

### File Path
- `.github/workflows/ci.yml`

### Triggers
- `push`: branches `[main]`
- `pull_request`: branches `[main]`

### Jobs
1. **`typecheck`**:
   - OS: `ubuntu-latest`
   - Setup: Node.js 20, `pnpm/action-setup` v4
   - Run: `pnpm run check-types`
2. **`test`**:
   - OS: `ubuntu-latest`
   - Setup: Node.js 20, `pnpm/action-setup` v4
   - Run: `pnpm run test`

---

## 2. Validation
- `test/github-ci.test.ts`: Unit test asserting `.github/workflows/ci.yml` contains `pnpm run check-types`, `pnpm run test`, and `actions/setup-node`.
