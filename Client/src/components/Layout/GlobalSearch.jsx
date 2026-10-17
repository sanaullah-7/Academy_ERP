import { useEffect, useMemo, useState } from 'react'
import { Archive, BookOpen, CalendarDays, ClipboardList, GraduationCap, LayoutDashboard, Search, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog.jsx'
import { Input } from '../ui/input.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { studentService } from '../../services/studentService.js'
import { admissionService } from '../../services/admissionService.js'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import { demoClassService } from '../../services/demoClassService.js'
import { assetService } from '../../services/assetService.js'

const navigation = [
  ['Dashboard', ROUTE_PATHS.DASHBOARD, PERMISSIONS.WORKSPACE_VIEW, LayoutDashboard],
  ['Admissions', ROUTE_PATHS.ADMISSIONS, PERMISSIONS.ADMISSIONS_VIEW, ClipboardList],
  ['Students', ROUTE_PATHS.STUDENTS, PERMISSIONS.STUDENTS_VIEW, UsersRound],
  ['Courses & Batches', ROUTE_PATHS.COURSES_BATCHES, PERMISSIONS.COURSES_VIEW, BookOpen],
  ['Faculty & Classes', ROUTE_PATHS.FACULTY_CLASSES, PERMISSIONS.FACULTY_VIEW, GraduationCap],
  ['Demo Classes', ROUTE_PATHS.DEMO_CLASSES, PERMISSIONS.DEMO_CLASSES_VIEW, CalendarDays],
  ['Assets', ROUTE_PATHS.ASSETS, PERMISSIONS.ASSETS_VIEW, Archive],
]
const item = (group,label,meta,path,Icon,keywords='') => ({ group,label,meta,path,Icon,keywords:`${label} ${meta} ${keywords}`.toLowerCase() })

export default function GlobalSearch({ open, onOpenChange }) {
  const navigate=useNavigate(),{branchId}=useBranch(),{can}=usePermissions()
  const allowed={
    [PERMISSIONS.WORKSPACE_VIEW]:can(PERMISSIONS.WORKSPACE_VIEW),
    [PERMISSIONS.STUDENTS_VIEW]:can(PERMISSIONS.STUDENTS_VIEW),
    [PERMISSIONS.ADMISSIONS_VIEW]:can(PERMISSIONS.ADMISSIONS_VIEW),
    [PERMISSIONS.COURSES_VIEW]:can(PERMISSIONS.COURSES_VIEW),
    [PERMISSIONS.FACULTY_VIEW]:can(PERMISSIONS.FACULTY_VIEW),
    [PERMISSIONS.DEMO_CLASSES_VIEW]:can(PERMISSIONS.DEMO_CLASSES_VIEW),
    [PERMISSIONS.ASSETS_VIEW]:can(PERMISSIONS.ASSETS_VIEW),
  }
  const permissionKey=Object.entries(allowed).filter(([,value])=>value).map(([key])=>key).join('|')
  const [query,setQuery]=useState(''),[rows,setRows]=useState([]),[status,setStatus]=useState('idle'),[active,setActive]=useState(0)
  useEffect(()=>{if(!open)return;let live=true
    async function load(){await Promise.resolve();if(!live)return;setQuery('');setActive(0);setStatus('loading');const scope={branchId};const jobs=[]
      const granted=new Set(permissionKey.split('|'))
      const nav=navigation.filter(([, ,permission])=>granted.has(permission)).map(([label,path,,Icon])=>item('Navigation',label,'Open module',path,Icon))
      if(granted.has(PERMISSIONS.STUDENTS_VIEW))jobs.push(studentService.listDirectory(scope).then(values=>values.map(x=>item('Students',x.name,x.studentId??x.admissionDisplayId??x.id,`/students/${x.id}`,UsersRound,`${x.id} ${x.studentNumber??''}`))))
      if(granted.has(PERMISSIONS.ADMISSIONS_VIEW))jobs.push(admissionService.list(scope).then(values=>values.map(x=>item('Admissions',x.studentName,x.displayAdmissionId??x.admissionId??x.id,ROUTE_PATHS.ADMISSIONS,ClipboardList,x.id))))
      if(granted.has(PERMISSIONS.COURSES_VIEW))jobs.push(academicService.overview(scope).then(a=>[...a.courses.map(x=>item('Courses',x.name,'Course',ROUTE_PATHS.COURSES_BATCHES,BookOpen,x.id)),...a.batches.map(x=>item('Batches',x.name,'Batch',ROUTE_PATHS.COURSES_BATCHES,BookOpen,x.id))]))
      if(granted.has(PERMISSIONS.FACULTY_VIEW))jobs.push(facultyService.list(scope).then(values=>values.map(x=>item('Faculty',x.name,x.assignedSubjects?.map(s=>s.name).join(', ')||'Teacher',`/faculty/${x.id}`,GraduationCap,x.id))))
      if(granted.has(PERMISSIONS.DEMO_CLASSES_VIEW))jobs.push(demoClassService.list(scope).then(values=>values.map(x=>item('Demo Classes',x.studentName,x.demoId??x.id,ROUTE_PATHS.DEMO_CLASSES,CalendarDays,x.id))))
      if(granted.has(PERMISSIONS.ASSETS_VIEW))jobs.push(assetService.list(scope).then(values=>values.map(x=>item('Assets',x.name,x.assetCode??x.id,ROUTE_PATHS.ASSETS,Archive,`${x.id} ${x.assetCode??''}`))))
      const results=await Promise.allSettled(jobs);if(!live)return;setRows([...nav,...results.flatMap(result=>result.status==='fulfilled'?result.value:[])]);setStatus('ready')
    }
    load();return()=>{live=false}
  },[branchId,open,permissionKey])
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return (q?rows.filter(row=>row.keywords.includes(q)):rows).slice(0,30)},[query,rows])
  const choose=row=>{if(!row)return;onOpenChange(false);navigate(row.path)}
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} className="ui-command-palette max-w-2xl gap-0 overflow-hidden p-0" onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setActive(index=>Math.min(index+1,filtered.length-1))}if(event.key==='ArrowUp'){event.preventDefault();setActive(index=>Math.max(index-1,0))}if(event.key==='Enter'){event.preventDefault();choose(filtered[active])}}}>
    <DialogTitle className="sr-only">Global search</DialogTitle><DialogDescription className="sr-only">Search authorized records in the active branch.</DialogDescription>
    <div className="flex items-center gap-3 border-b px-4 py-3"><Search size={20} className="text-primary"/><Input autoFocus aria-label="Global search" className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Search students, admissions, courses, batches…" value={query} onChange={event=>{setQuery(event.target.value);setActive(0)}}/><kbd className="rounded border px-2 py-1 text-[10px] text-muted-foreground">ESC</kbd></div>
    <div className="max-h-[min(60vh,480px)] overflow-y-auto p-2">{status==='loading'?<p className="p-5 text-center text-sm text-muted-foreground" role="status">Loading authorized records…</p>:filtered.length===0?<p className="p-5 text-center text-sm text-muted-foreground">No authorized results found.</p>:filtered.map((row,index)=>{const Icon=row.Icon;return <button type="button" key={`${row.group}-${row.path}-${row.label}-${index}`} onMouseEnter={()=>setActive(index)} onClick={()=>choose(row)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${active===index?'bg-muted':''}`}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={17}/></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-foreground">{row.label}</strong><small className="block truncate text-xs text-muted-foreground">{row.group} · {row.meta}</small></span></button>})}</div>
    <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">↑ ↓ Navigate · Enter Open · Esc Close</div>
  </DialogContent></Dialog>
}
