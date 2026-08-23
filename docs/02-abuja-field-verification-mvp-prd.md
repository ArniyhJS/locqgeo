# Abuja Field Verification MVP PRD

**Status:** Proposed MVP
**Date:** 2026-08-23

## Objective

Give an operations team a reliable way to assign sites, collect location-aware visit evidence, review exceptions, and export records for internal audit or service review.

## Primary Workflow

1. A supervisor creates sites and assigns workers or devices to them.
2. A worker scans a site QR code and submits a location-aware check-in.
3. The service evaluates credential scope, payload freshness, location signals, duplicate/idempotency rules, and configured risk signals.
4. The worker sees `ACCEPTED`, `PENDING_REVIEW`, or a clear rejection/pending result.
5. The supervisor reviews exceptions such as outside-radius, stale, duplicate, offline-captured, or unassigned submissions.
6. The supervisor exports a filtered record with evidence limitations visible.

## MVP Capabilities

### Site and Assignment Management

- create, edit, deactivate, and import sites;
- assign an enrolled worker/device to one or more sites;
- define radius, visit window, and required frequency;
- record the source and effective date of each assignment.

### Verification Capture

- signed or otherwise scoped site QR payload;
- server-derived tenant and authorization context;
- GPS coordinates, reported accuracy, capture time, receipt time, and device/app metadata needed for abuse analysis;
- idempotent submission handling;
- online submission and offline capture with a pending state;
- no claim that offline capture is accepted until server validation completes.

### Supervisor Operations

- live or recently received visit list;
- filters for site, worker, status, time window, and exception reason;
- assignment and authorization failures;
- manual review decision with actor and timestamp;
- CSV export with generated-at time and filter criteria.

## Explicit Evidence Boundary

A verified result may support the claim that an authorized client submitted a request associated with a site and location at a recorded time. It does not by itself prove identity, uninterrupted presence, task completion, quality of work, or absence of collusion. Customers may require additional evidence such as supervisor review, a photo, a work-order reference, or a dynamic site challenge.

## MVP Non-Goals

- consumer rewards and wallet balances;
- payroll decisions made automatically from a single signal;
- continuous employee surveillance;
- guaranteed indoor positioning;
- regulatory certification or official compliance acceptance;
- native hardware replacement in every patrol or access-control workflow.

## Initial Success Criteria

These are pilot targets, not established product guarantees:

- at least 90% of intended check-ins are captured successfully online or offline;
- at least 95% of captured records reach a terminal server decision within the agreed pilot window;
- supervisors review an exception within one business day;
- reporting preparation time falls by at least 30% against the customer baseline;
- workers can complete the normal check-in in under 30 seconds after site QR placement;
- no high-severity tenant-isolation or unauthorized-access finding remains open.

Pilot results must report sample size, device mix, network conditions, GPS conditions, and excluded records.
