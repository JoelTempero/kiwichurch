// Regenerates templates/kiwichurch-seed-template.xlsx from code.
// Run: `npm run build-template`.
//
// The template has four sheets:
//   - README   : instructions, no data
//   - Groups   : one row per gathering
//   - Events   : one row per event
//   - Users    : one row per person, with comma-separated group references
//
// Validation (allowed values, formats) is documented on the README sheet;
// scripts/seed.js enforces it programmatically on ingest.
import * as XLSX from 'xlsx'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(ROOT, 'templates', 'kiwichurch-seed-template.xlsx')

// -----------------------------------------------------------------------
// Sheet definitions
// -----------------------------------------------------------------------

const README_LINES = [
  ['Kiwi Church seed template'],
  [''],
  ['How to use this file:'],
  [
    '  1. Fill the Groups, Events, and Users sheets — one row per row of data.',
  ],
  ['  2. Leave the header row exactly as it is. Do not rename columns.'],
  ['  3. Send the filled file back. The seed script writes everything to the live site in one pass.'],
  [''],
  ['Conventions:'],
  ['  Dates  → YYYY-MM-DD (e.g. 2026-05-31)'],
  ['  Times  → HH:MM in 24-hour format (e.g. 09:30 or 19:00)'],
  ['  Booleans → the exact words TRUE or FALSE (uppercase)'],
  ['  Lists  → comma-separated, e.g. "Hanson\'s Lane, Sunday Crew"'],
  [''],
  ['Re-running:'],
  ['  Editing a row and re-sending the file is safe — existing groups/events/users get updated, no duplicates.'],
  ['  Removing a row does NOT delete anything from the live site. Deletions are manual via the admin UI.'],
  [''],
  ['─── Groups sheet ───'],
  ['  name           required, text, e.g. "Hanson\'s Lane"'],
  ['  description    optional, text'],
  ['  rhythm         optional, free text like "Weekly Sunday 4pm"'],
  ['  location       optional, text'],
  ['  isPublic       required, TRUE or FALSE — public groups let anyone read the board'],
  ['  color          optional, hex like #1a3a2f'],
  [''],
  ['─── Events sheet ───'],
  ['  title          required, text'],
  ['  date           required, YYYY-MM-DD'],
  ['  time           required, HH:MM'],
  ['  endTime        optional, HH:MM'],
  ['  location       required, text'],
  ['  description    optional, text'],
  ['  gatheringName  optional, must match a Groups.name row or be blank (= church-wide)'],
  ['  isPublic       required, TRUE or FALSE'],
  [''],
  ['─── Users sheet ───'],
  ['  email           required, the email used to log in'],
  ['  displayName     required, full name'],
  ['  role            required, one of: admin, host, member'],
  ['  phone           optional'],
  ['  bio             optional'],
  ['  memberOfGroups  optional, comma-separated Groups.name values (the Kiwi Church community is auto-joined)'],
  ['  hostedGroups    optional, comma-separated Groups.name values (only honored when role = host; auto-added to memberOfGroups)'],
  ['  canPostKete     optional, TRUE or FALSE (admins and hosts already have permission, no need to set)'],
  [''],
  ['Questions? Email Joel — joel@tempero.nz'],
]

const GROUPS_HEADERS = [
  'name',
  'description',
  'rhythm',
  'location',
  'isPublic',
  'color',
]

const EVENTS_HEADERS = [
  'title',
  'date',
  'time',
  'endTime',
  'location',
  'description',
  'gatheringName',
  'isPublic',
]

const USERS_HEADERS = [
  'email',
  'displayName',
  'role',
  'phone',
  'bio',
  'memberOfGroups',
  'hostedGroups',
  'canPostKete',
]

// -----------------------------------------------------------------------
// Build workbook
// -----------------------------------------------------------------------

function buildSheet(headerRow, exampleRows = []) {
  // aoa_to_sheet preserves order; example rows make the empty template
  // less intimidating to the client.
  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...exampleRows])
  // Reasonable column widths so the sheet doesn't open with collapsed text.
  sheet['!cols'] = headerRow.map(() => ({ wch: 22 }))
  // Freeze the header row.
  sheet['!freeze'] = { xSplit: 0, ySplit: 1 }
  return sheet
}

function buildReadme() {
  const sheet = XLSX.utils.aoa_to_sheet(README_LINES)
  sheet['!cols'] = [{ wch: 100 }]
  return sheet
}

const GROUP_EXAMPLES = [
  // Example row — clients can delete or replace.
  ['Hanson\'s Lane', 'A Sunday gathering at Hanson\'s Lane.', 'Weekly Sunday 4pm', 'Hanson\'s Lane', 'TRUE', '#1a3a2f'],
]

const EVENT_EXAMPLES = [
  ['Sunday Gathering', '2026-06-07', '16:00', '17:30', 'Hanson\'s Lane', '', 'Hanson\'s Lane', 'TRUE'],
]

const USER_EXAMPLES = [
  ['darryl@example.com', 'Darryl Tempero', 'admin', '', '', '', '', ''],
  ['member@example.com', 'Jane Doe', 'member', '', '', 'Hanson\'s Lane', '', ''],
]

const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, buildReadme(), 'README')
XLSX.utils.book_append_sheet(workbook, buildSheet(GROUPS_HEADERS, GROUP_EXAMPLES), 'Groups')
XLSX.utils.book_append_sheet(workbook, buildSheet(EVENTS_HEADERS, EVENT_EXAMPLES), 'Events')
XLSX.utils.book_append_sheet(workbook, buildSheet(USERS_HEADERS, USER_EXAMPLES), 'Users')

mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
XLSX.writeFile(workbook, OUTPUT_PATH)

console.log(`Template written to ${OUTPUT_PATH}`)
