import { render as renderBase,screen,fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach,expect,it,vi } from 'vitest'
import AssignFacultyModal from './AssignFacultyModal.jsx'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import { authService } from '../../services/authService.js'
import { resolveDailyClasses } from '../../services/classScheduleService.js'
import { admissionService } from '../../services/admissionService.js'
import App from '../../App.jsx'
import { AuthProvider } from '../../contexts/AuthContext.jsx'
import { BranchProvider } from '../../contexts/BranchContext.jsx'

function TestAccess({ children }) { return <AuthProvider><BranchProvider>{children}</BranchProvider></AuthProvider> }
const render = ui => renderBase(ui, { wrapper: TestAccess })

beforeEach(async()=>{localStorage.clear();await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin','demo-central')})
it('saves and edits through dialog handlers, shares academic projections and removes only the selected assignment',async()=>{
 const query={branchId:'demo-central'},user=userEvent.setup()
 const stream=await academicService.saveStream(null,{name:'QA Field',active:true},query)
 const course=await academicService.saveCourse(null,{name:'QA Course',streamId:stream.id,active:true},query)
 const batch=await academicService.saveBatch(null,{name:'QA Batch',courseId:course.id,active:true},query)
 const subject=await academicService.saveSubject(null,{name:'QA Biology',courseId:course.id,active:true,feeAmount:100},query)
 const props={open:true,onClose:vi.fn(),onAssigned:vi.fn(),courses:[course],streams:[stream],batches:[batch],subjects:[subject],teachers:await facultyService.list(query),branchId:query.branchId,initialTeacherId:'demo-teacher'}
 const view=render(<AssignFacultyModal {...props}/> )
 await user.selectOptions(screen.getByLabelText('Academic Field'),stream.id)
 await user.selectOptions(screen.getByLabelText('Course'),course.id)
 await user.selectOptions(screen.getByLabelText('Select Target Batch'),batch.id)
 await user.selectOptions(screen.getByLabelText('Select Subject'),subject.id)
 await user.click(screen.getAllByRole('button',{name:'Mon',exact:true}).at(-1))
 fireEvent.change(screen.getByLabelText('Start Time'),{target:{value:'10:00'}})
 fireEvent.change(screen.getByLabelText('End Time'),{target:{value:'11:00'}})
 await user.type(screen.getByLabelText('Room / Lab'),'QA Room')
 await user.click(screen.getByRole('button',{name:'Save Assignment'}))
 expect(props.onAssigned).toHaveBeenCalled()
 const [saved]=await facultyService.listAssignments(query)
 expect((await academicService.getCourse(course.id,query)).assignments[0].id).toBe(saved.id)
 expect((await facultyService.list(query)).find(t=>t.id==='demo-teacher')).toMatchObject({studentReach:0,weeklyHours:1})
 const rows=resolveDailyClasses({assignments:[saved],academic:await academicService.overview(query),branchId:query.branchId,now:new Date('2026-10-19T05:00:00Z')})
 expect(rows[0]).toMatchObject({subject:'QA Biology',enrolledCount:0,location:'QA Room'})
 const admission=await admissionService.create({studentName:'QA Enrolled Student',guardianName:'QA Guardian',contact:'03000000000',dob:'2010-01-01',course:course.name,courseId:course.id,streamId:stream.id,preferredBatchId:batch.id,subjectIds:[subject.id]},query)
 expect((await academicService.getBatch(batch.id,query)).enrolledCount).toBe(0)
 await admissionService.changeStatus(admission.id,{status:'Approved',expectedStatus:'Pending'},query)
 await admissionService.enroll(admission.id,{batchId:batch.id},query)
 expect((await academicService.getBatch(batch.id,query)).enrolledCount).toBe(1)
 expect((await facultyService.list(query)).find(t=>t.id==='demo-teacher').studentReach).toBe(1)
 const secondSubject=await academicService.saveSubject(null,{name:'QA Physics',courseId:course.id,active:true,feeAmount:100},query)
 // Create using only the immutable reference contract; projected display fields are never persisted.
 const record={teacherId:'demo-teacher',courseId:course.id,batchId:batch.id,subjectId:secondSubject.id,days:['Monday'],startTime:'12:00',endTime:'13:00',room:'QA Room'}
 const extra=await facultyService.assignFaculty(record,query)
 await expect(facultyService.assignFaculty(record,{branchId:'demo-north'})).rejects.toBeDefined()
 await expect(facultyService.assignFaculty({...record,startTime:'10:30',endTime:'11:30'},query)).rejects.toMatchObject({code:'SCHEDULE_CONFLICT'})
 view.unmount()
 const editView=render(<AssignFacultyModal {...props} initialAssignment={saved} assignments={[saved]}/> )
 await user.clear(screen.getByLabelText('Room / Lab'));await user.type(screen.getByLabelText('Room / Lab'),'Edited Room')
 await user.click(screen.getByRole('button',{name:'Save Assignment'}))
 expect((await facultyService.listAssignments(query))[0].room).toBe('Edited Room')
 await user.click(screen.getByRole('button',{name:'Remove Assignment'}))
 expect((await facultyService.listAssignments(query)).map(a=>a.id)).toEqual([extra.id])
 editView.unmount()
 history.replaceState(null,'','/admissions')
 const admissionView=render(<App/> )
 await user.click(await screen.findByRole('button',{name:'QA Field',exact:true}))
 fireEvent.change(screen.getByLabelText('Desired Course / Program'),{target:{value:course.id}})
 fireEvent.change(screen.getByLabelText('Preferred Batch'),{target:{value:batch.id}})
 expect((await screen.findAllByText('QA Room')).length).toBeGreaterThan(0)
 expect(screen.getAllByText('Faculty Teacher').length).toBeGreaterThan(0)
 admissionView.unmount()
 await authService.login({userId:'demo-owner'})
 await expect(facultyService.removeAssignment(extra.id,query)).rejects.toBeDefined()
})

it('shows only the selected teacher primary subject and rejects other subjects in persistence',async()=>{
 const query={branchId:'demo-central'}
 const teacher=await facultyService.createTeacher({name:'QA Biology Only',contact:'03000000061',specialization:'Biology'},query)
 const stream=await academicService.saveStream(null,{name:'QA Subject Field',active:true},query)
 const course=await academicService.saveCourse(null,{name:'QA Subject Course',streamId:stream.id,active:true},query)
 const batch=await academicService.saveBatch(null,{name:'QA Subject Batch',courseId:course.id,active:true},query)
 const biology=await academicService.saveSubject(null,{name:'Biology',courseId:course.id,active:true},query)
 const chemistry=await academicService.saveSubject(null,{name:'Chemistry',courseId:course.id,active:true},query)
 render(<AssignFacultyModal open onClose={()=>{}} course={course} initialTeacherId={teacher.id} teachers={[teacher]} batches={[batch]} subjects={[biology,chemistry]} branchId={query.branchId}/> )
 expect(screen.getByRole('option',{name:'Biology'})).toBeInTheDocument()
 expect(screen.queryByRole('option',{name:'Chemistry'})).not.toBeInTheDocument()
 await expect(facultyService.assignFaculty({teacherId:teacher.id,courseId:course.id,batchId:batch.id,subjectId:chemistry.id,days:['Mon'],startTime:'08:00',endTime:'09:00',room:'QA'},query)).rejects.toMatchObject({code:'INVALID_REFERENCE'})
})


it('keeps start/end ordering validation with complete AM/PM entry and suggestions', async () => {
 const query={branchId:'demo-central'}, user=userEvent.setup()
 const stream=await academicService.saveStream(null,{name:'Picker Field',active:true},query)
 const course=await academicService.saveCourse(null,{name:'Picker Course',streamId:stream.id,active:true},query)
 const batch=await academicService.saveBatch(null,{name:'Picker Batch',courseId:course.id,active:true},query)
 const subject=await academicService.saveSubject(null,{name:'Picker Subject',courseId:course.id,active:true,feeAmount:100},query)
 const onAssigned=vi.fn()
 render(<AssignFacultyModal open onClose={()=>{}} onAssigned={onAssigned} courses={[course]} streams={[stream]} batches={[batch]} subjects={[subject]} teachers={await facultyService.list(query)} branchId={query.branchId} initialTeacherId="demo-teacher"/>)
 await user.selectOptions(screen.getByLabelText('Academic Field'),stream.id)
 await user.selectOptions(screen.getByLabelText('Course'),course.id)
 await user.selectOptions(screen.getByLabelText('Select Target Batch'),batch.id)
 await user.selectOptions(screen.getByLabelText('Select Subject'),subject.id)
 await user.click(screen.getAllByRole('button',{name:'Mon',exact:true}).at(-1))
 fireEvent.change(screen.getByLabelText('Start Time'),{target:{value:'2:15 PM'}})
 fireEvent.change(screen.getByLabelText('End Time'),{target:{value:'9:07 AM'}})
 await user.type(screen.getByLabelText('Room / Lab'),'Picker Room')
 await user.click(screen.getByRole('button',{name:'Save Assignment'}))
 expect(await screen.findByText('Start time must be before end time.')).toBeInTheDocument()
 expect(onAssigned).not.toHaveBeenCalled()
 expect((await facultyService.listAssignments(query)).filter(a=>a.room==='Picker Room')).toHaveLength(0)
})
