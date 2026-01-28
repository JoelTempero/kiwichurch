import type { Timestamp } from 'firebase/firestore'

export type NotificationType =
  | 'event_reminder'
  | 'event_update'
  | 'new_post'
  | 'new_comment'
  | 'mention'
  | 'group_invite'
  | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Timestamp | Date
}
