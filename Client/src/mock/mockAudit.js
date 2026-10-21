import { auditImportance } from '../constants/audit.js'
// Browser-local change journal, embedded atomically with each domain save.
import { MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import { findDemoUser, getDemoUsers } from './authFixtures.js'
import { getBranchRoles } from '../constants/roles.js'
const modules={admissions:'Admissions',students:'Students',enrollments:'Admissions',courses:'Courses & Batches',batches:'Courses & Batches',academicStreams:'Courses & Batches',subjects:'Courses & Batches',classes:'Faculty & Classes',facultyAssignments:'Faculty & Classes',challans:'Fees',payments:'Fees',expenses:'Finance',demoClasses:'Demo Classes',assets:'Assets',salaryAgreements:'Payroll',payrollPeriods:'Payroll',payrollLines:'Payroll',payrollPayments:'Payroll',payrollAdvances:'Payroll',payrollAdjustments:'Payroll'}
const safeValues=new Set(['assignments','roles','courseId','batchId','subjectId','teacherId','name','studentName','title','active','enabled','accessRevoked','status','capacity','durationMonths','shift','startTime','endTime','days','amount','feeAmount','paidAmount','balance','pricingMode','primaryColor','sidebarBackground','sidebarText','sidebarIcon','sidebarActive','academyName','teacherPayrollEnabled'])
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
function actor(){
 let session
 try{session=JSON.parse(localStorage.getItem(MOCK_SESSION_KEY)||'null')}catch{return null}
 const user=session?.version===1?findDemoUser(session.userId):null
 if(!user?.enabled||!session.branchId)return null
 const roles=getBranchRoles(user,session.branchId)
 if(!roles.length)return null
 return {userId:user.id,userName:user.name,roles,branchId:session.branchId}
}
function changes(before,after){
 return [...new Set([...Object.keys(before||{}),...Object.keys(after||{})])].filter(key=>!['id','branchId','updatedAt','createdAt','actorUserId'].includes(key)&&!same(before?.[key],after?.[key])).map(field=>({field,before:safeValues.has(field)?before?.[field]??null:'Not displayed',after:safeValues.has(field)?after?.[field]??null:'Not displayed'}))
}
export function appendAudit(previous,next,kind){
 const oldLogs=previous?.auditLogs??[]
 if(!Array.isArray(oldLogs))throw new Error('Saved audit history is invalid; changes were not saved.')
 const who=actor()
 if(!who)return oldLogs
 let sequence=oldLogs.at(-1)?.sequence??0
 for(const key of [MOCK_DATABASE_KEY,MOCK_ORGANIZATION_KEY]){
  const saved=JSON.parse(localStorage.getItem(key)||'null')
  sequence=Math.max(sequence,saved?.auditLogs?.at(-1)?.sequence??0)
 }
 const events=[]
 function log(module,entity,id,before,after,branchId=who.branchId){
  const fields=changes(before,after)
  if(!fields.length)return
  const action=!before?'Created':!after?'Deleted':after.accessRevoked&&!before.accessRevoked?'Access removed':'Updated'
  const recordName=String(after?.name??before?.name??after?.studentName??before?.studentName??id??entity).slice(0,160)
  events.push({id:crypto.randomUUID(),sequence:++sequence,branchId,userId:who.userId,userName:who.userName,roles:who.roles,timestamp:new Date().toISOString(),module,entity,recordId:String(id??entity),recordName,action,importance:auditImportance({module,action,changes:fields}),description:`${action} ${recordName}. Changed: ${fields.map(c=>c.field).join(', ')}.`,changes:fields})
 }
 function rows(collection,module,before=[],after=[]){
  const old=new Map(before.map(item=>[item.id,item])),current=new Map(after.map(item=>[item.id,item]))
  for(const id of new Set([...old.keys(),...current.keys()])){
   const a=old.get(id),b=current.get(id)
   if(same(a,b))continue
   const branches=collection==='users'?[...new Set([...(a?.assignments??[]),...(b?.assignments??[])].map(item=>item.branchId))]:[]
   if(branches.length){for(const branchId of branches)log(module,collection,id,a?{...a,assignments:a.assignments.filter(item=>item.branchId===branchId)}:a,b?{...b,assignments:b.assignments.filter(item=>item.branchId===branchId)}:b,branchId)}
   else log(module,collection,id,a,b,b?.branchId??a?.branchId??who.branchId)
  }
 }
 if(kind==='database'){
  for(const [collection,module] of Object.entries(modules))rows(collection,module,previous?.[collection]??[],next[collection]??[])
 }else{
  rows('users','Users',previous.users??[],next.users??[])
  rows('branches','Branches',previous.branches??[],next.branches??[])
  for(const [key,module] of Object.entries({profileOverrides:'Users',assignmentOverrides:'Users',branchOverrides:'Branches',credentials:'Account Security'})){
   for(const id of new Set([...Object.keys(previous[key]??{}),...Object.keys(next[key]??{})])){
    const a=previous[key]?.[id],b=next[key]?.[id]
    if(same(a,b))continue
    const identity=getDemoUsers().find(u=>u.id===id)
    const branches=key==='branchOverrides'?[id]:[...new Set(identity?.assignments?.map(item=>item.branchId)??[who.branchId])]
    for(const branchId of branches.length?branches:[who.branchId]){
     if(key==='credentials')log(module,'password',id,{name:identity?.name??id,password:'previous'},{name:identity?.name??id,password:'changed'},branchId)
     else if(key==='assignmentOverrides')log(module,key,id,{name:identity?.name??id,assignments:(a??[]).filter(item=>item.branchId===branchId)},{name:identity?.name??id,assignments:(b??[]).filter(item=>item.branchId===branchId)},branchId)
     else log(module,key,id,{...a,name:a?.name??identity?.name??id},{...b,name:b?.name??identity?.name??id},branchId)
    }
   }
  }
  for(const id of next.deletedUserIds??[]){if(!(previous.deletedUserIds??[]).includes(id)&&!previous.users?.some(u=>u.id===id)){const user=getDemoUsers().find(u=>u.id===id);log('Faculty & Classes','faculty',id,{name:user?.name??id},null)}}
  for(const id of next.deletedBranchIds??[]){if(!(previous.deletedBranchIds??[]).includes(id))log('Branches','branches',id,{name:id,active:false},null,id)}
  if(!same(previous.settings,next.settings))log('Settings','settings','academy-settings',previous.settings,next.settings)
 }
 return events.length?[...oldLogs,...events]:oldLogs
}

export function readAuditHistory(){
 return [MOCK_ORGANIZATION_KEY,MOCK_DATABASE_KEY].flatMap(key=>{
  const saved=JSON.parse(localStorage.getItem(key)||'null'),logs=saved?.auditLogs??[]
  if(!Array.isArray(logs)||logs.some(log=>!log||typeof log.id!=='string'||typeof log.branchId!=='string'||!Array.isArray(log.roles)||!Array.isArray(log.changes)||!Number.isFinite(new Date(log.timestamp).getTime())))throw new Error('Saved audit history is invalid.')
  return logs
 })
}
