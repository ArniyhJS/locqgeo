# Database ERD Schema

```
+------------------+         +--------------------+         +-----------------------+
|      users       |         |     campaigns      |         |       geofences       |
+------------------+         +--------------------+         +-----------------------+
| id (PK)          |<---+    | id (PK)            |<-------+| id (PK)               |
| email            |    |    | name               |         | campaign_id (FK)      |
| name             |    |    | total_budget       |         | name                  |
| role             |    |    | spent_budget       |         | latitude, longitude   |
| created_at       |    |    | status             |         | radius_meters         |
+------------------+    |    +--------------------+         | location GEOGRAPHY    |
                        |                                   +-----------+-----------+
                        |                                               |
                        |    +--------------------+                     |
                        |    |       claims       |                     |
                        +---| id (PK)            |<--------------------+
                             | geofence_id (FK)   |
                             | user_id (FK)       |
                             | device_id          |
                             | status             |
                             +---------+----------+
                                       |
                                       v
                             +--------------------+
                             |      payouts       |
                             +--------------------+
                             | id (PK)            |
                             | claim_id (FK)      |
                             | provider           |
                             | reference          |
                             | amount, recipient  |
                             +--------------------+
```
