import { describe, expect, it } from 'vitest'
import { serializeWordTable } from './wordExport.js'

describe('Word table export', () => {
  it('creates an Office package and escapes record content in XML', () => {
    const file = serializeWordTable({ title: 'QA Report', branchName: 'QA Campus', filterSummary: 'Selected records', headers: ['Name', 'Amount'], rows: [['A & B <script>', 'Rs 100']] })
    expect([...file.slice(0, 4)]).toEqual([80, 75, 3, 4])
    const text = new TextDecoder().decode(file)
    expect(text).toContain('[Content_Types].xml')
    expect(text).toContain('word/document.xml')
    expect(text).toContain('A &amp; B &lt;script&gt;')
    expect(text).not.toContain('<script>')
    expect(text).toContain('Selected records')
    expect(text).toContain('Rs 100')
    expect(new DataView(file.buffer).getUint32(file.length - 22, true)).toBe(0x06054b50)
  })
})
