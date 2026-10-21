import { authService } from '../../services/authService.js'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogOut, Moon, Sun, UserRound } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Input } from '../ui/input.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import BranchSwitcher from '../Layout/BranchSwitcher.jsx'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { ROLE_LABELS } from '../../constants/roles.js'
import { organizationService } from '../../services/organizationService.js'
import useTheme from '../../hooks/useTheme.js'

const initials = name => String(name ?? '').split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase() || 'U'

export default function DemoSessionControls() {
  const { user, status, logout, refreshSession } = useAuth()
  const { roles } = useBranch()
  const { colorMode, toggleColorMode } = useTheme()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuOpen,setMenuOpen]=useState(false),[profileOpen,setProfileOpen]=useState(false),[message,setMessage]=useState('')
  const [passwordOpen,setPasswordOpen]=useState(false),[passwordBusy,setPasswordBusy]=useState(false),[passwordMessage,setPasswordMessage]=useState('')
  const [visiblePasswords,setVisiblePasswords]=useState({})
  const [passwords,setPasswords]=useState({currentPassword:'',newPassword:'',confirmPassword:''})
  const [form,setForm]=useState({name:'',photo:null})
  useEffect(()=>{if(!menuOpen)return;const close=e=>{if(!menuRef.current?.contains(e.target))setMenuOpen(false)};const key=e=>{if(e.key==='Escape')setMenuOpen(false)};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[menuOpen])
  if (status === 'loading') return <span className="text-xs text-muted-foreground" role="status">Loading…</span>
  if (!user) return <Button asChild variant="outline" size="sm"><Link to={ROUTE_PATHS.LOGIN}>Login</Link></Button>
  async function signOut(){setMenuOpen(false);await logout();navigate(ROUTE_PATHS.LOGIN,{replace:true})}
  function uploadPhoto(event){const file=event.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>262144){setMessage('Photo must be PNG, JPG, WEBP or GIF and 256 KB or smaller.');event.target.value='';return}const reader=new FileReader();reader.onload=()=>setForm(current=>({...current,photo:String(reader.result)}));reader.onerror=()=>setMessage('Photo could not be read.');reader.readAsDataURL(file)}
  async function saveProfile(event){event.preventDefault();try{await organizationService.saveOwnProfile(form);await refreshSession();setMessage('Profile saved.');setProfileOpen(false)}catch(error){setMessage(error.message)}}
  async function changePassword(event){event.preventDefault();setPasswordBusy(true);setPasswordMessage('');try{await authService.changePassword(passwords);setPasswords({currentPassword:'',newPassword:'',confirmPassword:''});setVisiblePasswords({});setPasswordMessage('Password changed. Use your new password the next time you sign in.')}catch(error){setPasswordMessage(error.message)}finally{setPasswordBusy(false)}}
  return <>
    <div className="flex min-w-0 items-center gap-2">
      <BranchSwitcher />
      <div className="relative" ref={menuRef}>
        <button type="button" aria-label="Open user menu" aria-haspopup="menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)} className="flex min-h-10 max-w-52 items-center gap-2 rounded-lg border border-transparent px-2 text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {user.photo?<img src={user.photo} alt="" className="size-8 rounded-full border border-border bg-card object-cover"/>:<span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{initials(user.name)}</span>}
          <span className="hidden min-w-0 sm:block"><strong className="block truncate text-xs">{user.name}</strong><small className="block truncate text-[10px] text-muted-foreground">{roles.map(role=>ROLE_LABELS[role]??role).join(', ')}</small></span>
        </button>
        {menuOpen&&<div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-max min-w-32 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg">
          <button role="menuitem" type="button" onClick={()=>{setForm({name:user.name??'',photo:user.photo??null});setMenuOpen(false);setMessage('');setProfileOpen(true)}} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent"><UserRound size={14}/>My Profile</button>
          <button role="menuitem" type="button" onClick={()=>{setMenuOpen(false);setPasswords({currentPassword:'',newPassword:'',confirmPassword:''});setPasswordMessage('');setVisiblePasswords({});setPasswordOpen(true)}} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent">Change Password</button>
          <button role="menuitem" type="button" aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`} onClick={()=>{toggleColorMode();setMenuOpen(false)}} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent">{colorMode === 'dark' ? <Sun size={14}/> : <Moon size={14}/>} {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}</button>
          <button role="menuitem" type="button" aria-label="Log out" onClick={()=>void signOut()} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"><LogOut size={14}/>Logout</button>
        </div>}
      </div>
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>My Profile</DialogTitle><DialogDescription>Update your personal display details. Your login identity and permissions stay unchanged.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={saveProfile}>
        <div className="flex items-center gap-3">{form.photo?<img src={form.photo} alt="Profile preview" className="size-16 rounded-full border object-cover"/>:<span className="grid size-16 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{initials(form.name)}</span>}<div><Input aria-label="Profile photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadPhoto}/>{form.photo&&<Button type="button" variant="ghost" size="sm" onClick={()=>setForm(current=>({...current,photo:null}))}>Remove photo</Button>}</div></div>
        <label className="block text-xs font-semibold">Display name<Input className="mt-1" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
        {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}
        <Button type="button" variant="outline" onClick={()=>{setPasswords({currentPassword:'',newPassword:'',confirmPassword:''});setPasswordMessage('');setVisiblePasswords({});setPasswordOpen(true)}}>Change Password</Button>
        <DialogFooter><Button type="button" variant="outline" onClick={()=>setProfileOpen(false)}>Cancel</Button><Button type="submit">Save profile</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
    <Dialog open={passwordOpen} onOpenChange={open=>{if(!passwordBusy){setPasswordOpen(open);if(!open)setPasswords({currentPassword:'',newPassword:'',confirmPassword:''})}}}><DialogContent><DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Your new password replaces the initial password for this account.</DialogDescription></DialogHeader>
     <form onSubmit={changePassword} className="space-y-4">
      {[['currentPassword','Current password'],['newPassword','New password'],['confirmPassword','Confirm new password']].map(([key,label])=><label key={key} className="block text-sm font-medium">{label}<span className="relative mt-1 block"><Input className="pr-11" type={visiblePasswords[key]?'text':'password'} autoComplete={key==='currentPassword'?'current-password':'new-password'} required minLength={key==='currentPassword'?undefined:6} maxLength={128} disabled={passwordBusy} value={passwords[key]} onChange={e=>setPasswords({...passwords,[key]:e.target.value})}/><button type="button" disabled={passwordBusy} aria-label={`${visiblePasswords[key]?'Hide':'Show'} ${label.toLowerCase()}`} aria-pressed={Boolean(visiblePasswords[key])} onClick={()=>setVisiblePasswords(current=>({...current,[key]:!current[key]}))} className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{visiblePasswords[key]?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>)}
      <p className="text-xs text-muted-foreground">Use 6 to 128 characters.</p>{passwordMessage&&<p role="status" className="text-sm">{passwordMessage}</p>}
      <DialogFooter><Button type="button" variant="outline" disabled={passwordBusy} onClick={()=>{setPasswordOpen(false);setPasswords({currentPassword:'',newPassword:'',confirmPassword:''})}}>Close</Button><Button type="submit" disabled={passwordBusy}>{passwordBusy?'Saving...':'Update password'}</Button></DialogFooter>
     </form>
    </DialogContent></Dialog>
  </>
}
