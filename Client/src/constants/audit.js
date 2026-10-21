export const AUDIT_MODULES = Object.freeze([
 'Dashboard','Admissions','Students','Courses & Batches','Faculty & Classes',
 'Fees','Finance','Payroll','Demo Classes','Assets','Reports',
 'Audit Log','Branches','Users','Settings','Account Security',
])
export const AUDIT_IMPORTANCE = Object.freeze(['Normal','Important','Critical'])
export function auditImportance({module,action,changes=[]}) {
 const criticalChange=changes.some(change=>
  module==='Users'&&['roles','assignments'].includes(change.field)&&action!=='Created'||
  ['Users','Branches'].includes(module)&&['active','enabled','accessRevoked'].includes(change.field)&&(change.after===false||change.field==='accessRevoked'&&change.after===true)||
  ['Fees','Finance','Payroll'].includes(module)&&change.field==='status'&&['Reversed','Cancelled','Voided'].includes(change.after)
 )
 if(action==='Deleted'||action==='Access removed'||criticalChange)return 'Critical'
 return ['Fees','Finance','Payroll','Users','Settings','Branches','Account Security'].includes(module)?'Important':'Normal'
}
