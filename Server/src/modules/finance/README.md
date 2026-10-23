# Finance Module

**Purpose:** Provides the reconciled income, posted expense and ledger view used by reports.

**Files:**

- `finance.routes.js` — Defines module API route registration.
- `finance.controller.js` — Translates validated HTTP requests and service results.
- `finance.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `finance.repository.js` — Contains scoped persistence queries for this module.
- `expense.model.js` — Reserves the persistent model boundary for this record type.
- `ledgerEntry.model.js` — Reserves the persistent model boundary for this record type.
- `expense.validation.js` — Defines request and domain input validation.
- `ledger.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** Verified Fee Payments, Posted Expenses, Payroll and Reports.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
