// scripts/wipe.js — Nuke Firestore + Auth on the Kiwi Church project.
//
// Keeps ONE Firebase Auth user (Joel by default) and their matching
// /users + /userProfiles docs. Everything else gets deleted: every
// Firestore collection and every Auth account.
//
// Usage:
//   node scripts/wipe.js                        # dry-run (default)
//   node scripts/wipe.js --apply                # actually delete
//   node scripts/wipe.js --apply --keep=<uid>   # override the kept uid
//
// Requires serviceAccount.json at the repo root (see scripts/README.md).
// This is irreversible. Run --apply only when you mean it.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const DEFAULT_KEEP_UID = '6wceO7iVh8MKIXo2544iuZrfxFp2' // joel@tempero.nz

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const keepArg = args.find(a => a.startsWith('--keep='))
const KEEP_UID = keepArg ? keepArg.split('=')[1] : DEFAULT_KEEP_UID

const serviceAccountPath = resolve(ROOT, 'serviceAccount.json')
if (!existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccount.json not found at the repo root.')
  console.error('See scripts/README.md → Service-account setup.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
const admin = require('firebase-admin')
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const auth = admin.auth()
const db = admin.firestore()

console.log(`Project: ${serviceAccount.project_id}`)
console.log(`Mode:    ${apply ? '!!! APPLY (destructive) !!!' : 'dry-run (no writes)'}`)
console.log(`Keep:    Auth uid ${KEEP_UID} + that user's /users + /userProfiles doc`)
console.log('')

// -----------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------
async function wipeAuth() {
  const toDelete = []
  let pageToken = undefined
  do {
    const result = await auth.listUsers(1000, pageToken)
    for (const u of result.users) {
      if (u.uid !== KEEP_UID) toDelete.push(u.uid)
    }
    pageToken = result.pageToken
  } while (pageToken)

  console.log(`Auth: ${toDelete.length} accounts to delete (keeping ${KEEP_UID}).`)
  if (!apply) return { deleted: 0, planned: toDelete.length }

  // deleteUsers takes up to 1000 uids per call.
  let deleted = 0
  for (let i = 0; i < toDelete.length; i += 1000) {
    const chunk = toDelete.slice(i, i + 1000)
    const result = await auth.deleteUsers(chunk)
    deleted += result.successCount
    if (result.failureCount > 0) {
      console.error(`  ${result.failureCount} failures in chunk starting at ${i}:`)
      for (const err of result.errors) {
        console.error(`    ${chunk[err.index]}: ${err.error.message}`)
      }
    }
  }
  console.log(`Auth: deleted ${deleted}/${toDelete.length}.`)
  return { deleted, planned: toDelete.length }
}

// -----------------------------------------------------------------------
// Firestore — recursive delete via Admin SDK
// -----------------------------------------------------------------------
async function recursiveDeleteDoc(docRef) {
  // Admin SDK has bulkWriter + recursiveDelete which handles subcollections.
  await db.recursiveDelete(docRef)
}

async function wipeCollection(collectionId, opts = {}) {
  const { keepDocIds = [] } = opts
  const snap = await db.collection(collectionId).get()
  const keep = new Set(keepDocIds)
  const docs = snap.docs.filter(d => !keep.has(d.id))
  console.log(`Firestore /${collectionId}: ${snap.size} docs total, ${docs.length} to delete${keep.size ? `, ${keep.size} kept` : ''}.`)

  if (!apply) return { deleted: 0, planned: docs.length }

  // Use recursiveDelete on each doc so subcollections get cleaned up too.
  let deleted = 0
  for (const doc of docs) {
    await recursiveDeleteDoc(doc.ref)
    deleted++
    if (deleted % 50 === 0) console.log(`  ${collectionId}: ${deleted}/${docs.length} deleted...`)
  }
  console.log(`  ${collectionId}: deleted ${deleted}/${docs.length}.`)
  return { deleted, planned: docs.length }
}

async function listTopLevelCollections() {
  const cols = await db.listCollections()
  return cols.map(c => c.id)
}

async function wipeFirestore() {
  const allCollections = await listTopLevelCollections()
  console.log(`Firestore: top-level collections found: ${allCollections.join(', ')}`)
  console.log('')

  const totals = {}

  // /users — keep KEEP_UID's doc so Joel stays admin during the gap
  // between wipe and seed.
  totals.users = await wipeCollection('users', { keepDocIds: [KEEP_UID] })

  // /userProfiles — same pattern.
  totals.userProfiles = await wipeCollection('userProfiles', { keepDocIds: [KEEP_UID] })

  // Everything else: nuke unconditionally. The seed re-creates what it needs.
  const others = allCollections.filter(c => !['users', 'userProfiles', 'settings'].includes(c))
  for (const col of others) {
    totals[col] = await wipeCollection(col)
  }

  // /settings — keep the setup marker doc. Wipe anything else in there.
  if (allCollections.includes('settings')) {
    totals.settings = await wipeCollection('settings', { keepDocIds: ['setup'] })
  }

  return totals
}

// -----------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------
const authResult = await wipeAuth()
console.log('')
const firestoreResult = await wipeFirestore()

console.log('')
console.log('=== Summary ===')
console.log(`Auth: ${apply ? 'deleted' : 'would delete'} ${apply ? authResult.deleted : authResult.planned} accounts.`)
for (const [col, r] of Object.entries(firestoreResult)) {
  console.log(`/${col}: ${apply ? 'deleted' : 'would delete'} ${apply ? r.deleted : r.planned} docs.`)
}
if (!apply) {
  console.log('')
  console.log('Dry-run only — nothing was deleted. Re-run with --apply to commit.')
}
