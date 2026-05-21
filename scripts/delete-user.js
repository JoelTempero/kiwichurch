// scripts/delete-user.js — Fully purge a user from Kiwi Church.
//
// Removes: Firebase Auth account, /users doc, /userProfiles doc, every
// gathering membership, and any /usernames reservation pointing to them.
// Use this to flush accounts you've already soft-deleted in Settings, or
// to nuke a duplicate that was created by mistake.
//
// Usage:
//   node scripts/delete-user.js --email=foo@bar.com           # dry-run
//   node scripts/delete-user.js --email=foo@bar.com --apply   # actually delete
//
// Bigger collateral damage (kete posts they authored, board posts,
// conversations) is left in place — those carry useful history. The
// account just won't be able to log in anymore. If you want a true scorched-
// earth pass, do it manually in the Firebase Console.
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
const emailArg = args.find(a => a.startsWith('--email='))
const apply = args.includes('--apply')

if (!emailArg) {
  console.error('Usage: node scripts/delete-user.js --email=foo@bar.com [--apply]')
  process.exit(1)
}
const EMAIL = emailArg.split('=')[1].trim().toLowerCase()

const serviceAccountPath = resolve(ROOT, 'serviceAccount.json')
if (!existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccount.json not found at the repo root.')
  process.exit(1)
}
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}
const auth = admin.auth()
const db = admin.firestore()

console.log(`Project: ${serviceAccount.project_id}`)
console.log(`Target:  ${EMAIL}`)
console.log(`Mode:    ${apply ? '!!! APPLY !!!' : 'dry-run'}`)
console.log('')

// 1) Find Auth user
let uid = null
try {
  const u = await auth.getUserByEmail(EMAIL)
  uid = u.uid
  console.log(`Auth: found uid=${uid}, displayName="${u.displayName || ''}"`)
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.log('Auth: no account found for this email.')
  } else {
    throw err
  }
}

// 2) Look for /users doc by uid (preferred) or by email field
let userDocRef = null
if (uid) {
  const ref = db.collection('users').doc(uid)
  const snap = await ref.get()
  if (snap.exists) userDocRef = ref
}
if (!userDocRef) {
  const q = await db.collection('users').where('email', '==', EMAIL).limit(1).get()
  if (!q.empty) userDocRef = q.docs[0].ref
}
console.log(`Firestore /users: ${userDocRef ? `found ${userDocRef.id}` : 'not found'}`)

// 3) Collect gathering membership doc refs (for the uid we have)
const userIdForMemberships = uid || userDocRef?.id
let membershipRefs = []
if (userIdForMemberships) {
  const gatherings = await db.collection('gatherings').get()
  for (const g of gatherings.docs) {
    const m = await g.collection('members').doc(userIdForMemberships).get()
    if (m.exists) membershipRefs.push(m.ref)
  }
}
console.log(`Firestore gathering memberships: ${membershipRefs.length}`)

// 4) /userProfiles
let profileRef = null
if (userIdForMemberships) {
  const p = await db.collection('userProfiles').doc(userIdForMemberships).get()
  if (p.exists) profileRef = p.ref
}
console.log(`Firestore /userProfiles: ${profileRef ? 'found' : 'not found'}`)

// 5) /usernames reservations pointing to this uid
let usernameRefs = []
if (userIdForMemberships) {
  const us = await db.collection('usernames').where('uid', '==', userIdForMemberships).get()
  usernameRefs = us.docs.map(d => d.ref)
}
console.log(`Firestore /usernames reservations: ${usernameRefs.length}`)

console.log('')
if (!apply) {
  console.log('Dry-run — re-run with --apply to actually delete.')
  process.exit(0)
}

// Apply
let deletedAuth = false
if (uid) {
  await auth.deleteUser(uid)
  deletedAuth = true
  console.log(`Auth: deleted uid ${uid}`)
}
for (const ref of membershipRefs) {
  await ref.delete()
}
console.log(`Firestore: removed ${membershipRefs.length} memberships`)
if (profileRef) {
  await profileRef.delete()
  console.log(`Firestore: deleted /userProfiles/${profileRef.id}`)
}
for (const ref of usernameRefs) {
  await ref.delete()
}
if (usernameRefs.length) console.log(`Firestore: deleted ${usernameRefs.length} /usernames reservations`)
if (userDocRef) {
  await userDocRef.delete()
  console.log(`Firestore: deleted /users/${userDocRef.id}`)
}

console.log('')
console.log(`Done. Auth deleted: ${deletedAuth ? 'yes' : 'no'}. Firestore cleaned.`)
