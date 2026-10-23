# Dashboard Module

**Purpose:** Builds permission-scoped KPI, chart and summary projections from authoritative records.

**Files:**

- `dashboard.routes.js` — Defines module API route registration.
- `dashboard.controller.js` — Translates validated HTTP requests and service results.
- `dashboard.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `dashboard.repository.js` — Contains scoped persistence queries for this module.

**Relationships:** All authorized academic, fee, finance, payroll and operational read models.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
