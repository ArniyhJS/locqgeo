# Maritime, Ports & Customs Verification

### Problem

Port authorities, shipping lines, and customs agencies struggle to enforce on-site inspection compliance and verify physical cargo checks across sprawling port terminals and bonded warehouses.

**Additional challenges:**

- Customs inspectors sign off on container inspections without physically visiting the dock or warehouse site.
- Marine pilot and tugboat crews lack automated, tamper-proof proof-of-presence during vessel berthing.
- High risk of cargo theft or seal tampering when physical verification steps are bypassed.
- Paper-based inspection logs delay container clearance and increase port congestion penalties (demurrage).
- Disconnect between logistics management systems and physical field inspector movements.

### How SpottGeo helps

- Port docks, container yards, and bonded warehouses are mapped as high-precision geofences.
- Inspectors scan QR codes at specific container stacks or vessel gangways to generate cryptographically signed proof-of-inspection.
- Webhooks automatically notify customs ERPs and shipping port software of verified physical inspections.

### Key features used

- Signed HMAC webhooks, geofence radius enforcement, velocity checks, immutable audit logging, device fingerprinting.

### Revenue model

- Per-inspection transaction fee.
- Enterprise integration SaaS for port operating systems (POS) and customs brokers.

### Example

A port operator mandates that customs agents log verified presence at container bay coordinates before cargo release permits are generated.

**Additional examples:**

- A maritime logistics firm verifies harbor pilot boarding at offshore anchorage points.
- A cold-chain logistics provider verifies inspector presence at refrigerated container plug-in docks.
- A hazardous material auditor logs physical inspection of fuel bunkering barges.
- A customs agency verifies physical destruction of seized counterfeit goods at disposal sites.

---

[Back to Vertical Use Cases Overview](./index.md)
