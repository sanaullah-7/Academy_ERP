# Payroll Module

**Purpose:** Manages assignment-based running salary balances, payments and payslips; it is not monthly payroll.

**Files:**

- `payroll.routes.js` — Defines module API route registration.
- `payroll.controller.js` — Translates validated HTTP requests and service results.
- `payroll.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `payroll.repository.js` — Contains scoped persistence queries for this module.
- `salaryAgreement.model.js` — Reserves the persistent model boundary for this record type.
- `payrollObligation.model.js` — Reserves the persistent model boundary for this record type.
- `payrollPayment.model.js` — Reserves the persistent model boundary for this record type.
- `payroll.validation.js` — Defines request and domain input validation.
- `payrollCalculation.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `payslip.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** Faculty Assignments, Salary Agreements, Payroll Payments, Expenses and Reports. Future code must verify and preserve the frontend salary calculation exactly.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
