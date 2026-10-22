export function scheduleIdleTask(task, timeout = 1500) {
  if (typeof window.requestIdleCallback === 'function' && typeof window.cancelIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout })
    return () => window.cancelIdleCallback(id)
  }

  const id = window.setTimeout(task, 0)
  return () => window.clearTimeout(id)
}
