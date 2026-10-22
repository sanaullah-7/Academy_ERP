import { facultyService } from './facultyService.js'
import { MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import {beforeEach,expect,it} from 'vitest'
import {authService} from './authService.js'
import {organizationService} from './organizationService.js'
import {academicService} from './academicService.js'
import {studentService} from './studentService.js'
import {reportService} from './reportService.js'
import {canAccess,PERMISSIONS} from '../constants/permissions.js'
import {readOrganization,writeOrganization} from '../mock/mockOrganization.js'
const staffEmail = role => `${role === 'admin' ? 'qa-created-admin' : role}@example.test`
const create=role=>organizationService.saveUser({name:'QA Staff',login:staffEmail(role),assignments:[{branchId:'demo-central',roles:[role]}]})
beforeEach(async()=>{localStorage.clear();await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin','demo-central')})
it.each(['teacher','receptionist','owner','admin','super_admin'])('creates %s only in active branch and signs in by normalized email',async role=>{
 const staff=await create(role)
 expect(staff.assignments).toEqual([{branchId:'demo-central',roles:[role]}])
 await authService.logout()
 const session=await authService.login({email:` ${staffEmail(role).toUpperCase()} `,password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})
 expect(session.branchId).toBe('demo-central')
 expect(session.user.assignments[0].roles).toEqual([role])
 expect(canAccess(PERMISSIONS.USERS_MANAGE,session.user,'demo-north')).toBe(false)
 if(['admin','super_admin'].includes(role)){
  expect((await organizationService.overview()).branches.map(b=>b.id)).toEqual(['demo-central'])
  await expect(organizationService.saveBranch({name:'Forbidden'},'demo-north')).rejects.toThrow('not assigned')
  await expect(organizationService.toggleBranch('demo-north')).rejects.toThrow('not assigned')
  await expect(organizationService.deleteBranch('demo-north')).rejects.toThrow('not assigned')
 }
 await expect(authService.selectBranch(staff.id,'demo-north')).rejects.toThrow('authorized')
})
it('lets branch Admin create standard staff roles but rejects Admin and Super Admin assignment',async()=>{
 const admin=await create('admin')
 await authService.logout()
 await authService.login({email:staffEmail('admin'),password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})
 expect((await authService.getSession()).user.id).toBe(admin.id)
 await expect(create('owner')).resolves.toMatchObject({assignments:[{branchId:'demo-central',roles:['owner']}]})
 await expect(create('receptionist')).resolves.toMatchObject({assignments:[{branchId:'demo-central',roles:['receptionist']}]})
 await expect(create('teacher')).resolves.toMatchObject({assignments:[{branchId:'demo-central',roles:['teacher']}]})
 await expect(organizationService.saveUser({name:'Forbidden Admin',login:'forbidden-admin@example.test',assignments:[{branchId:'demo-central',roles:['admin']}]})).rejects.toThrow('only Owner, Receptionist or Teacher')
 await expect(organizationService.saveUser({name:'Forbidden Super Admin',login:'forbidden-super@example.test',assignments:[{branchId:'demo-central',roles:['super_admin']}]})).rejects.toThrow('only Owner, Receptionist or Teacher')
 await expect(authService.selectBranch(admin.id,'demo-north')).rejects.toThrow('authorized')
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
 const teacher=(await facultyService.list({branchId:'demo-central'})).find(t=>t.id==='teacher-naeem')
 const assignments=await facultyService.listAssignments({branchId:'demo-central'})
 const before=localStorage.getItem(MOCK_DATABASE_KEY)
 await organizationService.deleteUser('teacher-naeem')
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
 expect((await facultyService.list({branchId:'demo-central'})).find(t=>t.id===teacher.id)).toEqual(teacher)
 expect(await facultyService.listAssignments({branchId:'demo-central'})).toEqual(assignments)
 expect((await organizationService.staffOverview()).users.some(u=>u.id===teacher.id)).toBe(false)
 localStorage.setItem(MOCK_SESSION_KEY,JSON.stringify({version:1,userId:teacher.id,branchId:'demo-central'}))
 expect(await authService.getSession()).toBeNull()
 await expect(authService.login({email:'teacher-naeem@tsa.local',password:import.meta.env.VITE_MOCK_STAFF_PASSWORD})).rejects.toThrow('incorrect')
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
it('repairs a legacy deleted built-in teacher identity without losing its faculty assignment',async()=>{
 const query={branchId:'demo-central'}
 const stream=await academicService.saveStream(null,{name:'Legacy Link Stream',active:true},query)
 const course=await academicService.saveCourse(null,{name:'Legacy Link Course',streamId:stream.id,active:true,pricingMode:'course',feeAmount:1000},query)
 const batch=await academicService.saveBatch(null,{name:'Legacy Link Batch',courseId:course.id,active:true},query)
 const subject=await academicService.saveSubject(null,{name:'Legacy Link Subject',courseId:course.id,active:true,feeAmount:500},query)
 const assignment=await facultyService.assignFaculty({teacherId:'teacher-naeem',courseId:course.id,batchId:batch.id,subjectId:subject.id,days:['Monday'],startTime:'10:00',endTime:'11:00',room:'Legacy Room'},query)
 const store=readOrganization()
 store.deletedUserIds.push('teacher-naeem')
 delete store.profileOverrides['teacher-naeem']
 writeOrganization(store)

 expect((await facultyService.listAssignments(query)).find(item=>item.id===assignment.id)).toMatchObject({teacherId:'teacher-naeem',teacherName:'Prof. Naeem (Chem)'})
 expect((await facultyService.list(query)).find(item=>item.id==='teacher-naeem')).toMatchObject({name:'Prof. Naeem (Chem)'})
 expect((await organizationService.staffOverview()).users.some(user=>user.id==='teacher-naeem')).toBe(false)
 await expect(authService.login({userId:'teacher-naeem'})).rejects.toThrow()
})
it('loads retained assignments for a legacy deleted created-teacher tombstone',async()=>{
 const query={branchId:'demo-central'}
 const teacher=await create('teacher')
 const stream=await academicService.saveStream(null,{name:'Created Legacy Stream',active:true},query)
 const course=await academicService.saveCourse(null,{name:'Created Legacy Course',streamId:stream.id,active:true,pricingMode:'course',feeAmount:1000},query)
 const batch=await academicService.saveBatch(null,{name:'Created Legacy Batch',courseId:course.id,active:true},query)
 const subject=await academicService.saveSubject(null,{name:'Created Legacy Subject',courseId:course.id,active:true,feeAmount:500},query)
 const assignment=await facultyService.assignFaculty({teacherId:teacher.id,courseId:course.id,batchId:batch.id,subjectId:subject.id,days:['Tuesday'],startTime:'10:00',endTime:'11:00',room:'Legacy Room'},query)
 const store=readOrganization()
 store.users=store.users.filter(user=>user.id!==teacher.id)
 store.deletedUserIds.push(teacher.id)
 delete store.profileOverrides[teacher.id]
 delete store.assignmentOverrides[teacher.id]
 writeOrganization(store)

 expect((await facultyService.listAssignments(query)).find(item=>item.id===assignment.id)).toMatchObject({teacherId:teacher.id})
 expect((await organizationService.staffOverview()).users.some(user=>user.id===teacher.id)).toBe(false)
})

it.each(['disabled','role-changed'])('loads saved data and dashboard after an assigned teacher is %s',async change=>{
 const query={branchId:'demo-central'},teacher=await create('teacher')
 const stream=await academicService.saveStream(null,{name:'History Stream',active:true},query)
 const course=await academicService.saveCourse(null,{name:'History Course',streamId:stream.id,active:true,pricingMode:'course',feeAmount:1000},query)
 const batch=await academicService.saveBatch(null,{name:'History Batch',courseId:course.id,active:true},query)
 const subject=await academicService.saveSubject(null,{name:'History Subject',courseId:course.id,active:true,feeAmount:500},query)
 const record={teacherId:teacher.id,courseId:course.id,batchId:batch.id,subjectId:subject.id,days:['Tuesday'],startTime:'10:00',endTime:'11:00',room:'History Room'}
 const assignment=await facultyService.assignFaculty(record,query)
 if(change==='disabled')await organizationService.toggleUser(teacher.id)
 else await organizationService.saveUser({...teacher,assignments:[{branchId:query.branchId,roles:['receptionist']}]},teacher.id)
 const before=localStorage.getItem(MOCK_DATABASE_KEY)
 await expect(studentService.list(query)).resolves.toBeInstanceOf(Array)
 await expect(reportService.overview(query)).resolves.toBeDefined()
 expect((await facultyService.listAssignments(query)).find(item=>item.id===assignment.id)).toMatchObject({teacherId:teacher.id,teacherName:teacher.name})
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
 await expect(facultyService.assignFaculty({...record,startTime:'12:00',endTime:'13:00'},query)).rejects.toThrow('enabled Teacher')
 const data=JSON.parse(before)
 data.facultyAssignments[0].teacherId='unknown-teacher'
 const invalid=JSON.stringify(data)
 localStorage.setItem(MOCK_DATABASE_KEY,invalid)
 await expect(studentService.list(query)).rejects.toThrow('teacher link is invalid')
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(invalid)
})
