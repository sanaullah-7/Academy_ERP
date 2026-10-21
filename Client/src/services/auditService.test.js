import {beforeEach,expect,it,vi} from 'vitest'
import {authService} from './authService.js'
import {academicService} from './academicService.js'
import {organizationService} from './organizationService.js'
import {auditService} from './auditService.js'
import {MOCK_DATABASE_KEY,MOCK_ORGANIZATION_KEY} from '../constants/storageKeys.js'
import {filterAuditLogs} from '../utils/auditFilter.js'
const q={branchId:'demo-central'}
beforeEach(async()=>{localStorage.clear();await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin',q.branchId)})
it('starts empty, skips initialization and no-op saves, captures actual before/after and newest order',async()=>{
 expect(await auditService.list(q)).toEqual([])
 await academicService.overview(q)
 expect(await auditService.list(q)).toEqual([])
 const course=await academicService.saveCourse(null,{name:'AUDIT Course',active:true},q)
 await academicService.saveCourse(course.id,{name:'AUDIT Renamed',active:true},q)
 const logs=await auditService.list(q)
 expect(logs.map(l=>l.action)).toEqual(['Updated','Created'])
 expect(logs[0]).toMatchObject({userId:'demo-admin',roles:['super_admin'],module:'Courses & Batches',branchId:q.branchId,recordId:course.id})
 expect(logs[0].changes).toContainEqual({field:'name',before:'AUDIT Course',after:'AUDIT Renamed'})
 await academicService.saveCourse(course.id,{name:'AUDIT Renamed',active:true},q)
 expect(await auditService.list(q)).toEqual(logs)
 const snapshot=localStorage.getItem(MOCK_DATABASE_KEY)
 await expect(academicService.saveCourse(null,{name:'AUDIT Renamed'},q)).rejects.toThrow()
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(snapshot)
})
it('captures staff access/password/settings changes and never stores private field values',async()=>{
 const staff=await organizationService.saveUser({name:'AUDIT Staff',login:'audit@example.test',contact:'PRIVATE-CONTACT',assignments:[{branchId:q.branchId,roles:['teacher']}]})
 await organizationService.saveSettings({academyName:'AUDIT Academy',description:'PRIVATE-NOTE'})
 const password=crypto.randomUUID()
 await authService.changePassword({currentPassword:import.meta.env.VITE_MOCK_ADMIN_PASSWORD,newPassword:password,confirmPassword:password})
 await organizationService.deleteUser(staff.id)
 const logs=await auditService.list(q),serialized=JSON.stringify(logs)
 expect(logs.some(l=>l.action==='Access removed')).toBe(true)
 expect(logs.some(l=>l.module==='Account Security')).toBe(true)
 expect(logs.some(l=>l.module==='Settings')).toBe(true)
 for(const value of ['PRIVATE-CONTACT','PRIVATE-NOTE',password,'salt','hash'])expect(serialized).not.toContain(value)
 expect(logs[0].userName).toBe('Administrator')
})
it('separates branches and denies Owner/Receptionist/Teacher or foreign branch reads',async()=>{
 await academicService.saveCourse(null,{name:'Central only'},q)
 await expect(auditService.list({branchId:'demo-north'})).rejects.toThrow('active branch')
 await authService.selectBranch('demo-admin','demo-north')
 expect(await auditService.list({branchId:'demo-north'})).toEqual([])
 for(const userId of ['demo-owner','demo-reception','demo-teacher']){
  const session=await authService.login({userId})
  await expect(auditService.list({branchId:session.branchId})).rejects.toThrow('Super Admin')
 }
})
it('does not log failed persistence and preserves existing journal',async()=>{
 await academicService.overview(q)
 const before=localStorage.getItem(MOCK_DATABASE_KEY),setItem=Storage.prototype.setItem
 const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value){if(key===MOCK_DATABASE_KEY)throw new Error('write failed');return setItem.call(this,key,value)})
 await expect(academicService.saveCourse(null,{name:'Not saved'},q)).rejects.toThrow('could not be saved')
 spy.mockRestore()
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
 expect(await auditService.list(q)).toEqual([])
 const prior=localStorage.getItem(MOCK_ORGANIZATION_KEY)
 const orgSpy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value){if(key===MOCK_ORGANIZATION_KEY)throw new Error('write failed');return setItem.call(this,key,value)})
 await expect(organizationService.saveSettings({academyName:'Not saved'})).rejects.toThrow('write failed')
 orgSpy.mockRestore()
 expect(localStorage.getItem(MOCK_ORGANIZATION_KEY)).toBe(prior)
 expect(await auditService.list(q)).toEqual([])
})
it('filters search, modules, importance and Karachi calendar boundaries inclusively',()=>{
 const log={userName:'QA Actor',roles:['receptionist'],module:'Admissions',action:'Created',description:'Saved admission',recordId:'a',importance:'Important',timestamp:'2026-10-19T20:00:00Z'}
 const now=new Date('2026-10-20T06:00:00Z')
 expect(filterAuditLogs([log],{period:'Today'},now)).toEqual([log])
 expect(filterAuditLogs([log],{search:'receptionist',module:'Admissions',importance:'Important',period:'Custom',from:'2026-10-20',to:'2026-10-20'},now)).toEqual([log])
 expect(filterAuditLogs([log],{module:'Fees'},now)).toEqual([])
 expect(filterAuditLogs([log],{period:'Custom',to:'2026-10-19'},now)).toEqual([])
})

it('captures the first mutation even when the academic database was never opened',async()=>{
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
 const course=await academicService.saveCourse(null,{name:'First saved course'},q)
 expect(await auditService.list(q)).toEqual([expect.objectContaining({recordId:course.id,action:'Created'})])
})

it('keeps shared teacher access changes in each affected branch with actor snapshot',async()=>{
 await organizationService.deleteUser('teacher-irfan')
 expect((await auditService.list(q)).some(log=>log.action==='Access removed')).toBe(true)
 await authService.selectBranch('demo-admin','demo-north')
 expect(await auditService.list({branchId:'demo-north'})).toEqual(expect.arrayContaining([expect.objectContaining({recordId:'teacher-irfan',userName:'Administrator',roles:['super_admin'],action:'Access removed'})]))
})
