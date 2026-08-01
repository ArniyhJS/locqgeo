# Product Requirements Documentation Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the product PRD documentation suite (`spottconsole_prd.md`, `spottdrop_prd.md`, `spottengine_prd.md`, `spottverify_prd.md`) with reviewed architectural decisions, anti-cheat specifications, financial float rules, and PWA positioning.

**Architecture:** Update each PRD markdown document in `docs/product/` directly to incorporate design choices established in `docs/superpowers/specs/2026-08-01-prd-updates-design.md`.

**Tech Stack:** GitHub Flavored Markdown

## Global Constraints

- Preserve all existing document structures, headers, and terminology unless explicitly updating them.
- All file paths in markdown links must use absolute `file:///` URLs or relative valid paths.
- No placeholder text (TBD, TODO) allowed in updated PRD sections.

---

### Task 1: Update SpottConsole PRD (`spottconsole_prd.md`)

**Files:**
- Modify: `docs/product/spottconsole_prd.md`

**Interfaces:**
- Consumes: Design specification decisions from `docs/superpowers/specs/2026-08-01-prd-updates-design.md`
- Produces: Complete, updated `spottconsole_prd.md`

- [ ] **Step 1: Edit `spottconsole_prd.md` to update Section 3.6 (Reward & Payout Operations)**

Update Section 3.6 to specify that pre-funded Float Balance is held at the Tenant Level in `tenant_floats`, with individual campaign budgets acting as reservation caps against the tenant float using atomic transaction locks.

- [ ] **Step 2: Edit `spottconsole_prd.md` to update Section 3.8 (API Keys & Developer Integrations)**

Update Section 3.8 to include Webhook Dead-Letter Queue (DLQ) UI management, retry log history, and exponential backoff configuration details.

- [ ] **Step 3: Edit `spottconsole_prd.md` to resolve Section 5 (Open Questions)**

Update Open Questions #2 (float architecture) and #5 (audit log immutability) to reflect resolved design choices.

- [ ] **Step 4: Verify formatting of `spottconsole_prd.md`**

Ensure valid markdown syntax and headers.

- [ ] **Step 5: Commit changes**

```bash
git add docs/product/spottconsole_prd.md
git commit -m "docs(spottconsole): update PRD with tenant float architecture, webhook DLQ, and open question resolutions"
```

---

### Task 2: Update SpottDrop PRD (`spottdrop_prd.md`)

**Files:**
- Modify: `docs/product/spottdrop_prd.md`

**Interfaces:**
- Consumes: Design specification decisions from `docs/superpowers/specs/2026-08-01-prd-updates-design.md`
- Produces: Complete, updated `spottdrop_prd.md`

- [ ] **Step 1: Edit `spottdrop_prd.md` to update Section 1 (Overview)**

Update Overview to explicitly specify SpottDrop as the consumer *Rewards & Gamification Portal*.

- [ ] **Step 2: Edit `spottdrop_prd.md` to update Section 4.3 (Wallet & Redemptions)**

Update Section 4.3 with minimum withdrawal thresholds (₦50 for airtime/data top-ups via VTpass, ₦500 for Paystack bank transfers) and fee disclosures.

- [ ] **Step 3: Edit `spottdrop_prd.md` to update Section 4.4 & 5 (User Identity & Technical Considerations)**

Update Section 4.4 and 5 with offline streak preservation rules (valid within 24-hour sync window) and cross-PWA deep-link handling for SpottVerify payloads.

- [ ] **Step 4: Verify formatting of `spottdrop_prd.md`**

Ensure valid markdown syntax and headers.

- [ ] **Step 5: Commit changes**

```bash
git add docs/product/spottdrop_prd.md
git commit -m "docs(spottdrop): update PRD with positioning, redemption thresholds, and cross-PWA specs"
```

---

### Task 3: Update SpottEngine PRD (`spottengine_prd.md`)

**Files:**
- Modify: `docs/product/spottengine_prd.md`

**Interfaces:**
- Consumes: Design specification decisions from `docs/superpowers/specs/2026-08-01-prd-updates-design.md`
- Produces: Complete, updated `spottengine_prd.md`

- [ ] **Step 1: Edit `spottengine_prd.md` to update Section 3.1 (Verification API)**

Update `/api/v1/engine/verify` spec with rate limits (5 req/60s per device, 100 req/60s per IP) and offline `scanned_at` vs `received_at` timestamp validation rules (15-min window for Flash Drops, clock monotonicity checks).

- [ ] **Step 2: Edit `spottengine_prd.md` to update Section 5 & 6 (Verification States & Fraud Requirements)**

Update Section 5 rejection codes for `REJECTED_SPOOF` and `REJECTED_RATE_LIMIT`. Update Section 6 to include Google Play Integrity / iOS App Attestation and dynamic HMAC QR validation in planned fraud layers.

- [ ] **Step 3: Edit `spottengine_prd.md` to update Section 7 (Reward Orchestration)**

Update Section 7 to specify atomic check-and-lock Tenant Float reservation transactions prior to payout queue dispatch.

- [ ] **Step 4: Verify formatting of `spottengine_prd.md`**

Ensure valid markdown syntax and headers.

- [ ] **Step 5: Commit changes**

```bash
git add docs/product/spottengine_prd.md
git commit -m "docs(spottengine): update PRD with rate limits, offline sync policy, attestation, and atomic float reservation"
```

---

### Task 4: Update SpottVerify PRD (`spottverify_prd.md`)

**Files:**
- Modify: `docs/product/spottverify_prd.md`

**Interfaces:**
- Consumes: Design specification decisions from `docs/superpowers/specs/2026-08-01-prd-updates-design.md`
- Produces: Complete, updated `spottverify_prd.md`

- [ ] **Step 1: Edit `spottverify_prd.md` to update Section 1 (Overview)**

Update Overview to explicitly specify SpottVerify as the *Utility Check-in & Credential Verifier*.

- [ ] **Step 2: Edit `spottverify_prd.md` to update Section 4.4 & 9 (Roadmap)**

Elevate Organizer Scanner Mode to High Priority in Phase 2 Roadmap.

- [ ] **Step 3: Edit `spottverify_prd.md` to update Section 6 (Verification Payloads)**

Update Section 6 to add Dynamic HMAC Signed QR Code payload specification (`{geofence_id, timestamp, nonce, hmac}`) alongside static poster payload formats.

- [ ] **Step 4: Verify formatting of `spottverify_prd.md`**

Ensure valid markdown syntax and headers.

- [ ] **Step 5: Commit changes**

```bash
git add docs/product/spottverify_prd.md
git commit -m "docs(spottverify): update PRD with positioning, organizer scanner priority, and dynamic HMAC QR payload specs"
```

---

### Task 5: Final Cross-Document Alignment Audit

**Files:**
- Check: `docs/product/spottconsole_prd.md`
- Check: `docs/product/spottdrop_prd.md`
- Check: `docs/product/spottengine_prd.md`
- Check: `docs/product/spottverify_prd.md`

- [ ] **Step 1: Perform cross-link and consistency review across all 4 PRDs**

Verify consistent terminology, correct link references, and alignment with `docs/superpowers/specs/2026-08-01-prd-updates-design.md`.

- [ ] **Step 2: Commit final alignment verification**

```bash
git commit --allow-empty -m "docs(product): verify cross-PRD document consistency and alignment"
```
