# Database Schema Summary - Quick Reference Guide

## 📊 Core Tables

### `users` (Extends Supabase auth.users)

- **Purpose**: Core user data
- **Key Fields**:
  - `id` (FK to auth.users)
  - `full_name`, `email`, `gender`
  - `birthdate` (enforced 18+ check)
  - `bio`
  - `location_lat`, `location_lng`
  - `preferences` (JSONB - age range, distance, gender prefs)
  - `last_active_at`, `verified_at`, `is_online`
- **Partitioned By**: `created_at` (yearly)
- **Indexes**: 25+

### `profiles` (Normalized additional info)

- **Purpose**: Optional user details (1NF compliance)
- **Key Fields**:
  - `user_id` (1:1 relationship)
  - `profile_picture_url`, `profile_picture_uploaded_at`
  - `height_cm`, `education`, `occupation`
  - `relationship_goal` (enum)
  - `smoking`, `drinking`, `children`
  - `visibility` (soft delete)

### `photos`

- **Status**: Removed for MVP. A single `profile_picture_url` now lives on the `profiles` table.

### `interests` (Global lookup)

- **Purpose**: Reusable interest tags
- **Key Fields**: `id` (SMALLSERIAL), `name` (UNIQUE)
- **Example Values**: Travel, Photography, Hiking, Cooking...

### `user_interests` (Many-to-many)

- **Purpose**: User-interest relationships
- **Key Fields**: `user_id`, `interest_id`
- **Unique**: Per user-interest pair

### `likes` (Swipe actions)

- **Purpose**: Track likes with mutual match logic
- **Key Fields**:
  - `from_user_id`, `to_user_id`
  - `is_active` (allows undo)
  - `unliked_at` (timestamp when undone)
- **Trigger**: Auto-creates match on mutual like
- **Constraint**: No self-likes

### `matches` (Mutual connections)

- **Purpose**: Track mutual connections (auto-created by trigger)
- **Key Fields**:
  - `user1_id`, `user2_id` (normalized - smaller ID first)
  - `is_active`, `ended_at`
- **Note**: Cannot be directly inserted (trigger-only)

### `messages` (High-volume)

- **Purpose**: Conversation messages
- **Key Fields**:
  - `match_id` (FK to matches)
  - `from_user_id`, `to_user_id`
  - `content`, `status` (sent/delivered/read)
  - `read_at`
- **Partitioned By**: `created_at` (quarterly)
- **ID Type**: BIGSERIAL (for scale)

### `blocks` (Privacy control)

- **Purpose**: User blocking system
- **Key Fields**:
  - `blocker_id`, `blocked_id`
  - `reason` (optional)
- **Effect**: Blocked users invisible to each other
- **Enforced**: Via RLS on all profile queries

### `skips` (For algorithm)

- **Purpose**: Track dismissals (for better recommendations)
- **Key Fields**: `from_user_id`, `to_user_id`

---

## 🔄 Key Triggers

### 1. **Mutual Match Creation**

```
Event: INSERT/UPDATE on likes (is_active = TRUE)
Action: If other user also liked → Create match
```

### 2. **Unlock Handler**

```
Event: UPDATE on likes (is_active = TRUE → FALSE)
Action: Soft-delete match (mark inactive)
```

### 3. **Primary Photo Management**

```
Event: INSERT/UPDATE on photos (is_primary = TRUE)
Action: Unset all other primary photos
```

### 4. **Activity Tracking**

```
Event: INSERT on likes OR INSERT on messages
Action: Update users.last_active_at = NOW()
```

### 5. **Auto-Profile Creation**

```
Event: INSERT on auth.users (new signup)
Action: Create users + profiles rows with defaults
```

---

## 🔐 Security: Row-Level Security (RLS)

### Profile Access

- ✅ View own profile: Always
- ✅ View public profile: If not blocked and visibility = TRUE
- ❌ View private profile: Never

### Message Access

- ✅ View own messages: Always
- ✅ Send message: Only if matched with recipient
- ✅ Read messages: Only if participant

### Like Access

- ✅ View own likes: Always
- ✅ Modify likes: Only own likes

### Block Access

- ✅ Create block: Only blocker can
- ✅ Delete block: Only blocker can

---

## 📈 Performance Optimizations

### Geographic Queries

```sql
-- Find matches near me
SELECT * FROM users 
WHERE ST_DWithin(location_point, $my_location, 5_miles)
```

⚡ Index: `GIST (location_point)` on geography type

### Recent Activity

```sql
-- Online users
SELECT * FROM users WHERE is_online = TRUE
```

⚡ Index: Partial index on `(is_online) WHERE is_online = TRUE`

### Unread Messages

```sql
-- My unread messages
SELECT * FROM messages WHERE to_user_id = $me AND read_at IS NULL
```

⚡ Index: Partial on `(read_at) WHERE read_at IS NULL`

### Like Checks

```sql
-- Has user already liked?
SELECT EXISTS (SELECT 1 FROM likes WHERE from_user_id = $a AND to_user_id = $b)
```

⚡ Index: UNIQUE constraint + indexed columns

---

## 🎯 Common Queries

### Discovery Feed

```sql
SELECT * FROM user_discovery_view
WHERE ST_DWithin(location_point, $location, $distance_meters)
  AND age BETWEEN $age_min AND $age_max
  AND id NOT IN (SELECT to_user_id FROM likes WHERE from_user_id = $me)
  AND id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = $me)
ORDER BY ST_Distance(location_point, $location);
```

### Check Mutual Match

```sql
INSERT INTO likes (from_user_id, to_user_id, is_active) 
VALUES ($user_a, $user_b, TRUE);
-- Trigger automatically creates match if mutual
```

### Send Message

```sql
INSERT INTO messages (match_id, from_user_id, to_user_id, content)
VALUES ($match_id, $me, $other, $msg)
-- RLS ensures we're matched before allowing insert
```

### Active Conversations

```sql
SELECT * FROM active_conversations_view WHERE ??? = $me
-- Shows latest message per match with unread counts
```

---

## 🚀 Deployment Steps

### 1. Enable Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geography type
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 2. Run Schema File

```bash
psql -h your-db.supabase.co -U postgres -f schema.sql
```

### 3. Create Initial Data

```sql
-- Insert standard interests
INSERT INTO interests (name) VALUES 
('Travel'), ('Photography'), ('Hiking'), ('Cooking'), 
('Music'), ('Art'), ('Fitness'), ('Movies');
```

### 4. Enable RLS

- ✅ Already enabled in schema
- Test with: `SELECT * FROM users WHERE id != auth.uid()` (should fail)

### 5. Test Policies

```sql
-- Switch to test user
SET LOCAL "request.jwt.claims.sub" = 'test-user-id';
SELECT * FROM users;  -- Should only see own profile
```

---

## 📊 Schema Statistics

- **Total Tables**: 10
- **Total Indexes**: 30+
- **Total Constraints**: 25+
- **Total Triggers**: 6
- **RLS Policies**: 25+
- **Helper Views**: 2
- **Enum Types**: 3

---

## ⚠️ Important Notes

### Geographic Queries Require PostGIS

```sql
-- WON'T WORK without PostGIS:
SELECT * FROM users WHERE geography_distance < 5;

-- REQUIRES PostGIS:
SELECT * FROM users WHERE ST_DWithin(location_point, $1, 8047);
```

### Partition Maintenance

- Add new message partitions quarterly
- Monitor partition sizes
- Archive old partitions for compliance

### Backup Strategy

- Daily full backups
- Partition-based backups for messages
- Test restores quarterly
