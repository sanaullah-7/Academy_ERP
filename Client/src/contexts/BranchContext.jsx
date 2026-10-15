/**
 * Purpose: Will define Branch Context for the contexts area of the Academy frontend.
 * Module: contexts
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { BranchContext } from './accessContexts.js'
import { useAuth } from '../hooks/useAuth.js'
import { getAuthorizedBranches } from '../mock/authFixtures.js'
import { getBranchRoles } from '../constants/roles.js'

export function BranchProvider({ children }) {
  const { user, branchId: selectedId, selectBranch, revision } = useAuth()
  const branches = getAuthorizedBranches(user)
  const branch = branches.find((candidate) => candidate.id === selectedId) ?? null
  const roles = branch ? getBranchRoles(user, branch.id) : []
  // Consumers key transient branch UI by scopeKey; user/branch changes invalidate it.
  const scopeKey = `${user?.id ?? 'anonymous'}:${branch?.id ?? 'none'}:${revision}`
  return <BranchContext.Provider value={{ branches, branch, branchId: branch?.id ?? null, roles, selectBranch, scopeKey }}>{children}</BranchContext.Provider>
}
