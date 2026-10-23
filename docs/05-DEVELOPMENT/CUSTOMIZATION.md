# CUSTOMIZATION

<!-- > Purpose: Defines safe academy-specific branding, settings and future SaaS customization boundaries. -->


# TSA Academy ERP — Customization, Branding & Configuration Specification

**Document:** CUSTOMIZATION.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Customization Standards Proposed; Existing Frontend Behavior Must Be Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization with Multiple Branches
**Document Category:** Operations & Configuration

---

## 1. Purpose

This document defines the approved boundaries and proposed technical standards for customizing TSA Academy ERP.

The system must support academy identity and visual personalization without compromising existing product workflows, security, financial accuracy or branch isolation.

This specification covers:

- Academy identity and branding.
- Application name and display information.
- Theme and color settings.
- Logo and branding assets.
- Branch-specific presentation.
- User interface preferences.
- Settings persistence.
- Role-based customization permissions.
- Frontend/backend synchronization.
- Print and export branding.
- Configuration validation.
- Default values and reset behavior.
- Customization testing.
- Future customization boundaries.

**Implementation boundary:** This document does not authorize changing application code, introducing uploads, modifying production settings or creating new customization features.

---

## 2. Customization Principles

### CUS-001 — Preserve Approved Functionality

Customization must not break Admissions, Students, Fees, Faculty, Payroll or other operational modules.

### CUS-002 — Separate Branding from Business Rules

Changing colors, names or visual presentation must not alter financial calculations or authorization.

### CUS-003 — Respect Organization and Branch Scope

Organization-wide and branch-specific settings must remain properly separated.

### CUS-004 — Maintain Accessibility

Themes must preserve readable text, clear actions and usable interfaces.

### CUS-005 — Validate Configuration

Invalid colors, URLs, settings or identifiers must be rejected or handled safely.

### CUS-006 — Centralize Theme Configuration

Avoid duplicating branding and theme values across individual pages.

### CUS-007 — Secure Settings Mutations

Only authorized roles may change protected academy settings.

### CUS-008 — Preserve Existing Defaults

Missing settings must not cause blank screens or unusable layouts.

### CUS-009 — Minimize Infrastructure

Do not introduce unnecessary asset-upload, cloud storage or theme libraries.

### CUS-010 — Owner Approval

New customization categories affecting business behavior require separate approval.

---

## 3. Current Frontend Context

The frontend has an existing academy branding and theme direction.

Relevant features include:

- Academy profile settings.
- Academy display name.
- Logo or branding references.
- Color and theme preferences.
- Shared React contexts.
- Role-specific navigation.
- Branch selection.
- Print and export presentation.

The exact implementation, supported fields, component paths and persistence mechanism must be verified against the current frontend source.

Do not treat proposed fields in this document as already implemented.

---

## 4. Customization Scope

| Category | Purpose | Status |
|---|---|---|
| Academy display name | Show academy identity | Existing product requirement |
| Academy branding | Maintain academy visual identity | Existing product requirement |
| Primary color | Customize application appearance | Existing theme direction |
| Secondary/accent colors | Support complementary branding | Proposed; verify source |
| Light/dark theme | Appearance preference | Verify existing frontend support |
| Branch display information | Show branch identity | Existing multi-branch requirement |
| Print branding | Academy identity on documents | Existing output compatibility requirement |
| User display preferences | Individual UI personalization | Proposed/TBD |
| Layout editor | Fully customizable application screens | Deferred |
| Custom role designer | Arbitrary permission creation | Deferred |
| Custom workflow designer | User-defined business processes | Deferred |

All actual available settings must be confirmed from source code.

---

## 5. Academy Identity

Academy identity represents the organization operating the ERP.

### Candidate Fields

- Academy display name.
- Short name.
- Public contact information.
- Logo reference.
- Approved address or location label.
- Public website, where applicable.
- Brand colors.

These fields are illustrative and must be reconciled with the existing Academy Settings implementation.

