# Background Jobs

**Purpose:** Reserves bounded asynchronous work such as large report exports. No queue is active.

**Files:**

- `jobQueue.js` — Reserves the future background queue adapter.
- `reportExport.job.js` — Will generate large authorized exports outside requests.

**Relationships:** Reports, secure object storage and job status tracking.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
