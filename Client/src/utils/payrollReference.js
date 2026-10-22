// Compact display reference only; stored identifiers remain authoritative.
export function payrollReference(value, prefix = 'PAY') {
  if (!value) return '—'
  let hash = 2166136261
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `${prefix}-${100 + ((hash >>> 0) % 900)}`
}

export function paymentReference(payment) {
  const reference = String(payment.transactionReference || '').trim()
  return /^\d{2,3}$/.test(reference)
    ? reference
    : payrollReference(payment.id || reference, 'TX')
}
