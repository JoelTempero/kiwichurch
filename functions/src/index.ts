import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { setGlobalOptions, logger } from 'firebase-functions/v2'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { shouldSend, computeBadge, deadTokens, buildPayload, type NotificationLike, type PushRecipient } from './pushLogic'

initializeApp()
// Firestore lives in nam5 (US multi-region) — the trigger must run alongside it.
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

/**
 * Every notification doc written anywhere in the app becomes a push to each
 * of the recipient's registered devices. Failures are logged, never thrown:
 * the notification doc (and the in-app bell) must not depend on push.
 */
export const onNotificationCreated = onDocumentCreated('notifications/{id}', async (event) => {
  const snap = event.data
  if (!snap) return
  const id = event.params.id
  const n = snap.data() as NotificationLike & { userId?: string }
  if (!n?.userId) return

  const db = getFirestore()
  const userRef = db.collection('users').doc(n.userId)
  const user = (await userRef.get()).data() as PushRecipient | undefined
  if (!shouldSend(user, n.type)) return

  const tokenSnap = await userRef.collection('pushTokens').get()
  const tokens = tokenSnap.docs.map((d) => d.id)
  if (tokens.length === 0) return

  const unread = await db
    .collection('notifications')
    .where('userId', '==', n.userId)
    .where('read', '==', false)
    .limit(200)
    .get()
  const badge = computeBadge(
    unread.docs.map((d) => d.get('type') as string),
    user?.mutedNotificationCategories ?? []
  )

  try {
    const result = await getMessaging().sendEachForMulticast({
      tokens,
      data: buildPayload(n, id, badge),
      webpush: { headers: { Urgency: 'high', TTL: '86400' } },
    })
    const dead = deadTokens(tokens, result.responses.map((r) => ({ success: r.success, error: r.error ? { code: r.error.code } : undefined })))
    result.responses.forEach((r, i) => {
      if (!r.success && !dead.includes(tokens[i])) {
        logger.warn('push send failed', { userId: n.userId, code: r.error?.code })
      }
    })
    await Promise.all(dead.map((t) => userRef.collection('pushTokens').doc(t).delete()))
    logger.info('push sent', { notificationId: id, sent: result.successCount, failed: result.failureCount, removed: dead.length })
  } catch (err) {
    logger.error('push multicast failed', { notificationId: id, err: String(err) })
  }
})
