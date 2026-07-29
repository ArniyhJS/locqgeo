# Sub-Project 2: Live Payment Webhook Routes — Design Spec

## Overview

Implements Paystack and Stripe webhook endpoints in `services/engine` to handle recurring subscription lifecycle events (`active`, `past_due`, `canceled`) for B2B tenants and B2C users, with automatic Redis feature cache invalidation via `@spottgeo/feature-gate`.

---

## 1. Webhook Routes & Endpoints

- **`POST /api/v1/webhooks/paystack`**: Paystack webhook ingestion
- **`POST /api/v1/webhooks/stripe`**: Stripe webhook ingestion

---

## 2. Signature Verification

### Paystack Verification
- Header: `x-paystack-signature`
- Algorithm: HMAC SHA-512 over raw body string using `PAYSTACK_SECRET_KEY`
- Invalid signature → Return HTTP `400 Bad Request`

### Stripe Verification
- Header: `stripe-signature`
- Algorithm: HMAC SHA-256 over `${timestamp}.${rawBody}` using `STRIPE_WEBHOOK_SECRET`
- Invalid signature or expired timestamp → Return HTTP `400 Bad Request`

---

## 3. Event Processing & Cache Invalidation

| Paystack Event | Stripe Event | Action | Status Result |
|---------------|-------------|--------|---------------|
| `subscription.create` | `customer.subscription.created` | Insert/Update subscription row | `active` or `trialing` |
| `charge.success` | `invoice.paid` | Update current period end | `active` |
| `invoice.payment_failed` | `invoice.payment_failed` | Update status | `past_due` |
| `subscription.disable` | `customer.subscription.deleted` | Set canceled timestamp | `canceled` |

### Cache Invalidation Sequence
1. Extract `entityType` (`TENANT` or `USER`) and `entityId`.
2. Execute DB update on `tenantSubscriptions` or `userSubscriptions`.
3. Invoke `invalidateFeatureCache(entityType, entityId)` from `@spottgeo/feature-gate`.
4. Return HTTP `200 OK` `{ status: "success" }`.

---

## 4. Package Testing
- `services/engine/test/payment-webhooks.test.ts`: Test Paystack and Stripe signature calculation, valid event processing, invalid signature rejection, and feature cache invalidation.
