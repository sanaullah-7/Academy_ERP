# Reports Module

**Purpose:** Builds permission-scoped academic, finance and payroll reports and export jobs.

**Files:**

- `report.routes.js` — Defines module API route registration.
- `report.controller.js` — Translates validated HTTP requests and service results.
- `report.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `report.repository.js` — Contains scoped persistence queries for this module.
- `payrollReport.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `export.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** All authorized module projections; exports must repeat record-level authorization.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
