import {expect,it} from 'vitest'
import {AUDIT_MODULES,AUDIT_IMPORTANCE,auditImportance} from './audit.js'
it('includes academy ERP modules and three ordered importance levels',()=>{
 expect(AUDIT_IMPORTANCE).toEqual(['Normal','Important','Critical'])
 for(const module of ['Dashboard','Admissions','Students','Courses & Batches','Faculty & Classes','Fees','Finance','Payroll','Demo Classes','Assets','Reports','Audit Log','Branches','Users','Settings'])expect(AUDIT_MODULES).toContain(module)
 expect(AUDIT_MODULES).not.toContain('Hotel Settings')
})
it('classifies actual action and changed fields consistently',()=>{
 expect(auditImportance({module:'Courses & Batches',action:'Updated'})).toBe('Normal')
 expect(auditImportance({module:'Fees',action:'Created'})).toBe('Important')
 expect(auditImportance({module:'Users',action:'Created',changes:[{field:'assignments',after:[]}]})).toBe('Important')
 expect(auditImportance({module:'Assets',action:'Deleted'})).toBe('Critical')
 expect(auditImportance({module:'Users',action:'Access removed'})).toBe('Critical')
 expect(auditImportance({module:'Users',action:'Updated',changes:[{field:'assignments',before:['teacher'],after:['super_admin']}]})).toBe('Critical')
 expect(auditImportance({module:'Branches',action:'Updated',changes:[{field:'active',before:true,after:false}]})).toBe('Critical')
 expect(auditImportance({module:'Fees',action:'Updated',changes:[{field:'status',after:'Reversed'}]})).toBe('Critical')
})
