import { describe,expect,it } from 'vitest'
import { classTimeStatus,resolveDailyClasses,zonedClock } from './classScheduleService.js'

const academic={
  courses:[{id:'course-1',name:'MDCAT',active:true}],
  batches:[{id:'batch-1',courseId:'course-1',name:'Morning Batch',active:true,enrolledCount:7}],
  subjects:[{id:'subject-1',courseId:'course-1',name:'Biology',active:true}],
}
const assignment={id:'assign-1',branchId:'branch-a',teacherId:'teacher-1',teacherName:'Teacher One',courseId:'course-1',batchId:'batch-1',subjectId:'subject-1',days:['Monday'],startTime:'10:20',endTime:'11:20',room:'Hall 1'}
const monday=new Date('2026-10-19T05:00:00.000Z')

describe('authoritative daily class schedule',()=>{
  it('matches weekday and resolves teacher, academic links and enrollment count',()=>{
    const result=resolveDailyClasses({assignments:[assignment],academic,branchId:'branch-a',now:monday})
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({subject:'Biology',teacherName:'Teacher One',courseName:'MDCAT',batchName:'Morning Batch',location:'Hall 1',enrolledCount:7})
    expect(result[0].timeStatus.type).toBe('soon')
  })
  it('includes today sessions and deduplicates their recurring occurrence',()=>{
    const session={id:'class-1',branchId:'branch-a',batchId:'batch-1',teacherId:'teacher-1',teacherName:'Teacher One',subject:'Biology',classDate:'2026-10-19',startTime:'10:20',endTime:'11:20',location:'Hall 1'}
    const result=resolveDailyClasses({sessions:[session,{...session,id:'future',classDate:'2026-10-20'}],assignments:[assignment],academic,branchId:'branch-a',now:monday})
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({id:'class-1',source:'single-date'})
  })
  it('isolates branches and reflects assignment add update and remove',()=>{
    expect(resolveDailyClasses({assignments:[{...assignment,branchId:'branch-b'}],academic,branchId:'branch-a',now:monday})).toEqual([])
    expect(resolveDailyClasses({assignments:[assignment],academic,branchId:'branch-a',now:monday})[0].teacherName).toBe('Teacher One')
    expect(resolveDailyClasses({assignments:[{...assignment,teacherName:'Teacher Updated'}],academic,branchId:'branch-a',now:monday})[0].teacherName).toBe('Teacher Updated')
    expect(resolveDailyClasses({assignments:[],academic,branchId:'branch-a',now:monday})).toEqual([])
  })
  it('calculates upcoming countdown, soon, in-progress and completed states',()=>{
    const item={startTime:'10:20',endTime:'11:20'}
    expect(classTimeStatus(item,new Date('2026-10-19T04:00:00Z'))).toMatchObject({type:'upcoming',minutesRemaining:80})
    expect(classTimeStatus(item,monday).type).toBe('soon')
    expect(classTimeStatus(item,new Date('2026-10-19T05:30:00Z')).type).toBe('in-progress')
    expect(classTimeStatus(item,new Date('2026-10-19T06:30:00Z')).type).toBe('completed')
  })
  it('rolls date and weekday at academy midnight',()=>{
    expect(zonedClock(new Date('2026-10-19T18:59:00Z'))).toMatchObject({dateKey:'2026-10-19',weekday:'monday'})
    expect(zonedClock(new Date('2026-10-19T19:01:00Z'))).toMatchObject({dateKey:'2026-10-20',weekday:'tuesday'})
  })
})
