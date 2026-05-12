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
  status: FamilyLinkStatus
  createdAt: Timestamp | Date
  acceptedAt?: Timestamp | Date
}

export function familyLinkId(a: string, b: string): string {
  return [a, b].sort().join('_')
}
