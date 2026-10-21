import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { MockDataError } from '../mock/mockDatabase.js'

async function scope(query, permission) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active session or branch changed.')
    if (!canAccess(permission, current.user, current.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This role is not authorized for this class action.')
  }
}

export const classScheduleService = {
  list: async query => mockApi.classScheduleOperation('list', { query }, await scope(query, PERMISSIONS.CLASSES_VIEW)),
  getById: async (id, query) => mockApi.classScheduleOperation('get', { id, query }, await scope(query, PERMISSIONS.CLASSES_VIEW)),
  create: async (record, query) => mockApi.classScheduleOperation('create', { record, query }, await scope(query, PERMISSIONS.CLASSES_MANAGE)),
  update: async (id, record, query) => mockApi.classScheduleOperation('update', { id, record, query }, await scope(query, PERMISSIONS.CLASSES_MANAGE)),
  delete: async (id, query) => mockApi.classScheduleOperation('delete', { id, query }, await scope(query, PERMISSIONS.CLASSES_MANAGE)),
}

const dayAliases={sun:'sunday',mon:'monday',tue:'tuesday',tues:'tuesday',wed:'wednesday',thu:'thursday',thur:'thursday',thurs:'thursday',fri:'friday',sat:'saturday'}
const normalizeDay=value=>{const day=String(value??'').trim().toLowerCase().replace(/[^a-z]/g,'');return dayAliases[day]??day}
export function zonedClock(now=new Date(),timeZone='Asia/Karachi'){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]))
  return {dateKey:`${parts.year}-${parts.month}-${parts.day}`,weekday:normalizeDay(parts.weekday),minutes:Number(parts.hour)*60+Number(parts.minute)}
}
const timeMinutes=value=>{const [hour,minute]=String(value??'').split(':').map(Number);return Number.isFinite(hour)&&Number.isFinite(minute)?hour*60+minute:null}
const resolvedText=(value,fallback)=>!value||/^unresolved\b/i.test(value)||value==='Teacher'?fallback:value
export function classTimeStatus(item,now=new Date(),timeZone='Asia/Karachi'){
  const clock=zonedClock(now,timeZone),start=timeMinutes(item.startTime),end=timeMinutes(item.endTime)
  if(start==null||end==null)return {label:'Time Not Configured',type:'incomplete',minutesRemaining:null}
  if(clock.minutes>=end)return {label:'Completed',type:'completed',minutesRemaining:0}
  if(clock.minutes>=start)return {label:'In Progress',type:'in-progress',minutesRemaining:0}
  const remaining=start-clock.minutes
  if(remaining<=30)return {label:'Starting Soon',type:'soon',minutesRemaining:remaining}
  const hours=Math.floor(remaining/60),minutes=remaining%60
  return {label:hours?(`In ${hours}h${minutes?` ${minutes}m`:''}`):`In ${minutes} min`,type:'upcoming',minutesRemaining:remaining}
}
export function resolveDailyClasses({sessions=[],assignments=[],academic={},branchId=null,now=new Date(),timeZone='Asia/Karachi'}={}){
  const clock=zonedClock(now,timeZone),courses=new Map((academic.courses??[]).map(value=>[value.id,value])),batches=new Map((academic.batches??[]).map(value=>[value.id,value])),subjects=new Map((academic.subjects??[]).map(value=>[value.id,value]))
  const validReference=(course,batch,subject)=>course?.active!==false&&batch?.active!==false&&subject?.active!==false
  const occurrenceKey=item=>[item.batchId,String(item.subject??'').trim().toLowerCase(),item.teacherId??'',item.startTime,item.endTime].join('|')
  const merged=new Map()
  assignments.filter(item=>(!branchId||item.branchId===branchId)&&item.branchId&&Array.isArray(item.days)&&item.days.some(day=>normalizeDay(day)===clock.weekday)).forEach(item=>{const course=courses.get(item.courseId),batch=batches.get(item.batchId),subject=subjects.get(item.subjectId);if(!validReference(course,batch,subject))return;const value={id:`assignment-${item.id}-${clock.dateKey}`,assignmentId:item.id,source:'recurring',classDate:clock.dateKey,subject:resolvedText(subject?.name??item.subjectName,'Not Configured'),teacherId:item.teacherId,teacherName:resolvedText(item.teacherName,'Not Assigned'),courseId:item.courseId,courseName:resolvedText(course?.name??item.courseName,'Not Configured'),batchId:item.batchId,batchName:resolvedText(batch?.name??item.batchName,'Not Configured'),startTime:item.startTime,endTime:item.endTime,location:resolvedText(item.room,'Not Configured'),enrolledCount:Number(batch?.enrolledCount??0)};merged.set(occurrenceKey(value),value)})
  sessions.filter(item=>(!branchId||item.branchId===branchId)&&item.classDate===clock.dateKey&&!['cancelled','canceled'].includes(String(item.status??'').toLowerCase())).forEach(item=>{const batch=batches.get(item.batchId),course=courses.get(item.courseId??batch?.courseId);const value={...item,source:'single-date',subject:resolvedText(item.subject,'Not Configured'),teacherName:resolvedText(item.teacherName,'Not Assigned'),courseName:resolvedText(item.courseName||course?.name,'Not Configured'),batchName:resolvedText(item.batchName||batch?.name,'Not Configured'),location:resolvedText(item.location,'Not Configured'),enrolledCount:Number(batch?.enrolledCount??item.enrolledCount??0)};merged.set(occurrenceKey(value),value)})
  return [...merged.values()].map(item=>({...item,timeStatus:classTimeStatus(item,now,timeZone)})).sort((left,right)=>left.startTime.localeCompare(right.startTime))
}
