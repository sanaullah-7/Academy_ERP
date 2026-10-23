/**
 * MongoDB Compound Index conventions and optimization helpers for multi-tenant ERP.
 * 
 * Rules:
 * 1. Every tenant-scoped collection must lead with `organizationId: 1`.
 * 2. Every branch-scoped collection must lead with `organizationId: 1, branchId: 1`.
 * 3. Range queries and sort keys (e.g. `createdAt: -1`) must follow equality keys (ESR rule: Equality, Sort, Range).
 */

export const INDEX_PATTERNS = Object.freeze({
  TENANT_ONLY: { organizationId: 1 },
  TENANT_BRANCH: { organizationId: 1, branchId: 1 },
  TENANT_BRANCH_CREATED: { organizationId: 1, branchId: 1, createdAt: -1 },
  TENANT_BRANCH_STATUS: { organizationId: 1, branchId: 1, status: 1 },
  TENANT_USER: { organizationId: 1, userId: 1 },
  TENANT_CODE: { organizationId: 1, code: 1 },
})

/**
 * Validates that an index definition obeys multi-tenant isolation by leading with organizationId.
 */
export function assertTenantPrefix(indexFields = {}) {
  const keys = Object.keys(indexFields)
  if (keys.length === 0 || keys[0] !== 'organizationId') {
    throw new Error('Index definition must lead with "organizationId" for strict multi-tenant isolation.')
  }
  return true
}

/**
 * Validates that a branch-scoped index definition obeys branch isolation by leading with organizationId and branchId.
 */
export function assertTenantBranchPrefix(indexFields = {}) {
  const keys = Object.keys(indexFields)
  if (keys.length < 2 || keys[0] !== 'organizationId' || keys[1] !== 'branchId') {
    throw new Error('Branch-scoped index must lead with "organizationId" followed by "branchId".')
  }
  return true
}
