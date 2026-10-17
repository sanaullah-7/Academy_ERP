/**
 * Purpose: Reusable table utilities for Academy ERP tables.
 * Provides: Selection & Bulk Actions, Column Visibility Toggle, Refresh Action, CSV/PDF Export.
 * Module: Shared UI Utilities
 */

import { useEffect, useRef, useState } from 'react'
import {
  RotateCw,
  LayoutGrid,
  Download,
  Filter,
  Plus,
  FileSpreadsheet,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { Button } from '../ui/button.jsx'

/**
 * Column visibility popover dropdown (Matches Picture 1 & Picture 3 reference)
 */
export function ColumnVisibilityDropdown({ columns = [], visibleColumns = {}, onToggleColumn, onReset }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        aria-label="Toggle column visibility"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        title="Show / Hide Columns"
        className="grid size-8 place-items-center rounded-full border border-sky-300 bg-sky-50 text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-100/80 focus-visible:outline-2 focus-visible:outline-ring cursor-pointer shadow-2xs"
      >
        <LayoutGrid size={15} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Customize columns menu"
          className="absolute right-0 z-[100] mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 animate-in fade-in-50 zoom-in-95"
          style={{ backgroundColor: '#ffffff', opacity: 1 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              SHOW/HIDE COLUMN
            </span>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {columns.map(col => {
              const checked = visibleColumns[col.key] !== false
              return (
                <label
                  key={col.key}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${col.required ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      disabled={col.required}
                      checked={checked}
                      onChange={() => onToggleColumn(col.key)}
                      className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{col.label}</span>
                  </span>
                  {col.required && <span className="text-[10px] text-muted-foreground italic font-normal">Fixed</span>}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Toolbar Actions Cluster:
 * - Purple Filter button
 * - Optional Green Add button
 * - Circular Refresh button
 * - Circular Column Visibility toggle
 * - Circular/Red PDF button (Direct downloadable PDF)
 * - Circular/Emerald CSV Export button
 * - Optional Print button
 */
export function TableToolbarActions({
  onRefresh,
  isRefreshing = false,
  columns = [],
  visibleColumns = {},
  onToggleColumn,
  onResetColumns,
  onPrint,
  onExportPdf,
  onExportCsv,
  onToggleFilter,
  isFilterActive = false,
  onAdd,
  showFilter = true,
  showColumns = true,
  showPrint = true,
  showExport = true,
  exportScopeSummary = '',
  className = '',
}) {
  const pdfHandler = onExportPdf || onPrint

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {showFilter && onToggleFilter && (
        <button
          type="button"
          aria-label="Toggle filters"
          title="Toggle Filters"
          onClick={onToggleFilter}
          className={`grid size-8 place-items-center rounded-full border transition-colors cursor-pointer shadow-2xs ${
            isFilterActive
              ? 'border-purple-400 bg-purple-100 text-purple-700'
              : 'border-purple-200 bg-purple-50 text-purple-600 hover:border-purple-300 hover:bg-purple-100/80'
          }`}
        >
          <Filter size={14} />
        </button>
      )}

      {onAdd && (
        <button
          type="button"
          aria-label="Add new record"
          title="Add New"
          onClick={onAdd}
          className="grid size-8 place-items-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 transition-colors hover:border-emerald-400 hover:bg-emerald-100/80 cursor-pointer shadow-2xs"
        >
          <Plus size={16} />
        </button>
      )}

      {onRefresh && (
        <button
          type="button"
          aria-label="Refresh table data"
          title="Refresh data"
          disabled={isRefreshing}
          onClick={onRefresh}
          className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          <RotateCw size={14} className={isRefreshing ? 'animate-spin text-primary' : ''} />
        </button>
      )}

      {showColumns && columns.length > 0 && onToggleColumn && (
        <ColumnVisibilityDropdown
          columns={columns}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
          onReset={onResetColumns}
        />
      )}

      {showPrint && pdfHandler && (
        <button
          type="button"
          aria-label="Print or save PDF"
          title={exportScopeSummary ? `Download PDF (${exportScopeSummary})` : 'Download PDF Document'}
          onClick={pdfHandler}
          className="grid size-8 place-items-center rounded-full border border-rose-300 bg-rose-50 text-rose-600 transition-colors hover:border-rose-400 hover:bg-rose-100/80 cursor-pointer shadow-2xs"
        >
          <span className="flex items-center justify-center rounded bg-rose-600 px-1 py-0.5 text-[9px] font-black tracking-tight text-white leading-none">
            PDF
          </span>
        </button>
      )}

      {showExport && onExportCsv && (
        <button
          type="button"
          aria-label="Export CSV"
          title={exportScopeSummary ? `Export CSV (${exportScopeSummary})` : 'Export CSV'}
          onClick={onExportCsv}
          className="grid size-8 place-items-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 transition-colors hover:border-emerald-400 hover:bg-emerald-100/80 cursor-pointer shadow-2xs"
        >
          <FileSpreadsheet size={15} />
        </button>
      )}
    </div>
  )
}

/**
 * Bulk Action Floating / Inline Bar (Screenshot 2 inspiration)
 * Appears when rows are selected, with selected count, safe actions, and clear button.
 */
export function BulkActionBar({
  selectedCount = 0,
  totalCount = 0,
  onClear,
  onSelectAllMatching,
  isAllMatchingSelected = false,
  onExportCsv,
  onExportPdf,
  onExportSelected,
  onDeleteSelected,
  deleteDisabledMessage = '',
  extraActions = null,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (selectedCount === 0) return null

  return (
    <div
      role="region"
      aria-label="Bulk actions toolbar"
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#940016]/20 bg-[#F9EBEE]/80 px-3 py-2 text-xs text-[#940016] shadow-sm animate-in fade-in-50 slide-in-from-top-1"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#940016] text-[10px] font-bold text-white">
          {selectedCount}
        </span>
        <span className="font-semibold text-gray-900">
          {selectedCount} of {totalCount} record{selectedCount === 1 ? '' : 's'} selected
        </span>

        {onSelectAllMatching && totalCount > selectedCount && !isAllMatchingSelected && (
          <button
            type="button"
            onClick={onSelectAllMatching}
            className="text-[11px] font-semibold text-[#940016] hover:underline cursor-pointer bg-white/70 px-2 py-0.5 rounded border border-[#940016]/30"
          >
            Select all {totalCount} matching records
          </button>
        )}

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {onExportCsv && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExportCsv}
            className="h-7 gap-1 px-2.5 text-xs font-semibold bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet size={13} />
            Export CSV ({selectedCount})
          </Button>
        )}

        {onExportPdf && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExportPdf}
            className="h-7 gap-1 px-2.5 text-xs font-semibold bg-white text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            Export PDF ({selectedCount})
          </Button>
        )}

        {!onExportCsv && !onExportPdf && onExportSelected && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExportSelected}
            className="h-7 gap-1 px-2.5 text-xs font-medium bg-white text-gray-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            Export Selected ({selectedCount})
          </Button>
        )}

        {extraActions}

        {onDeleteSelected && !deleteDisabledMessage && (
          confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-destructive">Confirm delete?</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-7 px-2 text-xs cursor-pointer"
                onClick={() => {
                  setConfirmDelete(false)
                  onDeleteSelected()
                }}
              >
                Yes, Delete ({selectedCount})
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs bg-white cursor-pointer"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              className="h-7 gap-1 px-2.5 text-xs font-semibold text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10 cursor-pointer shadow-2xs"
            >
              <Trash2 size={13} />
              Delete Selected ({selectedCount})
            </Button>
          )
        )}

        {deleteDisabledMessage && (
          <span
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground border border-border/60"
            title={deleteDisabledMessage}
          >
            <ShieldAlert size={12} className="text-amber-600" />
            Bulk Delete Restricted
          </span>
        )}
      </div>
    </div>
  )
}
