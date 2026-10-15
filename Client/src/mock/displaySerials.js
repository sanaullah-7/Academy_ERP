import { formatAdmissionId } from '../lib/admissionIds.js'

// Persisted array order is insertion order: updates retain positions, deletion closes gaps.
// Serial fields are response-only presentation data, never stored or used as lookup keys.
export function createDisplayProjector(data) {
  const serials = {}
  for (const collection of ['admissions', 'students']) {
    const counts = new Map()
    serials[collection] = new Map()
    for (const record of data[collection]) {
      const next = (counts.get(record.branchId) ?? 0) + 1
      counts.set(record.branchId, next)
      serials[collection].set(record.id, next)
    }
  }
  return (collection, record) => {
    if (!serials[collection]) return { ...record }
    const displaySerial = serials[collection].get(record.id)
    const projected = { ...record, displaySerial }
    if (collection === 'admissions') projected.displayAdmissionId = formatAdmissionId(displaySerial)
    if (collection === 'students' && record.admissionId != null) {
      projected.admissionDisplaySerialId = formatAdmissionId(serials.admissions.get(record.admissionId))
    }
    return projected
  }
}