### Requirements

- Keep academy identity separate from authentication credentials.
- Validate editable fields.
- Use a consistent identity across authorized screens.
- Avoid overwriting individual branch details.
- Preserve existing records when branding changes.
- Restrict edits to authorized roles.

### Important

The single-academy scope does not authorize implementing multi-academy SaaS onboarding.

---

## 6. Academy Name Customization

The academy display name may appear in:

- Navigation.
- Dashboard.
- Login presentation.
- Approved reports.
- Student documents.
- Fee receipts.
- Salary payslips.
- Print headers.

### Rules

1. Use the approved academy-name source.
2. Validate supported length and characters.
3. Escape or safely render user-provided text.
4. Refresh dependent presentation after a committed change.
5. Do not modify organization identifiers when renaming the academy.
6. Do not change existing financial record ownership.

### Historical Documents

A change to the academy name must not silently rewrite the legal or historical meaning of previously issued financial documents.

Whether generated documents display current branding or preserved issuance-time branding must follow the approved document policy.

---

## 7. Logo and Branding Assets

The project includes an academy-logo customization direction.

### Current Scope

Support existing approved logo presentation and configuration behavior.

### Important Restriction

Cloudinary, general-purpose media uploads and digital asset management are not approved for the current phase.

The physical Assets module is unrelated to academy branding media.

### Permitted Implementation Direction

Where the existing frontend supports a logo through a bundled asset, existing URL or stored configuration, preserve that behavior.

Do not invent:

- Cloudinary credentials.
- File-upload endpoints.
- Image-processing pipelines.
- Digital asset galleries.
- Unapproved storage services.

### Future Logo Upload

If a real upload workflow is separately approved, it must define:

- Accepted formats.
- File size limits.
- Storage provider.
- File validation.
- Access controls.
- Content security.
- Replacement behavior.
- Deletion/retention policy.

Until then, upload infrastructure remains deferred.

---

## 8. Color Customization

The theme system may allow academy branding through configurable colors.

### Candidate Tokens

- Primary.
- Primary foreground.
- Secondary.
- Accent.
- Background.
- Surface.
- Text.
- Border.
- Muted.
- Success.
- Warning.
- Error.

This token list is proposed; actual supported tokens must come from the frontend implementation.

### Requirements

- Validate supported color formats.
- Preserve readable contrast.
- Avoid invalid CSS injection.
- Apply tokens consistently.
- Maintain clear semantic status colors.
- Preserve existing component behavior.

### Financial Status Colors

The meaning of financial and workflow statuses must remain understandable regardless of the selected academy colors.

Color customization must not make a failed or outstanding payment appear successfully settled.

---

## 9. Theme Architecture

The frontend should maintain a centralized theme source.

### Proposed Flow

```text id="cset1"
Authorized Settings
        |
        v
Academy / Theme Configuration
        |
        v
Frontend Theme Context
        |
        v
Shared Design Tokens
        |
        v
Application Components
```

### Requirements

- Avoid component-level hardcoded academy branding where configurable.
- Preserve current shared theme conventions.
- Prevent unnecessary page reloads.
- Provide safe fallback values.
- Apply consistent branding across authorized modules.
- Avoid storing private backend configuration in theme state.

### Important

Do not replace the current UI component library merely to introduce theme customization.

---

## 10. Light and Dark Appearance

Light and dark modes may be supported if present in the existing frontend or separately approved.

### Requirements

- Verify the actual theme modes first.
- Preserve user readability.
- Use correct text/surface contrast.
- Keep forms and tables usable.
- Ensure modals, dropdowns and alerts remain visible.
- Maintain print-friendly output when printing.
- Prevent unexpected theme resets.

### Current Status

Exact supported modes and persistence behavior require source verification.

Do not claim dark mode is implemented without evidence.

---

## 11. Organization-Wide Versus Branch-Specific Settings

The system currently supports one academy and multiple branches.

