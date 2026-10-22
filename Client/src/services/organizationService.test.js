import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from './authService.js'
import { organizationService } from './organizationService.js'
import { getAuthorizedBranches } from '../mock/authFixtures.js'
import { readOrganization, writeOrganization } from '../mock/mockOrganization.js'
import { MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY } from '../constants/storageKeys.js'
import { reportService } from './reportService.js'
import { createMockDatabase } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
const existingBranch=()=>{const store=readOrganization();const branch={id:'qa-existing-branch',name:'QA Existing Campus',code:'QAE',location:'Fictional City',active:true};store.branches.push(branch);store.assignmentOverrides['demo-admin']??=[];store.assignmentOverrides['demo-admin'].push({branchId:branch.id,roles:['super_admin']});writeOrganization(store);return branch}
const legacyUser=async record=>{const store=readOrganization();const user={id:crypto.randomUUID(),enabled:true,...record};store.users.push(user);writeOrganization(store);return user}
const signIn=async()=>{await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin','demo-central')}
describe('F11-F13 organization service',()=>{
 beforeEach(async()=>{localStorage.clear();await signIn()})
 it('edits only core branch names while preserving other fields, records and creation pause',async()=>{
   const original=(await organizationService.overview()).branches.find(b=>b.id==='demo-central')
   const before=(await reportService.overview({branchId:'demo-central'})).students
   await organizationService.saveBranch({name:'QA Renamed Central',code:'QAC',location:'Test location',contact:'000'},'demo-central')
   const overview=await organizationService.overview()
   expect(overview.branches.find(b=>b.id==='demo-central')).toEqual({...original,name:'QA Renamed Central'})
   expect((await reportService.overview({branchId:'demo-central'})).students).toEqual(before)
   expect(getAuthorizedBranches((await authService.getSession()).user).find(b=>b.id==='demo-central').name).toBe('QA Renamed Central')
   await expect(organizationService.saveBranch({name:'QA New',code:'NEW',location:'Test'})).rejects.toThrow('temporarily disabled')
   await expect(organizationService.saveBranch({name:'QA Renamed Central',code:'OTHER',location:'Test'},'demo-north')).rejects.toThrow('exists')
 })
 it('toggles core branches in both directions, preserving saved name overrides',async()=>{
   const overview=vi.spyOn(reportService,'overview').mockResolvedValue({admissions:[],enrollments:[],challans:[]})
   await expect(organizationService.toggleBranch('demo-north')).resolves.toMatchObject({id:'demo-north',active:false})
   await organizationService.saveBranch({name:'QA North Renamed'},'demo-north')
   expect((await organizationService.overview()).branches.find(b=>b.id==='demo-north')).toMatchObject({name:'QA North Renamed',active:false})
   await expect(organizationService.toggleBranch('demo-north')).resolves.toMatchObject({name:'QA North Renamed',active:true})
   overview.mockRestore()
 })
 it('keeps custom branch metadata fixed during name-only edits',async()=>{
   const branch=existingBranch()
   await organizationService.saveBranch({name:'QA Name Only',code:'HACK',location:'Changed',contact:'Changed',active:false},branch.id)
   expect((await organizationService.overview()).branches.find(b=>b.id===branch.id)).toEqual({...branch,name:'QA Name Only'})
   await expect(organizationService.saveBranch({name:'  '},branch.id)).rejects.toThrow('branch name')
 })
 it('explains why the current branch or branches with unresolved operations cannot deactivate',async()=>{
   await expect(organizationService.toggleBranch('demo-central')).rejects.toThrow('Switch to another branch')
   const before=localStorage.getItem(MOCK_ORGANIZATION_KEY)
   const overview=vi.spyOn(reportService,'overview').mockResolvedValue({admissions:[{branchId:'demo-north',status:'Pending'}],enrollments:[],challans:[]})
   await expect(organizationService.toggleBranch('demo-north')).rejects.toThrow('Resolve pending')
   expect(localStorage.getItem(MOCK_ORGANIZATION_KEY)).toBe(before)
   overview.mockRestore()
 })
 it('deletes only an empty inactive branch and keeps operational records valid',async()=>{
   const branch=existingBranch()
   await reportService.overview({branchId:'demo-central'})
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('inactive')
   await organizationService.toggleBranch(branch.id)
   const before=JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
   await organizationService.deleteBranch(branch.id)
   expect((await organizationService.overview()).branches.some(b=>b.id===branch.id)).toBe(false)
   const after=JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
   expect(after.students).toEqual(before.students)
   expect(after.payments).toEqual(before.payments)
   expect(after.financialCounters[branch.id]).toBeUndefined()
   await expect(reportService.overview({branchId:'demo-central'})).resolves.toBeTruthy()
   await expect(organizationService.saveBranch({...branch},branch.id)).rejects.toThrow('not found')
 })
 it('allows Super Admin-only assignments and removes only the deleted branch access',async()=>{
   const branch=existingBranch()
   const store=readOrganization()
   store.assignmentOverrides['demo-admin']=[{branchId:branch.id,roles:['super_admin']}]
   writeOrganization(store)
   const otherAdmin=await legacyUser({name:'QA Admin',login:'qa-admin-delete-branch',contact:'000',assignments:[{branchId:branch.id,roles:['super_admin']},{branchId:'demo-central',roles:['super_admin']}]})
   await organizationService.toggleBranch(branch.id)
   await organizationService.deleteBranch(branch.id)
   const overview=await organizationService.overview()
   expect(overview.branches.some(b=>b.id===branch.id)).toBe(false)
   expect(overview.users.find(u=>u.id==='demo-admin').assignments.some(a=>a.branchId===branch.id)).toBe(false)
   expect(overview.users.find(u=>u.id===otherAdmin.id).assignments).toEqual([{branchId:'demo-central',roles:['super_admin']}])
   expect((await authService.getSession()).branchId).toBe('demo-central')
 })
 it('blocks Super Admin with an additional staff role and still protects linked course records',async()=>{
   const branch=existingBranch()
   const store=readOrganization()
   store.users.push({id:'qa-mixed-admin',name:'QA Mixed',enabled:true,assignments:[{branchId:branch.id,roles:['super_admin','teacher']}]})
   writeOrganization(store)
   await organizationService.toggleBranch(branch.id)
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('non-Super-Admin')
   const currentStore=readOrganization()
   currentStore.users=currentStore.users.filter(u=>u.id!=='qa-mixed-admin')
   writeOrganization(currentStore)
   createMockDatabase().run('courses','create',{record:{name:'QA Protected Course'},query:{branchId:branch.id}})
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('linked records')
 })
 it('blocks deletion for linked records, staff and the active branch without changing saved bytes',async()=>{
   const branch=existingBranch()
   createMockDatabase().run('courses','create',{record:{name:'QA Linked Course'},query:{branchId:branch.id}})
   await organizationService.toggleBranch(branch.id)
   const before=localStorage.getItem(MOCK_ORGANIZATION_KEY)
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('Courses: 1')
   expect(localStorage.getItem(MOCK_ORGANIZATION_KEY)).toBe(before)
   await expect(organizationService.deleteBranch('demo-central')).rejects.toThrow('Switch away')
 })
 it('blocks deletion for disabled staff assignments and unauthorized users',async()=>{
   const branch=existingBranch()
   await legacyUser({name:'QA Assigned',login:'qa-assigned',contact:'000',enabled:false,assignments:[{branchId:branch.id,roles:['teacher']}]})
   await organizationService.toggleBranch(branch.id)
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('staff assignments')
   await authService.login({userId:'demo-owner'})
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('not authorized')
 })
 it('restores exact database bytes when branch deletion persistence fails',async()=>{
   const branch=existingBranch()
   await reportService.overview({branchId:'demo-central'})
   await organizationService.toggleBranch(branch.id)
   const priorDb=localStorage.getItem(MOCK_DATABASE_KEY),priorOrg=localStorage.getItem(MOCK_ORGANIZATION_KEY)
   const setItem=Storage.prototype.setItem
   const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value){if(key===MOCK_ORGANIZATION_KEY)throw new Error('QA write failure');return setItem.call(this,key,value)})
   await expect(organizationService.deleteBranch(branch.id)).rejects.toThrow('QA write failure')
   spy.mockRestore()
   expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(priorDb)
   expect(localStorage.getItem(MOCK_ORGANIZATION_KEY)).toBe(priorOrg)
 })
 it('blocks Super Admin branch creation without changing saved branches or assignments',async()=>{
   existingBranch()
   const before=localStorage.getItem(MOCK_ORGANIZATION_KEY)
   const assignments=(await authService.getSession()).user.assignments
   await expect(organizationService.saveBranch({name:'QA New Campus',code:'QAN',location:'Fictional City'})).rejects.toThrow('temporarily disabled')
   expect(localStorage.getItem(MOCK_ORGANIZATION_KEY)).toBe(before)
   expect((await authService.getSession()).user.assignments).toEqual(assignments)
   expect((await organizationService.overview()).branches).toHaveLength(3)
 })
 it('persists lifecycle changes and different effective roles per branch',async()=>{const branch=existingBranch();const user=await legacyUser({name:'QA Multi Role',login:'qa-multi-role',contact:'+92 302 0000000',enabled:true,assignments:[{branchId:'demo-central',roles:['teacher']},{branchId:branch.id,roles:['receptionist']}]});expect(canAccess(PERMISSIONS.ADMISSIONS_CREATE,user,'demo-central')).toBe(false);expect(canAccess(PERMISSIONS.ADMISSIONS_CREATE,user,branch.id)).toBe(true);expect((await organizationService.toggleBranch(branch.id)).active).toBe(false);expect(getAuthorizedBranches(user).map(item=>item.id)).not.toContain(branch.id);expect((await organizationService.toggleBranch(branch.id)).active).toBe(true)})
 it('preserves editing of existing campuses and blocks an unknown-ID creation bypass',async()=>{
   const branch=existingBranch()
   await expect(organizationService.saveBranch({...branch,name:'QA Updated Campus'},branch.id)).resolves.toMatchObject({id:branch.id,name:'QA Updated Campus'})
   const before=localStorage.getItem(MOCK_ORGANIZATION_KEY)
   await expect(organizationService.saveBranch({name:'QA Bypass',code:'QAB',location:'Fictional City'},'made-up-id')).rejects.toThrow('not found')
   expect(localStorage.getItem(MOCK_ORGANIZATION_KEY)).toBe(before)
 })
 it.each(['demo-owner','demo-reception','demo-teacher'])('does not allow %s to create a branch',async userId=>{
   await authService.login({userId})
   await expect(organizationService.saveBranch({name:'QA Denied Campus',code:'QAD',location:'Fictional City'})).rejects.toThrow()
 })
 it('blocks self-deactivation and persists settings',async()=>{await expect(organizationService.toggleUser('demo-admin')).rejects.toThrow('own');const saved=await organizationService.saveSettings({academyName:'QA Fictional Academy',primaryColor:'#7F1D1D',logo:null});expect(saved.academyName).toBe('QA Fictional Academy');expect((await organizationService.overview()).settings).toEqual(saved)})
 it('persists academy contact details and current-user profile overrides separately',async()=>{const saved=await organizationService.saveSettings({academyName:'QA Fictional Academy',contactEmail:'office@example.test',contactPhone:'+92 300 0000000',website:'https://example.test',streetAddress:'1 Demo Road',city:'Test City',province:'Punjab',country:'Pakistan',description:'Fictional QA academy.'});expect((await organizationService.overview()).settings).toMatchObject(saved);await organizationService.saveOwnProfile({name:'QA Admin Updated',email:'admin@example.test',phone:'+92 301 0000000',photo:null});expect((await authService.getSession()).user).toMatchObject({name:'QA Admin Updated',email:'admin@example.test'});expect((await organizationService.overview()).settings.academyName).toBe('QA Fictional Academy')})
 it('deletes built-in staff persistently while preserving other accounts and guarding self',async()=>{
   await organizationService.deleteUser('teacher-bilal')
   await expect(authService.login({userId:'teacher-bilal'})).rejects.toThrow()
   await organizationService.deleteUser('demo-unassigned')
   expect((await organizationService.overview()).users.some(u=>u.id==='demo-unassigned')).toBe(false)
   expect((await organizationService.overview()).users.some(u=>u.id==='teacher-naeem')).toBe(true)
   await expect(organizationService.deleteUser('demo-admin')).rejects.toThrow('own account')
   await expect(authService.login({userId:'demo-unassigned'})).rejects.toThrow()
 })
 it('deletes created staff and refuses unauthorized deletion',async()=>{
   const user=await organizationService.saveUser({name:'QA Delete',login:'qa-delete@example.test',contact:'000',assignments:[{branchId:'demo-central',roles:['teacher']}]})
   await organizationService.deleteUser(user.id)
   expect((await organizationService.staffOverview()).users.some(u=>u.id===user.id)).toBe(false)
   await authService.login({userId:'demo-owner'})
   await expect(organizationService.deleteUser('teacher-naeem')).rejects.toThrow('not authorized')
 })

})
