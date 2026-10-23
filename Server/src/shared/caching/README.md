# Caching

**Purpose:** Reserves permission-aware cache access and invalidation. Redis is not active.

**Files:**

- `cache.service.js` — Will provide bounded cache reads and writes.
- `cacheInvalidation.js` — Will invalidate affected keys after committed mutations.

**Relationships:** Organization, branch, role, permission and data-version scoped reads.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
