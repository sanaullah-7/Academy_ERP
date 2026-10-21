export function formatBatchDuration(months, fallback = 'Not configured') {
  return Number.isSafeInteger(months) && months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : fallback
}
