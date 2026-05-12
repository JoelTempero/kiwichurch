import type { Timestamp } from 'firebase/firestore'

// Facebook-style account-to-account family link. Two members opt in via
// invite/accept. All state lives on this single doc — no denormalised
// arrays on User to keep in sync.
//
// Doc id is the deterministic sorted-pair join of the two user ids,
// matching the DM convo pattern: [a, b].sort().join('_'). That makes
// the link idempotent (can't accidentally create two between the same
// pair) and rules can verify membership without a query.
export type FamilyLinkStatus = 'pending' | 'accepted'

export interface FamilyLink {
  id: string
  participants: [string, string] // sorted
  senderId: string
  recipientId: string
  senderName?: string
  recipientName?: string
  // Each side maintains its own label, because most family relationships
  // are asymmetric (Father/Son, Mother/Daughter, Aunt/Nephew).
  // senderLabel    = how the sender refers to the recipient
  //                  (visible to the sender on their profile)
  // recipientLabel = how the recipient refers to the sender
  //                  (visible to the recipient on their profile)
  // Sender can preset recipientLabel at invite time as a courtesy.
  senderLabel?: string
  recipientLabel?: string
  // Legacy single-label field kept for back-compat with links that
  // pre-date the per-side labels — used as a fallback for both sides.
  relationship?: string
  status: FamilyLinkStatus
  createdAt: Timestamp | Date
  acceptedAt?: Timestamp | Date
}

export function familyLinkId(a: string, b: string): string {
  return [a, b].sort().join('_')
}

// Returns the label the given viewer should see on this link.
// Falls back to the legacy `relationship` field for old links.
export function labelForViewer(link: FamilyLink, viewerId: string): string {
  if (viewerId === link.senderId) return link.senderLabel || link.relationship || ''
  if (viewerId === link.recipientId) return link.recipientLabel || link.relationship || ''
  return link.relationship || ''
}

// Common relationships exposed via the invite/edit datalist. Free-text
// always accepted so anything missing here works fine.
export const RELATIONSHIP_SUGGESTIONS = [
  'Spouse',
  'Partner',
  'Father',
  'Mother',
  'Parent',
  'Son',
  'Daughter',
  'Child',
  'Brother',
  'Sister',
  'Sibling',
  'Grandfather',
  'Grandmother',
  'Grandparent',
  'Grandson',
  'Granddaughter',
  'Grandchild',
  'Uncle',
  'Aunt',
  'Nephew',
  'Niece',
  'Cousin',
  'In-law',
  'Family',
] as const
