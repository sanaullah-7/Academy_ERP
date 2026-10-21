import { ROLE_LABELS } from '../constants/roles.js'
import { getAcademyDateOnly } from './formatDate.js'
export function filterAuditLogs(logs,{search='',module='All',importance='All',period='All',from='',to=''},now=new Date()){
 const today=getAcademyDateOnly(now),needle=search.trim().toLowerCase()
 return logs.filter(log=>{
  if(module!=='All'&&log.module!==module||importance!=='All'&&log.importance!==importance)return false
  if(needle&&!`${log.userName} ${log.roles.join(' ')} ${log.roles.map(role=>ROLE_LABELS[role]??role).join(' ')} ${log.module} ${log.action} ${log.description} ${log.recordId}`.toLowerCase().includes(needle))return false
  const day=getAcademyDateOnly(new Date(log.timestamp))
  if(period==='Today'&&day!==today)return false
  if(period==='7 days'&&(new Date(today+'T00:00:00+05:00')-new Date(day+'T00:00:00+05:00')<0||new Date(today+'T00:00:00+05:00')-new Date(day+'T00:00:00+05:00')>6*86400000))return false
  if(period==='Month'&&day?.slice(0,7)!==today.slice(0,7))return false
  if(period==='Custom'&&((from&&day<from)||(to&&day>to)))return false
  return true
 })
}
