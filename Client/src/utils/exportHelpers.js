/**
 * Purpose: Will define export Helpers for the utils area of the Academy frontend.
 * Module: utils
 * Status: Implemented — safe client-side CSV serialization and download.
 */

function csvCell(value) {
  let text = value == null ? '' : String(value)
  if (typeof value === 'string' && /^[\s\uFEFF]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function serializeCsv(headers, rows) {
  return [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadCsv(filename, headers, rows) {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('CSV export is unavailable in this browser.')
  }

  const safeFilename = filename.replace(/[\\/:*?"<>|]+/g, '-')
  const blob = new Blob([`\uFEFF${serializeCsv(headers, rows)}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeFilename
  link.tabIndex = -1
  link.setAttribute('aria-hidden', 'true')
  link.style.position = 'fixed'
  link.style.left = '-10000px'
  document.body.append(link)

  try {
    link.click()
  } finally {
    window.setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(url)
    }, 1000)
  }
}
