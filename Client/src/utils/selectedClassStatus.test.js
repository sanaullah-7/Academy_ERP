import { expect, it } from 'vitest'
import { selectedClassStatus } from './selectedClassStatus.js'
const now = new Date('2026-10-19T05:00:00Z') // 10 AM Karachi
const daily = [
 {assignmentId:'early',startTime:'09:00',endTime:'09:30'},
 {assignmentId:'live',startTime:'09:30',endTime:'10:30'},
 {assignmentId:'later',startTime:'11:00',endTime:'12:00'},
 {id:'dated',source:'single-date',startTime:'10:15',endTime:'11:00'},
]
it('uses only the clicked occurrence rather than another active teacher class',()=>{
 expect(selectedClassStatus({assignmentId:'early'},daily,now).label).toBe('Completed')
 expect(selectedClassStatus({assignmentId:'live'},daily,now).label).toBe('In Progress')
 expect(selectedClassStatus({assignmentId:'later'},daily,now).type).toBe('upcoming')
 expect(selectedClassStatus({isSession:true,classId:'dated'},daily,now).label).toBe('Starting Soon')
})
it('does not claim progress for other days, removed/cancelled occurrences or no selection',()=>{
 expect(selectedClassStatus({assignmentId:'other-day'},daily,now).label).toBe('Not scheduled today')
 expect(selectedClassStatus({assignmentId:'live'},[],now).type).toBe('empty')
 expect(selectedClassStatus(null,daily,now).label).toBe('No class selected')
})
