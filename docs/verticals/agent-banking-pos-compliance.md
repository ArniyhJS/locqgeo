# Agent Banking & POS Compliance

### Problem

Fintechs, banks, and super-agents deploy agent banking POS networks across suburban and rural areas, but struggle to verify that agents operate from their legally registered addresses.

**Additional challenges:**

- Regulatory bodies (e.g., Central Bank of Nigeria) require POS agents to operate at registered addresses.
- Agents move POS terminals to unauthorized locations or operate "ghost agent" networks.
- Field compliance inspectors spend significant time visiting dispersed agent kiosks.
- High risk of money laundering and illegal financial activity at unverified POS locations.

### How LocqGeo helps

- Registered agent kiosk locations are stored as PostGIS geofences.
- POS agents conduct periodic mandatory presence verifications using LocqVerify.
- LocqEngine checks GPS accuracy and distance from the registered business location, flagging out-of-bounds terminals.

### Key features used

- Progressive identity linking, geofence radius validation, anti-fraud risk scoring.

### Revenue model

- Per-active-agent monthly compliance verification fee charged to fintechs/banks.

### Example

A mobile money operator requires 50,000 POS agents to perform a weekly location verification scan to keep their trading terminals active.

**Additional examples:**

- A microfinance bank verifies field loan officers visiting loan applicants' business premises.
- A card issuance network verifies agent locations before shipping physical debit cards for distribution.
- A merchant acquirer checks in-store POS placement to prevent terminal tampering or unauthorized relocation.

---

[Back to Vertical Use Cases Overview](./index.md)
