// scripts/set-test-passwords.js — Set a shared password on every Auth user
// except Joel's, and mark each /users doc with mustChangePassword: true so
// the portal shows the "you're using the test password" banner.
//
// For closed-beta testing only. Trade-off accepted: every test user shares
// the same password until they change it themselves via Settings.
//
// Usage:
//   node scripts/set-test-passwords.js                # dry-run
//   node scripts/set-test-passwords.js --apply        # apply (default password)
//   node scripts/set-test-passwords.js --apply --password=somethingElse
//   node scripts/set-test-passwords.js --apply --skip=joel@tempero.nz,a@b.com
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

const DEFAULT_PASSWORD = 'freedom'
const DEFAULT_SKIP_UID = '6wceO7iVh8MKIXo2544iuZrfxFp2' // joel@tempero.nz

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const pwArg = args.find(a => a.startsWith('--password='))
const skipArg = args.find(a => a.startsWith('--skip='))
const PASSWORD = pwArg ? pwArg.split('=')[1] : DEFAULT_PASSWORD
const extraSkipEmails = new Set((skipArg ? skipArg.split('=')[1].split(',') : []).map(s => s.trim().toLowerCase()).filter(Boolean))

if (PASSWORD.length < 6) {
  console.error(`Error: password must be at least 6 characters (Firebase Auth minimum). Got ${PASSWORD.length}.`)
  process.exit(1)
}

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
const FieldValue = admin.firestore.FieldValue

console.log(`Project:  ${serviceAccount.project_id}`)
console.log(`Mode:     ${apply ? '!!! APPLY !!!' : 'dry-run'}`)
console.log(`Password: "${PASSWORD}"`)
console.log(`Skip uid: ${DEFAULT_SKIP_UID}`)
if (extraSkipEmails.size) console.log(`Skip emails (extra): ${[...extraSkipEmails].join(', ')}`)
console.log('')

const targets = []
let pageToken = undefined
do {
  const result = await auth.listUsers(1000, pageToken)
  for (const u of result.users) {
    if (u.uid === DEFAULT_SKIP_UID) continue
    if (u.email && extraSkipEmails.has(u.email.toLowerCase())) continue
    targets.push(u)
  }
  pageToken = result.pageToken
} while (pageToken)

console.log(`Will update ${targets.length} accounts.`)
if (!apply) {
  console.log('Dry-run only — re-run with --apply to actually set passwords.')
  process.exit(0)
}

let updated = 0
let flagged = 0
const errors = []
for (const u of targets) {
  try {
    await auth.updateUser(u.uid, { password: PASSWORD })
    updated++
    try {
      await db.collection('users').doc(u.uid).update({
        mustChangePassword: true,
        updatedAt: FieldValue.serverTimestamp(),
      })
      flagged++
    } catch (err) {
      // Doc may not exist if Auth has a stray account without a matching
      // /users doc — log but don't fail the password set.
      console.error(`  ${u.email || u.uid}: /users update failed: ${err.message}`)
    }
    if (updated % 20 === 0) console.log(`  ${updated}/${targets.length}...`)
  } catch (err) {
    errors.push({ uid: u.uid, email: u.email, message: err.message })
    console.error(`  ${u.email || u.uid}: ${err.message}`)
  }
}

console.log('')
console.log(`Done. Passwords set: ${updated}/${targets.length}. Banner flag set: ${flagged}.`)
if (errors.length) {
  console.log(`Errors: ${errors.length}`)
  for (const e of errors) console.log(`  ${e.email || e.uid}: ${e.message}`)
  process.exit(1)
}
