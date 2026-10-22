import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useBranch } from '../../hooks/useBranch.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CirclePlus, Search, ShieldCheck, UserCog, Users } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import { organizationService } from '../../services/organizationService.js'
import { DEMO_USERS } from '../../mock/authFixtures.js'
import { ROLE_LABELS, ROLES } from '../../constants/roles.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
import { usePermissions } from '../../hooks/usePermissions.js'
import CustomSelect from '../../components/ui/CustomSelect.jsx'
const roles=Object.values(ROLES), adminAssignableRoles=[ROLES.OWNER,ROLES.RECEPTIONIST,ROLES.TEACHER], blank={name:'',login:'',contact:'',enabled:true,assignments:[]}
export default function UsersPage(){
 const {branchId,branch:currentBranch}=useBranch()
 const {hasRole}=usePermissions(),assignableRoles=hasRole(ROLES.ADMIN)?adminAssignableRoles:roles
 const [data,setData]=useState(() => peekPageResource(`users:${branchId}`)),[search,setSearch]=useState(''),[role,setRoleFilter]=useState('All'),[dialog,setDialog]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState(blank),[message,setMessage]=useState(''),[error,setError]=useState(''),[page,setPage]=useState(1),[loading,setLoading]=useState(!data)
 const [deleting,setDeleting]=useState(null),[deleteBusy,setDeleteBusy]=useState(false),[deleteError,setDeleteError]=useState('')
 async function removeStaff(){setDeleteBusy(true);setDeleteError('');try{await organizationService.deleteUser(deleting.id);setDeleting(null);setMessage('Staff login and role access removed. Faculty profile and related records are preserved.');await load()}catch(e){setDeleteError(e.message)}finally{setDeleteBusy(false)}}
 const load=useCallback(async()=>{const loadVersion=capturePageVersion();setLoading(true);setError('');try{const next=await organizationService.staffOverview();setData(rememberPageResource(`users:${branchId}`,next,loadVersion))}catch(e){setData(null);setError(e.message)}finally{setLoading(false)}},[branchId]);useEffect(()=>{void load()},[load])
 const rows=useMemo(()=>data?.users.filter(u=>`${u.name} ${u.login??u.id} ${u.contact??''}`.toLowerCase().includes(search.toLowerCase())&&(role==='All'||u.assignments.some(a=>a.roles.includes(role))))??[],[data,search,role])
 const open=item=>{setEditing(item??null);setForm(item?{name:item.name,login:item.login??item.id,contact:item.contact??'',enabled:item.enabled,assignments:item.assignments.map(a=>({...a,roles:[a.roles[0]]}))}:{...blank,assignments:[{branchId,roles:[ROLES.RECEPTIONIST]}]});setError('');setDialog(true)}
 const pages=Math.max(1,Math.ceil(rows.length/8)),visible=rows.slice((Math.min(page,pages)-1)*8,Math.min(page,pages)*8)
 const assignment=id=>form.assignments.find(a=>a.branchId===id); const setRole=(id,value)=>setForm({...form,assignments:form.assignments.map(a=>a.branchId===id?{...a,roles:[value]}:a)})
 async function save(e){e.preventDefault();try{await organizationService.saveUser(form,editing?.id);setDialog(false);setMessage(editing?'Staff account updated.':'Staff account created.');load()}catch(x){setError(x.message)}} async function toggle(item){try{await organizationService.toggleUser(item.id);setMessage('Account status updated.');load()}catch(x){setMessage(x.message)}}
 function exportUsers() {
   downloadCsv(
     'users-report.csv',
     ['Staff Member', 'Login / ID', 'Contact', 'Branch Access & Roles', 'Status'],
     rows.map(u => [
       u.name,
       u.login ?? u.id,
       u.contact || 'No contact',
       u.assignments.map(a => `${data?.branches.find(b => b.id === a.branchId)?.name ?? a.branchId}: ${ROLE_LABELS[a.roles[0]] ?? a.roles[0]}`).join('; ') || 'Unassigned',
       u.enabled ? 'Active' : 'Inactive'
     ])
   )
 }

 function exportUsersPdf() {
   exportTablePdf({
     filename: `users-report-${new Date().toISOString().slice(0, 10)}.pdf`,
     title: 'Staff Users & Role Assignments Report',
     branchName: currentBranch?.name ?? 'Current Branch',
     headers: ['Staff Member', 'Login / ID', 'Contact', 'Branch Access & Roles', 'Status'],
     rows: rows.map(u => [
       u.name,
       u.login ?? u.id,
       u.contact || 'No contact',
       u.assignments.map(a => `${data?.branches.find(b => b.id === a.branchId)?.name ?? a.branchId}: ${ROLE_LABELS[a.roles[0]] ?? a.roles[0]}`).join('; ') || 'Unassigned',
       u.enabled ? 'Active' : 'Inactive'
     ]),
     filterSummary: `${rows.length} staff accounts matching filters`
   })
 }
  return <DashboardLayout><div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
      <div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Users &amp; Roles</h1>
        <p className="text-xs text-muted-foreground">Branch assignments grant explicit role-based access per campus.</p>
      </div>
      <Button onClick={()=>open()} className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012] shadow-sm">
        <CirclePlus size={15}/>Add Staff Member
      </Button>
    </header>

    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">{message}</p>}
    {error && !dialog && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive"><span>{error}</span><Button type="button" variant="outline" size="sm" className="h-8" onClick={() => void load()}>Retry loading users</Button></div>}

    <section className="grid gap-3 sm:grid-cols-3">
      {[
        ['Staff Accounts', data?.users.length??0, Users, 'border-[#cde0fc] bg-linear-145 from-white via-[#f4f8fe] to-[#e7f1fe]'],
        ['Active Personnel', data?.users.filter(u=>u.enabled).length??0, UserCog, 'border-[#c9eed6] bg-linear-145 from-white via-[#f4fbf7] to-[#e6f6ee]'],
        ['Role Access Policy', 'Fail Closed', ShieldCheck, 'border-[#f7e2c2] bg-linear-145 from-white via-[#fffbf2] to-[#fdf2de]']
      ].map(([l, v, I, tone]) => (
        <Card key={l} className={`rounded-2xl border shadow-sm transition hover:shadow-md ${tone}`}>
          <CardContent className="flex min-h-[120px] items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
              <div className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{v}</div>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#940016]/10 bg-white/70 text-[#940016]">
              <I size={21} />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>

    <Card className="border border-border/80 shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14}/>
          <Input className="h-9 pl-8 text-xs" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff"/>
        </div>
        <CustomSelect
          aria-label="Filter staff by role"
          value={role}
          onChange={value => { setRoleFilter(value); setPage(1) }}
          options={[{ value: 'All', label: 'All Roles' }, ...roles.map(value => ({ value, label: ROLE_LABELS[value] }))]}
          className="h-9 w-44 rounded-xl border-primary/20 bg-card px-3 text-sm shadow-sm hover:border-primary/40 hover:bg-primary/5"
          containerClassName="relative shrink-0"
          menuWidthClass="w-52"
          menuAlign="right"
        />
        <TableToolbarActions onRefresh={load} showColumns={false} onPrint={() => window.print()} onExportCsv={exportUsers} onExportPdf={exportUsersPdf} />
      </CardContent>
    </Card>

    <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
            <tr>
              <th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Staff Member</th>
              <th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Branch Access &amp; Roles</th>
              <th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Status</th>
              <th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {visible.map(u => {
              const base = DEMO_USERS.some(x => x.id === u.id)
              return (
                <tr key={u.id} className="transition-colors hover:bg-[#F9EBEE]/35">
                  <td className="px-3.5 py-2.5">
                    <span className="font-semibold text-gray-900">{u.name}</span>
                    <span className="block text-[11px] text-muted-foreground font-mono">
                      {u.login ?? u.id} · {u.contact || 'No contact'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    {u.assignments.length ? (
                      <div className="flex flex-wrap gap-1">
                        {u.assignments.map(a => (
                          <span key={a.branchId} className="inline-flex items-center rounded-md bg-[#940016]/10 px-2 py-0.5 text-[11px] font-medium text-[#940016] border border-[#940016]/20">
                            {data.branches.find(b => b.id === a.branchId)?.name ?? a.branchId}: {ROLE_LABELS[a.roles[0]] ?? a.roles[0]}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border border-border/60'}`}>
                      <span className={`size-1.5 rounded-full ${u.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {u.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" aria-label={`Delete staff ${u.name}`} onClick={()=>{setDeleting(u);setDeleteError('')}}>Delete</Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs font-medium cursor-pointer" disabled={base} onClick={() => open(u)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground" disabled={base} onClick={() => toggle(u)}>
                        {u.enabled ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {loading && !data && <div role="status" className="p-8 text-center text-xs text-muted-foreground">Loading staff accounts...</div>}
      {!loading && !error && visible.length === 0 && (
        <div className="p-8 text-center text-xs text-muted-foreground">No staff members match these filters.</div>
      )}
    </div>

    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{rows.length ? ((Math.min(page, pages) - 1) * 8) + 1 : 0}–{Math.min(Math.min(page, pages) * 8, rows.length)} of {rows.length}</span>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer" disabled={page <= 1} onClick={() => setPage(x => x - 1)}>Previous</Button>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs cursor-pointer" disabled={page >= pages} onClick={() => setPage(x => x + 1)}>Next</Button>
      </div>
    </div>

    <Dialog open={dialog} onOpenChange={setDialog}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Staff Account' : 'Create Staff Account'}</DialogTitle>
          <DialogDescription>This account belongs to the current branch. Assign its role below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-3">
          {[['name','Full name'],['login','Email'],['contact','Contact']].map(([k,l]) => (
            <label key={k} className="text-xs font-semibold text-gray-700">
              {l}
              <Input className="mt-1 h-9 text-xs" type={k === 'login' ? 'email' : 'text'} required={k !== 'contact'} value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} />
            </label>
          ))}
          <fieldset className="grid gap-2">
            <legend className="text-xs font-semibold text-gray-700">Branch &amp; role</legend>
            {data?.branches.filter(b => b.active !== false).map(b => (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem] items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2" key={b.id}>

                <span className="text-xs font-medium text-gray-800">{b.name || currentBranch?.name}</span>
                <select aria-label="Staff role" disabled={!assignment(b.id)} className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none" value={assignment(b.id)?.roles[0] ?? ROLES.RECEPTIONIST} onChange={e => setRole(b.id, e.target.value)}>
                  {assignableRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
            ))}
          </fieldset>
          {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setDialog(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8 text-xs cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012]">Save Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!deleteBusy)setDeleting(null)}}>
      <DialogContent><DialogHeader><DialogTitle>Delete Staff Member</DialogTitle><DialogDescription>Are you sure you want to delete {deleting?.name} from Users? This removes their login and role access only. Their Faculty profile, classes, assignments and related records will remain.</DialogDescription></DialogHeader>
        {deleteError&&<p role="alert">{deleteError}</p>}
        <DialogFooter><Button variant="outline" disabled={deleteBusy} onClick={()=>setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={deleteBusy} onClick={removeStaff}>{deleteBusy?'Deleting...':'Delete Staff'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div></DashboardLayout>
}
