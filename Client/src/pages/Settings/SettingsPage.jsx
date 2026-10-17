import { useEffect, useState } from 'react'
import { BellRing, BookOpenCheck, Building2, GraduationCap, Landmark, Save, Settings2, ShieldCheck, Undo2 } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { organizationService } from '../../services/organizationService.js'
import { academicService } from '../../services/academicService.js'
import { useBranch } from '../../hooks/useBranch.js'
import useAcademy from '../../hooks/useAcademy.js'
import { ROLE_LABELS } from '../../constants/roles.js'
const blankProfile={tagline:'',contactEmail:'',contactPhone:'',website:'',streetAddress:'',city:'',province:'',country:'',description:''}
export default function SettingsPage(){
 const {branchId}=useBranch(),{branding,updateBranding}=useAcademy();const [data,setData]=useState(null),[academic,setAcademic]=useState(null),[section,setSection]=useState('profile'),[form,setForm]=useState({academyName:branding.name,...blankProfile,primaryColor:branding.primaryColor,logo:branding.logo??'',sidebarBackground:branding.sidebarBackground,sidebarText:branding.sidebarText,sidebarIcon:branding.sidebarIcon,sidebarActive:branding.sidebarActive}),[message,setMessage]=useState('')
 useEffect(()=>{Promise.all([organizationService.overview(),academicService.overview({branchId})]).then(([o,a])=>{setData(o);setAcademic(a);setForm(current=>({...current,...blankProfile,...o.settings,logo:o.settings.logo??''}))},e=>setMessage(e.message))},[branchId])
 async function uploadLogo(event){const file=event.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){setMessage('Logo must be PNG, JPG, WEBP or GIF.');event.target.value='';return}if(file.size>262144){setMessage('Logo must be 256 KB or smaller.');event.target.value='';return}const reader=new FileReader();reader.onload=()=>{setForm(current=>({...current,logo:String(reader.result)}));setMessage('Logo preview ready. Save Settings to persist it.')};reader.onerror=()=>setMessage('Logo file could not be read.');reader.readAsDataURL(file)}
 async function save(){try{const value={...form,logo:form.logo||null};const saved=await organizationService.saveSettings(value);if(!updateBranding({name:saved.academyName,primaryColor:saved.primaryColor,logo:saved.logo,sidebarBackground:saved.sidebarBackground,sidebarText:saved.sidebarText,sidebarIcon:saved.sidebarIcon,sidebarActive:saved.sidebarActive}))throw new Error('Branding values are invalid.');setData(current=>({...current,settings:saved}));setMessage('Academy settings saved.')}catch(e){setMessage(e.message)}}
 function cancel(){if(!data?.settings)return;setForm(current=>({...current,...blankProfile,...data.settings,logo:data.settings.logo??''}));setMessage('Unsaved academy changes cancelled.')}
 async function resetSidebar(){const defaults={primaryColor:'#940016',sidebarBackground:'#FFFFFF',sidebarText:'#111827',sidebarIcon:'#111827',sidebarActive:'#940016'};const next={...form,...defaults};setForm(next);try{if(!updateBranding({name:next.academyName,logo:next.logo||null,...defaults}))throw new Error('TSA defaults could not be restored.');await organizationService.saveSettings({academyName:next.academyName,logo:next.logo||null,...defaults});setMessage('TSA default theme restored.')}catch(e){setMessage(e.message)}}
 const tabs=[['profile','Academy Profile',Landmark],['academic','Academic Streams & Programs',GraduationCap],['fees','Fees & Default Packages',BookOpenCheck],['roles','Staff & Role Access',ShieldCheck],['branches','Campus & Branch Details',Building2],['alerts','Automated SMS & Challans',BellRing]]
  return <DashboardLayout><div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Preferences · Configuration</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Academy Settings</h1>
        <p className="text-xs text-muted-foreground">Configure approved organization identity and inspect academic records.</p>
      </div>
      <div className="flex gap-2"><Button variant="outline" onClick={cancel} className="h-9 gap-1.5 text-xs"><Undo2 size={14}/>Cancel</Button><Button onClick={save} className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012] shadow-sm"><Save size={15}/>Save Settings</Button></div>
    </header>

    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">{message}</p>}

    <nav className="flex gap-1.5 overflow-x-auto rounded-lg border border-border/80 bg-muted/40 p-1" aria-label="Settings sections">
      {tabs.map(([id, label, I]) => (
        <Button
          key={id}
          size="sm"
          variant={section === id ? 'default' : 'ghost'}
          onClick={() => setSection(id)}
          className={`h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer ${section === id ? 'bg-[#940016] text-white hover:bg-[#7a0012]' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
        >
          <I size={14}/>{label}
        </Button>
      ))}
    </nav>

    {section === 'profile' && <Card className="border border-border/80 shadow-sm"><CardContent className="space-y-5 p-4">
      <section><h2 className="text-sm font-bold text-foreground">General Information</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold">Official academy name<Input className="mt-1" value={form.academyName} onChange={e=>setForm({...form,academyName:e.target.value})}/></label><label className="text-xs font-semibold">Academy tagline<Input className="mt-1" value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})}/></label></div></section>
      <section className="border-t pt-4"><h2 className="text-sm font-bold text-foreground">Contact &amp; Web Presence</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold">Contact email<Input type="email" className="mt-1" value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})}/></label><label className="text-xs font-semibold">Contact telephone<Input type="tel" className="mt-1" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})}/></label><label className="text-xs font-semibold md:col-span-2">Website URL<Input type="url" className="mt-1" placeholder="https://" value={form.website} onChange={e=>setForm({...form,website:e.target.value})}/></label></div></section>
      <section className="border-t pt-4"><h2 className="text-sm font-bold text-foreground">Address &amp; Location</h2><div className="mt-3 grid gap-3 md:grid-cols-3"><label className="text-xs font-semibold md:col-span-3">Street address<Input className="mt-1" value={form.streetAddress} onChange={e=>setForm({...form,streetAddress:e.target.value})}/></label><label className="text-xs font-semibold">City<Input className="mt-1" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label className="text-xs font-semibold">Province / region<Input className="mt-1" value={form.province} onChange={e=>setForm({...form,province:e.target.value})}/></label><label className="text-xs font-semibold">Country<Input className="mt-1" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></label></div></section>
      <section className="border-t pt-4"><h2 className="text-sm font-bold text-foreground">Academy Description</h2><label className="mt-3 block text-xs font-semibold">Description<textarea className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" maxLength={1200} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label></section>
    </CardContent></Card>}

    {section === 'academic' && (
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#940016]/10 text-[#940016]">
              <Settings2 size={16} />
            </span>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Configurable Academic Streams &amp; Fields</h2>
              <p className="text-[11px] text-muted-foreground">Authoritative saved branch records managed in Courses &amp; Batches.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {academic?.streams.length ? academic.streams.map(s => (
              <div key={s.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <span className="text-xs font-bold text-gray-900">{s.name}</span>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {academic.courses.filter(c => c.streamId === s.id).length} linked courses · {s.active === false ? 'Inactive' : 'Active'}
                </p>
              </div>
            )) : <p className="text-xs text-muted-foreground">No academic streams configured for this branch.</p>}
          </div>
        </CardContent>
      </Card>
    )}

    {section === 'fees' && (
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Default Tuition Packages &amp; Subject Fees</h2>
            <p className="text-[11px] text-muted-foreground">Saved course and subject prices managed in Courses &amp; Batches; no duplicate fee policy is stored here.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {academic?.subjects.length ? academic.subjects.map(s => (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs" key={s.id}>
                <span className="font-medium text-gray-800">{s.name}</span>
                <span className="font-semibold text-gray-900">PKR {Number(s.feeAmount ?? 0).toLocaleString('en-PK')}</span>
              </div>
            )) : <p className="text-xs text-muted-foreground">No configured subject fees.</p>}
          </div>
        </CardContent>
      </Card>
    )}

    {section === 'roles' && (
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Staff &amp; Role Permissions Overview</h2>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Staff Member</th>
                  <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Campus Role Assignments</th>
                  <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data?.users.map(u => (
                  <tr key={u.id} className="hover:bg-[#F9EBEE]/35 transition-colors">
                    <td className="px-3 py-2 font-semibold text-gray-900">{u.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {u.assignments.map(a => `${data.branches.find(b => b.id === a.branchId)?.name ?? a.branchId}: ${ROLE_LABELS[a.roles[0]] ?? a.roles[0]}`).join(' · ') || 'Unassigned'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-semibold ${u.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border border-border/60'}`}>
                        <span className={`size-1.5 rounded-full ${u.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {u.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )}

    {section === 'branches' && (
      <div className="grid gap-3 sm:grid-cols-2">
        {data?.branches.map(b => (
          <Card className="border border-border/80 shadow-sm" key={b.id}>
            <CardContent className="p-4 space-y-1">
              <h2 className="text-sm font-bold text-gray-900">{b.name}</h2>
              <p className="text-xs text-muted-foreground">
                {b.location ?? 'Demo campus'} · <span className="font-mono">{b.code ?? 'DEMO'}</span> · {b.active === false ? 'Inactive' : 'Active'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )}

    {section === 'alerts' && (
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Automated Parent SMS &amp; Challan Alerts</h2>
            <p className="text-[11px] text-muted-foreground">SMS gateway is not configured in this frontend mock. Controls stay disabled and no live messages are sent.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Fee Collection SMS', 'Due Date Reminder', 'Admission Completion SMS', 'Scheduled Demo Class Invite'].map(x => (
              <label key={x} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{x}</span>
                  <small className="block text-[11px] text-muted-foreground">Unavailable until approved gateway exists.</small>
                </div>
                <input type="checkbox" disabled className="size-4 opacity-50" />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    <Card className="border border-border/80 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Branding &amp; Visual Identity</h2>
          <p className="text-[11px] text-muted-foreground">Configure organization logo, brand colors, and preview sidebar appearance.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold text-gray-700">
            Academy name
            <Input className="mt-1 h-9 text-xs" value={form.academyName} onChange={e => setForm({...form, academyName: e.target.value})} />
          </label>
          <label className="text-xs font-semibold text-gray-700">
            Global theme color
            <div className="mt-1 flex items-center gap-2">
              <Input type="color" className="h-9 w-12 cursor-pointer p-0.5" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} />
              <span className="font-mono text-xs text-muted-foreground">{form.primaryColor}</span>
            </div>
          </label>
          <label className="text-xs font-semibold text-gray-700">
            Academy logo
            <Input type="file" className="mt-1 h-9 text-xs file:mr-2 file:h-7 file:rounded-md file:border-0 file:bg-muted file:px-2 file:text-xs" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadLogo} />
            <small className="block mt-0.5 text-[10px] text-muted-foreground">PNG, JPG, WEBP or GIF; max 256 KB.</small>
            {form.logo && (
              <span className="mt-2 flex items-center gap-2">
                <img src={form.logo} alt="Current academy logo preview" className="size-10 rounded-lg border object-contain bg-white p-1" />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs cursor-pointer" onClick={() => setForm({...form, logo: ''})}>Remove</Button>
              </span>
            )}
          </label>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-900">Independent Sidebar Theme</h3>
              <p className="text-[11px] text-muted-foreground">Sidebar colors remain customizable and independent from the global theme.</p>
            </div>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs cursor-pointer" onClick={resetSidebar}>
              Reset TSA Default
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[['sidebarBackground','Background'],['sidebarText','Text'],['sidebarIcon','Icons'],['sidebarActive','Active item']].map(([key, label]) => (
              <label className="text-xs font-semibold text-gray-700" key={key}>
                {label}
                <div className="mt-1 flex items-center gap-2">
                  <Input aria-label={`Sidebar ${label}`} type="color" className="h-8 w-12 cursor-pointer p-0.5" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                  <span className="font-mono text-[11px] text-muted-foreground">{form[key]}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-2 rounded-lg p-3 text-xs border border-border/60 shadow-sm" style={{background: form.sidebarBackground, color: form.sidebarText}}>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold text-white shadow-sm" style={{background: form.sidebarActive}}>
                <Settings2 size={13} className="text-white"/>Dashboard
              </span>
              <span className="flex items-center gap-2 font-medium" style={{color: form.sidebarText}}>
                <GraduationCap size={13} style={{color: form.sidebarIcon}}/>Admissions · Reports · Settings
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div></DashboardLayout>
}
