// scripts/seed-kiwichurch.js — One-shot seed for the actual Kiwi Church data.
//
// Reads ref/kiwichurch-seed-template-Seeded.xlsx and applies the
// decisions from the 2026-05-21 session:
//
//   1. Combine displayName + Surname into the full name.
//   2. Roles: Admin → 'admin'; Member → 'member', upgraded to 'host'
//      iff Groups.Host matches their first name unambiguously.
//   3. Parse Users.Host as a comma-separated list. Free-text noise
//      (questions, "not sure if...", "let's...") is stripped. Any
//      surviving group name that doesn't match a Groups.name row
//      becomes a NEW PRIVATE group. Captures: Prestons, Kirwee, East,
//      Halswell, V1, Crookston, Writers Community.
//   4. The Groups.Youth row is forced private with Joel as host.
//   5. Hosts derived from Groups.Host first-name → user.displayName
//      first-word match (case-insensitive). Ambiguities (e.g. "John"
//      matches 3 users) are reported and skipped, no host assigned.
//   6. admin + host roles get canPostKete=true. members get false.
//   7. Community gathering (kiwi-church-community) is auto-created
//      and every user becomes a member.
//   8. No Events sheet in this spreadsheet — we don't seed any events.
//
// Usage:
//   npm run seed:kiwichurch -- --dry-run
//   npm run seed:kiwichurch -- --apply
//
// Output: console summary + scripts/output/seed-<ISO>.csv with password
// reset links for newly-created Auth accounts.

import * as XLSX from 'xlsx'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const COMMUNITY_GATHERING_ID = 'kiwi-church-community'
const COMMUNITY_GATHERING_NAME = 'Kiwi Church'
const XLSX_PATH = resolve(ROOT, 'ref', 'kiwichurch-seed-template-Seeded.xlsx')
const JOEL_EMAIL = 'joel@tempero.nz'

// Overrides for ambiguous / unmatched Groups.Host first names. Joel
// resolved these in the 2026-05-21 session.
const HOST_NAME_OVERRIDES = {
  'john': 'john.leathwick@gmail.com', // 3 Johns — Joel picked Leathwick
  'di':   'dianne.browne@gmail.com',  // Di → Dianne Browne
}

// -----------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const dryRun = !apply

