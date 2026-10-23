# Fees Module

**Purpose:** Manages enrollment challans, verified collections, receipts and student fee balances.

**Files:**

- `fee.routes.js` — Defines module API route registration.
- `fee.controller.js` — Translates validated HTTP requests and service results.
- `fee.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `fee.repository.js` — Contains scoped persistence queries for this module.
- `challan.model.js` — Reserves the persistent model boundary for this record type.
- `feePayment.model.js` — Reserves the persistent model boundary for this record type.
- `fee.validation.js` — Defines request and domain input validation.
- `feeCalculation.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `receipt.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** Enrollments, Students and Challans; verified payments must reconcile with Finance and Reports.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
