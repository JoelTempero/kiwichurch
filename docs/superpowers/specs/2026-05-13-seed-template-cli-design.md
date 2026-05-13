# Seed Template + Ingestion CLI — Design Spec

**Date:** 2026-05-13
**Scope:** A client-fillable Excel template and a local Node.js CLI for bulk-seeding Groups, Events, and Users into Firestore during client onboarding. Companion spec: [`2026-05-13-admin-workflow-features-design.md`](./2026-05-13-admin-workflow-features-design.md).

## Problem

Kiwi Church (and any future client built on this stack) needs a starting collection of groups, events, and members before the portal feels alive. Doing this by hand through the admin UI is tolerable for 5 entries and painful for 50. The client also knows their data better than Joel does — they should fill it in, not Joel.

## Design

### Template — `templates/kiwichurch-seed-template.xlsx`

One `.xlsx` file with four sheets, committed to the repo so Joel can hand it to any future client. Built once using the `xlsx` (SheetJS) library — produced by a small one-off generator script `scripts/build-template.js` so the template can be regenerated when columns evolve. Excel data validation (dropdowns, date format, email pattern) is configured directly in the .xlsx by the generator.

**Sheet 1 — `README`** (instructions, no data rows):

- Overview: "Fill in the next three sheets; leave headers untouched; send the file back to Joel."
- Conventions: required vs optional columns, allowed values for dropdown columns, date format (`YYYY-MM-DD`), time format (`HH:MM` 24-hour).
- Per-sheet column reference with examples for each tricky cell.
- Explicit note: removing rows from a sheet does NOT delete anything from the live system — deletions are manual via the admin UI.

**Sheet 2 — `Groups`** (one row per group):

| Column | Required | Type | Notes |
|---|---|---|---|
| `name` | yes | text | Natural key. Used to resolve `Users.memberOfGroups` and `Events.gatheringName`. |
| `description` | no | text | Long-form. |
| `rhythm` | no | text | e.g. "Weekly Sunday 4pm". Free text. |
| `location` | no | text | |
| `isPublic` | yes | dropdown TRUE/FALSE | Public = anyone can read board posts; Private = members only. |
| `color` | no | text | Hex like `#1a3a2f`. Optional. |

**Sheet 3 — `Events`** (one-off events only — recurring series remain a portal-only feature):

| Column | Required | Type | Notes |
|---|---|---|---|
| `title` | yes | text | |
| `date` | yes | YYYY-MM-DD | |
| `time` | yes | HH:MM | 24-hour. |
| `endTime` | no | HH:MM | |
| `location` | yes | text | |
| `description` | no | text | |
| `gatheringName` | no | text | Must match a `Groups.name` row OR be blank (blank = church-wide). |
| `isPublic` | yes | dropdown TRUE/FALSE | |

**Sheet 4 — `Users`** (one row per person):

| Column | Required | Type | Notes |
|---|---|---|---|
| `email` | yes | email | Natural key. Auth account uses this. |
| `displayName` | yes | text | |
| `role` | yes | dropdown `admin`/`host`/`member` | |
| `phone` | no | text | |
| `bio` | no | text | |
| `memberOfGroups` | no | text | Comma-separated `Groups.name` values. The community gathering (`kiwi-church-community`) is always auto-joined, no need to list it. |
| `hostedGroups` | no | text | Comma-separated `Groups.name` values. Only honored when `role == host`. Listed groups are also auto-added to `memberOfGroups` (mirrors `dbService.ensureMembershipsForUser`). |
| `canPostKete` | no | dropdown TRUE/FALSE | Optional flag. Admin and host already imply true. |

### CLI — `scripts/seed.js`

**Location:** new top-level `scripts/` folder. `package.json` gets `"seed": "node scripts/seed.js"`.

**Dependencies** (devDependencies only — not shipped in the portal bundle):
- `xlsx` (SheetJS) — parse the template and write the generator template.
- `firebase-admin` — write to Firestore and provision Auth accounts.

**Auth setup:**

- Joel exports a service-account JSON from Firebase Console.
- Saves it locally as `serviceAccount.json` at the repo root.
- `.gitignore` excludes `serviceAccount.json` and `scripts/output/`.
- `scripts/README.md` documents the export flow.

**CLI surface:**

```
node scripts/seed.js <path-to-xlsx>              # apply changes
node scripts/seed.js <path-to-xlsx> --dry-run    # validate + preview, no writes
node scripts/seed.js <path-to-xlsx> --only=users # process only one sheet (debugging)
```

**Pipeline — three passes, in order:**

**Pass 1 — Parse + validate.**

- Load all four sheets. Verify column headers match the template exactly. Reject the file if any required header is missing or extra columns appear.
- For each data row, validate: required fields present, types correct (date format, email format, dropdown values), and cross-sheet references resolvable (`Events.gatheringName` and `Users.memberOfGroups` / `Users.hostedGroups` must map to known `Groups.name` rows OR be blank).
- Collect all errors per row before bailing — print every problem at once so the client can fix in one round-trip. Exit code 1 if validation fails. No writes happen until validation is clean.

**Pass 2 — Upsert Groups, then Events.**

- For each `Groups` row: query Firestore for a doc where `name == <row.name>`. If found, `update()` the matched doc with non-blank fields from the sheet. If not found, `add()` a new doc. Either way, capture the resulting doc id keyed by name for the Events pass.
- For each `Events` row: build a `(title, date)` natural key, query Firestore (`where('title', '==', t).where('date', '==', d)`). Resolve `gatheringName` to a `gatheringId` from the Groups map. Update or create as above.
- Writes are batched at 450 ops per batch (same chunk size as the announcement broadcaster in the portal code).

