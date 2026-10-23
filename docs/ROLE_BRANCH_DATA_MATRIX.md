# Role, Branch and Data Matrix

**Actual frontend rules:** `constants/roles.js`, `permissions.js`, `moduleAccess.js`, `routes/ProtectedRoute.jsx`, `authFixtures.js` and service checks. Unknown/ambiguous assignments fail closed. Platform Admin is **not implemented**.

## 1. Module visibility

| Module | Super Admin | Admin | Receptionist | Owner | Teacher |
|---|---:|---:|---:|---:|---:|
| Dashboard | Full | Full | Operational | Summary | Own summary |
| Admissions | Full | Full | Full | View | Hidden |
| Students | Full | Full | Add/Edit/View | View | Hidden in canonical module registry |
| Courses & Batches | Full | Full | View | View | Hidden |
| Faculty & Classes | Full | Full | View/Edit class | View | Hidden; own profile remains reachable |
| Fees | Full | Full | Manage/Collect/View | View | Hidden |
| Finance | Full | Full | Hidden | View/manage expense per current grants | Hidden |
| Teacher Payroll | Full | Full | Hidden | View | Own compensation through profile/dashboard service path |
| Demo Classes | Full | Full | Full | View | Hidden |
| Assets | Full | Full | View/Create/Update | View | Hidden |
| Reports | Full + branch compare | Full + branch compare | View without expenses | View | Hidden |
| Audit, Branches, Users, Settings | Full | Full | Hidden | Hidden | Hidden |

Teacher has an empty `SINGLE_ROLE_GRANTS` list except the special `dashboard.view` rule. Teacher-owned profile/payroll behavior is implemented as narrowly scoped service exceptions, not broad module grants. This difference must be preserved or deliberately reconciled before backend integration.

## 2. Action grants

- Super Admin and Admin receive `FULL_ACCESS_GRANTS`. Organization service adds a critical distinction: Admin cannot create/modify/disable/delete Admin or Super Admin and can assign only Owner, Receptionist or Teacher in the current branch.
- Receptionist may decide admissions, edit students/classes, collect/manage fees, manage demos and create/update assets. It lacks Finance, Payroll, branch/user/settings/audit grants; report projection removes expenses.
- Owner has read grants for academic/financial modules plus `expenses.manage` in current code. Owner does not manage users/settings/branches/audit.
- Teacher reads dashboard universally for its assigned branch and receives own-record projections. It cannot use organization-wide module routes.

## 3. Assignment and branch model

A user has `assignments[] = { branchId, roles[] }`. `getBranchRoles` requires exactly one assignment entry for the selected branch and known non-empty roles; duplicate entries or multi-role results fail closed. `getAuthorizedBranches` filters enabled/active assigned branches. The session stores one `branchId`; `selectBranch` checks it against current authorization.

The data envelope uses `branchId` on operational records. Every domain service expects `{branchId}` and rechecks that the session branch matches. Report all-branch comparison is an explicit exception requiring `reports.compareBranches` and still selects only authorized branches.

## 4. Isolation surfaces

| Surface | Implemented control |
|---|---|
| Sidebar/mobile navigation | `visibleModules(can)` from canonical registry |
| Ctrl+K search | same registry plus permission-gated domain providers |
| Direct URL | `ProtectedRoute` permission redirect |
| Page buttons | `usePermissions().can` checks |
| Services | session + active branch + permission recheck |
| Adapter/query | collection filter by `branchId`; many mutations revalidate references |
| Dashboard | role-specific projection; teacher owned rows only |
| Reports/export | authorized projection before client export |
| Cache | key/signature includes user, branch, roles/permissions and raw storage |
| Logout | clears session and derived page cache |

## 5. Production boundary

All controls above execute in the browser and can be bypassed by a malicious user. Production must authenticate server-side and derive tenant, user, branch, role and record ownership from trusted session data. Never accept a client-supplied role or authorize solely from `branchId` in a request. Queries, exports and aggregate endpoints must apply the same scope before returning data.

## 6. Unverified decisions

- The docs describe possible multiple roles in one branch, but actual `canAccess` requires exactly one effective role. Multi-role combination policy is unresolved.
- A separate Platform Admin/tenant operator does not exist.
- Teacher direct Students/Courses/Faculty module navigation is hidden despite owner matrix wording about assigned-only data; owned data is currently dashboard/profile based.
- Owner expense mutation grant exists in code; whether this remains in production needs explicit acceptance.
