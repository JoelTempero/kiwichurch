import { describe, it, expect } from 'vitest'
import { withTimeout } from './withTimeout'

describe('withTimeout', () => {
  it('settles after the timeout when the promise never resolves (offline Firestore delete)', async () => {
    const never = new Promise<void>(() => {})
    const start = Date.now()
    await expect(withTimeout(never, 50)).resolves.toBe('timeout')
    expect(Date.now() - start).toBeGreaterThanOrEqual(45)
  })
  it('passes through a fast result', async () => {
    await expect(withTimeout(Promise.resolve(), 1000)).resolves.toBe('done')
  })
  it('swallows rejections (best-effort cleanup)', async () => {
    await expect(withTimeout(Promise.reject(new Error('x')), 1000)).resolves.toBe('failed')
  })
})
