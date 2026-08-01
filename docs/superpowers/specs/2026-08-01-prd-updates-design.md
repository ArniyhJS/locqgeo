# Design Specification: SpottGeo Product Requirements Documentation Updates

**Date:** 2026-08-01  
**Status:** Approved  
**Scope:** Update product PRD files (`spottconsole_prd.md`, `spottdrop_prd.md`, `spottengine_prd.md`, `spottverify_prd.md`) with ecosystem review resolutions, anti-cheat policies, financial float rules, and cross-PWA positioning.

---

## 1. Executive Summary & Goals

Following a comprehensive product PRD review, critical architectural choices, security layers, and operational policies need to be incorporated into the core PRD documentation suite. This design specification details the exact changes to be made to each PRD document in `docs/product/`.

The goals of these updates are:
1. **Resolve Operational Ambiguities:** Clearly define Tenant-Level Float Management, atomic budget deductions, and payout threshold rules.
2. **Harden Anti-Cheat & Offline Sync Specifications:** Define offline timestamp validation windows, monotonic clock checks, hardware attestation requirements, and rate limiting thresholds.
3. **Sharpen Product Boundaries:** Delineate SpottDrop (Rewards & Gamification PWA) vs. SpottVerify (Proof-of-Presence & Check-in PWA) and define cross-app deep-linking behavior.
4. **Enhance Enterprise Developer Experience:** Specify Webhook Dead-Letter Queue (DLQ) tooling, retry policies, and signature verification standards.

---

## 2. Key Architectural Decisions

### 2.1 Tenant Float & Campaign Budget Allocation
- **Tenant Float (Pre-funded Pool):** Managed strictly at the Tenant level in `user_wallets` / `tenant_floats`. All payouts draw directly from the pre-funded tenant float.
- **Campaign Budget Caps:** Act as logical reservation limits against the tenant float. When a campaign reward is triggered, SpottEngine executes an **atomic reservation transaction** (`SELECT ... FOR UPDATE` or Redis transaction) to deduct from the tenant float and update campaign budget spent before queuing the payout job.

### 2.2 Offline Sync & Clock Integrity Policy
- **Timestamp Strategy:** Verification pings record both `scanned_at` (client time) and `received_at` (server time).
- **Validation Windows:**
  - Standard Campaigns: Scans must be synced within 24 hours of `scanned_at`.
  - Flash Drops / Time-Limited Campaigns: Scans must be synced within **15 minutes** of `scanned_at`.
- **Clock Tampering Protection:** Client PWAs store monotonic time deltas alongside system timestamps. Server checks `received_at - scanned_at` drift and flags suspicious negative or excessive deltas with `REJECTED_SPOOF`.

### 2.3 Anti-Cheat & Security Enhancements
- **Rate Limits on `/api/v1/engine/verify`:**
  - Per Device: Max 5 verifications per 60 seconds.
  - Per IP Address: Max 100 verifications per 60 seconds.
  - Per Tenant API Key: Throttled based on tier (Default 1,000 req/sec).
- **Hardware Attestation Layer:** Target-state roadmap includes Google Play Integrity API (Android) and DeviceCheck/App Attest (iOS) evaluation to reject rooted/jailbroken devices running fake GPS injectors.
- **QR Payload Standards:**
  - Static QRs (printed billboards/posters): Signed alias or `geofence_id` payload + strict GPS geofence checks.
  - Dynamic QRs (digital displays): Include time-varying HMAC signature (`expires_at`, `nonce`) to prevent photo re-sharing attacks.

### 2.4 Product Positioning & Cross-PWA Routing
- **SpottDrop:** Positioned strictly as the *Consumer Rewards & Gamification Portal* (ad campaigns, billboard drops, loyalty punch cards, instant airtime/data/cash rewards).
- **SpottVerify:** Positioned strictly as the *Utility Check-in & Credential Verifier* (event attendance, workforce check-ins, site inspections, CPE credits, access control).
- **Cross-App Deep-Linking:** If a SpottVerify QR is scanned in SpottDrop or vice versa, the PWA parses the payload format and offers a seamless deep-link redirect to the sister app or processes the underlying `geofence_id` directly without erroring.

### 2.5 Financial Payout Thresholds
- **Airtime / Mobile Data Top-up:** Minimum redemption threshold of **₦50** via VTpass / primary provider.
- **Bank Transfer Cash Withdrawal:** Minimum redemption threshold of **₦500** via Paystack with transparent fee disclosures.

---

## 3. Document Edit Plan

### 3.1 `docs/product/spottconsole_prd.md`
- **Section 3.6 (Reward & Payout Operations):** Add specifications for Tenant Float balance management, campaign budget cap reservation, and atomic transaction locks.
- **Section 3.8 (API Keys & Developer Integrations):** Add Webhook Dead-Letter Queue (DLQ) management specifications, payload failure inspection UI, and exponential backoff retry logs.
- **Section 5 (Open Questions):** Mark Question #2 (float architecture) and Question #5 (audit log storage) as resolved with explicit choices.
- **Section 6 (Roadmap):** Add Webhook DLQ and Tenant Float management to Phase 3 Enterprise Controls.

### 3.2 `docs/product/spottdrop_prd.md`
- **Section 1 (Overview):** Add explicit positioning as the *Consumer Rewards & Gamification Portal*.
- **Section 4.3 (Wallet & Redemptions):** Add ₦50 minimum airtime/data and ₦500 minimum bank withdrawal thresholds.
- **Section 4.4 (User Identity & Account):** Specify offline streak preservation logic for pings synced within 24 hours.
- **Section 5 (Technical Considerations):** Add cross-PWA deep-linking payload handling specs.

### 3.3 `docs/product/spottengine_prd.md`
- **Section 3.1 (Verification API):** Update `/api/v1/engine/verify` Zod validation, rate limiting (5 req/60s device, 100 req/60s IP), and offline `scanned_at` vs `received_at` drift validation rules.
- **Section 5 (Verification States):** Add detailed rejection triggers for `REJECTED_SPOOF` (clock drift, attestation failure) and `REJECTED_RATE_LIMIT`.
- **Section 6 (Fraud and Trust Requirements):** Add Hardware Attestation (Play Integrity / App Attest) and Dynamic HMAC QR verification to target-state layers.
- **Section 7 (Reward Orchestration):** Update payout flow with atomic Tenant Float check-and-lock transactions.

### 3.4 `docs/product/spottverify_prd.md`
- **Section 1 (Overview):** Add explicit positioning as the *Utility Check-in & Credential Verifier*.
- **Section 4.4 (Organizer-Facing Features):** Elevate Organizer Scanner Mode to High Priority in Roadmap Phase 2.
- **Section 6 (Verification Payloads):** Update payload specs to include dynamic HMAC signed QR format (`{geofence_id, timestamp, nonce, hmac}`).

---

## 4. Verification Plan

- **Validation:** Inspect all modified markdown files to ensure valid GitHub Flavored Markdown syntax, consistent formatting, correct cross-links, and complete resolution of open items without leaving placeholders or broken links.
