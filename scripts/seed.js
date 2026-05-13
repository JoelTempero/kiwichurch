// scripts/seed.js — Bulk-seed Kiwi Church Firestore from an .xlsx.
//
// Usage:
//   node scripts/seed.js <path.xlsx>
//   node scripts/seed.js <path.xlsx> --dry-run
//   node scripts/seed.js <path.xlsx> --only=users
//
// See scripts/README.md for the service-account setup and what the
// pipeline does.

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

// -----------------------------------------------------------------------
// Arg parsing
// -----------------------------------------------------------------------
const args = process.argv.slice(2)
const xlsxPath = args.find(a => !a.startsWith('--'))
const dryRun = args.includes('--dry-run')
const onlyArg = args.find(a => a.startsWith('--only='))
const only = onlyArg ? onlyArg.split('=')[1] : null

if (!xlsxPath) {
  console.log('Usage: node scripts/seed.js <path.xlsx> [--dry-run] [--only=groups|events|users]')
  console.log('See scripts/README.md for setup and what this does.')
  process.exit(0)
}

if (!existsSync(xlsxPath)) {
  console.error(`Error: file not found: ${xlsxPath}`)
  process.exit(1)
}

// -----------------------------------------------------------------------
// Firebase Admin SDK setup (skipped under --dry-run)
// -----------------------------------------------------------------------
let admin = null
let auth = null
let db = null
let FieldValue = null

