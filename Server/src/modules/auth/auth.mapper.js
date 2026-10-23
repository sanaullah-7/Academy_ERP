export function toSafeUser(user) {
  if (!user) return null
  const id = user._id ? user._id.toString() : user.id
  return {
    id,
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    organizationId: user.organizationId,
    isProtected: Boolean(user.isProtected),
    lastLoginAt: user.lastLoginAt || null,
  }
}

export function toAuthorizedBranches(user) {
  if (!user || !Array.isArray(user.assignments)) return []

  const activeAssignments = user.assignments.filter(
    (a) => a.status === 'active' && Array.isArray(a.roles) && a.roles.length > 0
  )

  return activeAssignments.map((assignment) => {
    // If single role, assign it directly; if multiple, keep array
    const singleRole = assignment.roles.length === 1 ? assignment.roles[0] : null
    return {
      id: assignment.branchId,
      branchId: assignment.branchId,
      roles: [...assignment.roles],
      role: singleRole,
    }
  })
}

export function toAuthResponse({ user, activeBranch, branches, permissions, csrfToken }) {
  return {
    data: {
      user: toSafeUser(user),
      branches,
      activeBranch,
      permissions,
      csrfToken,
    },
  }
}
