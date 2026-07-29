# Sub-Project 5: GitHub Actions Automated CI Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `.github/workflows/ci.yml` monorepo workflow executing `pnpm run check-types` and `pnpm run test` on push and pull request.

**Architecture:** YAML workflow file with Node 20 and pnpm action setup. Vitest unit test in `test/github-ci.test.ts` validates workflow configuration.

**Tech Stack:** GitHub Actions, Node.js 20, pnpm v10, Vitest 4.

## Global Constraints
- Workflow path MUST be `.github/workflows/ci.yml`.
- Must trigger on `push` and `pull_request` to `main`.
- Must execute `pnpm run check-types` and `pnpm run test`.
- All tests run with `npx vitest run test/github-ci.test.ts`.

---

### Task 1: GitHub Actions CI Workflow Setup

**Files:**
- Create: `.github/workflows/ci.yml`
- Test: `test/github-ci.test.ts`

**Interfaces:**
- Produces: GitHub Actions CI workflow configuration

- [ ] **Step 1: Write failing workflow test**

Create `test/github-ci.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("GitHub Actions CI Workflow", () => {
  it("contains check-types and test jobs", () => {
    const workflowPath = path.join(__dirname, "../.github/workflows/ci.yml");
    const content = fs.readFileSync(workflowPath, "utf-8");
    expect(content).toContain("pnpm run check-types");
    expect(content).toContain("pnpm run test");
    expect(content).toContain("actions/setup-node");
    expect(content).toContain("pnpm/action-setup");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/github-ci.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Implement .github/workflows/ci.yml**

Create `.github/workflows/ci.yml`:
```yaml
name: SpottGeo Monorepo CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check-types:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run check-types
        run: pnpm run check-types

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm run test
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/github-ci.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml test/github-ci.test.ts
git commit -m "ci: add github actions workflow for monorepo check-types and unit tests"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-github-actions-ci-pipeline.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?
