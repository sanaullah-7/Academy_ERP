import { canAccess, PERMISSIONS } from '../constants/permissions.js'

// Explicit owner-approved DEMO module policy only; never a production permission grant.
export const canViewAdmissions = (user, branchId) => canAccess(PERMISSIONS.ADMISSIONS_VIEW, user, branchId)
export const canCreateAdmissions = (user, branchId) => canAccess(PERMISSIONS.ADMISSIONS_CREATE, user, branchId)
export const canEditAdmissions = (user, branchId) => canAccess(PERMISSIONS.ADMISSIONS_EDIT, user, branchId)

// Owner-approved active-branch Admin, Super Admin and Receptionist decisions.
export const canDecideAdmission = (user, branchId) => canAccess(PERMISSIONS.ADMISSIONS_DECIDE, user, branchId)
// Latest owner approval supersedes the historical Pending Delete deferral above.
export const canDeleteAdmission = (user, branchId) => canAccess(PERMISSIONS.ADMISSIONS_DELETE, user, branchId)
