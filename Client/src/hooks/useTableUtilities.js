import { useState, useMemo, useCallback } from 'react'

/**
 * Hook to manage multi-row selection in tables with full pagination awareness.
 * @param {Array} allItems - All filtered matching items across all pages.
 * @param {Function} getId - ID getter.
 * @param {Array|null} pageItems - Items currently visible on this pagination page (optional).
 */
export function useTableSelection(allItems = [], getId = (item) => item?.id, pageItems = null) {
  const [selectedIds, setSelectedIds] = useState([])

  const allItemIds = useMemo(() => (allItems || []).map(getId), [allItems, getId])
  const pageItemIds = useMemo(() => (pageItems || allItems || []).map(getId), [pageItems, allItems, getId])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(current => {
      if (current.includes(id)) {
        return current.filter(x => x !== id)
      }
      return [...current, id]
    })
  }, [])

  // Toggle select items on the current page
  const toggleSelectPage = useCallback(() => {
    setSelectedIds(current => {
      const allPageSelected = pageItemIds.length > 0 && pageItemIds.every(id => current.includes(id))
      if (allPageSelected) {
        return current.filter(id => !pageItemIds.includes(id))
      }
      const next = new Set([...current, ...pageItemIds])
      return Array.from(next)
    })
  }, [pageItemIds])

  // Select all matching records across all pages
  const selectAllMatching = useCallback(() => {
    setSelectedIds(allItemIds)
  }, [allItemIds])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const isPageSelected = useMemo(() => {
    return pageItemIds.length > 0 && pageItemIds.every(id => selectedSet.has(id))
  }, [pageItemIds, selectedSet])

  const isAllMatchingSelected = useMemo(() => {
    return allItemIds.length > 0 && allItemIds.every(id => selectedSet.has(id))
  }, [allItemIds, selectedSet])

  const isSomePageSelected = useMemo(() => {
    return pageItemIds.some(id => selectedSet.has(id)) && !isPageSelected
  }, [pageItemIds, selectedSet, isPageSelected])

  const isSelected = useCallback((id) => selectedSet.has(id), [selectedSet])

  const selectedItems = useMemo(() => {
    return (allItems || []).filter(item => selectedSet.has(getId(item)))
  }, [allItems, selectedSet, getId])

  // Scope helper: returns selected items if count > 0, otherwise all matching items
  const getExportScope = useCallback(() => {
    if (selectedIds.length > 0) {
      return {
        items: selectedItems,
        count: selectedItems.length,
        isFilteredAll: false,
        summary: `${selectedItems.length} selected record${selectedItems.length === 1 ? '' : 's'}`,
      }
    }
    return {
      items: allItems || [],
      count: (allItems || []).length,
      isFilteredAll: true,
      summary: `All ${(allItems || []).length} matching record${(allItems || []).length === 1 ? '' : 's'}`,
    }
  }, [selectedIds.length, selectedItems, allItems])

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll: toggleSelectPage, // Backward compatible
    toggleSelectPage,
    selectAllMatching,
    clearSelection,
    isAllSelected: isPageSelected, // Backward compatible for table header checkbox
    isPageSelected,
    isAllMatchingSelected,
    isSomeSelected: isSomePageSelected,
    isSelected,
    selectedItems,
    selectedCount: selectedIds.length,
    totalMatchingCount: (allItems || []).length,
    getExportScope,
  }
}

/**
 * Hook to manage column visibility with optional local storage persistence
 */
export function useColumnVisibility(initialColumns = [], storageKey = null) {
  const [visibleState, setVisibleState] = useState(() => {
    const defaultMap = {}
    initialColumns.forEach(col => {
      defaultMap[col.key] = col.defaultVisible !== false
    })

    if (storageKey && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(`col_pref_${storageKey}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          return { ...defaultMap, ...parsed }
        }
      } catch {
        // Fall back to defaultMap
      }
    }
    return defaultMap
  })

  const isVisible = useCallback((key) => {
    return visibleState[key] !== false
  }, [visibleState])

  const toggleColumn = useCallback((key) => {
    const colDef = initialColumns.find(c => c.key === key)
    if (colDef?.required) return // Cannot hide locked columns

    setVisibleState(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (storageKey && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`col_pref_${storageKey}`, JSON.stringify(next))
        } catch {
          // Ignore
        }
      }
      return next
    })
  }, [initialColumns, storageKey])

  const resetColumns = useCallback(() => {
    const defaultMap = {}
    initialColumns.forEach(col => {
      defaultMap[col.key] = col.defaultVisible !== false
    })
    setVisibleState(defaultMap)
    if (storageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(`col_pref_${storageKey}`)
      } catch {
        // Ignore
      }
    }
  }, [initialColumns, storageKey])

  return {
    visibleColumns: visibleState,
    isVisible,
    toggleColumn,
    resetColumns,
  }
}
