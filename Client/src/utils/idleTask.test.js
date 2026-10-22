import { afterEach, describe, expect, it, vi } from 'vitest'
import { scheduleIdleTask } from './idleTask.js'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  delete window.requestIdleCallback
  delete window.cancelIdleCallback
})

describe('scheduleIdleTask', () => {
  it('defers work to browser idle time when available', () => {
    const task = vi.fn()
    const cancel = vi.fn()
    window.requestIdleCallback = vi.fn(() => 17)
    window.cancelIdleCallback = cancel

    const dispose = scheduleIdleTask(task, 900)

    expect(window.requestIdleCallback).toHaveBeenCalledWith(task, { timeout: 900 })
    dispose()
    expect(cancel).toHaveBeenCalledWith(17)
  })

  it('uses a cancellable timer fallback', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    vi.stubGlobal('cancelIdleCallback', undefined)
    const task = vi.fn()
    const dispose = scheduleIdleTask(task)

    dispose()
    vi.runAllTimers()
    expect(task).not.toHaveBeenCalled()
  })
})
