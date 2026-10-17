import { MOCK_ORGANIZATION_KEY } from '../constants/storageKeys.js'

export const ORGANIZATION_LICENSE_LIMIT = 5
const defaultSettings = { academyName: 'The Scholar Coaching Academy', tagline: '', contactEmail: '', contactPhone: '', website: '', streetAddress: '', city: '', province: '', country: '', description: '', primaryColor: '#940016', logo: null, sidebarBackground: '#FFFFFF', sidebarText: '#111827', sidebarIcon: '#111827', sidebarActive: '#940016', notificationsConfigured: false }
export function readOrganization() {
  const raw = localStorage.getItem(MOCK_ORGANIZATION_KEY)
  if (!raw) return { version: 1, branches: [], users: [], deletedUserIds: [], assignmentOverrides: {}, profileOverrides: {}, settings: { ...defaultSettings } }
  const value = JSON.parse(raw)
  if (value?.version !== 1 || !Array.isArray(value.branches) || !Array.isArray(value.users) || !value.settings) throw new Error('Saved organization settings are invalid; existing data was preserved.')
  value.deletedUserIds ??= []
  if (!Array.isArray(value.deletedUserIds)) throw new Error('Saved deleted staff identities are invalid; existing data was preserved.')
  value.assignmentOverrides ??= {}
  value.profileOverrides ??= {}
  value.settings = { ...defaultSettings, ...value.settings }
  return value
}
export function writeOrganization(value) { localStorage.setItem(MOCK_ORGANIZATION_KEY, JSON.stringify(value)); return value }