if (!dryRun) {
  const serviceAccountPath = resolve(ROOT, 'serviceAccount.json')
  if (!existsSync(serviceAccountPath)) {
    console.error('Error: serviceAccount.json not found at the repo root.')
    console.error('See scripts/README.md → Service-account setup.')
    process.exit(1)
  }
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
  admin = require('firebase-admin')
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  auth = admin.auth()
  db = admin.firestore()
  FieldValue = admin.firestore.FieldValue
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const REQUIRED_HEADERS = {
  Groups: ['name', 'description', 'rhythm', 'location', 'isPublic', 'color'],
  Events: ['title', 'date', 'time', 'endTime', 'location', 'description', 'gatheringName', 'isPublic'],
  Users: ['email', 'displayName', 'role', 'phone', 'bio', 'memberOfGroups', 'hostedGroups', 'canPostKete'],
}

const ROLES = new Set(['admin', 'host', 'member'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readSheet(workbook, name) {
  const sheet = workbook.Sheets[name]
  if (!sheet) return null
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
}

function parseBoolCell(value, field, rowNumber, errors) {
  if (value === '' || value == null) return null
  const v = String(value).trim().toUpperCase()
  if (v === 'TRUE' || v === '1' || v === 'YES') return true
  if (v === 'FALSE' || v === '0' || v === 'NO') return false
  errors.push({ rowNumber, field, message: `expected TRUE or FALSE, got "${value}"` })
  return null
}

function trimOrEmpty(v) {
  return v == null ? '' : String(v).trim()
}

function splitList(v) {
  if (!v) return []
  return String(v).split(',').map(s => s.trim()).filter(Boolean)
}

// -----------------------------------------------------------------------
// Pass 1 — Parse + validate
// -----------------------------------------------------------------------
console.log(`Reading ${xlsxPath} ...`)
// SheetJS ESM build only exports `read`/`write`/`writeFile`, not
// `readFile` — load the buffer ourselves and pass it to `read`.
const workbookBuffer = readFileSync(xlsxPath)
const workbook = XLSX.read(workbookBuffer, { type: 'buffer' })

for (const sheetName of Object.keys(REQUIRED_HEADERS)) {
  if (!workbook.SheetNames.includes(sheetName)) {
    console.error(`Error: missing sheet "${sheetName}".`)
    process.exit(1)
  }
}

const errors = []

function validateHeaders(sheetName, rows) {
  const expected = REQUIRED_HEADERS[sheetName]
  const got = rows[0] || []
  for (let i = 0; i < expected.length; i++) {
    if (got[i] !== expected[i]) {
      errors.push({
        rowNumber: 1,
        field: `${sheetName} header`,
        message: `column ${i + 1} expected "${expected[i]}", got "${got[i]}"`,
      })
    }
  }
}

const groupsRows = readSheet(workbook, 'Groups')
const eventsRows = readSheet(workbook, 'Events')
const usersRows = readSheet(workbook, 'Users')

validateHeaders('Groups', groupsRows)
validateHeaders('Events', eventsRows)
validateHeaders('Users', usersRows)

const groups = [] // { name, description, rhythm, location, isPublic, color, rowNumber }
for (let i = 1; i < groupsRows.length; i++) {
  const row = groupsRows[i]
  const rowNumber = i + 1
  if (row.every(c => c === '' || c == null)) continue
  const name = trimOrEmpty(row[0])
  if (!name) {
    errors.push({ rowNumber, field: 'Groups.name', message: 'required' })
    continue
  }
  const isPublic = parseBoolCell(row[4], 'Groups.isPublic', rowNumber, errors)
  if (isPublic === null) continue
  groups.push({
    name,
    description: trimOrEmpty(row[1]),
    rhythm: trimOrEmpty(row[2]),
    location: trimOrEmpty(row[3]),
    isPublic,
    color: trimOrEmpty(row[5]),
    rowNumber,
  })
}

// The community gathering is auto-ensured by the script, so it's a
// valid cross-sheet reference even when the client doesn't list it
// in the Groups sheet.
const groupNameSet = new Set([COMMUNITY_GATHERING_NAME, ...groups.map(g => g.name)])

const events = []
for (let i = 1; i < eventsRows.length; i++) {
  const row = eventsRows[i]
  const rowNumber = i + 1
  if (row.every(c => c === '' || c == null)) continue
  const title = trimOrEmpty(row[0])
  const date = trimOrEmpty(row[1])
  const time = trimOrEmpty(row[2])
  const endTime = trimOrEmpty(row[3])
  const location = trimOrEmpty(row[4])
  const description = trimOrEmpty(row[5])
  const gatheringName = trimOrEmpty(row[6])
  const isPublic = parseBoolCell(row[7], 'Events.isPublic', rowNumber, errors)
  if (!title) errors.push({ rowNumber, field: 'Events.title', message: 'required' })
  if (!date || !DATE_RE.test(date)) errors.push({ rowNumber, field: 'Events.date', message: `expected YYYY-MM-DD, got "${date}"` })
  if (!time || !TIME_RE.test(time)) errors.push({ rowNumber, field: 'Events.time', message: `expected HH:MM, got "${time}"` })
  if (endTime && !TIME_RE.test(endTime)) errors.push({ rowNumber, field: 'Events.endTime', message: `expected HH:MM, got "${endTime}"` })
  if (!location) errors.push({ rowNumber, field: 'Events.location', message: 'required' })
  if (isPublic === null) continue
  if (gatheringName && !groupNameSet.has(gatheringName)) {
    errors.push({ rowNumber, field: 'Events.gatheringName', message: `"${gatheringName}" doesn't match any Groups.name row` })
  }
  events.push({ title, date, time, endTime, location, description, gatheringName, isPublic, rowNumber })
}

const users = []
const emailSet = new Set()
for (let i = 1; i < usersRows.length; i++) {
  const row = usersRows[i]
  const rowNumber = i + 1
  if (row.every(c => c === '' || c == null)) continue
  const email = trimOrEmpty(row[0]).toLowerCase()
  const displayName = trimOrEmpty(row[1])
  const role = trimOrEmpty(row[2]).toLowerCase()
  const phone = trimOrEmpty(row[3])
  const bio = trimOrEmpty(row[4])
  const memberOfGroups = splitList(row[5])
  const hostedGroups = splitList(row[6])
  const canPostKete = parseBoolCell(row[7], 'Users.canPostKete', rowNumber, errors)
  if (!email || !EMAIL_RE.test(email)) errors.push({ rowNumber, field: 'Users.email', message: `invalid email "${email}"` })
  else if (emailSet.has(email)) errors.push({ rowNumber, field: 'Users.email', message: `duplicate email "${email}"` })
  else emailSet.add(email)
  if (!displayName) errors.push({ rowNumber, field: 'Users.displayName', message: 'required' })
  if (!ROLES.has(role)) errors.push({ rowNumber, field: 'Users.role', message: `expected admin/host/member, got "${role}"` })
  for (const g of memberOfGroups) {
    if (!groupNameSet.has(g)) {
      errors.push({ rowNumber, field: 'Users.memberOfGroups', message: `"${g}" doesn't match any Groups.name row` })
    }
  }
  for (const g of hostedGroups) {
    if (!groupNameSet.has(g)) {
      errors.push({ rowNumber, field: 'Users.hostedGroups', message: `"${g}" doesn't match any Groups.name row` })
    }
  }
  users.push({
    email, displayName, role, phone, bio,
    memberOfGroups, hostedGroups,
    canPostKete: canPostKete === null ? false : canPostKete,
    rowNumber,
  })
}

if (errors.length > 0) {
  console.error(`\n${errors.length} validation error${errors.length === 1 ? '' : 's'}:`)
  for (const e of errors) {
    console.error(`  row ${e.rowNumber} — ${e.field}: ${e.message}`)
  }
  console.error('\nNo writes happened. Fix the rows and re-run.')
  process.exit(1)
}

console.log(`Parsed cleanly: ${groups.length} groups, ${events.length} events, ${users.length} users.`)
if (dryRun) {
  console.log('\n--dry-run set — no writes happen.')
  console.log(`Would upsert ${groups.length} groups, ${events.length} events, ${users.length} users.`)
  console.log(`Would create up to ${users.length} Firebase Auth accounts (existing ones are skipped).`)
  process.exit(0)
}

// -----------------------------------------------------------------------
// Pass 2 — Groups, then Events
// -----------------------------------------------------------------------
const summary = {
  groups: { created: 0, updated: 0, skipped: 0 },
  events: { created: 0, updated: 0, skipped: 0 },
  users: { created: 0, existing: 0, errors: 0 },
}

// Map { groupName -> groupId } populated as we upsert.
const groupNameToId = new Map()

if (!only || only === 'groups' || only === 'events' || only === 'users') {
  for (const group of groups) {
    if (only && only !== 'groups' && only !== 'events' && only !== 'users') break
    if (only === 'events') {
      // Events pass still needs the group-id map, so resolve existing
      // groups without writes.
      const snap = await db.collection('gatherings').where('name', '==', group.name).limit(1).get()
      if (!snap.empty) groupNameToId.set(group.name, snap.docs[0].id)
      continue
    }
    if (only === 'users') {
      const snap = await db.collection('gatherings').where('name', '==', group.name).limit(1).get()
      if (!snap.empty) groupNameToId.set(group.name, snap.docs[0].id)
      continue
    }
    const snap = await db.collection('gatherings').where('name', '==', group.name).limit(1).get()
    const payload = {
      name: group.name,
      isPublic: group.isPublic,
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (group.description) payload.description = group.description
    if (group.rhythm) payload.rhythm = group.rhythm
    if (group.location) payload.location = group.location
    if (group.color) payload.color = group.color
    if (snap.empty) {
      payload.createdAt = FieldValue.serverTimestamp()
      const ref = await db.collection('gatherings').add(payload)
      groupNameToId.set(group.name, ref.id)
      summary.groups.created++
    } else {
      const ref = snap.docs[0].ref
      await ref.update(payload)
      groupNameToId.set(group.name, ref.id)
      summary.groups.updated++
    }
  }
}

// Ensure community gathering exists (if not in the sheet, no-op).
{
  const ref = db.collection('gatherings').doc(COMMUNITY_GATHERING_ID)
  const snap = await ref.get()
  if (!snap.exists) {
    await ref.set({
      name: COMMUNITY_GATHERING_NAME,
      description: 'The main community board for all Kiwi Church members',
      isPublic: true,
      featured: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  groupNameToId.set(COMMUNITY_GATHERING_NAME, COMMUNITY_GATHERING_ID)
}

if (!only || only === 'events') {
  for (const event of events) {
    const gatheringId = event.gatheringName ? groupNameToId.get(event.gatheringName) : null
    if (event.gatheringName && !gatheringId) {
      console.error(`Skipping event "${event.title}" (row ${event.rowNumber}): gathering "${event.gatheringName}" not found.`)
      summary.events.skipped++
      continue
    }
    const snap = await db.collection('events')
      .where('title', '==', event.title)
      .where('date', '==', event.date)
      .limit(1)
      .get()
    const payload = {
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      isPublic: event.isPublic,
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (event.endTime) payload.endTime = event.endTime
    if (event.description) payload.description = event.description
    if (gatheringId) {
      payload.gatheringId = gatheringId
      payload.gatheringName = event.gatheringName
    }
    if (snap.empty) {
      payload.createdAt = FieldValue.serverTimestamp()
      await db.collection('events').add(payload)
      summary.events.created++
    } else {
      await snap.docs[0].ref.update(payload)
      summary.events.updated++
    }
  }
}

// -----------------------------------------------------------------------
// Pass 3 — Users
// -----------------------------------------------------------------------
const userOutputs = [] // { email, status, passwordResetLink, errors }

if (!only || only === 'users') {
  for (const user of users) {
    try {
      // Lookup or create Auth account.
      let authUser
      let createdNow = false
      try {
        authUser = await auth.getUserByEmail(user.email)
      } catch (err) {
        if (err.code !== 'auth/user-not-found') throw err
        authUser = await auth.createUser({
          email: user.email,
          password: randomBytes(16).toString('hex'),
          displayName: user.displayName,
        })
        createdNow = true
      }

      const uid = authUser.uid

      // Resolve hosted-groups to ids (only for hosts) and ensure host
      // memberships include their hosted groups.
      const hostedGatheringIds = user.role === 'host'
        ? user.hostedGroups
            .map(name => groupNameToId.get(name))
            .filter(Boolean)
        : []
      const memberOfGroupIds = user.memberOfGroups
        .map(name => groupNameToId.get(name))
        .filter(Boolean)
      // Hosts are also members of every group they host.
      const allMembershipIds = new Set([
        COMMUNITY_GATHERING_ID,
        ...memberOfGroupIds,
        ...hostedGatheringIds,
      ])

      // Upsert /users with merge (preserve portal-added fields like bio
      // if the sheet leaves them blank).
      const userPayload = {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: 'active',
        canPostKete: user.canPostKete,
        hostedGatherings: hostedGatheringIds,
        updatedAt: FieldValue.serverTimestamp(),
      }
      if (user.phone) userPayload.phone = user.phone
      if (user.bio) userPayload.bio = user.bio
      const userRef = db.collection('users').doc(uid)
      const userSnap = await userRef.get()
      if (userSnap.exists) {
        await userRef.update(userPayload)
      } else {
        await userRef.set({
          ...userPayload,
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      // Upsert /userProfiles mirror (conservative — only safe fields).
      const profilePayload = {
        id: uid,
        displayName: user.displayName,
        role: user.role,
        updatedAt: FieldValue.serverTimestamp(),
      }
      if (user.bio) profilePayload.bio = user.bio
      const profileRef = db.collection('userProfiles').doc(uid)
      const profileSnap = await profileRef.get()
      if (profileSnap.exists) {
        await profileRef.update(profilePayload)
      } else {
        await profileRef.set({
          ...profilePayload,
          createdAt: FieldValue.serverTimestamp(),
        })
      }

      // Write group memberships (idempotent — skip ones that already
      // exist).
      for (const gid of allMembershipIds) {
        const memberRef = db.collection('gatherings').doc(gid).collection('members').doc(uid)
        const memberSnap = await memberRef.get()
        if (!memberSnap.exists) {
          await memberRef.set({ joinedAt: FieldValue.serverTimestamp() })
        }
      }

      let passwordResetLink = ''
      if (createdNow) {
        try {
          passwordResetLink = await auth.generatePasswordResetLink(user.email)
        } catch (err) {
          console.error(`  generatePasswordResetLink failed for ${user.email}:`, err.message)
        }
        summary.users.created++
      } else {
        summary.users.existing++
      }

      userOutputs.push({
        email: user.email,
        status: createdNow ? 'created' : 'existing',
        passwordResetLink,
        errors: '',
      })
    } catch (err) {
      console.error(`Row ${user.rowNumber} (${user.email}) failed:`, err.message)
      summary.users.errors++
      userOutputs.push({
        email: user.email,
        status: 'error',
        passwordResetLink: '',
        errors: err.message,
      })
    }
  }
}

// -----------------------------------------------------------------------
// Output
// -----------------------------------------------------------------------
console.log(`\nDone.`)
console.log(`  Groups: ${summary.groups.created} created, ${summary.groups.updated} updated, ${summary.groups.skipped} skipped.`)
console.log(`  Events: ${summary.events.created} created, ${summary.events.updated} updated, ${summary.events.skipped} skipped.`)
console.log(`  Users:  ${summary.users.created} created, ${summary.users.existing} existing, ${summary.users.errors} errors.`)

if (userOutputs.length > 0) {
  const outputDir = resolve(ROOT, 'scripts', 'output')
  mkdirSync(outputDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputPath = resolve(outputDir, `seed-${stamp}.csv`)
  const lines = ['email,status,passwordResetLink,errors']
  for (const o of userOutputs) {
    const fields = [o.email, o.status, o.passwordResetLink, o.errors]
      .map(f => `"${String(f).replace(/"/g, '""')}"`)
    lines.push(fields.join(','))
  }
  writeFileSync(outputPath, lines.join('\n'), 'utf8')
  console.log(`\nPassword-reset links written to ${outputPath}`)
}
