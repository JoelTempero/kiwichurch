import { describe, it, expect } from 'vitest'
import { resolvePushStatus } from './pushStatus'

const base = { supported: true, ios: false, standalone: false, permission: 'default' as NotificationPermission, hasToken: false }

describe('resolvePushStatus', () => {
  it('iPhone outside the home-screen app needs install (even though push looks unsupported there)', () => {
    expect(resolvePushStatus({ ...base, ios: true, standalone: false, supported: false })).toBe('needs-install')
  })
  it('installed iPhone with push support behaves normally', () => {
    expect(resolvePushStatus({ ...base, ios: true, standalone: true })).toBe('off')
  })
  it('unsupported browsers are unsupported', () => {
    expect(resolvePushStatus({ ...base, supported: false })).toBe('unsupported')
  })
  it('denied permission is blocked', () => {
    expect(resolvePushStatus({ ...base, permission: 'denied' })).toBe('blocked')
  })
  it('granted with a saved token is on', () => {
    expect(resolvePushStatus({ ...base, permission: 'granted', hasToken: true })).toBe('on')
  })
  it('granted without a saved token is off (needs enabling on this device)', () => {
    expect(resolvePushStatus({ ...base, permission: 'granted', hasToken: false })).toBe('off')
  })
  it('default permission is off', () => {
    expect(resolvePushStatus(base)).toBe('off')
  })
})
