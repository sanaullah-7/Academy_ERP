import { appendAudit } from './mockAudit.js'
import { MOCK_ORGANIZATION_KEY } from '../constants/storageKeys.js'

export const ORGANIZATION_LICENSE_LIMIT = 5
const defaultSettings = { academyName: 'The Scholar Coaching Academy', tagline: '', contactEmail: '', contactPhone: '', website: '', streetAddress: '', city: '', province: '', country: '', description: '', primaryColor: '#940016', logo: null, sidebarBackground: '#FFFFFF', sidebarText: '#111827', sidebarIcon: '#111827', sidebarActive: '#940016', branchThemes: {}, notificationsConfigured: false, teacherPayrollEnabled: true }
// One canonical snapshot, checked against storage on EVERY read (including other tabs).
// Return detached values so callers cannot mutate the next reader's permissions.
let organizationSnapshot = null
export function readOrganization() {
  const raw = localStorage.getItem(MOCK_ORGANIZATION_KEY)
  if (!raw) return { version: 1, branches: [], users: [], deletedUserIds: [], assignmentOverrides: {}, profileOverrides: {}, settings: { ...defaultSettings } }
  if (organizationSnapshot?.raw === raw) return structuredClone(organizationSnapshot.value)
  const value = JSON.parse(raw)
  if (value?.version !== 1 || !Array.isArray(value.branches) || !Array.isArray(value.users) || !value.settings) throw new Error('Saved organization settings are invalid; existing data was preserved.')
  value.deletedUserIds ??= []
  if (!Array.isArray(value.deletedUserIds)) throw new Error('Saved deleted staff identities are invalid; existing data was preserved.')
  value.assignmentOverrides ??= {}
  value.profileOverrides ??= {}
  value.branchOverrides ??= {}
  value.deletedBranchIds ??= []
  if (!value.branchOverrides || typeof value.branchOverrides !== 'object' || Array.isArray(value.branchOverrides) || !Array.isArray(value.deletedBranchIds)) throw new Error('Saved branch settings are invalid; existing data was preserved.')
  value.settings = { ...defaultSettings, ...value.settings }
  if (value.settings.teacherPayrollEnabled === undefined || value.settings.teacherPayrollEnabled === null || value.settings.teacherPayrollEnabled === false) {
    value.settings.teacherPayrollEnabled = true
  }
  organizationSnapshot = { raw, value: structuredClone(value) }
  return value
}
export function writeOrganization(value) { const previous=readOrganization(); const saved={...value,auditLogs:appendAudit(previous,value,'organization')}; localStorage.setItem(MOCK_ORGANIZATION_KEY, JSON.stringify(saved)); organizationSnapshot = null; return value }
