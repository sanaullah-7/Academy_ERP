import { auditImportance } from '../constants/audit.js'
import { authService } from './authService.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { readAuditHistory } from '../mock/mockAudit.js'
export const auditService={
 async list({branchId}={}){
  const session=await authService.getSession()
  if(!session?.user||session.branchId!==branchId||!canAccess(PERMISSIONS.AUDIT_VIEW,session.user,branchId))throw new Error('Only an authorized Admin or Super Admin in the active branch can view this audit log.')
  return structuredClone(readAuditHistory().filter(log=>log.branchId===branchId).map(log=>({...log,importance:auditImportance(log)})).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)||(b.sequence??0)-(a.sequence??0)))
 }
}
