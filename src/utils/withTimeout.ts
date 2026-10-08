/**
 * Best-effort await: resolves 'done' / 'failed' / 'timeout', never rejects or
 * hangs. For cleanup that must not block the user — e.g. Firestore writes with
 * persistentLocalCache only resolve on server ack, so offline they never settle.
 */
export function withTimeout(promise: Promise<unknown>, ms: number): Promise<'done' | 'failed' | 'timeout'> {
  return Promise.race([
    promise.then(() => 'done' as const, () => 'failed' as const),
    new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ])
}
