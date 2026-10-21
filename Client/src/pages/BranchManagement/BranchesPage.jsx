import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, CirclePlus, MapPin, Pencil, Power, Search, Trash2, Users } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import { organizationService } from '../../services/organizationService.js'
import { reportService } from '../../services/reportService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { useAuth } from '../../hooks/useAuth.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
import { BRANCH_CREATION_ENABLED, BRANCH_CREATION_PAUSED_MESSAGE } from '../../constants/branchPolicy.js'
const empty = { name: '' }
const branchCardTones = [
  'border-rose-200 bg-linear-to-br from-white via-rose-50/60 to-rose-100/70 hover:border-rose-300',
  'border-sky-200 bg-linear-to-br from-white via-sky-50/60 to-sky-100/70 hover:border-sky-300',
  'border-emerald-200 bg-linear-to-br from-white via-emerald-50/60 to-emerald-100/70 hover:border-emerald-300',
  'border-amber-200 bg-linear-to-br from-white via-amber-50/60 to-amber-100/70 hover:border-amber-300',
]
export default function BranchesPage() {
  const { branchId } = useBranch()
  const { refreshSession } = useAuth()
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [busy, setBusy] = useState(false)
  const [data,setData]=useState(() => peekPageResource('branches')),[search,setSearch]=useState(''),[status,setStatus]=useState('All'),[dialog,setDialog]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState(empty),[message,setMessage]=useState(''),[error,setError]=useState('')
  const load=useCallback(()=>{const loadVersion=capturePageVersion();return Promise.all([organizationService.overview(),reportService.overview({branchId,allBranches:true})]).then(([organization,report])=>setData(rememberPageResource('branches',{...organization,report},loadVersion)),e=>setError(e.message))},[branchId]); useEffect(()=>{void load()},[load])
  const rows=useMemo(()=>data?.branches.filter(b=>(status==='All'||(status==='Active')===(b.active!==false))&&`${b.name} ${b.code??''} ${b.location??''}`.toLowerCase().includes(search.toLowerCase()))??[],[data,search,status])
  const staffCount=id=>data?.users.filter(u=>u.enabled&&u.assignments.some(a=>a.branchId===id)).length??0, summary=id=>({courses:data?.report?.courses.filter(x=>x.branchId===id).length??0,batches:data?.report?.batches.filter(x=>x.branchId===id).length??0,students:data?.report?.students.filter(x=>x.branchId===id).length??0})
  const open=item=>{setEditing(item??null);setForm(item?{name:item.name}:empty);setError('');setDialog(true)}
  async function save(e){e.preventDefault();if(busy)return;setBusy(true);try{await organizationService.saveBranch(form,editing?.id);setDialog(false);setMessage(editing?'Branch updated.':'Branch registered.');await refreshSession();await load()}catch(x){setError(x.message)}finally{setBusy(false)}}
  async function removeBranch(){if(busy||!deleting)return;setBusy(true);setDeleteError('');try{await organizationService.deleteBranch(deleting.id);setDeleting(null);setMessage('Empty inactive branch deleted.');await refreshSession();await load()}catch(x){setDeleteError(x.message)}finally{setBusy(false)}}
  async function toggle(item){if(busy)return;setBusy(true);setError('');setMessage('');try{const saved=await organizationService.toggleBranch(item.id);setMessage(`${saved.name} is now ${saved.active ? 'active' : 'inactive'}.`);await refreshSession();await load()}catch(x){setError(x.message)}finally{setBusy(false)}}
  function exportBranches() {
    downloadCsv(
      'branches-report.csv',
      ['Branch Name', 'Branch Code', 'Location', 'Contact', 'Status', 'Staff Count', 'Courses', 'Batches', 'Students'],
      rows.map(item => [
        item.name,
        item.code ?? '',
        item.location ?? '',
        item.contact ?? '',
        item.active !== false ? 'Active' : 'Inactive',
        staffCount(item.id),
        summary(item.id).courses,
        summary(item.id).batches,
        summary(item.id).students
      ])
    )
  }

  function exportBranchesPdf() {
    exportTablePdf({
      filename: `branches-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Academy Branches & Campuses Report',
      branchName: 'All Registered Campuses',
      headers: ['Branch Name', 'Branch Code', 'Location', 'Status', 'Staff', 'Courses', 'Batches', 'Students'],
      rows: rows.map(item => {
        const s = summary(item.id)
        return [
          item.name,
          item.code ?? '',
          item.location ?? '',
          item.active !== false ? 'Active' : 'Inactive',
          String(staffCount(item.id)),
          String(s.courses),
          String(s.batches),
          String(s.students)
        ]
      }),
      filterSummary: `${rows.length} branches matching filters`
    })
  }
  return <DashboardLayout><div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
      <div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Branch Management</h1>
        <p className="text-xs text-muted-foreground">Manage licensed academy campuses and branch-scoped operational access.</p>
      </div>
      <Button onClick={()=>open()} disabled={!BRANCH_CREATION_ENABLED || !data || (data?.branches.length??0)>=data?.licenseLimit} title={!BRANCH_CREATION_ENABLED ? BRANCH_CREATION_PAUSED_MESSAGE : undefined} className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012] shadow-sm">
        <CirclePlus size={15}/>Add Branch
      </Button>
    </header>
    {!BRANCH_CREATION_ENABLED && <p className="text-xs text-muted-foreground">{BRANCH_CREATION_PAUSED_MESSAGE} Existing campuses remain available.</p>}

    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">{message}</p>}
    {error && !dialog && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">{error}</p>}

    <section className="grid gap-3 sm:grid-cols-3">
      {[
        ['Licensed Campuses', `${data?.branches.length??0} / ${data?.licenseLimit??'·'}`, Building2],
        ['Active Campuses', data?.branches.filter(b=>b.active!==false).length??0, Power],
        ['Assigned Staff Members', data?.users.filter(u=>u.enabled&&u.assignments.length).length??0, Users]
      ].map(([l, v, I]) => (
        <Card key={l} className="top-kpi-card border border-border/80 shadow-sm transition hover:shadow-md">
          <CardContent className="flex min-h-[104px] items-center justify-between p-4">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
              <div className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{v}</div>
            </div>
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#940016]/10 text-[#940016]">
              <I size={18} />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>

    <Card className="border border-border/80 shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14}/>
          <Input className="h-9 pl-8 text-xs" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search branch, code or location..."/>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring" value={status} onChange={e=>setStatus(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <TableToolbarActions onRefresh={load} showColumns={false} onPrint={() => window.print()} onExportCsv={exportBranches} onExportPdf={exportBranchesPdf} />
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-3 lg:grid-cols-2">
      {rows.map(item => {
        const isActive = item.active !== false
        const branchSummary = summary(item.id)
        const cardTone = branchCardTones[Math.max(0, data.branches.findIndex(branch => branch.id === item.id)) % branchCardTones.length]
        const displayCode = item.code?.trim() && item.code.trim().toUpperCase() !== 'DEMO' ? item.code : null
        const displayLocation = item.location?.trim() && item.location.trim().toLowerCase() !== 'demo campus' ? item.location : null
        return (
          <Card key={item.id} className={`border shadow-sm transition hover:shadow-md ${cardTone}`}>
            <CardContent className="flex min-h-[190px] flex-col gap-4 p-5 sm:min-h-[200px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#940016]/10 text-[#940016]">
                    <Building2 size={20} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-lg font-bold leading-snug text-gray-900">{item.name}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border border-border/60'}`}>
                        <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {displayCode && <p className="mt-0.5 text-sm text-muted-foreground font-mono">{displayCode}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => open(item)} aria-label={`Edit ${item.name}`} title="Edit branch"><Pencil size={14}/></Button>
                  <Button variant="ghost" size="icon-sm" className={`size-8 cursor-pointer ${isActive ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-500 hover:bg-slate-100'}`} disabled={busy} onClick={() => toggle(item)} title={isActive ? 'Deactivate branch' : 'Activate branch'} aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${item.name}`}><Power size={14}/></Button>
                  <Button variant="ghost" size="icon-sm" className="size-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer" onClick={() => {setDeleteError('');setDeleting(item)}} aria-label={`Delete ${item.name}`} title="Delete branch"><Trash2 size={14}/></Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {displayLocation && <><span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {displayLocation}
                </span>
                <span>·</span></>}
                <span>{staffCount(item.id)} staff members</span>
                {item.contact && (
                  <>
                    <span>·</span>
                    <span>{item.contact}</span>
                  </>
                )}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[#940016]/10 bg-[#940016]/[0.06] px-3.5 py-3 text-sm text-gray-700 font-medium">
                <span>{branchSummary.courses} courses</span>
                <span className="text-muted-foreground">·</span>
                <span>{branchSummary.batches} batches</span>
                <span className="text-muted-foreground">·</span>
                <span>{branchSummary.students} active students</span>
              </div>

            </CardContent>
          </Card>
        )
      })}
    </div>

    {rows.length === 0 && (
      <div className="rounded-lg border border-border/80 bg-card p-8 text-center text-xs text-muted-foreground shadow-sm">
        No branches match these filters.
      </div>
    )}

    <Dialog open={Boolean(deleting)} onOpenChange={open=>{if(!open&&!busy)setDeleting(null)}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Branch</DialogTitle>
          <DialogDescription>Delete {deleting?.name}? The branch must be inactive with no courses, batches, subjects, students, financial records or other linked data. Only Super Admin assignments may remain; those branch assignments will be removed while their accounts are preserved. All other staff must be unassigned first.</DialogDescription>
        </DialogHeader>
        {deleting?.active !== false && <p className="text-xs text-amber-700">Deactivate this branch first.</p>}
        {deleteError && <p role="alert" className="text-xs text-destructive">{deleteError}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy} onClick={()=>setDeleting(null)}>Cancel</Button>
          <Button type="button" disabled={busy || deleting?.active !== false} onClick={removeBranch} className="bg-rose-700 text-white hover:bg-rose-800">{busy ? 'Deleting...' : 'Delete Branch'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={dialog} onOpenChange={open=>{if(!busy)setDialog(open)}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Branch' : 'Register Branch'}</DialogTitle>
          <DialogDescription>Update the branch name. Other branch details remain unchanged.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-3">
          {[['name','Branch name']].map(([k,l]) => (
            <label key={k} className="text-xs font-semibold text-gray-700">
              {l}
              <Input className="mt-1 h-9 text-xs" required maxLength={120} value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} />
            </label>
          ))}
          {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" disabled={busy} className="h-8 text-xs cursor-pointer" onClick={() => setDialog(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={busy} className="h-8 text-xs cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012]">{busy ? 'Saving...' : 'Save Branch'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div></DashboardLayout>
}
