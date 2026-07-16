// scripts/backfill-event-visibility.js — Stamp `openToAllMembers` on every
// existing event, before the strict Firestore rules (which require the
// field) are deployed.
//
// Mirrors the server-side source of truth in
// src/services/firebase/db.ts:computeOpenToAllMembers — keep the two in
// sync if that function ever changes:
//
//   openToAllMembers = !gatheringId || gatheringsById.get(gatheringId)?.isPublic === true
//
// i.e. an event with no group is church-wide (open); an event in a public
// group is open; an event in a private group — or one whose gathering
// doc is missing/deleted — is closed by default (fail closed).
//
// Invariant enforced on write (same as db.ts createEvent/updateEvent):
// when the computed flag is `false`, `isPublic` is also force-cleared to
// `false`. `Event.isPublic` is the "show on the public website" flag; a
// private group's event must never carry it, or the static homepage
// leaks the event to anonymous visitors even after the member-read hole
// is closed.
//
// Usage:
//   node scripts/backfill-event-visibility.js               # dry-run (default)
//   node scripts/backfill-event-visibility.js --apply        # actually write
//
// Requires serviceAccount.json at the repo root.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const args = process.argv.slice(2)
const apply = args.includes('--apply')

const serviceAccountPath = resolve(ROOT, 'serviceAccount.json')
if (!existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccount.json not found at the repo root.')
  console.error('See scripts/README.md → Service-account setup.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}
const db = admin.firestore()

const EVENTS_PAGE_SIZE = 500
const BATCH_LIMIT = 450 // stay under Firestore's 500-ops-per-batch cap

console.log(`Project: ${serviceAccount.project_id}`)
console.log(`Mode:    ${apply ? '!!! APPLY (writes) !!!' : 'dry-run (no writes)'}`)
console.log('')

// -----------------------------------------------------------------------
// 1) Load every gathering into an id -> isPublic map.
// -----------------------------------------------------------------------
async function loadGatheringsMap() {
  const snap = await db.collection('gatherings').get()
  const map = new Map()
  for (const doc of snap.docs) {
    map.set(doc.id, { isPublic: doc.data().isPublic === true })
  }
  console.log(`Gatherings loaded: ${map.size}`)
  return map
}

// Same computation as db.ts:computeOpenToAllMembers — fail closed when the
// gathering is missing or has no isPublic:true.
function computeOpenToAllMembers(gatheringId, gatheringsById) {
  if (!gatheringId) return true
  return gatheringsById.get(gatheringId)?.isPublic === true
}

// -----------------------------------------------------------------------
// 2) Page through every event, in batches of EVENTS_PAGE_SIZE, ordered by
//    document id so the cursor is stable across pages.
// -----------------------------------------------------------------------
async function* pageEvents() {
  let lastDoc = null
  for (;;) {
    let q = db.collection('events').orderBy(admin.firestore.FieldPath.documentId()).limit(EVENTS_PAGE_SIZE)
    if (lastDoc) q = q.startAfter(lastDoc)
    const snap = await q.get()
    if (snap.empty) return
    for (const doc of snap.docs) yield doc
    lastDoc = snap.docs[snap.docs.length - 1]
    if (snap.docs.length < EVENTS_PAGE_SIZE) return
  }
}

// -----------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------
const gatheringsById = await loadGatheringsMap()

let scanned = 0
// Every event we're about to (re-)stamp. We write to every event regardless
// of its current value — a legacy doc might have no field at all, or a
// stale/wrong one, and stamping is idempotent either way.
const pendingWrites = [] // { ref, openToAllMembers, isPublicPatch }
// The leak: events that compute closed (private-group members-only), i.e.
// were readable by ANY member before the strict rules land.
const leakEvents = [] // { id, title, gatheringId, isPublicBefore }
// The subset of the leak that ALSO carried isPublic: true — these were
// exposed on the public website, not just to all members. This is the
// "accidentally published" number.
const accidentallyPublished = []

for await (const doc of pageEvents()) {
  scanned++
  const data = doc.data()
  const gatheringId = data.gatheringId
  const isPublicBefore = data.isPublic === true
  const openToAllMembers = computeOpenToAllMembers(gatheringId, gatheringsById)

  const patch = { openToAllMembers, updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  if (openToAllMembers === false) {
    patch.isPublic = false
  }
  pendingWrites.push({ ref: doc.ref, patch })

  if (openToAllMembers === false) {
    const detail = {
      id: doc.id,
      title: data.title ?? '(untitled)',
      gatheringId: gatheringId ?? '(none)',
      isPublicBefore,
    }
    leakEvents.push(detail)
    if (isPublicBefore) accidentallyPublished.push(detail)
  }
}

console.log(`Events scanned: ${scanned}`)
console.log('')

console.log(`=== Leak: events readable by ALL members (openToAllMembers computes false) — ${leakEvents.length} ===`)
if (leakEvents.length === 0) {
  console.log('  (none)')
} else {
  for (const e of leakEvents) {
    console.log(`  ${e.id}  "${e.title}"  gathering=${e.gatheringId}  isPublic(before)=${e.isPublicBefore}`)
  }
}
console.log('')

console.log(`=== Accidentally published: isPublic was true and is being cleared (exposed on public website) — ${accidentallyPublished.length} ===`)
if (accidentallyPublished.length === 0) {
  console.log('  (none)')
} else {
  for (const e of accidentallyPublished) {
    console.log(`  ${e.id}  "${e.title}"  gathering=${e.gatheringId}`)
  }
}
console.log('')

if (!apply) {
  console.log(`Dry-run — would write ${pendingWrites.length}/${scanned} events. Re-run with --apply to commit.`)
  process.exit(0)
}

// Apply: chunked batch writes, <= BATCH_LIMIT ops per batch.
let written = 0
for (let i = 0; i < pendingWrites.length; i += BATCH_LIMIT) {
  const chunk = pendingWrites.slice(i, i + BATCH_LIMIT)
  const batch = db.batch()
  for (const { ref, patch } of chunk) {
    batch.update(ref, patch)
  }
  await batch.commit()
  written += chunk.length
  console.log(`  committed ${written}/${pendingWrites.length}...`)
}

console.log('')
console.log(`Done. Stamped openToAllMembers on ${written} events.`)
console.log(`Leak closed on ${leakEvents.length} events; ${accidentallyPublished.length} of those also had isPublic cleared.`)
