import { AUDIT_MODULES, AUDIT_IMPORTANCE } from '../../constants/audit.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Eye, RotateCw, ScrollText, Search } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { auditService } from '../../services/auditService.js'
import { formatTimestamp } from '../../utils/timeFormat.js'
import { filterAuditLogs } from '../../utils/auditFilter.js'
import { ROLE_LABELS } from '../../constants/roles.js'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Card } from '../../components/ui/card.jsx'
import Pagination from '../../components/Shared/Pagination.jsx'
import CustomSelect from '../../components/ui/CustomSelect.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog.jsx'
const defaults={search:'',module:'All',importance:'All',period:'All',from:'',to:''}
const valueLabel=value=>value==null?'Not set':typeof value==='object'?JSON.stringify(value):String(value)
export default function AuditLogPage(){
 const {branchId,branch}=useBranch()
 const [logs,setLogs]=useState([]),[filters,setFilters]=useState(defaults),[loading,setLoading]=useState(true),[error,setError]=useState(''),[page,setPage]=useState(1),[rows,setRows]=useState(10),[detail,setDetail]=useState(null)
 const load=useCallback(async()=>{await Promise.resolve();setLoading(true);setError('');try{setLogs(await auditService.list({branchId}))}catch(e){setLogs([]);setError(e.message)}finally{setLoading(false)}},[branchId])
 useEffect(()=>{let active=true;auditService.list({branchId}).then(values=>{if(active)setLogs(values)},failure=>{if(active)setError(failure.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[branchId])
 const invalid=filters.period==='Custom'&&filters.from&&filters.to&&filters.from>filters.to
 const filtered=useMemo(()=>invalid?[]:filterAuditLogs(logs,filters),[logs,filters,invalid])
 const safePage=Math.min(page,Math.max(1,Math.ceil(filtered.length/rows))),visible=filtered.slice((safePage-1)*rows,safePage*rows)
 const setFilter=(key,value)=>{setFilters(current=>({...current,[key]:value}));setPage(1)}
 return <DashboardLayout title="Audit Log"><div className="space-y-4">
  <header className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ScrollText size={22}/></span><div><h1 className="text-2xl font-bold">Audit Log</h1><p className="text-xs text-muted-foreground">Saved activity for {branch?.name}. Times shown in Asia/Karachi.</p></div></header>
  <Card className="border-border/80">
   <div className="grid grid-cols-2 items-end gap-2 border-b border-border/60 bg-muted/20 p-4 lg:grid-cols-[minmax(0,1fr)_160px_130px_130px_auto_40px]">
    <label className="col-span-2 min-w-0 text-xs font-medium lg:col-span-1">Search logs<div className="relative mt-1"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground"/><Input className="pl-9" placeholder="User, role, action or record..." value={filters.search} onChange={e=>setFilter('search',e.target.value)}/></div></label>
    {[['module','Module',AUDIT_MODULES],['importance','Importance',AUDIT_IMPORTANCE],['period','Time filter',['Today','7 days','Month','Custom']]].map(([key,label,options])=><div key={key} className="grid min-w-0 gap-1.5 text-xs font-medium">
     <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
     <CustomSelect
      aria-label={label}
      value={filters[key]}
      onChange={value=>setFilter(key,value)}
      options={[{value:'All',label:key==='module'?'All modules':key==='period'?'All time':'All'},...options.map(option=>({value:option,label:option,...(key==='importance'?{dot:option==='Critical'?'bg-red-600':option==='Important'?'bg-amber-500':'bg-emerald-600'}:{})}))]}
      containerClassName="relative w-full"
      className="h-10 w-full rounded-xl border-primary/15 bg-white hover:bg-[#fcf5f7]"
      menuWidthClass="w-full min-w-0"
     />
    </div>)}
    <Button variant="outline" onClick={()=>{setFilters(defaults);setPage(1)}}>Clear</Button><Button variant="outline" size="icon" aria-label="Refresh audit log" disabled={loading} onClick={()=>void load()}><RotateCw size={16} className={loading?'animate-spin':''}/></Button>
    {filters.period==='Custom'&&<div className="col-span-full flex w-full flex-wrap gap-3">{[['from','From date'],['to','To date']].map(([key,label])=><label key={key} className="grid gap-1 text-xs font-medium">{label}<Input type="date" value={filters[key]} onChange={e=>setFilter(key,e.target.value)}/></label>)}{invalid&&<p role="alert" className="self-end text-sm text-destructive">End date must follow start date.</p>}</div>}
   </div>
   <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground"><span>{filtered.length} matching activities</span><span>Changes are recorded from activation onward.</span></div>
   {error&&<p role="alert" className="mx-4 mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
   <div className="hidden overflow-x-auto md:block"><table className="w-full table-fixed text-left text-xs"><thead className="border-y border-border/60 bg-muted/30"><tr>{[['Date & time','w-[18%]'],['User / role','w-[17%]'],['Module','w-[13%]'],['Action','w-[12%]'],['Description','w-[28%]'],['Importance','w-[12%]']].map(([label,width])=><th key={label} className={`${width} px-4 py-3 font-semibold`}>{label}</th>)}</tr></thead><tbody className="divide-y divide-border/50">{visible.map(log=><tr key={log.id} className="hover:bg-primary/5"><td className="px-4 py-4 leading-relaxed">{formatTimestamp(log.timestamp)}</td><td className="break-words px-4 py-4"><strong>{log.userName}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{log.roles.map(role=>ROLE_LABELS[role]??role).join(', ')}</span></td><td className="px-4 py-4">{log.module}</td><td className="px-4 py-4 font-semibold">{log.action}</td><td className="px-4 py-4"><p className="break-words text-muted-foreground">{log.description}</p><button className="mt-2 inline-flex items-center gap-1 font-medium text-primary hover:underline" onClick={()=>setDetail(log)}><Eye size={13}/>View details</button></td><td className="px-4 py-4"><Importance value={log.importance}/></td></tr>)}</tbody></table></div>
   <div className="space-y-3 px-4 md:hidden">{visible.map(log=><button key={log.id} onClick={()=>setDetail(log)} className="w-full rounded-xl border border-border bg-card p-3 text-left text-xs"><span className="flex justify-between gap-2"><strong>{log.module} / {log.action}</strong><Importance value={log.importance}/></span><span className="mt-2 block font-semibold">{log.userName} / {log.roles.map(role=>ROLE_LABELS[role]??role).join(', ')}</span><span className="mt-1 block text-muted-foreground">{formatTimestamp(log.timestamp)}</span><span className="mt-2 block break-words">{log.description}</span></button>)}</div>
   {!visible.length&&!error&&<p role="status" className="p-10 text-center text-sm text-muted-foreground">{loading?'Loading audit log...':logs.length?'No activities match these filters.':'No recorded activity yet. Future saved changes will appear here.'}</p>}
   <Pagination label="Audit log" page={safePage} rows={rows} total={filtered.length} onPage={setPage} onRows={value=>{setRows(value);setPage(1)}}/>
  </Card>
  <Dialog open={Boolean(detail)} onOpenChange={open=>!open&&setDetail(null)}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Activity details</DialogTitle><DialogDescription>{detail?.module} / {detail?.action}</DialogDescription></DialogHeader>{detail&&<div className="space-y-4 text-sm"><p><b>{detail.userName}</b> / {detail.roles.map(role=>ROLE_LABELS[role]??role).join(', ')}</p><p className="text-muted-foreground">{formatTimestamp(detail.timestamp)}</p><p className="break-all"><b>Record:</b> {detail.recordName} <span className="text-xs text-muted-foreground">({detail.recordId})</span></p><div className="space-y-3">{detail.changes.map(change=><div key={change.field} className="rounded-lg border border-border bg-muted/20 p-3"><strong className="block break-words text-xs">{change.field}</strong><div className="mt-2 grid gap-3 sm:grid-cols-2"><p className="break-words text-xs"><span className="block text-muted-foreground">Before</span>{valueLabel(change.before)}</p><p className="break-words text-xs"><span className="block text-muted-foreground">After</span>{valueLabel(change.after)}</p></div></div>)}</div></div>}</DialogContent></Dialog>
 </div></DashboardLayout>
}
function Importance({value}){return <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${value==='Critical'?'text-red-700':value==='Important'?'text-amber-600':'text-emerald-700'}`}><AlertCircle size={13}/>{value}</span>}