### Organization-Wide Candidates

- Academy name.
- Shared brand identity.
- Global theme defaults.

### Branch-Specific Candidates

- Branch display name.
- Branch contact details.
- Branch address.
- Branch-specific document headers, if supported.

### Important

The actual ownership of each setting must be determined from current frontend behavior and approved database specifications.

Do not create conflicting organization and branch settings for one field without defining precedence.

---

## 12. Configuration Precedence

A possible hierarchy is:

```text id="cset2"
Application Safe Defaults
          |
          v
Approved Academy Settings
          |
          v
Approved Branch Overrides
          |
          v
Supported Personal Display Preferences
```

This hierarchy is **PROPOSED**, not a confirmed frontend implementation.

### Requirements

- Define which fields are overrideable.
- Keep business rules outside visual preference overrides.
- Prevent unauthorized branch overrides.
- Handle missing values deterministically.
- Avoid inconsistent presentation between modules.

Final precedence must be approved before backend implementation.

---

## 13. Branch Customization

Authorized branch settings may influence how users see their active branch.

### Possible Presentation Elements

- Branch name.
- Branch address.
- Branch-specific contact details.
- Branch label on print outputs.

### Security Rules

- Verify organization membership.
- Verify active branch.
- Enforce Settings modification permissions.
- Prevent one branch from changing another branch's protected configuration.
- Keep the current branch creation pause in effect.

### Critical Distinction

Editing existing branch presentation must not silently grant permission to create or delete branches.

---

## 14. Role-Based Settings Access

TSA Academy ERP supports five current roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Authorization

Only roles granted the relevant approved Settings permission may modify academy configuration.

### Receptionist

Receptionist has no independent administrative Settings access.

### Teacher

Teacher's self-profile access does not grant global Academy Settings access.

Supported personal appearance preferences, if later approved, must remain distinct from administrative Settings.

### Admin

Admin permissions must respect protected-account and privileged-operation restrictions.

### Owner

Owner permissions must match the verified frontend action-level registry.

### Super Admin

Super Admin remains subject to current product restrictions, including the paused branch-creation workflow.

---

## 15. Settings Data Model

The future backend may persist approved settings in MongoDB.

### Proposed Entity

`academySettings`

Candidate properties:

| Field | Purpose |
|---|---|
| `organizationId` | Owner organization |
| `branchId` | Branch scope where applicable |
| `displayName` | Approved display name |
| `branding` | Allowed branding configuration |
| `theme` | Allowed theme values |
| `updatedAt` | Modification timestamp |
| `updatedBy` | Authorized actor |

This is a proposed schema, not a finalized MongoDB collection.

### Requirements

- Unique approved scope.
- Field-level validation.
- Restriction of writable fields.
- Audit for important changes.
- Safe serialization.
- No secret credentials stored as ordinary public settings.

---

## 16. Backend Settings API

The final API must follow `API_CONTRACTS.md` and frontend service requirements.

### Proposed Operations

- Read authorized academy settings.
- Read authorized branch presentation settings.
- Update permitted academy branding.
- Update permitted branch presentation fields.
- Retrieve current effective theme configuration.

### API Requirements

- Authenticate protected requests.
- Enforce permissions.
- Validate branch scope.
- Validate editable fields.
- Reject protected system fields.
- Return safe configuration data.
- Record meaningful changes.

### Important

Do not expose arbitrary database-update endpoints for Settings.

The final routes and DTOs remain subject to contract approval.

---

## 17. Frontend and Backend Synchronization

After HTTP integration, settings should have an authoritative backend source.

### Proposed Flow

```text id="cset3"
Settings Page
     |
     v
Frontend Settings Service
     |
     v
Authorized Express API
     |
     v
MongoDB Settings
     |
     v
Committed Response
     |
     v
Refresh Academy / Theme Context
```

### Requirements

