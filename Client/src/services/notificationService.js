import { MOCK_NOTIFICATIONS_KEY } from '../constants/storageKeys.js'
import { getBranchRoles, ROLES } from '../constants/roles.js'
import { getDemoUsers } from '../mock/authFixtures.js'
import { authService } from './authService.js'

export const NOTIFICATION_CHANGED_EVENT = 'academy:notifications-changed'
const VERSION = 1
const MAX_ITEMS = 500

function readStore() {
  try {
    const raw = localStorage.getItem(MOCK_NOTIFICATIONS_KEY)
    if (!raw) return { version: VERSION, items: [] }
    const value = JSON.parse(raw)
    if (value?.version !== VERSION || !Array.isArray(value.items)) throw new Error()
    return value
  } catch {
    return { version: VERSION, items: [] }
  }
}

function writeStore(store) {
  localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify({ version: VERSION, items: store.items.slice(0, MAX_ITEMS) }))
  window.dispatchEvent(new CustomEvent(NOTIFICATION_CHANGED_EVENT))
}

const branchRoles = (user, branchId) => getBranchRoles(user, branchId)
const activeInRole = (user, branchId, role) => {
  const roles = branchRoles(user, branchId)
  return user.enabled !== false && !user.accessRevoked && roles.length === 1 && roles[0] === role
}

function recipientsFor(type, actor, branchId, teacherId) {
  const actorRoles = branchRoles(actor, branchId)
  if (actorRoles.length !== 1) return []
  if (actorRoles.includes(ROLES.OWNER)) return []
  const users = getDemoUsers()
  if (type === 'class_assigned' || type === 'salary_payment') {
    if (!actorRoles.some(role => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role))) return []
    return users.filter(user => user.id === teacherId && activeInRole(user, branchId, ROLES.TEACHER))
  }
  if (!['student_added', 'challan_created'].includes(type)) return []
  if (actorRoles.includes(ROLES.RECEPTIONIST)) {
    return users.filter(user => [ROLES.SUPER_ADMIN, ROLES.ADMIN].some(role => activeInRole(user, branchId, role)))
  }
  if (actorRoles.some(role => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role))) {
    return users.filter(user => activeInRole(user, branchId, ROLES.RECEPTIONIST))
  }
  return []
}

function copy(item) { return { ...item } }

export const notificationService = {
  async publish({ type, branchId, entityId, teacherId, title, message }) {
    const session = await authService.getSession()
    if (!session?.user || session.branchId !== branchId || !entityId) return []
    const recipients = recipientsFor(type, session.user, branchId, teacherId).filter(user => user.id !== session.user.id)
    if (!recipients.length) return []
    const store = readStore(), now = new Date().toISOString(), created = []
    for (const recipient of recipients) {
      const eventKey = `${type}:${branchId}:${entityId}:${recipient.id}`
      if (store.items.some(item => item.eventKey === eventKey)) continue
      const item = { id: `notification-${crypto.randomUUID()}`, eventKey, recipientUserId: recipient.id, branchId, type, title: String(title ?? '').slice(0, 120), message: String(message ?? '').slice(0, 320), actorName: session.user.name, entityId, createdAt: now, readAt: null }
      store.items.unshift(item); created.push(copy(item))
    }
    if (created.length) writeStore(store)
    return created
  },
  async list({ branchId }) {
    const session = await authService.getSession()
    if (!session?.user || session.branchId !== branchId || branchRoles(session.user, branchId).includes(ROLES.OWNER)) return []
    return readStore().items.filter(item => item.recipientUserId === session.user.id && item.branchId === branchId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(copy)
  },
  async markRead(id, { branchId }) { return this.update(id, branchId, item => ({ ...item, readAt: item.readAt || new Date().toISOString() })) },
  async markAllRead({ branchId }) {
    const session = await authService.getSession(); if (!session?.user || session.branchId !== branchId) return []
    const store = readStore(), now = new Date().toISOString(); let changed = false
    store.items = store.items.map(item => { if (item.recipientUserId === session.user.id && item.branchId === branchId && !item.readAt) { changed = true; return { ...item, readAt: now } } return item })
    if (changed) writeStore(store)
    return store.items.filter(item => item.recipientUserId === session.user.id && item.branchId === branchId).map(copy)
  },
  async remove(id, { branchId }) {
    const session = await authService.getSession(); if (!session?.user || session.branchId !== branchId) return false
    const store = readStore(), before = store.items.length
    store.items = store.items.filter(item => !(item.id === id && item.recipientUserId === session.user.id && item.branchId === branchId))
    if (store.items.length !== before) writeStore(store)
    return store.items.length !== before
  },
  async update(id, branchId, updater) {
    const session = await authService.getSession(); if (!session?.user || session.branchId !== branchId) return null
    const store = readStore(), index = store.items.findIndex(item => item.id === id && item.recipientUserId === session.user.id && item.branchId === branchId)
    if (index < 0) return null
    store.items[index] = updater(store.items[index]); writeStore(store); return copy(store.items[index])
  },
}
