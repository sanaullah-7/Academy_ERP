/**
 * Purpose: Select Branch Page for the Auth area of the Academy Management ERP.
 * Module: Auth
 * Features: Multi-campus selection, TSA Maroon executive styling, accessible select & visual cards.
 */

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Check,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import useAcademy from '../../hooks/useAcademy.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx'
import SessionStatus from '../../components/Auth/SessionStatus.jsx'
import AcademyLogo from '../../components/Layout/AcademyLogo.jsx'

export default function SelectBranchPage() {
  const { user, status, error, logout } = useAuth()
  const { branches, branch, selectBranch } = useBranch()
  const { branding } = useAcademy()
  const [selectedId, setSelectedId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === 'loading') return <SessionStatus />
  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />
  if (!branches.length) return <Navigate to={ROUTE_PATHS.UNAUTHORIZED} replace />
  if (branch) return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />

  async function submit(event) {
    event.preventDefault()
    if (!selectedId) return
    setIsSubmitting(true)
    await selectBranch(selectedId)
    setIsSubmitting(false)
  }

  const academyTitle = branding?.name || 'The Scholar Coaching Academy'

  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#4a000d] via-[#720014] to-[#250006] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#940016]/40 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/15 blur-3xl opacity-50" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-[#940016]/20 blur-3xl" />

      {/* Top Floating Academy Branding Pill */}
      <div className="relative z-10 mb-4 flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md shadow-xl text-white">
        <div className="size-7 rounded-full bg-white p-0.5 grid place-items-center shrink-0 shadow-2xs">
          <AcademyLogo className="size-5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-white/95">
          {academyTitle}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Multi-Campus
        </span>
      </div>

      <Card className="relative z-10 w-full max-w-lg rounded-3xl border border-white/20 bg-white p-5 shadow-2xl space-y-5 text-slate-900 animate-in fade-in zoom-in-95 duration-200 sm:p-7">
        <CardHeader className="p-0 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="size-11 rounded-xl bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9] grid place-items-center shadow-xs">
              <Building2 size={22} />
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900">{user.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">Authorized Staff</span>
            </div>
          </div>

          <div>
            <CardTitle>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Select a branch
              </h1>
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1.5 leading-relaxed font-normal">
              {user.name} has multiple authorized branches. Choose one to continue.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <form className="space-y-4" onSubmit={submit}>
            <fieldset className="space-y-2.5">
              <div className="flex items-center justify-between">
                <legend className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Choose authorized branch
                </legend>
                <span className="text-[11px] font-semibold text-slate-400">
                  {branches.length} {branches.length === 1 ? 'Campus' : 'Campuses'} Available
                </span>
              </div>
              {branches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {branches.map(candidate => {
                      const isSelected = selectedId === candidate.id
                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => setSelectedId(candidate.id)}
                          disabled={isSubmitting}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#940016]/15 ${
                            isSelected
                              ? 'border-[#940016] bg-[#F9EBEE] shadow-xs text-[#940016]'
                              : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                          }`}
                        >
                          <div className={`size-10 rounded-xl grid place-items-center shrink-0 transition-colors ${
                            isSelected ? 'bg-[#940016] text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Building2 size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#940016]' : 'text-slate-900'}`}>
                              {candidate.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {candidate.location || 'Authorized Campus'}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="size-5 rounded-full bg-[#940016] text-white grid place-items-center shrink-0 shadow-2xs">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
              )}
            </fieldset>

            {error && (
              <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                type="submit"
                disabled={!selectedId || isSubmitting}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[#940016] to-[#72000E] hover:from-[#7a0012] hover:to-[#5a000a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Entering Campus…' : 'Open dashboard'}</span>
                {!isSubmitting && <ArrowRight size={16} />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => void logout()}
                className="h-10 w-full text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Log out</span>
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Security & Access Notice */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#940016]" />
            <span>Role-based campus isolation</span>
          </div>
          <span>TSA Academy ERP 2026</span>
        </div>
      </Card>
    </main>
  )
}
