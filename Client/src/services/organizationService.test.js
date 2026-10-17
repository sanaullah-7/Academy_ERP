import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService.js'
import { organizationService } from './organizationService.js'
import { getAuthorizedBranches } from '../mock/authFixtures.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
const signIn=async()=>{await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin','demo-central')}
describe('F11-F13 organization service',()=>{
 beforeEach(async()=>{localStorage.clear();await signIn()})
 it('creates unique licensed branches and exposes them to assigned login sessions',async()=>{const branch=await organizationService.saveBranch({name:'QA West Campus',code:'QAW',location:'Fictional City',contact:'+92 300 0000000'});expect((await authService.getSession()).user.assignments.some(a=>a.branchId===branch.id&&a.roles.includes('super_admin'))).toBe(true);await expect(organizationService.saveBranch({name:'QA West Campus',code:'OTHER',location:'Elsewhere'})).rejects.toThrow('exists');const user=await organizationService.saveUser({name:'QA Branch Manager',login:'qa-manager',contact:'+92 301 0000000',enabled:true,assignments:[{branchId:branch.id,roles:['owner']}]});const session=await authService.login({userId:user.id});expect(getAuthorizedBranches(session.user).map(x=>x.id)).toEqual([branch.id]);expect(session.branchId).toBe(branch.id)})
 it('persists lifecycle changes and different effective roles per branch',async()=>{const branch=await organizationService.saveBranch({name:'QA Lifecycle',code:'QAL',location:'Fictional City'});const user=await organizationService.saveUser({name:'QA Multi Role',login:'qa-multi-role',contact:'+92 302 0000000',enabled:true,assignments:[{branchId:'demo-central',roles:['teacher']},{branchId:branch.id,roles:['receptionist']}]});expect(canAccess(PERMISSIONS.ADMISSIONS_CREATE,user,'demo-central')).toBe(false);expect(canAccess(PERMISSIONS.ADMISSIONS_CREATE,user,branch.id)).toBe(true);expect((await organizationService.toggleBranch(branch.id)).active).toBe(false);expect(getAuthorizedBranches(user).map(item=>item.id)).not.toContain(branch.id);expect((await organizationService.toggleBranch(branch.id)).active).toBe(true)})
  it('enforces the five-branch tenant limit',async()=>{for(const code of ['A','B','C'])await organizationService.saveBranch({name:`QA ${code}`,code:`Q${code}`,location:'Fictional City'});await expect(organizationService.saveBranch({name:'QA D',code:'QD',location:'Fictional City'})).rejects.toThrow('limit')})
 it('blocks self-deactivation and persists settings',async()=>{await expect(organizationService.toggleUser('demo-admin')).rejects.toThrow('own');const saved=await organizationService.saveSettings({academyName:'QA Fictional Academy',primaryColor:'#7F1D1D',logo:null});expect(saved.academyName).toBe('QA Fictional Academy');expect((await organizationService.overview()).settings).toEqual(saved)})
 it('persists academy contact details and current-user profile overrides separately',async()=>{const saved=await organizationService.saveSettings({academyName:'QA Fictional Academy',contactEmail:'office@example.test',contactPhone:'+92 300 0000000',website:'https://example.test',streetAddress:'1 Demo Road',city:'Test City',province:'Punjab',country:'Pakistan',description:'Fictional QA academy.'});expect((await organizationService.overview()).settings).toMatchObject(saved);await organizationService.saveOwnProfile({name:'QA Admin Updated',email:'admin@example.test',phone:'+92 301 0000000',photo:null});expect((await authService.getSession()).user).toMatchObject({name:'QA Admin Updated',email:'admin@example.test'});expect((await organizationService.overview()).settings.academyName).toBe('QA Fictional Academy')})
 it('deletes built-in staff persistently while preserving other accounts and guarding self',async()=>{
   await expect(organizationService.deleteUser('teacher-irfan')).rejects.toThrow('linked records are protected')
   await organizationService.deleteUser('demo-unassigned')
   expect((await organizationService.overview()).users.some(u=>u.id==='demo-unassigned')).toBe(false)
   expect((await organizationService.overview()).users.some(u=>u.id==='teacher-naeem')).toBe(true)
   await expect(organizationService.deleteUser('demo-admin')).rejects.toThrow('own account')
   await expect(authService.login({userId:'demo-unassigned'})).rejects.toThrow()
 })
 it('deletes created staff and refuses unauthorized deletion',async()=>{
   const user=await organizationService.saveUser({name:'QA Delete',login:'qa-delete',contact:'000',assignments:[{branchId:'demo-central',roles:['teacher']}]})
   await organizationService.deleteUser(user.id)
   expect((await organizationService.overview()).users.some(u=>u.id===user.id)).toBe(false)
   await authService.login({userId:'demo-owner'})
   await expect(organizationService.deleteUser('teacher-naeem')).rejects.toThrow('not authorized')
 })

})
