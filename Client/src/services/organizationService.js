import { getBranchRoles } from '../constants/roles.js'
import { loginEmail, normalizeEmail } from '../mock/mockCredentials.js'
import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { DEMO_BRANCHES, DEMO_USERS, getDemoBranches, getDemoUsers } from '../mock/authFixtures.js'
import { ORGANIZATION_LICENSE_LIMIT, readOrganization, writeOrganization } from '../mock/mockOrganization.js'
import { reportService } from './reportService.js'
import { BRANCH_CREATION_ENABLED, BRANCH_CREATION_PAUSED_MESSAGE } from '../constants/branchPolicy.js'

async function authorize(permission) { const session = await authService.getSession(); if (!session?.user || !session.branchId || !canAccess(permission, session.user, session.branchId)) throw new Error('This role is not authorized for organization management.'); return session }
const managesBranch = (user,id) => {const roles=getBranchRoles(user,id);return roles.length===1 && roles[0]==='super_admin'}
const normalize = value => value.trim().toLowerCase()
const text = (value, max) => String(value ?? '').trim().slice(0, max)
const validEmail = value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const validUrl = value => { if (!value) return true; try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }
export const organizationService = {
  async overview() { const session=await authorize(PERMISSIONS.BRANCHES_MANAGE); const branches=getDemoBranches().filter(b=>managesBranch(session.user,b.id)),ids=new Set(branches.map(b=>b.id)); return { branches, users:getDemoUsers().filter(u=>u.assignments.some(a=>ids.has(a.branchId))).map(u=>({...u,assignments:u.assignments.filter(a=>ids.has(a.branchId))})), settings: readOrganization().settings, licenseLimit: ORGANIZATION_LICENSE_LIMIT } },
  async saveBranch(record, id) {
    const session = await authorize(PERMISSIONS.BRANCHES_MANAGE)
    if (!id && !BRANCH_CREATION_ENABLED) throw new Error(BRANCH_CREATION_PAUSED_MESSAGE)
    const store = readOrganization(), all = getDemoBranches()
    if (id) {
      if (getDemoBranches().some(b=>b.id===id) && !managesBranch(session.user,id)) throw new Error('This branch is not assigned to your account.')
      const original = all.find(item => item.id === id)
      if (!original) throw new Error('Branch was not found. Reload existing branches.')
      const name = typeof record.name === 'string' ? record.name.trim() : ''
      if (!name || name.length > 120) throw new Error('Enter a branch name of 1 to 120 characters.')
      if (all.some(item => item.id !== id && normalize(item.name) === normalize(name))) throw new Error('Branch name already exists.')
      if (DEMO_BRANCHES.some(item => item.id === id)) {
        store.branchOverrides ??= {}
        store.branchOverrides[id] = { ...store.branchOverrides[id], name }
      } else {
        const index = store.branches.findIndex(item => item.id === id)
        store.branches[index] = { ...store.branches[index], name }
      }
      writeOrganization(store)
      return { ...original, name }
    }
    if (all.length >= ORGANIZATION_LICENSE_LIMIT) throw new Error('Tenant branch license limit reached.')
    if (!record.name?.trim() || !record.code?.trim() || !record.location?.trim()) throw new Error('Branch name, code and location are required.'); if (all.some(item => item.id !== id && (normalize(item.name) === normalize(record.name) || normalize(item.code ?? '') === normalize(record.code)))) throw new Error('Branch name or code already exists.'); const value = { id: `branch-${crypto.randomUUID()}`, name: record.name.trim(), code: record.code.trim().toUpperCase(), location: record.location.trim(), contact: record.contact?.trim() ?? '', active: true }; store.branches.push(value); store.assignmentOverrides ??= {}; store.assignmentOverrides[session.user.id] ??= []; store.assignmentOverrides[session.user.id].push({ branchId: value.id, roles: ['super_admin'] }); writeOrganization(store); return value
  },
  async deleteBranch(id) { const session=await authorize(PERMISSIONS.BRANCHES_MANAGE); if(!managesBranch(session.user,id))throw new Error('This branch is not assigned to your account.'); return mockApi.deleteEmptyBranch(id) },
  async toggleBranch(id) {
    const session = await authorize(PERMISSIONS.BRANCHES_MANAGE)
    const branch = getDemoBranches().find(item => item.id === id)
    if (!branch) throw new Error('Branch was not found. Reload saved branches.')
    if (!managesBranch(session.user,id)) throw new Error('This branch is not assigned to your account.')
    const isActive = branch.active !== false
    if (isActive && session.branchId === id) throw new Error('Switch to another branch before deactivating the current branch.')
    if (isActive && getDemoBranches().filter(item => item.active !== false).length <= 1) throw new Error('The last usable branch cannot be deactivated.')
    if (isActive) {
      const records = await reportService.overview({ branchId: session.branchId, allBranches: true })
      if (records.admissions.some(item => item.branchId === id && item.status === 'Pending') || records.enrollments.some(item => item.branchId === id && item.status === 'Active') || records.challans.some(item => item.branchId === id && item.status !== 'Paid')) throw new Error('Resolve pending admissions, active enrollments and unpaid challans before deactivating this branch.')
    }
    const current = await authorize(PERMISSIONS.BRANCHES_MANAGE)
    if (current.user.id !== session.user.id || current.branchId !== session.branchId) throw new Error('Session changed. Reload before changing branch status.')
    const latest = getDemoBranches().find(item => item.id === id)
    if (!latest || (latest.active !== false) !== isActive) throw new Error('Branch status changed. Reload saved branches.')
    const store = readOrganization()
    if (DEMO_BRANCHES.some(item => item.id === id)) {
      store.branchOverrides ??= {}
      store.branchOverrides[id] = { ...store.branchOverrides[id], active: !isActive }
    } else {
      store.branches.find(item => item.id === id).active = !isActive
    }
    writeOrganization(store)
    return { ...latest, active: !isActive }
  },
  async staffOverview() {
    const session = await authorize(PERMISSIONS.USERS_MANAGE)
    return {branches:getDemoBranches().filter(b=>b.id===session.branchId),users:getDemoUsers().filter(u=>!u.accessRevoked && u.assignments.some(a=>a.branchId===session.branchId)).map(u=>({...u,login:loginEmail(u),assignments:u.assignments.filter(a=>a.branchId===session.branchId)}))}
  },
  async saveUser(record, id) {
    const session = await authorize(PERMISSIONS.USERS_MANAGE), store = readOrganization(), all = getDemoUsers()
    const login = normalizeEmail(record.login)
    if (!record.name?.trim() || !login || !validEmail(login) || !record.assignments?.length) throw new Error('Name, valid email and one branch role are required.')
    if (all.some(item => item.id !== id && loginEmail(item) === login)) throw new Error('Login identity already exists.')
    if (id === session.user.id && record.enabled === false) throw new Error('You cannot deactivate your own account.')
    if (DEMO_USERS.some(item => item.id === id)) throw new Error('Built-in account identity is read-only.')
    const index = store.users.findIndex(item => item.id === id)
    if (id && (index < 0 || !store.users[index].assignments.some(a=>a.branchId===session.branchId))) throw new Error('Staff account is not in the current branch.')
    if (record.assignments.length !== 1 || record.assignments.some(a=>a.branchId!==session.branchId || !['super_admin','owner','receptionist','teacher'].includes(a.roles?.[0]) || a.roles.length!==1)) throw new Error('Choose one role in the current branch only.')
    const value = {...(index >= 0 ? store.users[index] : {}),id:id ?? `staff-${crypto.randomUUID()}`,name:record.name.trim(),login,contact:String(record.contact??'').trim(),enabled:record.enabled!==false,assignments:[...(index>=0 ? store.users[index].assignments.filter(a=>a.branchId!==session.branchId) : []),{branchId:session.branchId,roles:[record.assignments[0].roles[0]]}]}
    if(index>=0)store.users[index]=value;else store.users.push(value)
    writeOrganization(store)
    return value
  },
  async toggleUser(id) { const session = await authorize(PERMISSIONS.USERS_MANAGE); if (id === session.user.id) throw new Error('You cannot deactivate your own account.'); const store = readOrganization(), user = store.users.find(item => item.id === id); if (user && !user.assignments.some(a=>a.branchId===session.branchId)) throw new Error('Staff account is not in the current branch.'); if (!user) throw new Error('Only created staff accounts can change status.'); if (user.enabled && user.assignments.some(a => a.roles.includes('super_admin')) && getDemoUsers().filter(u => u.enabled && u.assignments.some(a => a.roles.includes('super_admin'))).length <= 1) throw new Error('The last school Super Admin cannot be deactivated.'); user.enabled = !user.enabled; writeOrganization(store); return user },
  async deleteUser(id, { removeProfile = false } = {}) {
    const session = await authorize(PERMISSIONS.USERS_MANAGE)
    if (id === session.user.id) throw new Error('You cannot delete your own account.')
    const users = getDemoUsers(), user = users.find(item => item.id === id)
    if (!user || (user.assignments.length && !user.assignments.some(a=>a.branchId===session.branchId))) throw new Error('Staff account was not found in the current branch.')
    for (const assignment of user.assignments) {
      if (!canAccess(PERMISSIONS.USERS_MANAGE, session.user, assignment.branchId)) throw new Error('You must have staff management permission in every assigned branch.')
      if (user.enabled && assignment.roles.includes('super_admin') && !users.some(other => other.id !== id && canAccess(PERMISSIONS.USERS_MANAGE, other, assignment.branchId))) throw new Error('The last branch Super Admin cannot be deleted.')
    }
    if(removeProfile) await mockApi.facultyAssignmentOperation('checkTeacherDelete',{id,query:{branchId:session.branchId}})
    const current = await authorize(PERMISSIONS.USERS_MANAGE)
    if (current.user.id !== session.user.id || current.branchId !== session.branchId) throw new Error('Session changed. Reload before deleting.')
    const store = readOrganization()
    if(removeProfile){
      store.users=store.users.filter(item=>item.id!==id)
      store.deletedUserIds=[...new Set([...store.deletedUserIds,id])]
      delete store.profileOverrides[id]
      delete store.assignmentOverrides[id]
      if(store.credentials)delete store.credentials[id]
    }else{
      // Users removal retains professional profiles and all record links.
      const created=store.users.find(item=>item.id===id)
      if(created)created.accessRevoked=true
      else store.profileOverrides[id]={...store.profileOverrides[id],accessRevoked:true}
    }
    writeOrganization(store)
    return user
  },
  async saveSettings(settings) { await authorize(PERMISSIONS.SETTINGS_MANAGE); const store = readOrganization(), prior=store.settings; const next = { ...prior, academyName: text(settings.academyName??prior.academyName,120), tagline:text(settings.tagline??prior.tagline,160), contactEmail:text(settings.contactEmail??prior.contactEmail,160), contactPhone:text(settings.contactPhone??prior.contactPhone,40), website:text(settings.website??prior.website,240), streetAddress:text(settings.streetAddress??prior.streetAddress,240), city:text(settings.city??prior.city,100), province:text(settings.province??prior.province,100), country:text(settings.country??prior.country,100), description:text(settings.description??prior.description,1200), primaryColor: settings.primaryColor??prior.primaryColor, logo: settings.logo===undefined?prior.logo:settings.logo, sidebarBackground: settings.sidebarBackground??prior.sidebarBackground, sidebarText: settings.sidebarText??prior.sidebarText, sidebarIcon: settings.sidebarIcon??prior.sidebarIcon, sidebarActive: settings.sidebarActive??prior.sidebarActive, teacherPayrollEnabled: settings.teacherPayrollEnabled !== undefined ? Boolean(settings.teacherPayrollEnabled) : (prior.teacherPayrollEnabled ?? false) }; if (!next.academyName) throw new Error('Official academy name is required.'); if (!validEmail(next.contactEmail)) throw new Error('Enter a valid contact email address.'); if (!validUrl(next.website)) throw new Error('Website URL must start with http:// or https://.'); store.settings = next; writeOrganization(store); return next },
  async saveOwnProfile(record) { const session=await authService.getSession(); if(!session?.user) throw new Error('Sign in again to update your profile.'); const name=text(record.name,100),email=text(record.email,160),phone=text(record.phone,40),photo=record.photo||null; if(!name) throw new Error('Display name is required.'); if(!validEmail(email)) throw new Error('Enter a valid profile email address.'); if(photo&&(!/^data:image\/(png|jpeg|webp|gif);base64,/.test(photo)||photo.length>370000)) throw new Error('Profile photo must be PNG, JPG, WEBP or GIF and 256 KB or smaller.'); const store=readOrganization(); store.profileOverrides[session.user.id]={name,email,phone,photo}; const created=store.users.find(item=>item.id===session.user.id); if(created) Object.assign(created,{name,email,phone,photo}); writeOrganization(store); return { ...session.user, name,email,phone,photo } },
}
