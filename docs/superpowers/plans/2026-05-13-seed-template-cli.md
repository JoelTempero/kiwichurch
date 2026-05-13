# Plan — Seed Template + CLI

Spec: `docs/superpowers/specs/2026-05-13-seed-template-cli-design.md` (commit ab090cc)

Three commits. No live Firebase needed for the build of the script itself; service-account-driven testing is left to Joel.

---

## Task 4 · Scaffolding + deps + README

**Steps:**
1. Update `package.json`:
   - Add `"seed": "node scripts/seed.js"` and `"build-template": "node scripts/build-template.js"` to scripts
   - Add `"xlsx": "^0.18.5"` and `"firebase-admin": "^12.6.0"` to devDependencies
2. Run `npm install` to lock the new packages
3. `.gitignore` — append `serviceAccount.json` and `scripts/output/*.csv`
4. Create `scripts/output/.gitkeep`
5. Create `scripts/README.md` covering:
   - What the script does
   - How to export a service account JSON from Firebase Console
   - Where to put it (`serviceAccount.json` at repo root)
   - Commands: `npm run build-template`, `npm run seed -- ./path/to/file.xlsx`, `npm run seed -- ./file.xlsx --dry-run`, `--only=users` flag
   - Output location (scripts/output/)
   - Troubleshooting: missing service account, parse errors, idempotency
6. Build (script doesn't affect Vite), commit.

---

## Task 5 · Template generator

**Steps:**
1. Create `scripts/build-template.js` (CommonJS, no transpile):
   - Require `xlsx`
   - Build four worksheets: README, Groups, Events, Users with the exact columns from the spec
   - README sheet is a single column with multi-line cells of instructions; bold the header row
   - For each data sheet: header row only, no data rows
   - Data validation via XLSX's `!dataValidation` cell-level dropdowns for the enum columns (`isPublic`, `role`, `canPostKete`)
   - Write to `templates/kiwichurch-seed-template.xlsx`
2. Run `npm run build-template` to generate the file
3. Verify the file exists and is non-empty
4. Commit both `scripts/build-template.js` and the generated `templates/kiwichurch-seed-template.xlsx`

---

## Task 6 · Seed CLI

**Steps:**
1. Create `scripts/seed.js` (CommonJS):
   - Parse argv: `[, , xlsxPath, ...flags]`. Read `--dry-run`, `--only=<sheet>` from flags.
   - Read `serviceAccount.json` from repo root; clear error if missing.
   - Initialize `firebase-admin` with the service account.
   - Get `auth = admin.auth()` and `db = admin.firestore()`.
   - Read the xlsx file via `xlsx.readFile()`, extract rows from each sheet (`xlsx.utils.sheet_to_json`).
   - **Pass 1 — validate:**
     - Check headers on each sheet match the template; fail fast if off.
     - Validate each row (required fields, type, enum values, cross-sheet references).
     - Collect a list of `{ sheet, rowNumber, error }` entries; if any, print all and exit 1.
   - **Pass 2 — Groups:**
     - For each Groups row: query Firestore `where('name', '==', name).limit(1)`. Update or add. Track id by name.
     - Batched at 450 ops.
   - **Pass 2 — Events:**
     - For each Events row: query `where('title', '==', title).where('date', '==', date).limit(1)`. Resolve `gatheringName → gatheringId`. Update or add.
   - **Pass 3 — Users:**
     - For each Users row:
       - `auth.getUserByEmail(email)` in try/catch
       - on not-found: `auth.createUser({ email, password: crypto.randomBytes(16).toString('hex'), displayName })`
       - upsert `/users/{uid}` with `update()` (or `set({}, {merge:true})` if not exists)
       - upsert `/userProfiles/{uid}` with the safe-field subset
       - resolve all groups (memberOf + hostedGroups + community), write member docs
       - if created: `auth.generatePasswordResetLink(email)` → push to output
   - **Output:**
     - Console summary
     - Write CSV to `scripts/output/seed-${isoTimestamp}.csv`
   - **Dry-run:** runs Pass 1 fully, simulates Pass 2 + Pass 3 with counts only, no Auth provisioning, no writes.
2. Verify the script loads without crashing (`node scripts/seed.js` with no args prints usage and exits 0)
3. Manual-verify a `--dry-run` against the template — this will fail at "service account missing" if Joel hasn't set one up, which is fine for the build phase.
4. Commit.

**Acceptance criteria:** `node scripts/seed.js` shows usage; `node scripts/seed.js path.xlsx --dry-run` parses + validates the template (with mock service account or clear error); script crashes safely on bad input.

---

## Critique pass (after Task 6)

- Make sure no top-level imports in `scripts/` leak into the Vite bundle (Vite shouldn't pick up `scripts/` — verify by inspecting the build output is unchanged).
- Confirm `xlsx` and `firebase-admin` are in `devDependencies`, not `dependencies`.
- Confirm `serviceAccount.json` and `scripts/output/*.csv` are gitignored.
- Confirm `templates/kiwichurch-seed-template.xlsx` is checked in.
