import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * CustomSelect: A compact, accessible dropdown select component with tight spacing,
 * TSA styling, and keyboard navigation.
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  'aria-label': ariaLabel,
  className = '',
  menuWidthClass = 'min-w-[190px] max-w-[280px]',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Normalize options array
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: String(opt), label: String(opt) }
    }
    return {
      value: String(opt.value),
      label: opt.label || String(opt.value),
      count: opt.count,
    }
  })

  const selectedOption = normalizedOptions.find(opt => opt.value === String(value))
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return undefined
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  // Handle escape key
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(v => !v)}
        className={`h-9 inline-flex items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-xs font-medium text-slate-800 shadow-2xs hover:bg-slate-50/80 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${className}`}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          size={13}
          className={`text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute left-0 top-full z-50 mt-1 w-max ${menuWidthClass} rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in-0 zoom-in-95`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-2.5 py-1.5 text-xs text-muted-foreground">No options available</div>
          ) : (
            normalizedOptions.map(opt => {
              const isSelected = opt.value === String(value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1 text-xs text-left rounded-md transition-colors cursor-pointer my-0.5 ${
                    isSelected
                      ? 'bg-[#F9EBEE] text-[#940016] font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {opt.count != null && (
                      <span className="text-[10px] text-slate-400 font-mono">({opt.count})</span>
                    )}
                    {isSelected && <Check size={12} className="text-[#940016]" />}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
