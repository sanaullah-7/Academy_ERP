const encode = value => new TextEncoder().encode(value)
const escapeXml = value => [...String(value ?? '')].filter(char => {
  const code = char.codePointAt(0)
  return [9, 10, 13].includes(code) || (code >= 32 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) && code !== 0xfffe && code !== 0xffff)
}).join('').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
const paragraph = value => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(value).replaceAll('\n', '</w:t><w:br/><w:t xml:space="preserve">')}</w:t></w:r></w:p>`

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const ACADEMY_TITLE = 'THE SCHOLAR COACHING ACADEMY'
const ACADEMY_TAGLINE = 'Official Management & Academic Information System'

const heading1 = text => `<w:p><w:pPr><w:spacing w:before="60" w:after="40"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="940016"/><w:sz w:val="32"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
const subtitle = text => `<w:p><w:pPr><w:spacing w:after="80"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
const metaParagraph = text => `<w:p><w:pPr><w:spacing w:after="100"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
const filterParagraph = text => `<w:p><w:pPr><w:spacing w:after="180"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`

// Minimal uncompressed ZIP package containing genuine Office Open XML files.
export function serializeWordTable({ title, branchName, filterSummary, headers, rows }) {
  const headerRow = values => `<w:tr><w:trPr><w:tblHeader/></w:trPr>${values.map(value => `<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="940016"/><w:tcW w:w="0" w:type="auto"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`
  const row = values => `<w:tr>${values.map(value => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr>${paragraph(value)}</w:tc>`).join('')}</w:tr>`
  const files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${heading1(ACADEMY_TITLE)}${subtitle(ACADEMY_TAGLINE)}${metaParagraph(`${title} — Campus: ${branchName || 'The Scholar Coaching Academy'}`)}${filterParagraph(`Scope: ${filterSummary || 'All Records'} | Generated: ${new Date().toLocaleDateString('en-PK')}`)}<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr><w:tblGrid>${headers.map(() => '<w:gridCol w:w="2000"/>').join('')}</w:tblGrid>${headerRow(headers)}${rows.map(row).join('')}</w:tbl><w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/></w:sectPr></w:body></w:document>`
  }
  const local = [], central = []
  let offset = 0, centralSize = 0
  for (const [name, text] of Object.entries(files)) {
    const path = encode(name), body = encode(text), crc = crc32(body)
    const header = new Uint8Array(30 + path.length), view = new DataView(header.buffer)
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true)
    view.setUint32(14, crc, true); view.setUint32(18, body.length, true); view.setUint32(22, body.length, true)
    view.setUint16(26, path.length, true); header.set(path, 30)
    const directory = new Uint8Array(46 + path.length), entry = new DataView(directory.buffer)
    entry.setUint32(0, 0x02014b50, true); entry.setUint16(4, 20, true); entry.setUint16(6, 20, true)
    entry.setUint32(16, crc, true); entry.setUint32(20, body.length, true); entry.setUint32(24, body.length, true)
    entry.setUint16(28, path.length, true); entry.setUint32(42, offset, true); directory.set(path, 46)
    local.push(header, body); central.push(directory)
    offset += header.length + body.length; centralSize += directory.length
  }
  const end = new Uint8Array(22), view = new DataView(end.buffer)
  view.setUint32(0, 0x06054b50, true); view.setUint16(8, central.length, true); view.setUint16(10, central.length, true)
  view.setUint32(12, centralSize, true); view.setUint32(16, offset, true)
  const result = new Uint8Array(offset + centralSize + end.length)
  let cursor = 0
  for (const part of [...local, ...central, end]) { result.set(part, cursor); cursor += part.length }
  return result
}

export function downloadWordTable(filename, options) {
  const blob = new Blob([serializeWordTable(options)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename.replace(/[\\/:*?"<>|]+/g, '-'); link.hidden = true
  document.body.append(link)
  try { link.click() } finally { window.setTimeout(() => { link.remove(); URL.revokeObjectURL(url) }, 1000) }
}
