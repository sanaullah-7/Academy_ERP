import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import useAcademy from '../../hooks/useAcademy.js'
import LoginAtmosphere from '../../components/Auth/LoginAtmosphere.jsx'
import LoginLogoMotion from '../../components/Auth/LoginLogoMotion.jsx'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import SessionStatus from '../../components/Auth/SessionStatus.jsx'

export default function LoginPage() {
 const {user,status,error,login}=useAuth(),{branch}=useBranch(),{branding}=useAcademy()
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false),[submitted,setSubmitted]=useState(false),[busy,setBusy]=useState(false)
 if(status==='loading'&&!busy)return <SessionStatus/>
 if(user&&submitted)return <Navigate to={branch?ROUTE_PATHS.DASHBOARD:ROUTE_PATHS.SELECT_BRANCH} replace/>
 async function submit(e){e.preventDefault();setBusy(true);setSubmitted(true);try{await login({email,password})}finally{setBusy(false)}}
 return <main className="relative min-h-dvh bg-[#f8f3f5] p-4 text-slate-900 sm:p-8 flex items-center justify-center lg:h-dvh lg:overflow-hidden">
  <div className="relative z-10 grid w-full max-w-[60rem] overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-xl lg:scale-90 lg:transform-gpu lg:grid-cols-[1.08fr_0.92fr]">
   <section className="relative flex flex-col justify-between gap-5 overflow-hidden bg-gradient-to-br from-[#720014] via-[#940016] to-[#450c20] p-6 text-white sm:p-8">
    <LoginAtmosphere />
    <div className="relative z-10 flex flex-col items-start gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">Academy Management</span>
      <h1 className="max-w-full whitespace-nowrap text-[clamp(0.85rem,4.4vw,1.35rem)] font-bold leading-[1.1] tracking-[-0.04em] [word-spacing:0.03em] sm:text-[2rem] sm:[word-spacing:0.1em] lg:text-[2rem]">{branding.name}</h1>
    </div>
    <div className="relative z-10"><LoginLogoMotion /></div>
    <div className="relative z-10"><h2 className="text-xl font-semibold">Your academy, connected.</h2><p className="mt-2 text-sm leading-relaxed text-white/75">Manage admissions, classes and everyday academy activity from your assigned branch.</p><div className="mt-4 flex flex-wrap gap-2 text-[10px]"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5"><GraduationCap size={15}/>Academics</span><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5"><ShieldCheck size={15}/>Role-based access</span></div></div>
   </section>
   <section className="flex flex-col justify-center p-6 sm:p-8">
    <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><LockKeyhole size={22}/></span>
    <h2 className="text-3xl font-bold">Welcome back</h2><p className="mb-6 mt-2 text-sm text-slate-500">Sign in with your staff email and password.</p>
    <form onSubmit={submit} className="space-y-5">
     <label className="block text-sm font-semibold">Email<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18}/><Input type="email" autoComplete="username" required maxLength={160} className="min-h-11 pl-10" value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></div></label>
     <label className="block text-sm font-semibold">Password<div className="relative mt-2"><Input type={show?'text':'password'} autoComplete="current-password" required maxLength={128} className="min-h-11 pr-12" value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/><button type="button" aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)} className="absolute right-1 top-1 flex size-9 items-center justify-center rounded text-slate-500 hover:bg-slate-100">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
     {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
     <Button type="submit" disabled={busy} className="min-h-11 w-full">{busy?'Signing in...':'Sign in'}</Button>
    </form>
    <p className="mt-6 text-xs leading-relaxed text-slate-500">Need access? Contact your branch administrator.</p>
   </section>
  </div>
 </main>
}
