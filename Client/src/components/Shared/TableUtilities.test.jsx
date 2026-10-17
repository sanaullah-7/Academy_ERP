import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import {
  useTableSelection,
  useColumnVisibility,
  ColumnVisibilityDropdown,
  TableToolbarActions,
  BulkActionBar
} from './TableUtilities.jsx'

describe('TableUtilities hooks and components', () => {
  const sampleItems = [
    { id: '1', name: 'Item One' },
    { id: '2', name: 'Item Two' },
    { id: '3', name: 'Item Three' }
  ]

  it('manages row selection and select all correctly', () => {
    const { result } = renderHook(() => useTableSelection(sampleItems))
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.isAllSelected).toBe(false)

    // Select one
    act(() => {
      result.current.toggleSelect('1')
    })
    expect(result.current.isSelected('1')).toBe(true)
    expect(result.current.isSelected('2')).toBe(false)
    expect(result.current.selectedCount).toBe(1)
    expect(result.current.isSomeSelected).toBe(true)

    // Select All
    act(() => {
      result.current.toggleSelectAll()
    })
    expect(result.current.isAllSelected).toBe(true)
    expect(result.current.selectedCount).toBe(3)

    // Deselect All
    act(() => {
      result.current.toggleSelectAll()
    })
    expect(result.current.isAllSelected).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })

  it('correctly handles getExportScope for zero selection, 1, 2, and all-matching across pagination', () => {
    const allItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
      { id: '4', name: 'Item 4' },
      { id: '5', name: 'Item 5' }
    ]
    const pageItems = [allItems[0], allItems[1]] // 2 items on page 1

    const { result } = renderHook(() => useTableSelection(allItems, item => item.id, pageItems))

    // 1. Zero selection: exports all 5 matching records across all pages
    const zeroScope = result.current.getExportScope()
    expect(zeroScope.isFilteredAll).toBe(true)
    expect(zeroScope.count).toBe(5)
    expect(zeroScope.items).toEqual(allItems)
    expect(zeroScope.summary).toBe('All 5 matching records')

    // 2. Exactly 1 row selected
    act(() => {
      result.current.toggleSelect('1')
    })
    const oneScope = result.current.getExportScope()
    expect(oneScope.isFilteredAll).toBe(false)
    expect(oneScope.count).toBe(1)
    expect(oneScope.items).toEqual([allItems[0]])
    expect(oneScope.summary).toBe('1 selected record')

    // 3. Exactly 2 rows selected
    act(() => {
      result.current.toggleSelect('2')
    })
    const twoScope = result.current.getExportScope()
    expect(twoScope.isFilteredAll).toBe(false)
    expect(twoScope.count).toBe(2)
    expect(twoScope.items).toEqual([allItems[0], allItems[1]])
    expect(twoScope.summary).toBe('2 selected records')

    // 4. Select all matching across pagination
    act(() => {
      result.current.selectAllMatching()
    })
    const allMatchingScope = result.current.getExportScope()
    expect(allMatchingScope.isFilteredAll).toBe(false)
    expect(allMatchingScope.count).toBe(5)
    expect(allMatchingScope.items).toEqual(allItems)
    expect(allMatchingScope.summary).toBe('5 selected records')
  })

  it('handles column visibility toggling and locked columns', () => {
    const columns = [
      { key: 'name', label: 'Name', required: true },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount', defaultVisible: false }
    ]
    const { result } = renderHook(() => useColumnVisibility(columns))
    expect(result.current.isVisible('name')).toBe(true)
    expect(result.current.isVisible('status')).toBe(true)
    expect(result.current.isVisible('amount')).toBe(false)

    // Cannot toggle required column
    act(() => {
      result.current.toggleColumn('name')
    })
    expect(result.current.isVisible('name')).toBe(true)

    // Toggle non-required column
    act(() => {
      result.current.toggleColumn('status')
    })
    expect(result.current.isVisible('status')).toBe(false)
  })

  it('renders TableToolbarActions with refresh, print, and column toggle', () => {
    const onRefresh = vi.fn()
    const onPrint = vi.fn()
    const onExportCsv = vi.fn()
    const onToggleColumn = vi.fn()

    render(
      <TableToolbarActions
        onRefresh={onRefresh}
        onPrint={onPrint}
        onExportCsv={onExportCsv}
        columns={[{ key: 'name', label: 'Name' }]}
        visibleColumns={{ name: true }}
        onToggleColumn={onToggleColumn}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh table data' }))
    expect(onRefresh).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Print or save PDF' }))
    expect(onPrint).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(onExportCsv).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle column visibility' }))
    expect(screen.getByRole('dialog', { name: 'Customize columns menu' })).toBeInTheDocument()
  })

  it('renders BulkActionBar when rows are selected', () => {
    const onClear = vi.fn()
    const onExport = vi.fn()

    const { rerender } = render(
      <BulkActionBar selectedCount={0} totalCount={10} onClear={onClear} />
    )
    expect(screen.queryByRole('region', { name: 'Bulk actions toolbar' })).not.toBeInTheDocument()

    rerender(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onClear={onClear}
        onExportSelected={onExport}
        deleteDisabledMessage="Bulk delete is prohibited on this ledger"
      />
    )
    expect(screen.getByRole('region', { name: 'Bulk actions toolbar' })).toBeInTheDocument()
    expect(screen.getByText(/3 of 10 records selected/i)).toBeInTheDocument()
    expect(screen.getByText('Bulk Delete Restricted')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
