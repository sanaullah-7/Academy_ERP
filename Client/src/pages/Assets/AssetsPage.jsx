import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useColumnVisibility } from '../../hooks/useTableUtilities.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Archive, BadgeCheck, Building2,
  ClipboardCheck, Eye, FlaskConical, Loader2,
  MapPin, MoreVertical, PackagePlus, Pencil, Search,
  Sofa, Tv2, Wrench, Zap,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import CustomSelect from '../../components/ui/CustomSelect.jsx'
import Pagination from '../../components/Shared/Pagination.jsx'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '../../components/ui/dialog.jsx'
import { assetService } from '../../services/assetService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { getDemoUsers } from '../../mock/authFixtures.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { getLocalDateOnly } from '../../utils/formatDate.js'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'

// ─── Column definitions ──────────────────────────────────────────────────────
const assetColumns = [
  { key: 'assetCode', label: 'Asset & Item', required: true },
  { key: 'category',  label: 'Category' },
  { key: 'purchase',  label: 'Purchase Date' },
  { key: 'bookValue', label: 'Book Value' },
  { key: 'condition', label: 'Condition' },
  { key: 'location',  label: 'Location' },
  { key: 'actions',   label: 'Actions', required: true },
]

// ─── Category metadata (icon + accent colour) ─────────────────────────────
const CATEGORY_META = {
  'Classroom Tech & AV': { Icon: Tv2,         color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  'Cooling & Power':     { Icon: Zap,          color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  'Lab Equipment':       { Icon: FlaskConical,  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  'Furniture & Fixtures':{ Icon: Sofa,          color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
}
const defaultMeta = { Icon: Archive, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' }
const getCategoryMeta = (cat) => CATEGORY_META[cat] ?? defaultMeta

// ─── Helpers ─────────────────────────────────────────────────────────────────
const money = (v) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)

const deprPct = (cost, bv) => {
  if (!cost || cost === 0 || bv == null) return null
  const pct = Math.round(((cost - bv) / cost) * 1000) / 10
  return pct > 0 ? pct : null
}

const fmtDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(day, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

const emptyAsset = {
  assetCode: '', name: '', category: '', description: '',
  trackingType: 'Individual', quantity: 1, purchaseDate: '',
  purchaseCost: '', bookValue: '', serialNumber: '',
  location: '', supplier: '', notes: '',
}
const field = 'min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'

// ─── Condition badge ──────────────────────────────────────────────────────────
function ConditionBadge({ condition }) {
  if (condition === 'Excellent')
    return <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"><span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />Excellent</span>
  if (condition === 'Working')
    return <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700"><span className="size-1.5 shrink-0 rounded-full bg-sky-500" />Good Condition</span>
  if (condition === 'Needs Maintenance')
    return <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600"><span className="size-1.5 shrink-0 rounded-full bg-rose-500" />Needs Servicing</span>
  return <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600"><span className="size-1.5 shrink-0 rounded-full bg-gray-400" />{condition}</span>
}

// ─── Inline asset form ─────────────────────────────────────────────────────
function AssetForm({ value, onChange, editing }) {
  const set = (key, next) => onChange({ ...value, [key]: next })
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Asset Tag ID<Input required disabled={editing} value={value.assetCode} onChange={e => set('assetCode', e.target.value)} placeholder="AST-001" /></label>
      <label className="text-sm font-medium">Asset Name<Input required value={value.name} onChange={e => set('name', e.target.value)} placeholder="Projector" /></label>
      <label className="text-sm font-medium">Category<Input required value={value.category} onChange={e => set('category', e.target.value)} placeholder="Classroom Tech & AV" /></label>
      <div className="space-y-1">
        <label className="text-sm font-medium">Tracking Type</label>
        <CustomSelect
          aria-label="Tracking type"
          value={value.trackingType}
          onChange={val => set('trackingType', val)}
          options={['Individual', 'Bulk']}
          containerClassName="relative w-full text-left"
          className="h-10 w-full bg-white"
          menuWidthClass="w-full min-w-full"
        />
      </div>
      <label className="text-sm font-medium">Quantity<Input required min="1" type="number" disabled={value.trackingType === 'Individual'} value={value.trackingType === 'Individual' ? 1 : value.quantity} onChange={e => set('quantity', e.target.value)} /></label>
      <label className="text-sm font-medium">Purchase Date<Input type="date" value={value.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} /></label>
      <label className="text-sm font-medium">Purchase Cost (PKR)<Input min="0" type="number" value={value.purchaseCost} onChange={e => set('purchaseCost', e.target.value)} /></label>
      <label className="text-sm font-medium">Stored Book Value (PKR)<Input min="0" type="number" value={value.bookValue ?? ''} onChange={e => set('bookValue', e.target.value)} placeholder="Optional; no auto depreciation" /></label>
      <label className="text-sm font-medium">Serial Number<Input value={value.serialNumber} onChange={e => set('serialNumber', e.target.value)} /></label>
      <label className="text-sm font-medium">Location<Input value={value.location} onChange={e => set('location', e.target.value)} placeholder="Hall / room" /></label>
      <label className="text-sm font-medium">Supplier<Input value={value.supplier} onChange={e => set('supplier', e.target.value)} /></label>
      <label className="text-sm font-medium sm:col-span-2">Description<textarea className={`${field} min-h-20 py-2`} value={value.description} onChange={e => set('description', e.target.value)} /></label>
    </div>
  )
}

// ─── Row actions dropdown (3-dots) ────────────────────────────────────────────
function RowMenu({ item, canManage, canOperate, onView, onEdit, onMaintenance }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  function openMenu(e) {
    e.stopPropagation()
    if (open) {
      setOpen(false)
      setPosition(null)
      return
    }
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const menuWidth = 128
    const menuHeight = canManage && item.status !== 'Retired' ? 108 : 36

    let left = rect.right - menuWidth
    if (left < 8) left = 8
    if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8

    let top = rect.bottom + 4
    if (top + menuHeight > window.innerHeight - 8 && rect.top - menuHeight > 8) {
      top = rect.top - menuHeight - 4
    }

    setPosition({ top, left })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return undefined
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
        setPosition(null)
      }
    }
    function handleClose() {
      setOpen(false)
      setPosition(null)
    }
    document.addEventListener('pointerdown', handleClickOutside)
    window.addEventListener('resize', handleClose)
    window.addEventListener('scroll', handleClose, true)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      window.removeEventListener('resize', handleClose)
      window.removeEventListener('scroll', handleClose, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More actions for ${item.assetCode}`}
        onClick={openMenu}
        className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
      >
        <MoreVertical size={15} />
      </button>
      {open && position && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${item.assetCode}`}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          className="fixed z-[9999] w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 text-xs text-slate-800"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button" role="menuitem"
            onClick={() => { setOpen(false); setPosition(null); onView() }}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-[#F9EBEE] hover:text-[#940016] focus-visible:bg-[#F9EBEE] focus-visible:text-[#940016] rounded-lg text-left transition-colors cursor-pointer"
          >
            <Eye size={13} className="shrink-0 text-sky-600" />
            View Details
          </button>
          {canManage && item.status !== 'Retired' && (
            <>
              <button
                type="button" role="menuitem"
                onClick={() => { setOpen(false); setPosition(null); onEdit() }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-[#F9EBEE] hover:text-[#940016] focus-visible:bg-[#F9EBEE] focus-visible:text-[#940016] rounded-lg text-left transition-colors cursor-pointer"
              >
                <Pencil size={13} className="shrink-0 text-violet-600" />
                Edit Asset
              </button>
              {canOperate && <button
                type="button" role="menuitem"
                onClick={() => { setOpen(false); setPosition(null); (['Needs Maintenance', 'Out of Service'].includes(item.condition) ? onMaintenance() : onView()) }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-[#F9EBEE] hover:text-[#940016] focus-visible:bg-[#F9EBEE] focus-visible:text-[#940016] rounded-lg text-left transition-colors cursor-pointer"
              >
                <ClipboardCheck size={12} className="shrink-0 text-emerald-600" />
                {['Needs Maintenance', 'Out of Service'].includes(item.condition) ? 'Log Repair' : 'Inspect'}
              </button>}

            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const { branchId, branch, scopeKey } = useBranch()
  const { can, roles } = usePermissions()
  const canManage = can(PERMISSIONS.ASSETS_MANAGE)
  const canOperate = canManage && !roles.includes('receptionist')

  // Data state
  const [result, setResult] = useState(() => peekPageResource('assets', { scopeKey, refresh: 0 }))
  const [refresh, setRefresh] = useState(0)

  // Filter / sort state
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [condition, setCondition] = useState('All')
  const [location, setLocation]   = useState('All')
  const [sort, setSort]           = useState('code')
  const [page, setPage]           = useState(1)

  // Dialog state
  const [dialog, setDialog]         = useState(null)
  const [selected, setSelected]     = useState(null)
  const [form, setForm]             = useState(emptyAsset)
  const [busy, setBusy]             = useState(false)
  const [feedback, setFeedback]     = useState('')
  const [dialogError, setDialogError] = useState('')

  // Quick inspection sidebar
  const [inspection, setInspection] = useState({ assetId: '', condition: 'Working', remarks: '' })
  const [inspectBusy, setInspectBusy] = useState(false)
  const [inspectFeedback, setInspectFeedback] = useState('')

  // Assign / maintenance action state
  const [action, setAction] = useState({
    assignedToId: '', location: '', date: getLocalDateOnly(),
    description: '', condition: 'Working', cost: '', nextServiceDate: '',
  })

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true
    let requestId = 0
    const load = () => {
      const latest = ++requestId
      const loadVersion = capturePageVersion()
      assetService.list({ branchId }).then(
        data => { if (active && latest === requestId) setResult(rememberPageResource('assets', { scopeKey, refresh, data }, loadVersion)) },
        error => { if (active && latest === requestId) setResult({ scopeKey, refresh, error: error.message }) },
      )
    }
    load()
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    const timer = window.setInterval(load, 60000)
    return () => { active = false; window.removeEventListener('focus', load); window.removeEventListener('storage', load); window.clearInterval(timer) }
  }, [branchId, scopeKey, refresh])

  const current = result?.scopeKey === scopeKey && result.refresh === refresh ? result : null
  const assets  = useMemo(() => current?.data ?? [], [current])

  // ── Derived lists ─────────────────────────────────────────────────────────
  const categories = useMemo(() => [...new Set(assets.map(i => i.category))].sort(), [assets])
  const locations  = useMemo(() => [...new Set(assets.map(i => i.location).filter(Boolean))].sort(), [assets])
  const staff      = getDemoUsers().filter(u => u.enabled && u.assignments.some(a => a.branchId === branchId))

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() =>
    assets
      .filter(i =>
        (category === 'All' || i.category === category) &&
        (condition === 'All' || i.condition === condition) &&
        (location  === 'All' || i.location  === location) &&
        `${i.assetCode} ${i.name} ${i.category} ${i.location} ${i.assignedToName ?? ''}`.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) =>
        sort === 'value' ? (b.bookValue ?? -1) - (a.bookValue ?? -1) :
        sort === 'name'  ? a.name.localeCompare(b.name) :
                           a.assetCode.localeCompare(b.assetCode)
      ),
    [assets, category, condition, location, search, sort]
  )

  const [pageSize, setPageSize] = useState(10)
  const pages    = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible  = filtered.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize)

  // ── KPI stats ─────────────────────────────────────────────────────────────
  const storedValue     = assets.reduce((s, i) => s + (i.bookValue ?? 0), 0)
  const needsMaintenance= assets.filter(i => i.status === 'Maintenance').length
  const nonRetired      = assets.filter(i => i.status !== 'Retired')
  const workingRate     = nonRetired.length
    ? Math.round(nonRetired.filter(i => ['Excellent', 'Working'].includes(i.condition)).length / nonRetired.length * 1000) / 10
    : 0

  // ── Table utilities ───────────────────────────────────────────────────────
  const columnVisibility = useColumnVisibility(assetColumns, 'assets')

  // ── Dialog openers ────────────────────────────────────────────────────────
  const openCreate = () => { setSelected(null); setForm(emptyAsset); setDialogError(''); setDialog('form') }
  const openEdit   = (item) => { setSelected(item); setForm({ ...item, bookValue: item.bookValue ?? '' }); setDialogError(''); setDialog('form') }
  const openAction = (item, type) => {
    setSelected(item)
    setAction({ assignedToId: item.assignedToId ?? '', location: item.location ?? '', date: getLocalDateOnly(), description: '', condition: item.condition, cost: '', nextServiceDate: '' })
    setDialogError('')
    setDialog(type)
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  async function submit(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setDialogError('')
    try {
      if (selected) await assetService.update(selected.id, form, { branchId })
      else          await assetService.create(form, { branchId })
      setFeedback(selected ? 'Asset details updated.' : 'Asset registered successfully.')
      setDialog(null); setRefresh(x => x + 1)
    } catch (err) { setDialogError(err.message) }
    finally { setBusy(false) }
  }

  async function saveAction(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setDialogError('')
    try {
      if (dialog === 'assign')      await assetService.assign(selected.id, action, { branchId })
      if (dialog === 'maintenance') await assetService.addMaintenance(selected.id, action, { branchId })
      setFeedback(dialog === 'assign' ? 'Asset assignment updated.' : 'Maintenance record saved.')
      setDialog(null); setRefresh(x => x + 1)
    } catch (err) { setDialogError(err.message) }
    finally { setBusy(false) }
  }

  async function unassign(item) {
    try { await assetService.unassign(item.id, { branchId }); setFeedback('Asset returned to inventory.'); setRefresh(x => x + 1) }
    catch (err) { setFeedback(err.message) }
  }

  async function quickInspect(e) {
    e.preventDefault()
    if (inspectBusy) return
    const item = assets.find(a => a.id === inspection.assetId)
    if (!item) return
    setInspectBusy(true); setInspectFeedback('')
    try {
      await assetService.inspect(item.id, inspection, { branchId })
      setInspectFeedback(`Inspection saved for ${item.assetCode}.`)
      setInspection({ assetId: '', condition: 'Working', remarks: '' })
      setRefresh(x => x + 1)
    } catch (err) { setInspectFeedback(err.message) }
    finally { setInspectBusy(false) }
  }

  // ── Export helpers ────────────────────────────────────────────────────────
  function exportCsv() {
    const items = filtered
    downloadCsv(
      `tsa-${branch?.name ?? 'branch'}-assets-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Asset Tag','Name','Category','Tracking','Qty','Purchase Date','Purchase Cost','Book Value','Condition','Status','Location','Assigned To'],
      items.map(i => [i.assetCode, i.name, i.category, i.trackingType, i.quantity, i.purchaseDate, i.purchaseCost, i.bookValue ?? 'N/A', i.condition, i.status, i.location, i.assignedToName ?? ''])
    )
    setFeedback(`CSV export completed (${items.length} records).`)
  }

  function exportPdf() {
    const items = filtered
    const summary = `${filtered.length} matching assets`
    exportTablePdf({
      filename: `tsa-${branch?.name ?? 'branch'}-assets-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Academy Assets & Equipment Directory',
      branchName: branch?.name ?? 'The Scholar Coaching Academy',
      headers: ['Asset Tag','Asset Name','Category','Qty','Purchase Cost','Book Value','Condition','Location'],
      rows: items.map(i => [i.assetCode, i.name, i.category, String(i.quantity ?? 1), money(i.purchaseCost), i.bookValue == null ? 'N/A' : money(i.bookValue), i.condition, i.location || 'Unassigned']),
      filterSummary: summary,
    })
    setFeedback(`PDF downloaded (${items.length} records).`)
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (!current) return (
    <DashboardLayout>
      <div role="status" className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />Loading branch inventory…
      </div>
    </DashboardLayout>
  )
  if (current.error) return (
    <DashboardLayout>
      <div role="alert" className="p-8 text-destructive">
        {current.error} <Button onClick={() => setRefresh(x => x + 1)} className="ml-2">Retry</Button>
      </div>
    </DashboardLayout>
  )

  // ── Quick inspection sidebar: last inspection note for selected asset ─────
  const inspectedAsset = assets.find(a => a.id === inspection.assetId)
  const lastInspect    = inspectedAsset?.history?.filter(h => h.type === 'Inspection').at(-1)

  return (
    <DashboardLayout>
      <div className="space-y-5 print:p-0">

        {/* ── Page header ── */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Academy Assets &amp; Inventory
            </h1>
            <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
              Track campus equipment, classroom tech, air conditioning, and furniture with maintenance schedules and book values.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <TableToolbarActions
              onRefresh={() => setRefresh(x => x + 1)}
              columns={assetColumns}
              visibleColumns={columnVisibility.visibleColumns}
              onToggleColumn={columnVisibility.toggleColumn}
              onResetColumns={columnVisibility.resetColumns}
              onExportPdf={exportPdf}
              onExportCsv={exportCsv}
              onPrint={() => window.print()}
              exportScopeSummary={`${filtered.length} matching assets`}
            />
            {canManage && (
              <Button size="sm" className="h-9 gap-1.5 bg-[#940016] hover:bg-[#72000E] text-white shadow-sm" onClick={openCreate}>
                <PackagePlus size={15} />+ Register New Asset
              </Button>
            )}
          </div>
        </header>

        {/* ── Feedback banner ── */}
        {feedback && (
          <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary">
            {feedback}
          </p>
        )}

        {/* ── KPI stat cards ── */}
        <section className="assets-metrics grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Assets',
              value: assets.length,
              Icon: Archive,
              note: `Across ${categories.length} categories`,
              iconCls: 'bg-[#F9EBEE] text-[#940016] border-[#f0d5d9]',
            },
            {
              label: 'Total Inventory Value',
              value: money(storedValue),
              Icon: BadgeCheck,
              note: `${assets.filter(i => i.bookValue != null).length}/${assets.length} stored book values`,
              iconCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            {
              label: 'Needs Maintenance',
              value: needsMaintenance,
              Icon: Wrench,
              note: needsMaintenance > 0 ? `${needsMaintenance} asset${needsMaintenance > 1 ? 's' : ''} flagged urgent` : 'All assets operational',
              iconCls: needsMaintenance > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200',
              urgent: needsMaintenance > 0,
            },
            {
              label: 'Working Condition',
              value: `${workingRate}%`,
              Icon: ClipboardCheck,
              note: `${nonRetired.length} non-retired assets`,
              iconCls: 'bg-sky-50 text-sky-700 border-sky-200',
            },
          ].map(({ label, value, Icon, note, iconCls, urgent }) => (
            <Card key={label} className="top-kpi-card py-0 overflow-hidden border border-border/80 shadow-xs">
              <CardContent className="flex items-start justify-between p-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <strong className={`mt-1.5 block text-2xl font-bold tracking-tight tabular-nums ${urgent ? 'text-rose-600' : 'text-foreground'}`}>
                    {current?.data ? value : current?.error ? 'Unavailable' : 'Loading...'}
                    {urgent && <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Urgent</span>}
                  </strong>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>
                </div>
                <span className={`grid size-10 place-items-center rounded-xl border ${iconCls}`}>
                  <Icon size={19} />
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Main content: table + sidebar ── */}
        <div className="assets-inventory-layout grid min-w-0 gap-4 xl:gap-[2px] xl:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">

          {/* ── Left: filters + table ── */}
          <section className="min-w-0 space-y-3">

            {/* Category filter tabs */}
            <Card className="py-0 border border-border/80 shadow-xs">
              <CardContent className="assets-filter-panel space-y-3 p-3.5">
                {/* Tab pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[{ key: 'All', count: assets.length }, ...categories.map(c => ({ key: c, count: assets.filter(i => i.category === c).length }))].map(({ key, count }) => {
                    const isActive = category === key
                    const meta = key === 'All' ? defaultMeta : getCategoryMeta(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setCategory(key); setPage(1) }}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                          ${isActive
                            ? 'bg-[#940016] text-white shadow-sm'
                            : `${meta.bg} ${meta.color} hover:bg-[#F9EBEE] hover:text-[#940016] focus-visible:bg-[#F9EBEE] focus-visible:text-[#940016]`
                          }`}
                      >
                        {key !== 'All' && <meta.Icon size={12} className={isActive ? 'text-white' : meta.color} />}
                        {key === 'All' ? 'All Assets' : key} ({count})
                      </button>
                    )
                  })}
                </div>

                {/* Search + filter row */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative flex-1 min-w-[200px] sm:min-w-[240px] xl:flex-none xl:w-[40%]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input
                      className="pl-9 h-9 text-xs w-full bg-white border-slate-200/90 shadow-2xs placeholder:text-muted-foreground focus:ring-1 focus:ring-[#940016]"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1) }}
                      placeholder="Search asset by tag ID, item name, room…"
                    />
                  </label>
                  <CustomSelect
                    aria-label="Filter by location"
                    value={location}
                    onChange={val => { setLocation(val); setPage(1) }}
                    options={[
                      { value: 'All', label: 'All Rooms' },
                      ...locations.map(l => ({ value: l, label: l }))
                    ]}
                    placeholder="All Rooms"
                    className="h-9 min-w-[140px] max-w-[170px] bg-white border-slate-200/90 text-[11px] font-medium"
                    menuWidthClass="w-44 min-w-44 max-w-44"
                  />
                  <CustomSelect
                    aria-label="Filter by condition"
                    value={condition}
                    onChange={val => { setCondition(val); setPage(1) }}
                    options={[
                      { value: 'All', label: 'All Conditions', dot: 'bg-slate-400' },
                      { value: 'Excellent', label: 'Excellent', dot: 'bg-emerald-500' },
                      { value: 'Working', label: 'Good Condition', dot: 'bg-sky-500' },
                      { value: 'Needs Maintenance', label: 'Needs Servicing', dot: 'bg-rose-500' },
                      { value: 'Out of Service', label: 'Out of Service', dot: 'bg-slate-400' },
                    ]}
                    placeholder="All Conditions"
                    className="h-9 min-w-[145px] max-w-[175px] bg-white border-slate-200/90 text-[11px] font-medium"
                    menuWidthClass="w-44 min-w-44 max-w-44"
                  />
                  <CustomSelect
                    aria-label="Sort assets"
                    value={sort}
                    onChange={val => setSort(val)}
                    options={[
                      { value: 'code', label: 'Sort: Tag' },
                      { value: 'name', label: 'Sort: Name' },
                      { value: 'value', label: 'Sort: Value' },
                    ]}
                    placeholder="Sort: Tag"
                    className="h-9 w-[90px] min-w-[90px] max-w-[90px] bg-white border-slate-200/90 text-[11px] font-medium"
                    menuWidthClass="w-28 min-w-28 max-w-28"
                    menuAlign="right"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
            <div className="hidden overflow-hidden md:block">
              <table className="asset-registry-table w-full table-fixed text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-400">
                  <tr>
                    {columnVisibility.isVisible('assetCode') && <th className="w-[22%] px-3.5 py-3">Asset Tag &amp; Item</th>}
                    {columnVisibility.isVisible('category')  && <th className="w-[14%] px-3.5 py-3">Category</th>}
                    {columnVisibility.isVisible('purchase')  && <th className="w-[13%] px-3.5 py-3">Purchase</th>}
                    {columnVisibility.isVisible('bookValue') && <th className="w-[13%] px-3.5 py-3">Book Value</th>}
                    {columnVisibility.isVisible('condition') && <th className="w-[14%] px-3.5 py-3">Condition</th>}
                    {columnVisibility.isVisible('location')  && <th className="w-[17%] px-3.5 py-3">Location</th>}
                    {columnVisibility.isVisible('actions')   && <th className="w-[7%]  px-3.5 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {visible.map(item => {
                    const meta      = getCategoryMeta(item.category)
                    const CatIcon   = meta.Icon
                    const depr      = deprPct(item.purchaseCost, item.bookValue)
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-[#F9EBEE]/20">

                        {/* Asset code + name */}
                        {columnVisibility.isVisible('assetCode') && (
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`hidden shrink-0 size-7 place-items-center rounded-lg border ${meta.bg} ${meta.border} lg:grid`}>
                                <CatIcon size={12} className={meta.color} />
                              </span>
                              <div className="min-w-0">
                                <button className="font-bold text-[#940016] hover:underline text-[10px] whitespace-nowrap" onClick={() => { setSelected(item); setDialog('details') }}>
                                  {item.assetCode}
                                </button>
                                <p className="truncate text-[11px] font-medium text-foreground leading-tight max-w-[140px]" title={item.name}>{item.name}</p>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Category */}
                        {columnVisibility.isVisible('category') && (
                          <td className="px-3.5 py-3 max-w-[130px]">
                            <span className="block truncate text-[11px] text-muted-foreground" title={item.category}>{item.category}</span>
                          </td>
                        )}

                        {/* Purchase date + cost */}
                        {columnVisibility.isVisible('purchase') && (
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className="block text-[11px] font-medium text-foreground">{fmtDate(item.purchaseDate)}</span>
                            <span className="block text-[10px] tabular-nums text-muted-foreground">{money(item.purchaseCost)}</span>
                          </td>
                        )}

                        {/* Book value + depreciation */}
                        {columnVisibility.isVisible('bookValue') && (
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            {item.bookValue == null ? (
                              <span className="text-[10px] text-muted-foreground italic">N/A</span>
                            ) : (
                              <>
                                <span className="block text-[11px] font-semibold tabular-nums text-foreground">{money(item.bookValue)}</span>
                                {depr != null && (
                                  <span className="block text-[10px] text-muted-foreground">−{depr}% depr.</span>
                                )}
                              </>
                            )}
                          </td>
                        )}

                        {/* Condition badge */}
                        {columnVisibility.isVisible('condition') && (
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <ConditionBadge condition={item.condition} />
                          </td>
                        )}

                        {/* Location */}
                        {columnVisibility.isVisible('location') && (
                          <td className="px-3.5 py-3 max-w-[160px]">
                            <div className="flex items-start gap-1">
                              <Building2 size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
                              <span className="truncate text-[11px] text-muted-foreground" title={item.location || 'Unassigned'}>{item.location || 'Unassigned'}</span>
                            </div>
                          </td>
                        )}

                        {/* Actions */}
                        {columnVisibility.isVisible('actions') && (
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <RowMenu
                                item={item}
                                canManage={canManage}
                                canOperate={canOperate}
                                onView={() => { setSelected(item); setDialog('details') }}
                                onEdit={() => openEdit(item)}
                                onMaintenance={() => openAction(item, 'maintenance')}
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="grid gap-2.5 p-3 md:hidden">
              {visible.map(item => {
                const meta    = getCategoryMeta(item.category)
                const CatIcon = meta.Icon
                const depr    = deprPct(item.purchaseCost, item.bookValue)
                return (
                  <Card key={item.id} className="py-0 border border-border/80 shadow-xs">
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className={`grid size-8 shrink-0 place-items-center rounded-lg border ${meta.bg} ${meta.border}`}>
                            <CatIcon size={15} className={meta.color} />
                          </span>
                          <div>
                            <button className="text-[11px] font-bold text-[#940016]" onClick={() => { setSelected(item); setDialog('details') }}>
                              {item.assetCode}
                            </button>
                            <p className="text-sm font-medium text-foreground leading-tight">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category} · <MapPin size={10} className="inline" /> {item.location || 'Unassigned'}</p>
                          </div>
                        </div>
                        <ConditionBadge condition={item.condition} />
                      </div>
                      {item.bookValue != null && (
                        <div className="mt-2.5 flex items-baseline gap-2 border-t border-border/50 pt-2">
                          <span className="text-xs font-semibold tabular-nums">{money(item.bookValue)}</span>
                          {depr != null && <span className="text-[10px] text-muted-foreground">−{depr}% depr.</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Empty state */}
            {visible.length === 0 && (
              <p className="rounded-xl border border-dashed border-border/80 bg-card p-10 text-center text-xs text-muted-foreground">
                No saved assets match these filters.
              </p>
            )}

            {/* Pagination attached to the inventory container */}
              <Pagination label="Assets" page={Math.min(page, pages)} rows={pageSize} total={filtered.length}
                onPage={setPage} onRows={rows => { setPageSize(rows); setPage(1) }} />
            </div>
          </section>

          {/* ── Right sidebar: Quick Inspection ── */}
          <aside className="assets-inspection-panel print:hidden">
            <Card className="py-0 border border-border/80 shadow-xs xl:sticky xl:top-20">
              <CardContent className="p-4 space-y-4">
                {/* Sidebar header */}
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-lg bg-[#F9EBEE] border border-[#f0d5d9]">
                    <ClipboardCheck size={17} className="text-[#940016]" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Quick Inspection</h2>
                    <p className="text-[11px] text-muted-foreground">Physical Audit Log</p>
                  </div>
                </div>

                {canOperate ? (
                  <form onSubmit={quickInspect} className="space-y-3">
                    {/* Asset tag selector */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Asset Tag ID</label>
                      <CustomSelect
                        aria-label="Select asset tag"
                        value={inspection.assetId}
                        onChange={val => setInspection(prev => ({ ...prev, assetId: val }))}
                        options={assets.filter(a => a.status !== 'Retired').map(a => ({
                          value: a.id,
                          label: `${a.assetCode} · ${a.name}`,
                        }))}
                        placeholder="Select saved asset…"
                        containerClassName="relative w-full text-left"
                        className="h-9 w-full bg-white border-slate-200/90 text-xs"
                        menuWidthClass="w-full min-w-full"
                      />
                    </div>

                    {/* Condition status */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Condition Status</label>
                      <CustomSelect
                        aria-label="Condition status"
                        value={inspection.condition}
                        onChange={val => setInspection(prev => ({ ...prev, condition: val }))}
                        options={[
                          { value: 'Working', label: 'Good Condition', dot: 'bg-sky-500' },
                          { value: 'Needs Maintenance', label: 'Needs Servicing', dot: 'bg-rose-500' },
                          { value: 'Excellent', label: 'Excellent', dot: 'bg-emerald-500' },
                          { value: 'Out of Service', label: 'Out of Service', dot: 'bg-slate-400' },
                        ]}
                        placeholder="Select condition…"
                        containerClassName="relative w-full text-left"
                        className="h-9 w-full bg-white border-slate-200/90 text-xs"
                        menuWidthClass="w-full min-w-full"
                      />
                    </div>

                    {/* Inspection remarks */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inspection Note / Remarks</label>
                      <textarea
                        required
                        className="min-h-[5rem] w-full rounded-lg border border-input bg-background p-2.5 text-xs shadow-xs outline-none focus:ring-1 focus:ring-ring"
                        value={inspection.remarks}
                        onChange={e => setInspection({ ...inspection, remarks: e.target.value })}
                        placeholder="Describe the asset's current physical state…"
                      />
                    </div>

                    {/* Last inspection note (if asset selected) */}
                    {lastInspect && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
                        <p className="font-semibold mb-0.5">Last inspection note:</p>
                        <p className="italic">{lastInspect.remarks}</p>
                      </div>
                    )}

                    {inspectFeedback && (
                      <p className={`rounded-lg px-3 py-2 text-[11px] font-medium ${inspectFeedback.includes('saved') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {inspectFeedback}
                      </p>
                    )}

                    <Button type="submit" size="sm" className="h-9 w-full gap-1.5 bg-[#940016] hover:bg-[#72000E] text-white shadow-sm" disabled={inspectBusy}>
                      <Wrench size={14} />{inspectBusy ? 'Saving…' : 'Update Asset Status'}
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-muted-foreground">Inventory is read-only for your current role.</p>
                )}

                {/* Maintenance alert panel — assets needing work */}
                {assets.filter(a => a.status === 'Maintenance').length > 0 && (
                  <div className="mt-1 rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                      <Wrench size={12} /> Maintenance Required
                    </p>
                    {assets.filter(a => a.status === 'Maintenance').map(a => (
                      <div key={a.id} className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-rose-500" />
                        <div className="min-w-0">
                          <p className="text-[10px] leading-relaxed font-medium text-slate-700"><span className="font-semibold text-rose-700">{a.assetCode}</span> — {a.name}</p>
                          <p className="text-[10px] leading-relaxed text-slate-500">{a.location || 'Unassigned'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* ── Register / Edit Asset dialog ── */}
        <Dialog open={dialog === 'form'} onOpenChange={open => !open && setDialog(null)}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected ? 'Edit Asset' : 'Register New Asset'}</DialogTitle>
              <DialogDescription>Save branch-owned inventory details. Automatic depreciation is unavailable.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <AssetForm value={form} onChange={setForm} editing={Boolean(selected)} />
              {dialogError && <p role="alert" className="text-sm text-destructive">{dialogError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
                <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Asset'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Asset details dialog ── */}
        <Dialog open={dialog === 'details'} onOpenChange={open => !open && setDialog(null)}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected?.assetCode} · {selected?.name}</DialogTitle>
              <DialogDescription>Saved asset details, assignment and maintenance history.</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 text-sm">
                <div className="grid gap-2 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
                  <p><b>Category:</b> {selected.category}</p>
                  <p><b>Status:</b> {selected.status}</p>
                  <p><b>Condition:</b> {selected.condition}</p>
                  <p><b>Location:</b> {selected.location || 'Unassigned'}</p>
                  <p><b>Assigned:</b> {selected.assignedToName || 'Nobody'}</p>
                  <p><b>Book Value:</b> {selected.bookValue == null ? 'Unavailable' : money(selected.bookValue)}</p>
                  <p><b>Purchase Cost:</b> {money(selected.purchaseCost)}</p>
                  <p><b>Purchase Date:</b> {fmtDate(selected.purchaseDate)}</p>
                  {selected.serialNumber && <p><b>Serial #:</b> {selected.serialNumber}</p>}
                  {selected.supplier    && <p><b>Supplier:</b> {selected.supplier}</p>}
                  {selected.notes && <p className="sm:col-span-2"><b>Notes:</b> {selected.notes}</p>}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Maintenance History</h3>
                  {selected.maintenanceHistory.length ? selected.maintenanceHistory.map(h => (
                    <div key={h.id} className="mt-2 rounded-lg border p-3">
                      <p className="font-medium">{fmtDate(h.date)} — {h.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.condition} · {h.cost == null ? 'Cost not recorded' : money(h.cost)}
                        {h.nextServiceDate ? ` · Next: ${fmtDate(h.nextServiceDate)}` : ''}
                      </p>
                    </div>
                  )) : (
                    <p className="text-muted-foreground">No maintenance records saved.</p>
                  )}
                </div>
                {canManage && selected.status !== 'Retired' && (
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    {canOperate && <Button size="sm" onClick={() => openAction(selected, 'assign')}>{selected.assignedToId ? 'Reassign' : 'Assign Staff'}</Button>}
                    {canOperate && selected.assignedToId && <Button size="sm" variant="outline" onClick={() => unassign(selected)}>Unassign</Button>}
                    {canOperate && <Button size="sm" variant="outline" onClick={() => openAction(selected, 'maintenance')}>Log Maintenance</Button>}
                    <Button size="sm" variant="outline" onClick={() => openEdit(selected)}>Edit Details</Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Assign / Maintenance dialog ── */}
        <Dialog open={dialog === 'assign' || dialog === 'maintenance'} onOpenChange={open => !open && setDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialog === 'assign' ? 'Assign Asset' : 'Log Maintenance'}</DialogTitle>
              <DialogDescription>{selected?.assetCode} · {selected?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={saveAction} className="grid gap-3">
              {dialog === 'assign' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Branch Staff</label>
                    <CustomSelect
                      aria-label="Select staff"
                      value={action.assignedToId}
                      onChange={val => setAction({ ...action, assignedToId: val })}
                      options={staff.map(u => ({ value: u.id, label: u.name }))}
                      placeholder="Select staff…"
                      containerClassName="relative w-full text-left"
                      className="h-10 w-full bg-white"
                      menuWidthClass="w-full min-w-full"
                    />
                  </div>
                  <label className="text-sm font-medium">Location<Input value={action.location} onChange={e => setAction({ ...action, location: e.target.value })} /></label>
                </>
              ) : (
                <>
                  <label className="text-sm font-medium">Service Date<Input required type="date" value={action.date} onChange={e => setAction({ ...action, date: e.target.value })} /></label>
                  <label className="text-sm font-medium">Description<textarea required className={`${field} min-h-20 py-2`} value={action.description} onChange={e => setAction({ ...action, description: e.target.value })} /></label>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Resulting Condition</label>
                    <CustomSelect
                      aria-label="Resulting condition"
                      value={action.condition}
                      onChange={val => setAction({ ...action, condition: val })}
                      options={[
                        { value: 'Excellent', label: 'Excellent', dot: 'bg-emerald-500' },
                        { value: 'Working', label: 'Good Condition', dot: 'bg-sky-500' },
                        { value: 'Needs Maintenance', label: 'Needs Servicing', dot: 'bg-rose-500' },
                        { value: 'Out of Service', label: 'Out of Service', dot: 'bg-slate-400' },
                      ]}
                      placeholder="Select condition…"
                      containerClassName="relative w-full text-left"
                      className="h-10 w-full bg-white"
                      menuWidthClass="w-full min-w-full"
                    />
                  </div>
                  <label className="text-sm font-medium">Recorded Cost (optional)<Input min="0" type="number" value={action.cost} onChange={e => setAction({ ...action, cost: e.target.value })} /></label>
                  <label className="text-sm font-medium">Next Service Date<Input type="date" value={action.nextServiceDate} onChange={e => setAction({ ...action, nextServiceDate: e.target.value })} /></label>
                </>
              )}
              {dialogError && <p role="alert" className="text-sm text-destructive">{dialogError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
                <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}