- Show success only after a valid saved result.
- Handle validation failures.
- Preserve form input where appropriate.
- Refresh affected UI.
- Invalidate stale setting caches.
- Avoid overwriting another branch's settings.

### Browser Persistence

Local theme preferences may remain browser-local only for explicitly approved personal display behavior.

Organization-level settings must not depend on one staff member's localStorage as the shared authoritative source.

---

## 18. Branding in Dashboard and Navigation

Branding may appear in:

- Application header.
- Sidebar.
- Dashboard welcome area.
- Branch selector.
- User profile menu.
- Authentication screens.

### Requirements

- Preserve existing layouts.
- Avoid oversized or distorted logos.
- Maintain legible academy names.
- Support typical screen sizes.
- Avoid breaking navigation when the name is long.
- Keep role-based menu visibility unchanged.

A color or logo change must not affect navigation authorization.

---

## 19. Branding in Forms

Customization must not interfere with:

- Form labels.
- Required-field indicators.
- Validation messages.
- Input readability.
- Focus indicators.
- Disabled states.
- Submit actions.

### Financial Forms

Payment-related forms must preserve clear distinctions between:

- Payable.
- Paid.
- Outstanding.
- Pending verification.
- Verified.
- Rejected or failed transaction.

Visual customization cannot change the underlying financial status.

---

## 20. Reports and Document Branding

Approved reports and print outputs may use academy branding.

### Examples

- Admission documents.
- Student reports.
- Challans.
- Fee receipts.
- Attendance reports, where implemented.
- Salary payslips.
- Financial ledgers.
- Academic summaries.

### Requirements

- Use approved academy/branch identity.
- Preserve correct financial amounts.
- Respect export authorization.
- Keep headers readable.
- Provide print-friendly contrast.
- Avoid clipping long names.
- Avoid including confidential data in unauthorized documents.

### Historical Branding

Whether reprinted historical documents use the original issuance branding or latest branding remains a document-policy decision.

Do not silently change historical financial evidence.

---

## 21. Teacher My Profile Customization

The Teacher self-service route is:

`/my-profile`

It contains:

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Customization Rules

- Apply the approved academy theme.
- Preserve readable salary figures.
- Keep payslips print-friendly.
- Respect branch display context.
- Do not expose other teachers' compensation.
- Do not grant Teacher administrative branding permissions.

Visual changes must not alter running payroll balances or payment history.

---

## 22. Financial Workflow Protection

Customization must never modify the approved financial calculation logic.

### Fees

Changing branding must not change:

- Challan payable amount.
- Verified payment total.
- Outstanding fees.
- Receipt transaction references.

### Teacher Payroll

Changing a theme or document header must not change:

- Faculty Assignment.
- Fixed/Percentage agreement.
- Running obligation.
- Salary payment.
- Outstanding salary.
- Linked Posted Expense.

### Confirmed Payroll Rule

Payroll is assignment-based and does not automatically generate monthly salary.

This rule cannot be overridden through theme settings.

---

## 23. Customization and Multi-Branch Security

### Required Behavior

- Organization settings are loaded from the authorized organization.
- Branch settings use the current authorized branch.
- A user cannot change settings for an unassigned branch.
- Cross-branch reports follow separate permissions.
- Settings updates cannot manipulate role grants.

### Branch Switching

After a permitted branch switch:

1. Validate new branch membership.
2. Resolve effective role.
3. Load applicable presentation settings.
4. Refresh relevant branch branding.
5. Clear stale previous-branch state as required.

The branch switch must not expose restricted data.

---

## 24. Customization Validation

Validate all editable configuration fields.

### Candidate Validation

- Academy name length.
- Valid contact field formats.
- Allowed color strings.
- Permitted theme identifiers.
- Approved URL formats.
- Branch ownership.
- Authorized writable fields.

### Security Controls

- Prevent script injection.
- Prevent malicious CSS values.
- Restrict arbitrary URLs where necessary.
- Reject unexpected fields.
- Use safe rendering for text.
- Protect Settings APIs from mass assignment.

