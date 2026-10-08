import { describe, it, expect } from 'vitest'
import { buildClickUrl } from './pushClickUrl'

describe('buildClickUrl (service worker copy)', () => {
  it('adds ?n= to a link without a query', () => {
    expect(buildClickUrl('/groups/abc', 'n1')).toBe('/groups/abc?n=n1')
  })
  it('adds &n= to a link with a query', () => {
    expect(buildClickUrl('/home?post=p1', 'n1')).toBe('/home?post=p1&n=n1')
  })
  it('defaults an empty link to /home', () => {
    expect(buildClickUrl('', 'n1')).toBe('/home?n=n1')
  })
})
