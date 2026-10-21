// Browser-local demo credentials only. Replace with server authentication before deployment.
import { readOrganization, writeOrganization } from './mockOrganization.js'
export const normalizeEmail = value => String(value ?? '').trim().toLowerCase()
export const loginEmail = user => normalizeEmail(user.id === 'demo-admin' ? import.meta.env.VITE_MOCK_ADMIN_EMAIL : user.login?.includes('@') ? user.login : `${user.id}@tsa.local`)
const initialPassword = user => user.id === 'demo-admin' ? import.meta.env.VITE_MOCK_ADMIN_PASSWORD : import.meta.env.VITE_MOCK_STAFF_PASSWORD
const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
async function hash(password, salt) {
 const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
 return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256)))
}
export async function verifyPassword(user, password) {
 if (typeof password !== 'string' || !password) return false
 const credentials = readOrganization().credentials
 if (credentials != null && (typeof credentials !== 'object' || Array.isArray(credentials))) throw new Error('Saved credentials are invalid. Contact the administrator.')
 const stored = credentials?.[user.id]
 if (credentials && Object.hasOwn(credentials,user.id)) {
  if (!stored || typeof stored.salt !== 'string' || !/^[a-f0-9]{64}$/.test(stored.hash)) throw new Error('Saved credentials are invalid. Contact the administrator.')
  return await hash(password, stored.salt) === stored.hash
 }
 const initial = initialPassword(user)
 if (!initial) throw new Error('Local login configuration is missing. Contact the administrator.')
 return password === initial
}
export async function makePasswordRecord(password) {
 if (typeof password !== 'string' || password.length < 6 || password.length > 128) throw new Error('Use a password between 6 and 128 characters.')
 const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
 return {salt,hash:await hash(password,salt)}
}
export function storePassword(userId, record) {
 const store = readOrganization()
 store.credentials = {...store.credentials,[userId]:record}
 writeOrganization(store)
}
