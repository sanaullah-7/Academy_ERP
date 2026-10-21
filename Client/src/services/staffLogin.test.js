import { facultyService } from './facultyService.js'
import { MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import {beforeEach,expect,it} from 'vitest'
import {authService} from './authService.js'
import {organizationService} from './organizationService.js'
import {canAccess,PERMISSIONS} from '../constants/permissions.js'
import {readOrganization,writeOrganization} from '../mock/mockOrganization.js'
const create=role=>organizationService.saveUser({name:'QA Staff',login:`${role}@example.test`,assignments:[{branchId:'demo-central',roles:[role]}]})
beforeEach(async()=>{localStorage.clear();await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin','demo-central')})
it.each(['teacher','receptionist','owner','super_admin'])('creates %s only in active branch and signs in by normalized email',async role=>{
 const staff=await create(role)
 expect(staff.assignments).toEqual([{branchId:'demo-central',roles:[role]}])
 await authService.logout()
 const session=await authService.login({email:` ${role.toUpperCase()}@example.test `,password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})
 expect(session.branchId).toBe('demo-central')
 expect(session.user.assignments[0].roles).toEqual([role])
 expect(canAccess(PERMISSIONS.USERS_MANAGE,session.user,'demo-north')).toBe(false)
 if(role==='super_admin'){
  expect((await organizationService.overview()).branches.map(b=>b.id)).toEqual(['demo-central'])
  await expect(organizationService.saveBranch({name:'Forbidden'},'demo-north')).rejects.toThrow('not assigned')
  await expect(organizationService.toggleBranch('demo-north')).rejects.toThrow('not assigned')
  await expect(organizationService.deleteBranch('demo-north')).rejects.toThrow('not assigned')
 }
 await expect(authService.selectBranch(staff.id,'demo-north')).rejects.toThrow('authorized')
})
it('rejects cross-branch create/edit and duplicate normalized emails without mutations',async()=>{
 const staff=await create('teacher'),before=JSON.stringify(readOrganization())
 await expect(organizationService.saveUser({name:'Other',login:'other@example.test',assignments:[{branchId:'demo-north',roles:['teacher']}]})).rejects.toThrow('current branch')
 await expect(organizationService.saveUser({name:'Other',login:' TEACHER@example.test ',assignments:staff.assignments})).rejects.toThrow('exists')
 expect(JSON.stringify(readOrganization())).toBe(before)
 await authService.selectBranch('demo-admin','demo-north')
 expect((await organizationService.staffOverview()).users.some(u=>u.id===staff.id)).toBe(false)
 await expect(organizationService.saveUser({...staff,name:'Wrong branch'},staff.id)).rejects.toThrow('current branch')
 await expect(organizationService.toggleUser(staff.id)).rejects.toThrow('current branch')
 await expect(organizationService.deleteUser(staff.id)).rejects.toThrow('current branch')
})
it('replaces default password, persists salted digest, rejects old/default after logout and reload',async()=>{
 await create('teacher')
 const password=import.meta.env.VITE_MOCK_STAFF_PASSWORD,newPassword=crypto.randomUUID()
 await authService.login({email:'teacher@example.test',password})
 await expect(authService.changePassword({currentPassword:'wrong',newPassword,confirmPassword:newPassword})).rejects.toThrow('Current password')
 await expect(authService.changePassword({currentPassword:password,newPassword,confirmPassword:'different'})).rejects.toThrow('match')
 await authService.changePassword({currentPassword:password,newPassword,confirmPassword:newPassword})
 expect(JSON.stringify(readOrganization())).not.toContain(newPassword)
 await authService.logout()
 await expect(authService.login({email:'teacher@example.test',password})).rejects.toThrow('incorrect')
 expect((await authService.login({email:'teacher@example.test',password:newPassword})).branchId).toBe('demo-central')
 expect((await authService.getSession()).user.login).toBe('teacher@example.test')
})
it('authenticates admin and rejects unknown, disabled, inactive and unassigned accounts',async()=>{
 const password=import.meta.env.VITE_MOCK_ADMIN_PASSWORD
 await authService.logout()
 expect((await authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password})).user.id).toBe('demo-admin')
 for(const email of ['unknown@example.test','demo-disabled@tsa.local','demo-unassigned@tsa.local'])await expect(authService.login({email,password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})).rejects.toThrow()
 await authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password})
 await authService.selectBranch('demo-admin','demo-central')
 const staff=await create('teacher')
 await organizationService.toggleUser(staff.id)
 await expect(authService.login({email:'teacher@example.test',password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})).rejects.toThrow('incorrect')
})

it('allows admin password change and fails closed for damaged credential records',async()=>{
 const password=import.meta.env.VITE_MOCK_ADMIN_PASSWORD,newPassword=crypto.randomUUID()
 await authService.changePassword({currentPassword:password,newPassword,confirmPassword:newPassword})
 await authService.logout()
 await expect(authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password})).rejects.toThrow('incorrect')
 expect((await authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password:newPassword})).user.id).toBe('demo-admin')
 await expect(authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password:'wrong'})).rejects.toThrow('incorrect')
 expect(await authService.getSession()).toBeNull()
 const store=readOrganization();store.credentials['demo-admin']=null;writeOrganization(store)
 await expect(authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password})).rejects.toThrow('credentials are invalid')
})

it('accepts six-character passwords and rejects five characters',async()=>{
 const currentPassword=import.meta.env.VITE_MOCK_ADMIN_PASSWORD
 await expect(authService.changePassword({currentPassword,newPassword:'abcde',confirmPassword:'abcde'})).rejects.toThrow('between 6 and 128')
 await authService.changePassword({currentPassword,newPassword:'abcdef',confirmPassword:'abcdef'})
 await authService.logout()
 expect((await authService.login({email:import.meta.env.VITE_MOCK_ADMIN_EMAIL,password:'abcdef'})).user.id).toBe('demo-admin')
})

it('revokes teacher login without deleting faculty profiles, assignments or academic data',async()=>{
 const teacher=(await facultyService.list({branchId:'demo-central'})).find(t=>t.id==='teacher-irfan')
 const assignments=await facultyService.listAssignments({branchId:'demo-central'})
 const before=localStorage.getItem(MOCK_DATABASE_KEY)
 await organizationService.deleteUser('teacher-irfan')
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
 expect((await facultyService.list({branchId:'demo-central'})).find(t=>t.id===teacher.id)).toEqual(teacher)
 expect(await facultyService.listAssignments({branchId:'demo-central'})).toEqual(assignments)
 expect((await organizationService.staffOverview()).users.some(u=>u.id===teacher.id)).toBe(false)
 localStorage.setItem(MOCK_SESSION_KEY,JSON.stringify({version:1,userId:teacher.id,branchId:'demo-central'}))
 expect(await authService.getSession()).toBeNull()
 await expect(authService.login({email:'teacher-irfan@tsa.local',password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})).rejects.toThrow('incorrect')
 await expect(authService.login({userId:teacher.id})).rejects.toThrow()
})
it('preserves a created teacher while revoking that account access',async()=>{
 const teacher=await create('teacher')
 await organizationService.deleteUser(teacher.id)
 expect(readOrganization().users.find(u=>u.id===teacher.id)).toMatchObject({accessRevoked:true,name:'QA Staff'})
 expect((await facultyService.list({branchId:'demo-central'})).some(t=>t.id===teacher.id)).toBe(true)
 expect((await organizationService.staffOverview()).users.some(u=>u.id===teacher.id)).toBe(false)
 await expect(authService.login({email:teacher.login,password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})).rejects.toThrow('incorrect')
})