**Pass 3 — Provision Users.**

For each `Users` row:

1. Look up Firebase Auth by `email`:
   - `auth.getUserByEmail(email)` — try/catch on `auth/user-not-found`.
   - Existing → grab the `uid`, mark as "existing" in the output.
   - Not found → `auth.createUser({ email, password: randomBytes(16).toString('hex'), displayName })`, mark as "created".
2. Upsert `/users/{uid}` with `update()` on these fields only: `email`, `displayName`, `role`, `phone`, `bio`, `status: 'active'`, `canPostKete`, `hostedGatherings`, `updatedAt`. Use `update()` not `set()` — preserves any fields the user added through the portal after seeding (e.g. `interests`, `gallery`, `privacy`). When the doc doesn't exist yet, fall through to `set()` with merge.
3. Upsert `/userProfiles/{uid}` via the same privacy-respecting mirror logic the portal uses. The script doesn't have access to per-user privacy preferences yet, so it writes a conservative mirror: `displayName`, `role`, `bio` only. The user's own next login will run the portal's full mirror update and bring `phone`/`email` etc. into the mirror if their privacy toggles allow it.
4. Resolve `memberOfGroups + hostedGroups + ['kiwi-church-community']` (deduplicated) to group ids using the Groups map. For each id, write `gatherings/{groupId}/members/{uid}` with `{ id: uid, joinedAt: serverTimestamp() }` if it doesn't already exist.
5. For users marked "created" only: call `auth.generatePasswordResetLink(email)`, append `{ email, status: 'created', passwordResetLink, errors: [] }` to an output array.
6. For users marked "existing": append `{ email, status: 'existing', passwordResetLink: '', errors: [] }`.

**Output:**

When the run finishes:

- Console summary printed to stdout:
  ```
  Groups: 8 created, 2 updated.
  Events: 23 created, 0 updated.
  Users: 47 created, 3 existing, 0 errors.
  Password-reset links written to scripts/output/seed-2026-05-13-1432.csv
  ```
- CSV file at `scripts/output/seed-<ISO-timestamp>.csv` with columns `email, status, passwordResetLink, errors`. Joel forwards this to the client; the client emails the password-reset links to each member (or Joel mail-merges them).
- `--dry-run` does Pass 1 fully, prints what Pass 2 + Pass 3 would do (counts only — no Auth provisioning), and writes nothing.

### Idempotency contract

- Re-running with an unchanged file is a no-op: every row matches existing, every row is `update()`d with the same data, no Auth accounts are created.
- Adding rows = new docs / new Auth accounts.
- Editing a row's non-key fields = the matched doc's fields are overwritten with the sheet values. Portal-added fields not present in the sheet are preserved (`update()` semantics).
- Removing rows from the sheet = nothing happens in Firestore. Deletion is manual via the admin UI. Documented prominently in the README sheet.

### Error handling

- **Validation errors (Pass 1):** report all errors, exit 1, no writes.
- **Mid-write errors (Pass 2 + Pass 3):** log the failing row, continue with the next one. End-of-run summary shows successes + per-row failures. No transaction rollback — partial-success is the deliberate trade-off since re-running is safe.
- **Service account missing:** clear error message pointing at `scripts/README.md`.
- **`xlsx` file not found / not openable:** clear error, exit 1.

### Trade-offs

- **Service-account JSON sensitivity** — the `scripts/README.md` is explicit: do not commit, do not share, rotate immediately if it leaks. Standard Firebase Admin SDK trade-off; any alternative (running through the portal client-side) makes Auth-account provisioning a one-by-one HTTP dance with worse error handling.
- **No deletes** — explicit decision. The script is for additive onboarding, not ongoing sync. Once the platform is live, removal is admin's job through the UI.
- **No recurring events in the seed** — recurring series are admin-driven in the portal anyway, and a CSV/xlsx is a bad place to express recurrence rules. Out of scope.
- **`userProfiles` mirror written conservatively** — without per-user privacy preferences, the seed mirror only includes the safest fields. The portal's own mirror update on the user's first login fills in the rest, controlled by their toggles.
- **Validation is row-level, not cross-row** — duplicate group names, duplicate emails, etc. are caught in Pass 1 by the parse-and-validate logic.

## Files added

- `templates/kiwichurch-seed-template.xlsx` — the template handed to clients.
- `scripts/build-template.js` — one-off generator that produces the .xlsx using SheetJS. Run via `node scripts/build-template.js`. Lets the template evolve in code (column tweaks, dropdown values, README copy) without hand-editing a binary file.
- `scripts/seed.js` — the CLI.
- `scripts/README.md` — service-account setup, command reference, troubleshooting.
- `scripts/output/.gitkeep` — empty marker; outputs are gitignored.
- `.gitignore` entry — `serviceAccount.json` + `scripts/output/*.csv`.

## Files modified

- `package.json` — `"seed": "node scripts/seed.js"`, `"build-template": "node scripts/build-template.js"`, devDependencies `xlsx` + `firebase-admin`.

## Out of scope

- Admin upload UI in the portal — defer indefinitely. The CLI covers the onboarding use case; no live client has asked for self-serve bulk import.
- Recurring events in the seed — admin UI handles this.
- Photos / avatars — seed doesn't include image upload. Members upload their own photos in the portal.
- Family-link relationships — seed doesn't build the family-link collection. Members invite their own relatives.
- Deletes / row-disappear semantics — manual.

## Open questions

None at spec time. Concrete column lists and pipeline shape are above; plan converts each pass into a step-by-step.