The exact validation constraints must follow final accepted UI/API contracts.

---

## 25. Reset and Default Behavior

The application must remain usable when optional customization is absent.

### Requirements

- Provide safe default theme values.
- Preserve branding consistency.
- Handle incomplete configuration.
- Avoid breaking startup because a nonessential optional color is missing.
- Prevent unapproved data deletion during reset.

### Reset to Default

A Reset to Default action may be supported only if the current frontend implements it or the owner approves it separately.

Resetting appearance must not reset:

- User accounts.
- Admissions.
- Students.
- Payments.
- Payroll.
- Expenses.
- Branch data.

---

## 26. Import and Export of Customization

Portable theme presets or configuration import/export are not required initially.

### If Approved Later

Define:

- Supported configuration schema.
- Allowed fields.
- Version compatibility.
- Validation.
- Authorization.
- Preview.
- Rollback behavior.

### Security

Never export:

- Password hashes.
- Session secrets.
- MongoDB credentials.
- Hidden administrative tokens.

Customization export must not become a general database export.

---

## 27. Configuration Versioning

If Settings structures evolve over time, use an approved schema version or migration strategy.

### Requirements

- Preserve compatible previous settings.
- Provide safe defaults.
- Avoid silent loss of branch overrides.
- Document new fields.
- Test migration behavior.
- Preserve valid historical document metadata where necessary.

Database schema changes must follow `DATABASE_MIGRATIONS.md`.

---

## 28. Customization Performance

Academy branding and theme data should load efficiently.

### Performance Guidelines

- Avoid fetching identical settings repeatedly.
- Reuse approved frontend context.
- Cache safe settings where appropriate.
- Invalidate after authorized updates.
- Handle branch switching correctly.
- Avoid heavy assets that significantly degrade loading.

### Security

Cached settings must not expose protected configuration from another organization or branch.

---

## 29. Accessibility and Responsive Design

Themes must preserve usability across supported devices.

### Minimum Review Areas

- Text contrast.
- Button visibility.
- Form readability.
- Keyboard focus states.
- Error/warning differentiation.
- Sidebar navigation.
- Tables.
- Modal dialogs.
- Mobile layouts.
- Print outputs.

Do not rely solely on color to communicate important payment or admission status.

---

## 30. Customization Testing Strategy

### Visual Tests

- Academy name appears correctly.
- Brand colors are applied consistently.
- Long names do not break layout.
- Default theme loads when customization is absent.
- Supported appearance modes remain readable.

### Permission Tests

- Authorized Settings update succeeds.
- Receptionist administrative Settings update is denied.
- Teacher administrative Settings update is denied.
- Unauthorized branch customization is denied.
- Protected fields cannot be changed through request manipulation.

### Integration Tests

- Backend settings persist.
- Frontend context refreshes after update.
- Branch switching loads the correct settings.
- Reload preserves committed settings.
- Validation failures do not display false success.

### Regression Tests

- Admissions still work.
- Fees and receipts remain accurate.
- Teacher My Profile remains secure.
- Payroll calculations remain unchanged.
- Reports and exports preserve values.
- Role-specific navigation remains correct.

---

## 31. Customization Acceptance Criteria

A customization feature is technically acceptable when:

1. It implements only approved editable fields.
2. Required authorization is enforced.
3. Organization/branch scope is correct.
4. Invalid values are rejected.
5. Existing frontend behavior is preserved.
6. Default theme behavior is reliable.
7. Relevant screens remain readable.
8. Printing/export formatting remains usable.
9. Academic and financial data is unaffected.
10. Relevant tests have actually passed.

Owner acceptance remains a separate decision.

---

## 32. Customization Checklist

