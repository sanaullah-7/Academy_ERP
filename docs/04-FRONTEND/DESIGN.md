<!-- Design System — Lovable prototype ke mutabiq colors, fonts, sidebar, buttons, tables aur layout rules -->

# Academy Management ERP — Visual Design System & UX Specification

**Document:** DESIGN.md
**Version:** 1.0
**Status:** DRAFT — Pending Design Verification and Approval
**Updated:** 2026-10-10
**Project:** Academy Management ERP
**Application:** React + Vite Web Application
**Design Strategy:** Reference-Driven, Component-Based, Responsive

## CURRENT EFFECTIVE REQUIREMENTS — 2026-10-23

The completed frontend uses the premium TSA visual language across all five role dashboards while preserving role-specific data. Current branding is TSA maroon/white, soft `#F7F8FC` page backgrounds, white content surfaces, shared KPI/card/chart primitives, Plus Jakarta Sans, responsive sidebar/mobile navigation, accessible dialogs and compact status badges. Branch settings control academy identity and per-branch theme/sidebar values for authorized roles.

Preserve the approved desktop/mobile layouts and semantic success/warning/error colors during backend integration. Loading/error states may change only to consume HTTP data; backend work must not redesign screens, inject technical details into user flows or expose unauthorized data. Login Three.js/GSAP is decorative, deferred and removable without affecting authentication. Physical Assets means academy inventory; no Cloudinary or new digital-media workflow is approved.

Historical teal/reference-only notes below describe earlier design phases and are superseded where they conflict with the current implemented maroon premium UI.

## F00-011 — Approved login logo motion (2026-10-21)

Owner-approved login-only polish: the configured academy logo keeps its white image background and current layout, with a subtle GSAP idle float and gentle Three.js tilt on pointer movement. Respect `prefers-reduced-motion` by rendering a static logo; preserve a static fallback if WebGL is unavailable. This does not establish animation patterns for other screens.

---

## Accepted Foundation / F01-001 Visual Scope (2026-10-10)

Owner accepted F00-004's implemented/report-tested mock design scope with the other foundations; prior pending-acceptance snapshots remain history. No formal accessibility certification or production deployment is claimed.

