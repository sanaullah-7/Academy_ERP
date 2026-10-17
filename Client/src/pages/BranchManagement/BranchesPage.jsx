import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, CirclePlus, Eye, MapPin, Pencil, Power, Search, Users } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import { organizationService } from '../../services/organizationService.js'
import { reportService } from '../../services/reportService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { DEMO_BRANCHES } from '../../mock/authFixtures.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
const empty = { name: '', code: '', location: '', contact: '' }
export default function BranchesPage() {
  const { branchId } = useBranch()
  const [data,setData]=useState(null),[search,setSearch]=useState(''),[status,setStatus]=useState('All'),[dialog,setDialog]=useState(false),[viewing,setViewing]=useState(null),[editing,setEditing]=useState(null),[form,setForm]=useState(empty),[message,setMessage]=useState(''),[error,setError]=useState('')
  const load=useCallback(()=>Promise.all([organizationService.overview(),reportService.overview({branchId,allBranches:true})]).then(([organization,report])=>setData({...organization,report}),e=>setError(e.message)),[branchId]); useEffect(()=>{void load()},[load])
  const rows=useMemo(()=>data?.branches.filter(b=>(status==='All'||(status==='Active')===(b.active!==false))&&`${b.name} ${b.code??''} ${b.location??''}`.toLowerCase().includes(search.toLowerCase()))??[],[data,search,status])
  const staffCount=id=>data?.users.filter(u=>u.enabled&&u.assignments.some(a=>a.branchId===id)).length??0, summary=id=>({courses:data?.report?.courses.filter(x=>x.branchId===id).length??0,batches:data?.report?.batches.filter(x=>x.branchId===id).length??0,students:data?.report?.students.filter(x=>x.branchId===id).length??0})
  const open=item=>{setEditing(item??null);setForm(item?{name:item.name,code:item.code??item.id.replace('demo-','').toUpperCase(),location:item.location??'Demo campus',contact:item.contact??''}:empty);setError('');setDialog(true)}
  async function save(e){e.preventDefault();try{await organizationService.saveBranch(form,editing?.id);setDialog(false);setMessage(editing?'Branch updated.':'Branch registered.');load()}catch(x){setError(x.message)}}
  async function toggle(item){try{await organizationService.toggleBranch(item.id);setMessage('Branch status updated.');load()}catch(x){setMessage(x.message)}}
  function exportBranches() {
    downloadCsv(
      'branches-report.csv',
      ['Branch Name', 'Branch Code', 'Location', 'Contact', 'Status', 'Staff Count', 'Courses', 'Batches', 'Students'],
      rows.map(item => [
        item.name,
        item.code ?? 'DEMO',
        item.location ?? 'Demo campus',
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
          item.code ?? 'DEMO',
          item.location ?? 'Demo campus',
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
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization Control · Campuses</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Branch Management</h1>
        <p className="text-xs text-muted-foreground">Manage licensed academy campuses and branch-scoped operational access.</p>
      </div>
      <Button onClick={()=>open()} disabled={(data?.branches.length??0)>=data?.licenseLimit} className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012] shadow-sm">
        <CirclePlus size={15}/>Add Branch
      </Button>
    </header>

    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">{message}</p>}

    <section className="grid gap-3 sm:grid-cols-3">
      {[
        ['Licensed Campuses', `${data?.branches.length??0} / ${data?.licenseLimit??'·'}`, Building2],
        ['Active Campuses', data?.branches.filter(b=>b.active!==false).length??0, Power],
        ['Assigned Staff Members', data?.users.filter(u=>u.enabled&&u.assignments.length).length??0, Users]
      ].map(([l, v, I]) => (
        <Card key={l} className="border border-border/80 shadow-sm transition hover:shadow-md">
          <CardContent className="flex items-center justify-between p-3.5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</p>
              <div className="mt-1 text-xl font-bold tracking-tight text-gray-900">{v}</div>
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
        const base = DEMO_BRANCHES.some(b => b.id === item.id)
        const isActive = item.active !== false
        const branchSummary = summary(item.id)
        return (
          <Card key={item.id} className="border border-border/80 shadow-sm transition hover:border-[#940016]/30 hover:shadow-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#940016]/10 text-[#940016]">
                    <Building2 size={20} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">{item.name}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border border-border/60'}`}>
                        <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono">{item.code ?? 'DEMO'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setViewing(item)} aria-label={`View ${item.name}`}><Eye size={14}/></Button>
                  <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground cursor-pointer" disabled={base} onClick={() => open(item)} aria-label={`Edit ${item.name}`}><Pencil size={14}/></Button>
                  <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground cursor-pointer" disabled={base} onClick={() => toggle(item)} aria-label={`Toggle ${item.name}`}><Power size={14}/></Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {item.location ?? 'Demo campus'}
                </span>
                <span>·</span>
                <span>{staffCount(item.id)} staff members</span>
                {item.contact && (
                  <>
                    <span>·</span>
                    <span>{item.contact}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-gray-700 font-medium">
                <span>{branchSummary.courses} courses</span>
                <span className="text-muted-foreground">·</span>
                <span>{branchSummary.batches} batches</span>
                <span className="text-muted-foreground">·</span>
                <span>{branchSummary.students} active students</span>
              </div>

              {base && (
                <p className="rounded-md bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground border border-border/40">
                  Core demo branch identity is read-only; operational records remain branch scoped.
                </p>
              )}
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

    <Dialog open={Boolean(viewing)} onOpenChange={open=>!open&&setViewing(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{viewing?.name}</DialogTitle>
          <DialogDescription>Saved branch details and connected record counts.</DialogDescription>
        </DialogHeader>
        {viewing && (
          <div className="grid gap-2 rounded-lg bg-muted/40 p-4 text-xs">
            <p><b>Code:</b> {viewing.code}</p>
            <p><b>Location:</b> {viewing.location}</p>
            <p><b>Contact:</b> {viewing.contact || 'Not configured'}</p>
            <p><b>Status:</b> {viewing.active === false ? 'Inactive' : 'Active'}</p>
            <p><b>Connected:</b> {summary(viewing.id).courses} courses · {summary(viewing.id).batches} batches · {summary(viewing.id).students} students · {staffCount(viewing.id)} staff</p>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={dialog} onOpenChange={setDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Branch' : 'Register Branch'}</DialogTitle>
          <DialogDescription>Branch names and codes must be unique within this tenant.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-3">
          {[['name','Branch name'],['code','Branch code'],['location','Location'],['contact','Contact']].map(([k,l]) => (
            <label key={k} className="text-xs font-semibold text-gray-700">
              {l}
              <Input className="mt-1 h-9 text-xs" required={k !== 'contact'} value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} />
            </label>
          ))}
          {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setDialog(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8 text-xs cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012]">Save Branch</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div></DashboardLayout>
}
