# Final frontend QA — 2026-10-23

Ticket: `FINAL-FRONTEND-QA-DEV-PUSH-20261023`.
Owner authorization: final QA of all existing uncommitted frontend work, followed by a normal commit/push to `origin/dev` only after critical checks pass. No backend or production deployment is authorized.

## Corrections from this review

- Reports derives its effective selected category from current permissions. Receptionist opens Fees instead of the hidden Payroll category; a now-denied Finance/Payroll selection also falls back immediately.
- Teacher dashboard session clicks and keyboard activation open the own-profile timetable instead of the denied branch-wide Faculty route.
- The mobile notification panel is anchored inside the viewport. Its prior right-aligned placement relative to the bell clipped the panel off the left edge of phone screens.
- The report-trend assertion now enumerates all nine approved categories, including Payroll, instead of expecting the historical eight-category count.
- Existing source, tests, responsive styling, payroll history and documentation changes were preserved. No dependency or lint suppression was introduced.

## Automated validation

- Initial full ESLint: PASS, 0 errors / 0 warnings. Final full ESLint: PASS, 0 errors / 0 warnings.
- Initial complete Vitest: 689 passed / 1 obsolete assertion failed, across 84 files. The assertion was corrected without removing any test.
- Intermediate complete run: 690/690 PASS. Later focused Reports/trend tests: 31/31 PASS. Teacher profile/navigation tests: 7/7 PASS after correcting the test update payload to the adapter's existing schema.
- A run already in progress while that new navigation test was being edited read its earlier invalid fixture payload and ended at 691 passed / 1 failed. The corrected seven-test file passed separately; a fresh full run uses an unchanged final source tree.
- Final unchanged-tree complete Vitest run after all fixes: PASS, 692/692 tests across 84/84 files, 254.33 seconds. No tests skipped or disabled.
- Production build after source corrections: PASS. The existing large PDF/Three chunks still trigger Vite's size advisory; the owner explicitly excludes risky bundle restructuring just to silence it.
- jsdom emits its existing unsupported Canvas `getContext` diagnostic. Browser runtime checks have zero page errors; no canvas dependency or output suppression was added.

## Browser verification

Disposable headless Edge contexts exercised saved records without changing the owner's browser storage.

| Role | Saved academic/fee data | Payroll reporting | Navigation/access |
| --- | --- | --- | --- |
| Super Admin | Newly saved assignment, enrollment and verified fee receipt | Authorized | Desktop/mobile/search/direct routes PASS |
| Admin | Same saved branch records | Authorized | Desktop/mobile/search/direct routes PASS |
| Owner | Authorized saved academic and financial summaries | Readonly authorized | Restricted administration hidden/denied |
| Receptionist | Operational records and fee receipt; Reports starts on Fees | No payroll/expense data | Restricted finance/administration hidden/denied |
| Teacher | Own assigned subject, batch and matching enrolled student | Own compensation only; organization report denied | Own profile/timetable works; broad routes denied |

- Salary fixture: 15,000 due; 5,000 partial then 10,000 final payment; Reports shows 15,000 paid and zero remaining. PDF/CSV downloads contain the saved batch. Existing complete-suite integration tests verify one Finance posting per payment and mutation/branch isolation.
- Branch role-switch checks remove stale navigation permissions; logout clears sensitive transient page snapshots. Source-version invalidation is covered by complete-suite dashboard/report/cache integration tests.
- All visible modules for all five roles were checked at 320, 360, 390, 430, 768, 1024, 1366 and 1440px. Dashboard checks additionally cover 375, 414, 820, 1280, 1920px and landscape sizes. No document horizontal overflow; drawer, search, branch menu and staff dialog fit.
- Warm SPA observation across role-authorized modules was about 140–499ms, including a 120ms observation window. Loading observations: one initial module observation for each administrator role, zero for other roles. This is an observation count, not a guarantee of no possible loading frames.
- Teacher profile/session browser checks PASS at 1440×900 and 390×844 after the navigation fix.
- Browser harnesses/screenshots remain ignored under `artifacts/` and are excluded from the release commit.

## Boundaries and release safety

- Frontend/localStorage mock only: different browser profiles/devices do not synchronize without the deferred shared backend. This is not production authentication or backend authorization.
- Physical-device software-keyboard testing and backend integration: NOT_RUN.
- Initial `git fetch origin dev` found 0 local-only / 0 remote-only commits. Remote must be checked again immediately before committing/pushing.
- Stage only reviewed source/tests and nonempty project documentation. Secrets, all `.env` files, build output, dependencies, artifacts and temporary files are excluded. Empty local `docs/API.md` and `docs/DATABASE.md` placeholders remain untouched and untracked.
- Release criteria PASS. The owner-authorized normal commit/push follows the final index/path/remote checks; its actual hash and remote verification are reported after those commands complete.
