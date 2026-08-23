# Regulatory and Compliance Assumptions

**Status:** Requires customer and legal validation
**Date:** 2026-08-23

This document separates hypotheses from claims. LocqGeo must not describe itself as regulator-approved or compliance-certified without written evidence from the relevant authority or customer compliance function.

## Nigeria POS Geofencing Hypothesis

The strategy documentation references a CBN requirement involving geotagging or geofencing of POS activity and a 70-metre radius. This may represent a useful market trigger, but the repository currently does not establish:

- the authoritative circular or publication;
- the affected institutions and terminal types;
- the effective date and enforcement mechanism;
- whether a browser/PWA-generated location record is acceptable evidence;
- retention, reporting, audit, and data-residency requirements.

Until these are confirmed, describe POS compliance as a **market hypothesis**, not as a guaranteed product use case. Before selling this workflow, obtain the primary source and review the interpretation with a qualified Nigerian compliance or legal adviser and the prospective customer.

## Cross-Cutting Questions

Every pilot must document:

- lawful basis and notice for collecting location and device data;
- retention and deletion periods;
- access controls and tenant isolation;
- worker/contractor consent and labor-policy implications;
- cross-border processing and hosting requirements;
- incident response and customer data export/deletion;
- whether evidence is used for payment, discipline, donor reporting, or regulatory submission.

## Product Language Rules

Use:

- “location-aware visit evidence”;
- “risk-scored verification”;
- “audit-supporting record”;
- “pending server validation”;
- “configured anti-abuse signals.”

Avoid:

- “tamper-proof”;
- “trustless”;
- “guaranteed fraud prevention”;
- “proves a real person was there”;
- “regulatory compliance” unless the customer and relevant authority have accepted the evidence model.
