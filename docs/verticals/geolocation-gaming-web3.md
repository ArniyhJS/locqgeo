# Geolocation & Web3 Gaming

### Problem

Location-based game developers (AR games, Web3 "Visit-to-Earn" or "Move-to-Earn") face severe GPS spoofing that destroys game balance and drains token economies.

**Additional challenges:**

- Players use fake GPS apps or desktop emulators to collect location-based digital assets without moving.
- Automated bot farms farm high-value in-game loot drops from remote locations.
- Building custom anti-cheat engines for spatial validation requires specialized GIS engineering.
- Game studios need a low-latency API to verify real-world movement during gameplay loops.

### How LocqGeo helps

- In-game loot drop spots, portals, or quest nodes are synced with LocqEngine geofences.
- Players perform location verification calls via the LocqEngine REST API during gameplay.
- LocqEngine's 4-step anti-cheat filter calculates a spoof score and blocks emulated or spoofed location pings.

### Key features used

- Sub-50ms verification latency, anti-spoof risk scoring, developer API integration.

### Revenue model

- API call usage-based billing per 1,000 game verifications.
- Enterprise SDK licensing for game studios.

### Example

A Web3 AR game studio integrates LocqEngine's API to ensure players physically visit sponsored real-world locations (coffee shops, landmarks) before claiming rare in-game NFT items.

**Additional examples:**

- A fitness-gamification app verifies players visiting physical gym partner locations to earn tokenized rewards.
- A brand runs a nationwide digital treasure hunt game where players race to physical coordinates to claim real cash rewards.
- An esports tournament operator verifies player physical attendance at local LAN gaming hubs.

---

[Back to Vertical Use Cases Overview](./index.md)
