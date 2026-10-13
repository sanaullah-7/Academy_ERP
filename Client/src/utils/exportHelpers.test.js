import { describe, expect, it, vi } from 'vitest'
import { downloadCsv, serializeCsv } from './exportHelpers.js'

describe('CSV exports', () => {
  it('quotes CSV delimiters and neutralizes spreadsheet formulas in text fields', () => {
    expect(serializeCsv(
      ['Name', 'Reference', 'Amount'],
      [['Student, "A"', '=HYPERLINK("https://example.invalid")', -1250]],
    )).toBe('"Name","Reference","Amount"\r\n"Student, ""A""","\'=HYPERLINK(""https://example.invalid"")","-1250"')
    expect(serializeCsv(['Text'], [['  +SUM(A1:A2)']])).toBe('"Text"\r\n"\'  +SUM(A1:A2)"')
  })

  it('downloads UTF-8 CSV using a sanitized filename and releases the object URL', () => {
    vi.useFakeTimers()
    const createObjectURL = vi.fn(() => 'blob:financial-report')
    const revokeObjectURL = vi.fn()
    const downloadedNames = []
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function recordDownload() {
      downloadedNames.push(this.download)
    })
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    try {
      downloadCsv('Demo:North.csv', ['Value'], [['saved']])
      expect(downloadedNames).toEqual(['Demo-North.csv'])
      expect(click).toHaveBeenCalledOnce()
      expect(createObjectURL).toHaveBeenCalledOnce()
      expect(document.querySelector('a[download="Demo-North.csv"]')).not.toBeNull()

      vi.runAllTimers()
      expect(document.querySelector('a[download="Demo-North.csv"]')).toBeNull()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:financial-report')
    } finally {
      click.mockRestore()
      vi.unstubAllGlobals()
      vi.useRealTimers()
    }
  })
})