- [ ] Existing frontend Settings implementation inspected.
- [ ] Supported fields documented.
- [ ] Source of truth established.
- [ ] Organization/branch ownership established.
- [ ] Editable fields validated.
- [ ] Settings permissions enforced.
- [ ] Theme defaults established.
- [ ] Existing Academy/Theme Context preserved.
- [ ] Settings persistence verified.
- [ ] Branch switch behavior tested.
- [ ] Responsive design checked.
- [ ] Print/export branding checked.
- [ ] Teacher salary privacy maintained.
- [ ] Financial calculation invariance tested.
- [ ] No unapproved upload infrastructure introduced.
- [ ] No unauthorized role changes introduced.

Unchecked items indicate pending verification.

---

## 33. Explicitly Deferred Customization

The initial project does not automatically include:

- Visual page builder.
- Drag-and-drop dashboard designer.
- Arbitrary custom database fields.
- Custom role and permission designer.
- Custom admission workflow builder.
- Custom payroll formula editor.
- Automatic monthly salary options.
- Custom financial reversal workflows.
- Cloudinary/media upload infrastructure.
- Multi-client SaaS white-label provisioning.
- Per-tenant hosting domains.
- Third-party theme marketplace.

Each requires separate scope definition and owner approval.

---

## 34. Open Decisions

The following remain TBD or require actual frontend source verification:

- Exact existing Academy Settings fields.
- Exact supported theme tokens.
- Light/dark mode availability.
- Logo storage/reference mechanism.
- Organization versus branch setting precedence.
- Personal appearance preferences.
- Settings API contract.
- Reset-to-default behavior.
- Historical document branding policy.
- Allowed custom color formats.
- Print branding templates.
- Configuration versioning.

Do not silently treat proposed fields as implemented.

---

## 35. Related Documentation

This document must remain aligned with:

- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `DESIGN.md` — UI/design system.
- `ARCHITECTURE.md` — Technical architecture.
- `FRONTEND_INTEGRATION.md` — Frontend services and contexts.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — Settings API contracts.
- `DATABASE.md` — Settings persistence.
- `DATABASE_MIGRATIONS.md` — Schema evolution.
- `SECURITY.md` — Security requirements.
- `AUTHENTICATION_AND_SECURITY.md` — Sessions and protected access.
- `RBAC_PERMISSIONS.md` — Action-level permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization/branch scope.
- `BUSINESS_RULES.md` — Domain invariants.
- `CACHING_AND_PERFORMANCE.md` — Data refresh and caching.
- `BACKEND_TESTING_STRATEGY.md` — Test requirements.
- `FEATURE_DEVELOPMENT.md` — Engineering workflow.
- `ENVIRONMENT_CONFIG.md` — Configuration standards.
- `AGENTS.md` — Coding-agent instructions.
- `RULES.md` — Engineering boundaries.
- `MEMORY.md` — Owner-approved decisions.
- `PROGRESS.md` — Verified implementation history.

Relative Markdown links must match actual repository paths.

---

## 36. Final Implementation Boundary

### Confirmed Product Direction

- Academy profile and branding customization.
- Changeable academy identity and visual theme direction.
- Existing React frontend contexts.
- Five current roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Current branch creation pause.
- Physical Assets separate from branding media.

### Proposed Customization Architecture

- Centralized branding configuration.
- Validated theme tokens.
- Authorized Settings APIs.
- MongoDB-backed organization/branch settings.
- Frontend context synchronization.
- Safe defaults and cache invalidation.
- Consistent document branding.

### Deferred

- Media upload infrastructure.
- Full layout builder.
- SaaS white-label provisioning.
- Custom role/workflow builder.
- Arbitrary payroll configuration.

### Not Implemented or Verified by This Document

- New Settings APIs.
- New theme controls.
- New logo upload mechanisms.
- Final branch override policy.
- Source-level verification of all proposed settings.
- Production customization tests.

**Governing Principle:** Customize TSA Academy ERP's approved visual identity and presentation without changing the system's authorized workflows, business rules, branch ownership, confidential records or financial calculations.

**Document Status:** DRAFT — Ready for existing frontend customization verification and later approved implementation.