F01-001 reuses approved teal/Jakarta/sidebar/topbar/Card tokens. Current read-only reference DOM confirms Plus Jakarta Sans and rgb(248,249,255) canvas; observed greeting, four KPI cards, larger chart area and Quick Operations inspired the section hierarchy. The web tool could not access the URL; Edge rendered content in interactive state although an initial complete-state wait timed out. No new exact tokens, example financial figures/actions, role policies or statistics were adopted. [Skeleton screenshots and checks](../00-CORE/PROGRESS.md#f01-001--dashboard-skeleton-delivery-2026-10-10).

---

## F00-004 — Approved Design System (2026-10-09)

**Approval:** Owner explicitly approved reference alignment, Plus Jakarta Sans, teal accents, 256px desktop sidebar, 64px topbar, 12px cards and shadcn/ui Button/Card/Input/Badge/Dialog. This supersedes earlier proposed-only statements for these values; older review snapshots remain history. Final owner acceptance of the implementation is pending.

The live reference was rechecked in Edge before implementation. Rendered measurements confirmed existing DOC-SYNC-001 observations; its stylesheet additionally verified outline #6d7a77, error #ba1a1a, soft surfaces #eff4ff/#dce9ff, primary hover/text #00685f and border oklch(0.929 0.013 255.508). No unverified chart or business-status palette was introduced.

| Approved implementation | Source / purpose |
|---|---|
| #f8f9ff canvas, white surfaces, #0b1c30 foreground, #565e74 supporting text | Verified rendered reference values |
| #008378 primary and #00685f hover/focus/link accent | Verified reference values; existing white foreground retained for readable selected navigation (4.65:1), avoiding the reference's dark-on-teal selected text |
| Plus Jakarta Sans Variable, normal weights 200–800 | Fontsource self-hosted wght.css; font-display swap, Unicode subsets and system fallback; actual Latin font load verified |
| 256px desktop sidebar / 80px compact, 64px topbar | Approved reference desktop dimensions; compact behavior preserved from existing shell |
| 12px card / 8px control radius, light shared shadow | Verified reference card/control values; centralized semantic Tailwind tokens |
| Desktop padding 32px, card padding 24px, title 24–28px | Reference-aligned spacing/type with responsive minimums |
| 150ms transitions and reduced-motion overrides | Verified reference nav timing; CSS-only motion includes portalled dialogs |
| Modal navigation below 1024px | Existing accessible responsive strategy retained; reference's narrow-screen overflow rejected for this implementation |

Only the five requested shadcn-derived source components were added; manual config targets existing Tailwind v4. Default Button/Input targets are at least 44px, Input uses a visible outline and focus ring, Dialog requires accessible title/description and handles keyboard modality through Radix. Input callers must provide labels. No dark theme, authentication, branch/session controls, search workflow, working module navigation or dashboard data introduced.

[Executed verification and limitations](../00-CORE/PROGRESS.md#f00-004--verification-evidence-2026-10-09). Sampled contrast and keyboard/ARIA checks passed; screen-reader certification, maintained tests and deployment fallback remain unverified. Future visual/business changes require separate approval.

---

## DOC-SYNC-001 — Lovable Reference Review (2026-10-09)

**Source:** [Client-approved Lovable reference](https://sunbeam-styler.lovable.app/).
**Access:** PASS in headless Microsoft Edge. The web tool separately returned `URL https://sunbeam-styler.lovable.app/ is not accessible via this tool.` This was a tool-specific failure, not website unavailability.
**Method:** Read-only DOM/computed-style inspection and reviewed desktop/mobile screenshots; 1440×1000 desktop, 768×844 tablet, 390×844 narrow viewport. No forms submitted or reference data changed.

Observed title: Dashboard · Elarion Academy ERP. Only the public dashboard and sampled controls were reviewed. Its names, dates, figures and routes are examples, not approved ERP business rules or permissions.

### Verified Rendered Observations

These measurements describe visible elements, not permanent brand-token approval. Generic `:root` defaults differ from actual dashboard utility colors; this comparison uses rendered styles.

| Area | Verified reference observation |
|---|---|
| Canvas / surface | Main background #f8f9ff (rgb 248,249,255); white sidebar/cards #ffffff |
| Text | Main #0b1c30; secondary controls #565e74; nav labels #3d4947 |
| Accent | Active nav/primary action background #008378; text-link accent #00685f |
| Tinted surfaces | Search/quick-action surfaces #eff4ff; selected period #dce9ff |
| Typography | Computed Plus Jakarta Sans with system fallbacks; fonts loaded and family check true. Page title 28px/600, section headings 16px/600, nav 14px/500 (active 600), sampled labels/actions 12px/600, search 13px/400 |
| Sidebar | Fixed white 256px sidebar, academy brand, Branch & Session summary, single module list and bottom user identity. Active teal row; typical row 44px, radius 8px, padding 10px vertical/16px horizontal, 8px icon gap, nav padding 8px |
| Topbar | Fixed 64px high, offset after sidebar; translucent white/backdrop blur, subtle 0 1px 8px shadow at 4% opacity. Search, branch/session badge, New Admission link, notification button, user identity |
| Spacing | Desktop content starts 32px from sidebar and 32px below topbar; sampled cards 24px padding; consistent grid gaps |
| Cards | White, measured 12px radius; light 0 1px 3px / 0 1px 2px shadow at 10% opacity. KPI row, cashflow, enrolment table, quick operations, upcoming classes and payments; tinted inset panels/status pills |
| Icons / motion | Material Symbols Outlined font check true, loaded icons in reviewed screenshots; nav computed transition 150ms |

Teal/blue financial highlights and red outstanding-fee emphasis are visible. Full semantic palettes, every typography/card variant, chart tokens and accessible contrast were not exhaustively measured or approved.

### Responsive Layout and Sampled Interactions

- At 1440px, four KPI cards and a two-column content area appear beside the expanded sidebar.
- At 768px, sidebar remains 256px and main is 512px. At strict 390px CSS width, sidebar stays 256px, main is 134px and document scroll width is 549px: cramped/clipped content and horizontal overflow are verified. Mobile-device emulation also expanded layout width to 549px. No responsive menu button was found in the sampled dashboard.
- Module navigation is rendered as anchors with hrefs and active styling. Hover/transition classes exist. Destination functionality, reference history navigation and permissions were NOT_RUN.
- Clicking This Week retained Today selection styling and did not change body text. Clicking notifications produced no dialog or visible text change in the sampled check. Intended filter/notification workflows cannot be inferred from these controls.
- Search, user identity, period buttons and quick operations are visible. Search results, user/branch menus, form workflows, keyboard accessibility and reference reduced-motion behavior were NOT_RUN.

### Differences and Proposed Follow-up — No Implementation

| Topic | Existing DESIGN / frontend | Proposed change, requiring approval |
|---|---|---|
| Palette | Exact colors TBD; theme.css uses neutral #f6f7f9 canvas, #202735 text, #293448 accent | Evaluate observed teal/cool surface/text values in a token-alignment ticket, with contrast checks |
| Font | Exact font TBD; shell uses system stack | Evaluate Plus Jakarta Sans, loading method and fallbacks; no dependency installed now |
| Dimensions | Dimensions TBD; shell sidebar 260px/80px and topbar 76px | Review 256px desktop sidebar/64px topbar while preserving accessible collapse/drawer |
| Corners / elevation | DESIGN proposes cards 10–12px, controls 8px; shell card 16px/control 9px with broader soft shadow | Evaluate observed 12px/8px and lighter reference elevation |
| Spacing / type | DESIGN four-pixel scale and title 24–28px; shell desktop padding 40px/title clamp 24–30px | Evaluate measured 32px outer/24px card spacing and 28px heading |
| Navigation | DESIGN permission-aware modules; shell grouped disabled placeholders; reference ungrouped anchors | Review grouping/active styling only; working routes and permissions require their own tickets |
| Header | DESIGN suggests branch/user/search; shell breadcrumb/preview/menu controls | Record reference branch/session/search/user/notifications as future scope requiring approved contracts; no decorative nonworking additions |
| Responsive behavior | DESIGN compact tablet/collapsible mobile; current drawer below 1024px passed prior checks; reference narrow overflow | Retain current accessible responsive foundation; do not reproduce reference overflow; client devices remain TBD |
| Icons / motion | Current Lucide and 180ms CSS with reduced-motion override; reference Material Symbols/150ms | Consider timing only if approved; retain approved Lucide and reduced-motion support |
| Dashboard content | Reference operational widgets; current root intentionally Hi | Dashboard implementation remains outside this documentation task |

### Limitations and Authorization

Reference availability is resolved for this review. Observations are verified for this public page/date, not blanket approval to replace application tokens. The narrow-screen defects and sampled inactive controls need owner review. Existing draft values remain provisional until approved reconciliation. No code, packages or theme tokens were changed.

[Progress evidence](../00-CORE/PROGRESS.md#doc-sync-001--delivery-evidence-2026-10-09) and [current task](../00-CORE/TASKS.md#doc-sync-001--latest-task-state-2026-10-09) record the delivery limits. No additional implementation is authorized.

---

## 1. Purpose

This document establishes the visual design standards, user experience rules, component guidelines and responsive layout specifications for the Academy Management ERP.

It serves as the central source of truth for frontend visual consistency.

All AI coding tools, including Codex and Antigravity, must follow this document when implementing or modifying frontend interfaces.

The objectives are:

- Maintain consistent visual design across all ERP modules.
- Follow the client-approved Lovable prototype.
- Support configurable academy branding.
- Provide clear and intuitive navigation.
- Build reusable and accessible components.
- Support different role-based dashboards.
- Prevent inconsistent AI-generated layouts.
- Enable future design improvements without widespread code changes.
- Keep the application professional, scalable, maintainable and responsive.

This document defines design requirements, not implementation authorization.

## 2. Decision Classification

Every design decision must use one of these classifications:

**CONFIRMED:** Explicitly approved or supplied.

**PROPOSED:** Recommended design decision awaiting approval.

**TBD:** Not yet determined or requiring reference verification.

**DEFERRED:** Excluded from the current development phase.

Do not silently convert a PROPOSED or TBD decision into a CONFIRMED requirement.

## 3. Confirmed Product Design Requirements

### 3.1 Application Type

CONFIRMED:

- Web-based Academy Management ERP.
- One academy organization in the initial release.
- Multiple academy branches.
- Five primary roles: Super Admin, Admin, Receptionist, Owner and Teacher.
- Configurable academy name, logo and primary theme colors.
- Consistent design across all modules.
- Reusable React components.
- Frontend-first development using mock services.

### 3.2 Client Design Reference

CONFIRMED:

The existing Lovable prototype is the primary visual reference:

https://sunbeam-styler.lovable.app/

The final frontend should closely follow the approved prototype's overall visual identity, navigation approach and layout patterns.

Visual details must be verified through available screenshots or source files before exact values are finalized.

Do not claim to have verified hidden pages, interactions, exact colors or component behavior without evidence.

### 3.3 Brand Configuration

The Super Admin must eventually be able to configure:

- Academy display name.
- Academy logo.
- Primary theme color.
- Relevant academy profile details.

Additional branding options remain PROPOSED until approved.

Do not hardcode the academy's identity throughout the components.

## 4. Core Design Principles

### 4.1 Consistency

Every page must follow the same visual language.

Shared styling rules must control:

- Typography.
- Spacing.
- Colors.
- Buttons.
- Inputs.
- Tables.
- Cards.
- Dialogs.
- Navigation.
- Icons.
- Feedback states.

### 4.2 Clarity

Important data and actions must be understandable without excessive visual complexity.

Use clear page headings, labels, descriptions and action names.

### 4.3 Information Hierarchy

Arrange content using a consistent hierarchy:

1. Global navigation.
2. Page heading.
3. Relevant page actions.
4. Filters and controls.
5. Primary content.
6. Secondary information.

### 4.4 Usability

A user should understand:

- Where they are.
- Which branch is active.
- What actions they can perform.
- What data is being displayed.
- Whether an operation succeeded or failed.
- How to return to a previous screen.

### 4.5 Accessibility

Use semantic HTML, accessible forms and keyboard-operable interactions.

Do not make critical information understandable only through color.

### 4.6 Component Reusability

Use shared components instead of duplicating visual implementations.

Reuse approved patterns unless a module has a documented reason for variation.

### 4.7 Responsive Layout

The application should remain usable on supported screen sizes.

Desktop will be the primary design target, with tablet and mobile browser adaptations proposed.

### 4.8 Maintainability

Design decisions should be defined centrally, not scattered across individual JSX files.

---

## 5. Design Token System

**Status: PROPOSED**

Use centralized design tokens rather than hardcoded styling values throughout the application.

Design tokens represent reusable visual values such as colors, spacing and corner radii.

Example token categories:

- `color.background`
- `color.foreground`
- `color.primary`
- `color.primaryForeground`
- `color.secondary`
- `color.surface`
- `color.border`
- `color.success`
- `color.warning`
- `color.danger`
- `color.info`
- `spacing.*`
- `radius.*`
- `shadow.*`
- `font.*`

The actual token values must be aligned with the approved prototype.

### 5.1 Color Architecture

Use semantic color roles.

| Token | Purpose |
|---|---|
| Primary | Main actions, selected navigation and branding |
| Primary Foreground | Text/icons on primary backgrounds |
| Background | Application canvas |
| Foreground | Main text |
| Surface | Cards, tables, menus and dialogs |
| Muted | Secondary content and inactive backgrounds |
| Border | Separators, outlines and table borders |
| Success | Successful operations |
| Warning | Attention and non-critical issues |
| Danger | Destructive actions and errors |
| Info | Informational statuses |

**TBD:** Exact reference color values and approved HEX codes.

Do not invent permanent brand colors before verification.

### 5.2 Theme Customization

CONFIRMED:

The academy's branding must be configurable.

PROPOSED:

Use CSS variables or a compatible centralized theme configuration.

Theme changes should update shared components consistently.

Validate text/background contrast when users select custom colors.

Persist approved branding settings through the data service layer.

During the mock phase, use controlled demo persistence.

### 5.3 Light and Dark Theme

Light and dark modes must not be implemented independently with inconsistent styling.

**TBD:** Whether the first release requires both modes.

If dark mode is approved:

- Use semantic tokens.
- Verify accessible contrast.
- Adapt charts, forms and dialogs.
- Avoid hardcoded light-only colors.

---

## 6. Typography System

**Status: PROPOSED**

Use one consistent application font family and a limited typography scale.

The exact font family must be verified against the Lovable reference.

Recommended initial typography scale:

| Element | Proposed size |
|---|---|
| Page title | 24–28px |
| Section title | 18–20px |
| Card title | 16–18px |
| Main body text | 14–16px |
| Table content | 13–14px |
| Labels | 13–14px |
| Supporting text | 12–13px |

These are provisional ranges, not confirmed prototype measurements.

### Typography Rules

- Maintain consistent font weights.
- Use sufficient line height.
- Avoid excessively small text.
- Use distinct title, heading and body styles.
- Support long names and labels gracefully.
- Never use font size alone to indicate an error.
- Prefer readable numeric alignment for financial tables.

Use a centrally defined font and typography system.

---

## 7. Spacing and Sizing

**Status: PROPOSED**

Use a consistent spacing scale based on four-pixel increments.

Suggested spacing units:

| Token | Value |
|---|---|
| XS | 4px |
| SM | 8px |
| MD | 12px |
| Base | 16px |
| LG | 24px |
| XL | 32px |
| 2XL | 40px |
| 3XL | 48px |

Use the reference prototype to adjust these values when required.

### Layout Spacing Rules

- Keep consistent spacing between page sections.
- Align form labels and inputs.
- Apply consistent table padding.
- Use shared page container spacing.
- Avoid arbitrary margins added only to fix one screen.
- Maintain adequate space around destructive actions.

### Border Radius

Use centralized radius tokens.

Proposed examples:

- Small controls: 6px.
- Inputs and buttons: 8px.
- Cards: 10–12px.
- Larger dialogs: 12–16px.

Final values are TBD pending prototype verification.

### Shadows

Use subtle elevation to distinguish surfaces.

Avoid heavy or decorative shadows unless they are present in the approved reference.

---

## 8. Application Layout

### 8.1 Main Dashboard Layout

The primary authenticated interface should contain:

- Application sidebar.
- Top header.
- Active branch selector.
- Current user menu.
- Page title and actions.
- Main content area.

Proposed structure:

```text
+--------------------------------------------------+
| Sidebar | Top Header / User / Branch Selector     |
|         +----------------------------------------+
|         | Page Title + Primary Actions           |
|         +----------------------------------------+
|         | Filters / Search                       |
|         +----------------------------------------+
|         | Main Page Content                      |
|         |                                        |
|         +----------------------------------------+
```

Exact dimensions, placement and proportions must be aligned with the approved reference.

### 8.2 Sidebar Navigation

The sidebar must provide access to authorized modules.

Main modules:

- Dashboard
- Admissions
- Students
- Courses & Batches
- Faculty & Classes
- Fees
- Finance
- Demo Classes
- Assets
- Reports
- Settings

Administrative navigation may additionally include:

- Branch Management
- User Management

Navigation visibility must be role and branch aware.

Frontend visibility is a usability feature, not a replacement for backend authorization.

### Sidebar Standards

- Clear active-state indicator.
- Consistent icon sizing.
- Readable labels.
- Proper hover and focus states.
- Logical grouping.
- No duplicate navigation items.
- Accessible keyboard interaction.

### 8.3 Header

The header may include:

- Active page context.
- Branch selector.
- User profile menu.
- Notifications, if part of the approved product scope.
- Search, if confirmed by the reference.

Do not implement decorative controls that appear functional but perform no action.

### 8.4 Page Container

Use consistent maximum width and horizontal padding.

Avoid individually designed content widths without a documented reason.

---

## 9. Responsive Design

**Status: PROPOSED**

Desktop-first implementation is recommended because the primary ERP workflows contain tables, forms and financial data.

Suggested responsive ranges:

| Screen | Proposed behavior |
|---|---|
| Large desktop, 1440px+ | Expanded workspace and multi-column dashboards |
| Desktop, 1024–1439px | Standard ERP layout |
| Tablet, 768–1023px | Compact navigation and responsive content |
| Mobile, below 768px | Collapsible navigation and stacked content |

These are proposed breakpoints, not verified prototype specifications.

### Responsive Rules

- Sidebar must not obstruct main content.
- Tables should support horizontal overflow or an approved compact representation.
- Forms should adapt to narrower screens.
- Modal dialogs must fit the viewport.
- Critical action buttons must remain accessible.
- Avoid hidden functionality solely because screen width is small.
- Test common desktop, tablet and mobile browser sizes.

**TBD:** Officially supported minimum viewport size and client devices.

---

## 10. Shared Component Design Standards

All modules must reuse standardized UI components.

### 10.1 Buttons

Supported button types:

- Primary.
- Secondary.
- Outline.
- Destructive.
- Text/Ghost.
- Icon-only.

Required states:

- Default.
- Hover.
- Keyboard focus.
- Disabled.
- Loading.

Rules:

- One clearly identifiable primary action per relevant section.
- Destructive actions require appropriate confirmation.
- Loading actions should prevent accidental duplicate submissions.
- Icon-only buttons require accessible labels.

### 10.2 Form Inputs

Supported controls may include:

- Text input.
- Number input.
- Email input.
- Phone input.
- Password input.
- Date picker.
- Select.
- Multi-select.
- Textarea.
- Checkbox.
- Radio group.
- File upload.

Required states:

- Default.
- Focused.
- Disabled.
- Required.
- Invalid.
- Read-only.

Form rules:

- Every input must have a meaningful label.
- Required fields must be indicated.
- Errors must be displayed near affected controls.
- Validation must not rely only on color.
- Preserve entered data after recoverable errors.
- Use consistent field spacing.
- Validate on suitable events without distracting the user unnecessarily.

### 10.3 Cards

Use cards for:

- Dashboard statistics.
- Academy summaries.
- Branch overviews.
- Financial statistics.
- Course and batch summaries.
- Faculty information.

All similar cards should follow consistent:

- Padding.
- Typography.
- Radius.
- Border.
- Icon treatment.
- Number formatting.

### 10.4 Data Tables

Data tables are core ERP components.

Support, where relevant:

- Column headings.
- Sorting.
- Search.
- Filtering.
- Pagination.
- Empty states.
- Loading states.
- Row actions.
- Status indicators.
- Responsive overflow.
- Selection where required.

Rules:

- Use consistent cell padding.
- Format financial values consistently.
- Keep row actions understandable.
- Do not show sensitive information unnecessarily.
- Provide accessible table headings.
- Avoid displaying thousands of rows at once.

### 10.5 Dialogs and Modals

Use dialogs for focused tasks such as:

- Confirmation.
- Small edit forms.
- Branch selection.
- User role assignments.
- Destructive action confirmation.

Dialogs must:

- Have a meaningful title.
- Support keyboard interaction.
- Manage focus correctly.
- Include clear cancel/confirm actions.
- Prevent accidental destructive changes.
- Display validation and operation errors.

### 10.6 Status Indicators

Use consistent status colors and labels.

Examples of proposed statuses:

- Active.
- Inactive.
- Pending.
- Approved.
- Rejected.
- Paid.
- Partially Paid.
- Overdue.
- Completed.
- Cancelled.

Do not assume all status values belong to every module.

Final status vocabularies must follow the approved product requirements.

---

## 11. Dashboard Design Standards

The dashboard must adapt to the active user, role and branch.

### 11.1 Shared Dashboard Structure

PROPOSED:

1. Page heading.
2. Branch context.
3. Summary statistics.
4. Primary charts.
5. Operational lists.
6. Quick actions.

### 11.2 Super Admin Dashboard

May contain authorized academy-wide information such as:

- Total students.
- Branch overview.
- Admission summaries.
- Fee collection statistics.
- Outstanding balances.
- Staff overview.
- Branch comparisons.

### 11.3 Owner Dashboard

May contain authorized business-level information:

- Academy performance.
- Financial summaries.
- Fee collection trends.
- Enrollment statistics.
- Branch summaries.

Exact financial privileges remain subject to SECURITY.md.

### 11.4 Receptionist Dashboard

May contain permitted front-desk information:

- Today's admissions.
- Pending inquiries.
- Demo follow-ups.
- Fee collection tasks.
- Relevant student records.

### 11.5 Teacher Dashboard

May contain:

- Assigned classes.
- Assigned batches.
- Scheduled sessions.
- Assigned student information.
- Own earnings, where authorized.

Do not display academy-wide financial information to Teacher accounts unless explicitly authorized.

### 11.6 Dashboard Chart Rules

- Use consistent chart components.
- Always label units.
- Include clear time periods.
- Respect branch filters.
- Handle missing data honestly.
- Never fabricate totals.
- Display appropriate loading and error states.
- Use accessible legends and supporting labels.

A chart must derive its numbers from the same underlying records as related reports.

---

## 12. Module-Specific Screen Standards

The following specifications are structural guidelines. Exact controls and actions must follow the approved PRD and feature tickets.

### 12.1 Admissions

Screens may include:

- Admission list.
- New admission form.
- Admission details.
- Pending admissions.

Components include student information, guardian information, course selection, batch selection and admission status.

The form must use consistent multi-section layout and clear validation.

### 12.2 Students

Screens may include:

- Student directory.
- Student profile.
- Student editing.

Use consistent search, filtering, profile tabs, enrollment history and financial history presentations.

### 12.3 Courses & Batches

Use clear visual distinctions between courses, subjects and branch-specific batches.

Forms, schedules, faculty assignments and seat availability must use shared design patterns.

### 12.4 Faculty & Classes

Provide coherent faculty listings, profiles, subject assignments and teaching schedules.

Teacher-facing information should follow access restrictions.

### 12.5 Fees

Use consistent financial formatting for:

- Invoices.
- Installments.
- Fee collection.
- Discounts.
- Outstanding balances.
- Receipts.

Financial forms must clearly distinguish amounts due from amounts paid.

### 12.6 Finance

Use financial tables and charts with clear:

- Date ranges.
- Branch scope.
- Transaction types.
- Income and expenses.
- Totals and currencies.

Sensitive actions must have appropriate confirmation and authorization.

### 12.7 Demo Classes

Use consistent registration, scheduling, status, attendance and admission-conversion interfaces.

### 12.8 Assets

Provide asset listings, statuses, branch locations, condition information and maintenance history.

### 12.9 Reports

Use a shared reporting layout containing:

- Report selection.
- Date or period filters.
- Branch filters.
- Results preview.
- Export/print actions where approved.

### 12.10 Branch Management

Provide authorized branch lists, details, creation/editing interfaces and staff association information.

Branch management controls must not be displayed to unauthorized users.

### 12.11 User Management

Provide controlled interfaces for:

- Staff accounts.
- User status.
- Branch assignments.
- Multiple roles per branch.
- Permission presentation.

Do not expose sensitive credential data.

### 12.12 Settings

Provide centrally managed sections for academy branding, theme and approved operational settings.

Theme changes must remain visually consistent across modules.

---

## 13. UX States and Feedback

Every interactive module must handle relevant states.

### Loading State

Display a spinner, skeleton or progress indicator appropriate to the context.

Avoid unnecessary page flicker.

### Empty State

Show a meaningful message and, when authorized, an appropriate next action.

Example:

"No students found for the selected branch."

### Success State

Confirm successful operations without misleading the user.

Do not display success before the operation has completed.

### Error State

Use clear and actionable error messages.

Avoid displaying raw server stack traces.

### Validation State

Highlight invalid fields and explain what needs correction.

### Permission-Denied State

Show a consistent unauthorized experience.

Never reveal protected data while presenting a permission error.

### Offline/Network Failure

Distinguish connectivity errors from validation and authorization failures.

Mock mode must not pretend that remote persistence has occurred.

### Unsaved Changes

PROPOSED:

Warn users before navigating away from forms containing unsaved changes when data loss would be significant.

---

## 14. Accessibility Standards

**PROPOSED TARGET: WCAG 2.2 Level AA**

Implement appropriate accessibility practices, including:

- Semantic HTML.
- Visible keyboard focus.
- Keyboard-operable navigation.
- Proper form labels.
- Descriptive buttons.
- Suitable color contrast.
- Screen-reader-friendly statuses.
- Correct dialog focus behavior.
- Error descriptions associated with inputs.
- Sufficiently large interactive controls.
- Reduced-motion support where applicable.

Avoid replacing semantic controls with non-accessible custom elements without justification.

Accessibility must be tested, not assumed from the component library.

---

## 15. Icons, Images and Visual Assets

Use one consistent approved icon style throughout the ERP.

**PROPOSED:** Use the existing project's icon library, or Lucide if already available and approved.

Rules:

- Maintain consistent icon size and stroke treatment.
- Icons should support understanding, not replace meaningful labels where clarity is needed.
- Use real academy branding only when authorized.
- Avoid unrelated stock imagery.
- Optimize uploaded images.
- Provide appropriate alternative text.

**TBD:** Exact approved icons and media assets.

---

## 16. Print and Export Design

Receipts, invoices and reports may require printable layouts.

Print interfaces must:

- Hide unrelated navigation.
- Preserve readable typography.
- Format monetary amounts correctly.
- Show approved academy identity.
- Avoid clipping tables or totals.
- Use suitable page margins.
- Handle multi-page content where needed.

Exact receipt sizes, branding, numbering and legal requirements remain TBD.

Do not invent official receipt formats without client confirmation.

---

## 17. Component Organization

The frontend must use the existing agreed page-based structure.

Example:

```text
Client/src/
├── pages/
│   ├── Dashboard/
│   ├── Admissions/
│   ├── Students/
│   ├── CoursesBatches/
│   ├── FacultyClasses/
│   ├── Fees/
│   ├── Finance/
│   ├── DemoClasses/
│   ├── Assets/
│   ├── Reports/
│   ├── Settings/
│   ├── BranchManagement/
│   └── UserManagement/
│
├── components/
│   ├── Dashboard/
│   ├── Admissions/
│   ├── Students/
│   ├── CoursesBatches/
│   ├── FacultyClasses/
│   ├── Fees/
│   ├── Finance/
│   ├── DemoClasses/
│   ├── Assets/
│   ├── Reports/
│   ├── Settings/
│   ├── BranchManagement/
│   ├── UserManagement/
│   ├── Layout/
│   ├── Shared/
│   └── ui/
│
├── layouts/
├── routes/
├── contexts/
├── services/
└── styles/
```

Component files should have meaningful names.

Do not duplicate the same UI logic across multiple modules.

Do not create hundreds of empty placeholder components.

Do not change the approved directory conventions without authorization.

---

## 18. Design Implementation Rules for AI Agents

All coding agents must follow these rules:

1. Read AGENTS.md and approved project documentation.
2. Review this DESIGN.md before modifying frontend visual components.
3. Follow the approved Lovable design reference.
4. Reuse existing UI components.
5. Do not invent unrelated visual themes.
6. Use centralized design tokens.
7. Preserve responsive behavior.
8. Support keyboard and accessible interaction.
9. Separate presentation from business logic.
10. Avoid hardcoded academy branding.
11. Use consistent form validation and feedback styles.
12. Do not create decorative buttons with no functionality.
13. Do not change unrelated modules.
14. Do not overwrite working components without approval.
15. Run relevant lint, component tests and production build checks.
16. Report visual differences from the approved reference.
17. Mark unimplemented interactions honestly.
18. Stop before implementing a new unapproved feature ticket.

---

## 19. Phase-Based Design Development

The frontend design will be implemented progressively.

| Phase | Design Focus |
|---|---|
| F00 | Layout foundation, design tokens, sidebar, header, routing and theme |
| F01 | Four role-based dashboards |
| F02 | Admissions |
| F03 | Students |
| F04 | Courses and Batches |
| F05 | Faculty and Classes |
| F06 | Fees |
| F07 | Finance |
| F08 | Demo Classes |
| F09 | Assets |
| F10 | Reports |
| F11 | Branch Management |
| F12 | User Management |
| F13 | Settings and integrated frontend QA |

Each phase must use the same approved visual language.

The design system should be established during F00, then reused throughout later phases.

### Phase Acceptance Criteria

A phase may be considered visually complete only when:

- The screens reflect approved references.
- Shared components are reused appropriately.
- Required interactions behave correctly.
- Responsive layouts have been checked.
- Loading, empty, error and disabled states are handled.
- Relevant accessibility checks have been performed.
- Existing UI has not regressed.
- Remaining visual discrepancies are documented.

---

## 20. Design Quality Checklist

Before approving a frontend ticket, verify:

- [ ] The page matches the approved design direction.
- [ ] Typography is consistent.
- [ ] Spacing is consistent.
- [ ] Colors use shared tokens.
- [ ] Buttons use approved variants.
- [ ] Forms contain labels and validation states.
- [ ] Tables use consistent formatting.
- [ ] Navigation is clear.
- [ ] Branch context is displayed appropriately.
- [ ] Role-specific information is not incorrectly shown.
- [ ] Responsive behavior is usable.
- [ ] Keyboard navigation works.
- [ ] Loading and error states exist where applicable.
- [ ] No misleading dummy values are presented as real data.
- [ ] No unrelated components were changed.
- [ ] Relevant tests and build checks pass.

A page is not complete simply because it looks attractive.

---

## 21. Open Design Questions (TBD)

The following decisions require verification or approval:

1. Exact HEX values of reference colors.
2. Exact typography family and font weights.
3. Final sidebar dimensions and navigation spacing.
4. Final header dimensions.
5. Card border-radius and shadow values.
6. Required dark-mode support.
7. Minimum supported desktop/mobile screen sizes.
8. Approved academy logo and imagery.
9. Receipt and invoice print layouts.
10. Branding settings allowed for Super Admin.
11. Final icon library and icon treatment.
12. Role-specific dashboard widget visibility.
13. Any prototype screens not yet documented.
14. Language and localization requirements.
15. Accessibility testing scope.

These questions must not be silently answered by the coding agent.

---

## 22. Relationship to Other Documents

This DESIGN.md owns the visual standards and UX consistency rules.

Other documents own their respective requirements:

- [PRD](../00-CORE/PRD.md) — Product requirements.
- [System Design](../00-CORE/SYSTEM_DESIGN.md) — Business workflows.
- [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md) — Implementation architecture.
- [Security](../SECURITY.md) — Roles and authorization.
- [Frontend Integration](FRONTEND_INTEGRATION.md) — UI behavior and API contracts.
- [Feature Tickets](../00-CORE/FEATURE_TICKETS.md) — Implementation tasks.
- [Engineering Rules](../00-CORE/RULES.md) — Mandatory code quality.
- [Tasks](../00-CORE/TASKS.md) — Active implementation work.
- [Progress](../00-CORE/PROGRESS.md) — Verified completion.
- [Documentation Index](../00-CORE/README.md) — Documentation navigation.

If requirements conflict, stop and request clarification rather than inventing a resolution.

---

## 23. Approval and Change Management

The client has approved the overall System Design and Architecture direction.

Detailed design tokens and undocumented interactions remain subject to verification.

After design approval, changes must follow this process:

1. Record the requested change.
2. Identify affected screens and shared components.
3. Assess the impact on roles, branches and data flows.
4. Update the authoritative documentation.
5. Update affected implementation tickets.
6. Implement the approved change.
7. Run relevant visual and functional regression tests.
8. Update project progress and decision records.

Do not reinterpret a minor client change as permission to redesign the whole ERP.

---

**Document Status:** DRAFT — Pending Visual Verification and Approval
**Current Development Authorization:** Documentation review only

This document defines professional visual and UX standards for the Academy Management ERP. It does not authorize implementation of unapproved features or replacement of the client-approved visual direction.

## MOBILE-20261018 - Confirmed mobile presentation scope (2026-10-18)

Owner approved mobile-only presentation at widths <=767px, targeting320,360,375,390,414 and430px plus landscape. Existing >=768px design remains unchanged. Reuse the current accessible drawer/topbar, semantic theme, compact KPI grids, existing record cards where available, bounded inner table scroll with all data/actions preserved, readable single-column forms and viewport-fit dialogs. Inline admission summary belongs below the form and must not cover inputs. Respect safe areas/reduced motion and existing permissions. Mobile-specific rules are screen-only to preserve print/PDF appearance. MOBILE-20261018 is IN_REVIEW pending owner acceptance; this does not authorize new business rules or alter existing desktop tokens. Validation/evidence and physical-device limitations are recorded in PROGRESS.md.


## DEMO-REGISTER-CLASSES-20261018 - Owner-approved registration dialog update

Scoped polished Demo registration dialog: candidate details, dependent Field/Course/Batch controls, saved-class timing cards with subject/teacher/day/time/room, preferred date/time and notes. Bounded width720px, viewport-relative height, independently scrollable body and persistent Cancel/Register footer. Mobile single-column form and safe-area footer retained. Scope excludes the rest of desktop/mobile ERP. Nine actual Edge viewport cases including320px and1440px passed. IN_REVIEW pending owner acceptance.


## Demo candidate action menu - 2026-10-18

Demo desktop rows and mobile cards share a compact three-dot action menu with keyboard navigation, Escape dismissal and portal positioning to avoid table clipping. Delete opens explicit confirmation; converted linked records show disabled Delete with an explanation.


## DEMO-MULTI-CLASS-20261018

Demo registration class cards now independently toggle aria-pressed and retain multiple selections, with a visible selected count. Existing compact form layout is preserved. Demo Details displays all requested class snapshots with 12-hour timings.


## ASSETS-LIVE-FLOW-20261019

Owner reauthorizes Assets functionality and compact non-overflowing inventory layout after previous targeted undo. Existing centralized asset services remain the data source; register/edit/assign/unassign/inspection/maintenance mutations retain persistence and branch/permission checks. Added cleaned-up focus/storage/minute refresh with latest-request guard so summaries and rows reflect saved changes. Added duplicate-submit guards. KPI loading/errors no longer masquerade as zero totals. Desktop inventory uses fixed percentage widths, compact single-line typography/ellipsis and bounded text; full details remain accessible. Existing mobile cards retained. Sidebar stacks below the table until1600px to provide readable table width. PASS37 database/asset-service/mounted-page tests, including actual UI registration/card totals and external saved inspection/value refresh; full lint0/0; production build with existing large-chunk warning; isolated Edge actual registration, persistence, table refresh and no horizontal table/page overflow at360/768/1024/1366/1440/1600px; git diff --check. Full suite NOT_RUN. No owner-record changes, no new seeding/schema change or commit/push. IN_REVIEW pending owner acceptance.


## ASSETS-100-PERCENT-20261019

Owner supplies80%-zoom reference and requests its compact proportions at normal100% zoom. Scoped desktop Assets presentation now uses approximately75/25 inventory/right-inspection split, compact cards/filter typography and fixed100%-total table column proportions; category tabs stay in one internally scrollable line, filters remain one row, rows retain single-line truncation with accessible Details. Reduced cell padding and icons; attached pagination preserved. No browser zoom/transform, data, status or business-rule changes. PASS targeted lint, production build (existing chunk warning), isolated fictional8-record Edge checks at1366/1440/1920 at deviceScaleFactor1, right-sidebar positioning, no table/page horizontal overflow;1440 screenshot visually inspected. Existing mobile styling retained. Runtime tests NOT_RUN for this scoped presentation pass. IN_REVIEW; no commit/push.


## REPORTS-CATEGORY-STYLING-20261019

Owner requests pale maroon bordered report category options with relevant icons and improved hover. Added semantic icons via existing TAB_CONFIG and imported Lucide components, light maroon inactive tabs/container/badges, deeper maroon hover, preserved solid active state; added pressed state and focus ring. Filtering/count logic unchanged. PASS production build (existing chunk warning) and git diff --check. Lint not rerun: previous Reports9 errors/2 warnings remain documented; runtime tests NOT_RUN for this presentation change.


## REPORTS-KPI-COLORS-FIT-20261019

Owner requests shared colorful KPI backgrounds and smaller nonbreaking content for every Reports category. Reused shared top-kpi-card gradients/borders/hover, reduced padding and label/value/subtext sizes, constrained content tracks with min-width0, single-line ellipsis and full-text titles. Existing metric values/calculations preserved. PASS build (existing chunk warning), isolated Edge all8 category card groups at390/1366/1440: contained single-line content; git diff --check. Lint/full tests NOT_RUN; earlier Reports lint issues documented.


## REPORTS-FILTER-FOOTER-EXPORT-20261019

Owner requests compact colored filter section with hover, attached rows-per-page footer and table-header PDF/spreadsheet export icons. Reduced filter padding/control heights/label sizes, pale maroon background/borders/hover. Reused shared Pagination (default10,10/15/25/50, ranges, numbered pages) inside report table container. Reused toolbar PDF/CSV icons connected to existing filtered/selected exports. Updated obsolete test expecting owner-removed Schedule Summary button to current header/export/pagination assertions; no skipped tests. PASS4 Reports tests, build (existing chunk warning), disposable browser page-size selection/filter menu and actual PDF/CSV downloads; git diff --check. Existing Reports lint findings unchanged, full suite NOT_RUN. No business/filter logic or owner-data modifications.

## REPORTS-TABLE-FIT-20261019

Owner authorizes compact Reports ledger sizing at normal100% browser zoom using supplied80% screenshot as reference. Scoped desktop-only ledger CSS reduces cell padding, primary/secondary typography, avatars and search dimensions; automatic table column sizing and bounded horizontal scrolling retained. No data/action/export changes or browser zoom manipulation. Status: IN_REVIEW pending owner visual acceptance. PASS production build (existing chunk warning) and git diff --check. Browser visual comparison NOT_RUN. Reports tests attempted but runner stalled without results and was interrupted; no test pass claimed.


## REPORTS-LEFT-TREND-20261019 - Left analytics card redesign

Left meter replaced by white bordered card, smooth maroon area chart, zero-based axis, compact tooltip and dashed slate finance outflow. Existing7/5 split/right donut retained; mobile controls wrap. Default Month groups all matching dates. Period buttons change grouping; Date Range limits only chart data. Missing activity intervals show zeros; no data shows empty state; one period shows a point and sparse-data explanation. No fabricated history or targets. Owner-authorized; IN_REVIEW.


## REPORTS-TREND-SUMMARY-20261019

Owner approves reference-style icon/label/value summaries inside each Reports left chart card. Three real filtered-ledger metrics below chart; maroon/amber tinted circular icons, responsive3-column desktop/stacked mobile. Snapshot scope explicitly labeled separately from chart dates. A single calendar period is a rounded bar with an explanation; multiple periods remain the smooth area chart. No guessed target percentages. Verification in PROGRESS.md; IN_REVIEW.


## SETTINGS-BRANDING-DESIGN-20261020

Owner authorizes visual polish of Branding & Visual Identity only. SettingsPage.jsx now uses a soft theme-tinted maroon/white gradient, icon-led header, three white identity/color/logo field cards, bordered color-swatch tiles and framed sidebar preview. Small sky/slate tint balances the sidebar section; primary accents still follow configured theme tokens. Responsive grids/wrapping preserve desktop/mobile fit. Added explicit input labels and semantic sidebar section. Original upload validation/file reader, save/cancel/reset handlers and hidden settings persistence are unchanged. No extra sections, packages or workflows introduced.

## Premium role-dashboard alignment — 2026-10-22

The Super Admin dashboard remains the visual reference. All five roles now render the same shared KPI card primitive with identical 12px radius, 144px minimum height, accent-bar palettes, icon treatments, typography and shadow. Owner, Receptionist and Teacher panels use the same white surfaces, soft borders, rounded headers and spacing against the existing `#F7F8FC` theme background. Role-specific content and semantic status colors remain unchanged.

PASS12/12 AdminOperations/branding-context regression tests, touched ESLint, production build (existing export chunk warning), whitespace check. Isolated Edge verifies1440/1024/768/390 widths without page overflow, live color preview, Cancel, Save/reload, Reset and no JS errors; visually reviewed desktop screenshot. All browser changes used disposable demo storage, no owner records changed. Upload handler unchanged; additional file-upload browser regression NOT_RUN. Full repository suite NOT_RUN. IN_REVIEW pending owner visual acceptance. Application file: Client/src/pages/Settings/SettingsPage.jsx; task/progress/ticket/design records updated. Screenshots/check: artifacts/settings-branding-design-20261020. No commit/push; unrelated edits retained. Next approval: owner visual review.


## AUDIT-LOG-20261020
Owner-authorized Audit Log uses existing maroon accents, semantic white Card, compact labeled search/filter row, desktop six-column table and mobile activity cards, colored Important/Normal markers, shared pagination and readonly before/after dialog. Current branch and Asia/Karachi timestamp context shown. No redesign of other modules. Desktop/mobile browser evidence and actual tests recorded in PROGRESS.md. IN_REVIEW.

## F13-BRANCH-THEME-DARK-MODE - 2026-10-21

CONFIRMED: Global theme and independent sidebar colors are saved per branch and shared by all roles assigned to that branch. Primary color drives semantic buttons, active controls, highlights, focus states and legacy maroon utilities. Dark mode uses dark semantic page, topbar, card, menu, table, input, gradient and status surfaces with high-contrast text; explicitly customized sidebar colors remain independent, while untouched default sidebar colors receive dark-mode defaults. Print styles remain unchanged.

## Responsive role-dashboard rules — 2026-10-22

Phone dashboards use compact two-column KPI/action grids from 360px and a single KPI column below 360px. Tablet quick actions use two columns through 1199px so labels and icons remain contained beside the desktop sidebar. Mobile navigation, search and dialogs keep touch-sized controls and viewport-bounded surfaces; wide tables retain their fields inside local horizontal scrollers rather than widening the document. Desktop presentation keeps the established Super Admin design tokens.
