import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useEffect, useState } from 'react'
import { Building2, GraduationCap, ImagePlus, Palette, PanelLeft, Save, Settings2, Undo2 } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { organizationService } from '../../services/organizationService.js'
import { useBranch } from '../../hooks/useBranch.js'
import useAcademy from '../../hooks/useAcademy.js'
const blankProfile={tagline:'',contactEmail:'',contactPhone:'',website:'',streetAddress:'',city:'',province:'',country:'',description:''}
export default function SettingsPage(){
 const {branchId,branch:currentBranch}=useBranch(),{branding,updateBranding}=useAcademy();const resourceKey=`settings:${branchId}`,[data,setData]=useState(() => peekPageResource(resourceKey)?.data ?? null),[form,setForm]=useState({academyName:branding.name,...blankProfile,primaryColor:branding.primaryColor,logo:branding.logo??'',sidebarBackground:branding.sidebarBackground,sidebarText:branding.sidebarText,sidebarIcon:branding.sidebarIcon,sidebarActive:branding.sidebarActive,teacherPayrollEnabled:Boolean(branding.teacherPayrollEnabled)}),[message,setMessage]=useState('')
 useEffect(()=>{const loadVersion=capturePageVersion();let active=true;organizationService.overview().then(o=>{if(!active)return;rememberPageResource(resourceKey,{data:o},loadVersion);setData(o);setForm(current=>({...current,...blankProfile,...o.settings,primaryColor:branding.primaryColor,sidebarBackground:branding.sidebarBackground,sidebarText:branding.sidebarText,sidebarIcon:branding.sidebarIcon,sidebarActive:branding.sidebarActive,logo:o.settings.logo??'',teacherPayrollEnabled:Boolean(o.settings.teacherPayrollEnabled)}))},e=>{if(active)setMessage(e.message)});return()=>{active=false}},[branchId,branding.primaryColor,branding.sidebarActive,branding.sidebarBackground,branding.sidebarIcon,branding.sidebarText,resourceKey])
 async function uploadLogo(event){const file=event.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){setMessage('Logo must be PNG, JPG, WEBP or GIF.');event.target.value='';return}if(file.size>262144){setMessage('Logo must be 256 KB or smaller.');event.target.value='';return}const reader=new FileReader();reader.onload=()=>{setForm(current=>({...current,logo:String(reader.result)}));setMessage('Logo preview ready. Save Settings to persist it.')};reader.onerror=()=>setMessage('Logo file could not be read.');reader.readAsDataURL(file)}
 async function save(){try{const value={...form,logo:form.logo||null};const saved=await organizationService.saveSettings(value);if(!updateBranding({name:saved.academyName,primaryColor:saved.primaryColor,logo:saved.logo,sidebarBackground:saved.sidebarBackground,sidebarText:saved.sidebarText,sidebarIcon:saved.sidebarIcon,sidebarActive:saved.sidebarActive}))throw new Error('Branding values are invalid.');setData(current=>({...current,settings:saved}));setMessage('Academy settings saved.')}catch(e){setMessage(e.message)}}
 async function resetSidebar(){const defaults={primaryColor:'#940016',sidebarBackground:'#FFFFFF',sidebarText:'#111827',sidebarIcon:'#111827',sidebarActive:'#940016'};const next={...form,...defaults};setForm(next);try{if(!updateBranding({name:next.academyName,logo:next.logo||null,...defaults}))throw new Error('TSA defaults could not be restored.');await organizationService.saveSettings({academyName:next.academyName,logo:next.logo||null,...defaults});setMessage('TSA default theme restored.')}catch(e){setMessage(e.message)}}

  return <DashboardLayout><div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
      <div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Academy Settings</h1>
        <p className="text-xs text-muted-foreground">Configure branding and the shared visual theme for everyone in {currentBranch?.name ?? 'this branch'}.</p>
      </div>
      <div className="flex gap-2"><Button onClick={save} disabled={!data} className="h-9 gap-1.5 text-xs font-medium cursor-pointer bg-[#940016] text-white hover:bg-[#7a0012] shadow-sm"><Save size={15}/>Save Settings</Button></div>
    </header>

    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">{message}</p>}

    <Card className="overflow-hidden rounded-2xl border border-primary/15 bg-[#fcf5f7] shadow-[0_8px_28px_rgba(70,15,30,0.05)]">
      <div className="flex items-start gap-3 border-b border-primary/10 bg-[#fcf5f7] px-5 py-5 sm:px-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-primary/10 bg-primary/10 text-primary"><Palette size={22} aria-hidden="true"/></span>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-foreground">Branding &amp; Visual Identity</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Configure organization logo, brand colors, and preview sidebar appearance.</p>
        </div>
      </div>
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="min-w-0 rounded-xl border border-primary/10 bg-white p-4 shadow-xs">
            <label className="block text-xs font-semibold text-foreground">
              <span className="flex items-center gap-2"><Building2 size={15} className="text-primary" aria-hidden="true"/>Academy name</span>
              <Input aria-label="Academy name" className="mt-3 h-10 bg-background text-xs" value={form.academyName} onChange={e => setForm({...form, academyName: e.target.value})}/>
            </label>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Your academy name across the application.</p>
          </div>
          <div className="min-w-0 rounded-xl border border-primary/10 bg-white p-4 shadow-xs">
            <label className="block text-xs font-semibold text-foreground">
              <span className="flex items-center gap-2"><Palette size={15} className="text-primary" aria-hidden="true"/>Global theme color</span>
              <span className="mt-3 flex items-center gap-3">
                <Input aria-label="Global theme color" type="color" className="size-11 shrink-0 cursor-pointer rounded-xl border-primary/15 bg-background p-1" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})}/>
                <span className="rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs text-foreground">{form.primaryColor}</span>
              </span>
            </label>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Shared across buttons, highlights, tabs and controls for every role in this branch.</p>
          </div>
          <div className="min-w-0 rounded-xl border border-primary/10 bg-white p-4 shadow-xs">
            <label className="block text-xs font-semibold text-foreground">
              <span className="flex items-center gap-2"><ImagePlus size={15} className="text-primary" aria-hidden="true"/>Academy logo</span>
              <Input aria-label="Academy logo" type="file" className="mt-3 h-10 min-w-0 w-full bg-background text-[11px] file:mr-2 file:h-8 file:rounded-md file:border-0 file:bg-primary/5 file:px-2 file:text-[11px] file:text-primary" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadLogo}/>
            </label>
            <div className="mt-2 flex h-10 min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 text-[10px] leading-3.5 text-muted-foreground">PNG, JPG, WEBP or GIF<span className="block">Max 256 KB.</span></p>
              {form.logo && <div className="flex shrink-0 items-center gap-2">
                <img src={form.logo} alt="Current academy logo preview" className="size-8 shrink-0 rounded-lg border object-contain bg-white p-0.5"/>
                <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[10px] cursor-pointer" onClick={() => setForm({...form, logo: ''})}>Remove</Button>
              </div>}
            </div>
          </div>
        </div>

        <section aria-labelledby="sidebar-theme-heading" className="space-y-4 rounded-2xl border border-primary/10 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/10 bg-card text-primary"><PanelLeft size={17} aria-hidden="true"/></span>
              <div className="min-w-0"><h3 id="sidebar-theme-heading" className="text-sm font-bold text-foreground">Independent Sidebar Theme</h3>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">Sidebar colors remain customizable and independent from the global theme.</p>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 bg-white text-[11px] cursor-pointer" onClick={resetSidebar} disabled={!data}><Undo2 size={12} aria-hidden="true"/>Reset TSA Default</Button>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[['sidebarBackground','Background'],['sidebarText','Text'],['sidebarIcon','Icons'],['sidebarActive','Active item']].map(([key, label]) => (
              <label className="min-w-0 rounded-xl border border-border/60 bg-white p-3 text-xs font-semibold text-foreground shadow-xs" key={key}>
                {label}
                <span className="mt-2.5 flex flex-wrap items-center gap-2.5">
                  <Input aria-label={`Sidebar ${label}`} type="color" className="size-10 shrink-0 cursor-pointer rounded-lg bg-background p-1" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}/>
                  <span className="font-mono text-[11px] text-muted-foreground">{form[key]}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-white shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-white px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Live sidebar preview</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true"/>Preview</span>
            </div>
            <div aria-label="Sidebar appearance preview" className="p-4 text-xs sm:p-5" style={{background: form.sidebarBackground, color: form.sidebarText}}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-white shadow-sm" style={{background: form.sidebarActive}}><Settings2 size={15} aria-hidden="true"/>Dashboard</span>
                <span className="flex flex-wrap items-center gap-2 font-medium" style={{color: form.sidebarText}}><GraduationCap size={15} style={{color: form.sidebarIcon}} aria-hidden="true"/>Admissions &middot; Reports &middot; Settings</span>
              </div>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>

  </div></DashboardLayout>
}