// -----------------------------------------------------------------------
// Admin SDK (skipped under dry-run)
// -----------------------------------------------------------------------
let admin = null
let auth = null
let db = null
let FieldValue = null
if (apply) {
  const serviceAccountPath = resolve(ROOT, 'serviceAccount.json')
  if (!existsSync(serviceAccountPath)) {
    console.error('Error: serviceAccount.json not found at the repo root.')
    process.exit(1)
  }
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
  admin = require('firebase-admin')
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
  auth = admin.auth()
  db = admin.firestore()
  FieldValue = admin.firestore.FieldValue
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const NOISE_PATTERNS = [
  /^not sure/i,
  /^let'?s/i,
  /^would /i,
  /^i think/i,
  /^if /i,
  /^but /i,
  /^maybe/i,
]
function isNoise(token) {
  if (!token) return true
  if (/^[a-z]/.test(token)) return true // starts lowercase = sentence fragment
  return NOISE_PATTERNS.some(p => p.test(token))
}

function parseHostList(raw) {
  if (!raw) return []
  const trimmed = String(raw).trim()
  if (!trimmed) return []
  // Strip "?" tails: "Youth? Let's talk..." → "Youth"
  const beforeQuestion = trimmed.includes('?') ? trimmed.split('?')[0] : trimmed
  const parts = beforeQuestion.split(',').map(p => p.trim()).filter(Boolean)
  return parts.filter(p => !isNoise(p))
}

function firstWord(s) {
  return String(s || '').trim().split(/\s+/)[0] || ''
}

function trimAll(v) {
  return v == null ? '' : String(v).trim()
}

// -----------------------------------------------------------------------
// Parse spreadsheet
// -----------------------------------------------------------------------
console.log(`Reading ${XLSX_PATH} ...`)
const buf = readFileSync(XLSX_PATH)
const wb = XLSX.read(buf, { type: 'buffer' })

function rowsOf(sheetName) {
  const sh = wb.Sheets[sheetName]
  if (!sh) throw new Error(`Missing sheet: ${sheetName}`)
  return XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' })
}

const groupsRows = rowsOf('Groups')
const usersRows = rowsOf('Users')

// Groups sheet: [name, Description, rhythm, location, isPublic, Host]
const sheetGroups = [] // { name, description, rhythm, location, isPublic, hostFirstNames[] }
for (let i = 1; i < groupsRows.length; i++) {
  const row = groupsRows[i]
  if (row.every(c => c === '' || c == null)) continue
  const name = trimAll(row[0])
  if (!name) continue
  const description = trimAll(row[1])
  const rhythm = trimAll(row[2])
  const location = trimAll(row[3])
  const isPublicRaw = trimAll(row[4]).toUpperCase()
  // "YES" → true, "No"/"" → false. Youth has empty value.
  const isPublic = isPublicRaw === 'YES' || isPublicRaw === 'TRUE' || isPublicRaw === '1'
  const hostFirstNames = trimAll(row[5])
    .split(',')
    .map(s => trimAll(s))
    .filter(Boolean)
    .filter(s => s.toLowerCase() !== 'various')
  sheetGroups.push({ name, description, rhythm, location, isPublic, hostFirstNames })
}

// Users sheet: [email, displayName, Surname, Role, Host, phone]
const sheetUsers = []
const emailSet = new Set()
for (let i = 1; i < usersRows.length; i++) {
  const row = usersRows[i]
  if (row.every(c => c === '' || c == null)) continue
  const email = trimAll(row[0]).toLowerCase()
  const firstName = trimAll(row[1])
  const surname = trimAll(row[2])
  const roleRaw = trimAll(row[3]).toLowerCase()
  const hostCol = trimAll(row[4])
  const phone = trimAll(row[5])
  if (!email || !firstName) continue
  if (emailSet.has(email)) {
    console.error(`Duplicate email row ${i + 1}: ${email}`)
    process.exit(1)
  }
  emailSet.add(email)
  const role = roleRaw === 'admin' ? 'admin' : 'member' // 'host' assigned later
  const displayName = surname ? `${firstName} ${surname}` : firstName
  const memberOfHosts = parseHostList(hostCol)
  sheetUsers.push({
    email,
    firstName,
    surname,
    displayName,
    roleSeed: role,
    memberOfHosts,
    phone,
  })
}

// -----------------------------------------------------------------------
// Derive groups: sheet groups ∪ private groups inferred from Users.Host
// -----------------------------------------------------------------------
const sheetGroupNames = new Set(sheetGroups.map(g => g.name))
const derivedPrivateGroupNames = new Set()
for (const u of sheetUsers) {
  for (const g of u.memberOfHosts) {
    if (!sheetGroupNames.has(g)) derivedPrivateGroupNames.add(g)
  }
}

const allGroups = []
for (const g of sheetGroups) {
  // Force Youth private (per decision)
  const isPublic = g.name === 'Youth' ? false : g.isPublic
  allGroups.push({ ...g, isPublic, source: 'sheet' })
}
for (const name of derivedPrivateGroupNames) {
  allGroups.push({
    name,
    description: '',
    rhythm: '',
    location: '',
    isPublic: false,
    hostFirstNames: [],
    source: 'derived',
  })
}

// -----------------------------------------------------------------------
// Resolve hosts: Groups.Host first names → user emails
// -----------------------------------------------------------------------
const usersByFirstNameLower = new Map() // lower first name → [user, ...]
for (const u of sheetUsers) {
  const k = firstWord(u.firstName).toLowerCase()
  if (!k) continue
  const list = usersByFirstNameLower.get(k) || []
  list.push(u)
  usersByFirstNameLower.set(k, list)
}

const hostAssignments = [] // { groupName, hostFirstName, status: 'matched'|'ambiguous'|'unknown', emails }
const userHostedGroups = new Map() // user.email → [groupName, ...]

for (const g of allGroups) {
  // Force Youth host = Joel (per decision)
  if (g.name === 'Youth') {
    const arr = userHostedGroups.get(JOEL_EMAIL) || []
    arr.push(g.name)
    userHostedGroups.set(JOEL_EMAIL, arr)
    hostAssignments.push({ groupName: g.name, hostFirstName: 'Joel', status: 'matched', emails: [JOEL_EMAIL] })
    continue
  }
  for (const hostName of g.hostFirstNames) {
    const k = hostName.toLowerCase()
    const overrideEmail = HOST_NAME_OVERRIDES[k]
    if (overrideEmail) {
      const arr = userHostedGroups.get(overrideEmail) || []
      arr.push(g.name)
      userHostedGroups.set(overrideEmail, arr)
      hostAssignments.push({ groupName: g.name, hostFirstName: hostName, status: 'override', emails: [overrideEmail] })
      continue
    }
    const matches = usersByFirstNameLower.get(k) || []
    if (matches.length === 0) {
      hostAssignments.push({ groupName: g.name, hostFirstName: hostName, status: 'unknown', emails: [] })
    } else if (matches.length === 1) {
      const email = matches[0].email
      const arr = userHostedGroups.get(email) || []
      arr.push(g.name)
      userHostedGroups.set(email, arr)
      hostAssignments.push({ groupName: g.name, hostFirstName: hostName, status: 'matched', emails: [email] })
    } else {
      hostAssignments.push({
        groupName: g.name,
        hostFirstName: hostName,
        status: 'ambiguous',
        emails: matches.map(m => m.email),
      })
    }
  }
}

// Upgrade role to 'host' for users with any hosted groups (unless admin).
for (const u of sheetUsers) {
  if (u.roleSeed === 'admin') continue
  if (userHostedGroups.has(u.email)) u.roleSeed = 'host'
}

// canPostKete: admin and host roles
for (const u of sheetUsers) {
  u.canPostKete = u.roleSeed === 'admin' || u.roleSeed === 'host'
}

// -----------------------------------------------------------------------
// Dry-run report
// -----------------------------------------------------------------------
console.log('')
console.log('=== Plan ===')
console.log(`Groups (sheet):   ${sheetGroups.length}`)
console.log(`Groups (derived): ${derivedPrivateGroupNames.size}  → ${[...derivedPrivateGroupNames].join(', ')}`)
console.log(`Groups (total):   ${allGroups.length} (+ community)`)
console.log(`Users:            ${sheetUsers.length}`)
const adminCount = sheetUsers.filter(u => u.roleSeed === 'admin').length
const hostCount = sheetUsers.filter(u => u.roleSeed === 'host').length
const memberCount = sheetUsers.filter(u => u.roleSeed === 'member').length
console.log(`  admins: ${adminCount}, hosts: ${hostCount}, members: ${memberCount}`)
console.log('')

console.log('=== Host resolution ===')
for (const a of hostAssignments) {
  if (a.status === 'matched') {
    console.log(`  ✓ ${a.groupName} ← ${a.hostFirstName} → ${a.emails[0]}`)
  } else if (a.status === 'override') {
    console.log(`  ⇨ ${a.groupName} ← "${a.hostFirstName}" → ${a.emails[0]} (override)`)
  } else if (a.status === 'ambiguous') {
    console.log(`  ⚠ ${a.groupName} ← "${a.hostFirstName}" → AMBIGUOUS: ${a.emails.join(', ')} — no host assigned`)
  } else {
    console.log(`  ✗ ${a.groupName} ← "${a.hostFirstName}" → NO MATCH — no host assigned`)
  }
}
console.log('')

console.log('=== Per-user hosted groups ===')
for (const [email, groups] of userHostedGroups) {
  console.log(`  ${email}: ${groups.join(', ')}`)
}
console.log('')

if (dryRun) {
  console.log('Dry-run only — re-run with --apply to write to Firestore + Auth.')
  process.exit(0)
}

// -----------------------------------------------------------------------
// Apply: groups, then auth+users, then memberships
// -----------------------------------------------------------------------
const groupNameToId = new Map()

// Community gathering — ensure exists.
{
  const ref = db.collection('gatherings').doc(COMMUNITY_GATHERING_ID)
  await ref.set({
    name: COMMUNITY_GATHERING_NAME,
    description: 'The main community board for all Kiwi Church members',
    isPublic: true,
    featured: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
  groupNameToId.set(COMMUNITY_GATHERING_NAME, COMMUNITY_GATHERING_ID)
}

// Other groups: match by name (fresh from wipe → all new).
for (const g of allGroups) {
  const snap = await db.collection('gatherings').where('name', '==', g.name).limit(1).get()
  const payload = {
    name: g.name,
    isPublic: g.isPublic,
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (g.description) payload.description = g.description
  if (g.rhythm) payload.rhythm = g.rhythm
  if (g.location) payload.location = g.location
  if (snap.empty) {
    payload.createdAt = FieldValue.serverTimestamp()
    const ref = await db.collection('gatherings').add(payload)
    groupNameToId.set(g.name, ref.id)
  } else {
    await snap.docs[0].ref.update(payload)
    groupNameToId.set(g.name, snap.docs[0].id)
  }
}
console.log(`Wrote ${allGroups.length} groups (+ community).`)

// Users: lookup or create Auth, then upsert /users + /userProfiles +
// memberships.
const userOutputs = []
let createdAuth = 0
let existingAuth = 0
for (const u of sheetUsers) {
  try {
    let authUser
    let createdNow = false
    try {
      authUser = await auth.getUserByEmail(u.email)
    } catch (err) {
      if (err.code !== 'auth/user-not-found') throw err
      authUser = await auth.createUser({
        email: u.email,
        password: randomBytes(16).toString('hex'),
        displayName: u.displayName,
        emailVerified: false,
      })
      createdNow = true
      createdAuth++
    }
    if (!createdNow) existingAuth++
    const uid = authUser.uid

    const hostedNames = userHostedGroups.get(u.email) || []
    const hostedIds = hostedNames.map(n => groupNameToId.get(n)).filter(Boolean)

    const memberNames = new Set([
      ...u.memberOfHosts,
      ...hostedNames,
    ])
    const memberIds = [...memberNames].map(n => groupNameToId.get(n)).filter(Boolean)
    // Community membership added below.

    const userPayload = {
      email: u.email,
      displayName: u.displayName,
      role: u.roleSeed,
      status: 'active',
      canPostKete: u.canPostKete,
      hostedGatherings: hostedIds,
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (u.phone) userPayload.phone = u.phone

    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()
    if (userSnap.exists) {
      await userRef.update(userPayload)
    } else {
      await userRef.set({ ...userPayload, createdAt: FieldValue.serverTimestamp() })
    }

    const profilePayload = {
      id: uid,
      displayName: u.displayName,
      role: u.roleSeed,
      updatedAt: FieldValue.serverTimestamp(),
    }
    const profileRef = db.collection('userProfiles').doc(uid)
    const profileSnap = await profileRef.get()
    if (profileSnap.exists) {
      await profileRef.update(profilePayload)
    } else {
      await profileRef.set({ ...profilePayload, createdAt: FieldValue.serverTimestamp() })
    }

    // Memberships: community + every resolved group.
    const allMemberships = new Set([COMMUNITY_GATHERING_ID, ...memberIds])
    for (const gid of allMemberships) {
      const memberRef = db.collection('gatherings').doc(gid).collection('members').doc(uid)
      const memberSnap = await memberRef.get()
      if (!memberSnap.exists) {
        await memberRef.set({ joinedAt: FieldValue.serverTimestamp() })
      }
    }

    let passwordResetLink = ''
    if (createdNow) {
      try {
        passwordResetLink = await auth.generatePasswordResetLink(u.email)
      } catch (err) {
        console.error(`  generatePasswordResetLink failed for ${u.email}:`, err.message)
      }
    }

    userOutputs.push({
      email: u.email,
      displayName: u.displayName,
      role: u.roleSeed,
      status: createdNow ? 'created' : 'existing',
      passwordResetLink,
      errors: '',
    })
  } catch (err) {
    console.error(`Failed ${u.email}:`, err.message)
    userOutputs.push({
      email: u.email,
      displayName: u.displayName,
      role: u.roleSeed,
      status: 'error',
      passwordResetLink: '',
      errors: err.message,
    })
  }
}

console.log('')
console.log(`Done. Auth: ${createdAuth} created, ${existingAuth} existing.`)

// CSV
const outputDir = resolve(ROOT, 'scripts', 'output')
mkdirSync(outputDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const outputPath = resolve(outputDir, `seed-kiwichurch-${stamp}.csv`)
const lines = ['email,displayName,role,status,passwordResetLink,errors']
for (const o of userOutputs) {
  const fields = [o.email, o.displayName, o.role, o.status, o.passwordResetLink, o.errors]
    .map(f => `"${String(f).replace(/"/g, '""')}"`)
  lines.push(fields.join(','))
}
writeFileSync(outputPath, lines.join('\n'), 'utf8')
console.log(`CSV written to ${outputPath}`)
