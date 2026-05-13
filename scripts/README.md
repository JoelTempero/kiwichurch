# Kiwi Church seed scripts

Local tools for onboarding a new (or topping up an existing) Kiwi Church
deployment from a client-fillable Excel template.

There are two scripts here:

- `build-template.js` — regenerates `templates/kiwichurch-seed-template.xlsx`
  from code. Run this whenever the template's columns / dropdowns / README
  text change so the binary `.xlsx` in `templates/` stays in sync.
- `seed.js` — reads a filled-in template and writes the data to Firestore
  via the Firebase Admin SDK. Creates Auth accounts for new users and
  generates password-reset links so members can set their own passwords.

Both scripts are dev-only — they live outside `src/` and never ship in the
portal bundle. They are run locally by Joel (or whoever owns onboarding).

---

## Service-account setup (one-off)

1. Open the [Firebase Console](https://console.firebase.google.com/) and
   pick the project.
2. ⚙️ Project Settings → **Service Accounts**.
3. Click **Generate new private key**. A JSON file downloads.
4. Save it as `serviceAccount.json` at the **repo root** (the same folder
   as `package.json`).

`.gitignore` already excludes `serviceAccount.json` — do not commit it,
do not paste it anywhere public. If it leaks, rotate immediately via the
console (Service Accounts → existing key → Delete).

---

## Templates

### Regenerate the .xlsx

```sh
npm run build-template
```

Writes `templates/kiwichurch-seed-template.xlsx`. Commit the file so
clients can pull the latest version straight from the repo.

### Sheet conventions

The template has four sheets:

- **README** — instructions. Read the cells, don't edit them.
- **Groups** — one row per group. Required: `name`, `isPublic`.
- **Events** — one-off events only. Recurring series are admin-driven in
  the portal. Required: `title`, `date`, `time`, `location`, `isPublic`.
- **Users** — one row per person. Required: `email`, `displayName`,
  `role`. Cross-sheet references (`memberOfGroups`, `hostedGroups`,
  `Events.gatheringName`) must match a `Groups.name` row exactly, or be
  blank.

The Kiwi Church community gathering is auto-joined for every user — no
need to list it in `memberOfGroups`.

---

## Running the seed

```sh
# Dry run: validate + preview, write nothing
npm run seed -- ./path/to/filled-template.xlsx --dry-run

# Apply
npm run seed -- ./path/to/filled-template.xlsx

# Only one sheet (useful when debugging)
npm run seed -- ./path/to/filled-template.xlsx --only=users
```

### Pipeline

1. **Pass 1 — Parse + validate.** Headers checked, every cell typed,
   cross-sheet references resolved. All errors collected, then printed
   together. If anything fails, the script exits 1 and writes nothing.
2. **Pass 2 — Upsert groups, then events.** Match groups by `name`,
   events by `(title, date)`. Updates non-blank fields on existing
   docs; adds new docs otherwise.
3. **Pass 3 — Users.** Look up each by email. Create Firebase Auth
   accounts for new emails with a random throwaway password. Upsert
   `/users` + `/userProfiles` mirror. Write group memberships
   (memberOfGroups + hostedGroups + community). Generate a password-
   reset link for every newly-created account.

### Output

- Console summary: counts of created / updated rows per sheet.
- CSV file at `scripts/output/seed-<ISO-timestamp>.csv` with columns
  `email, status, passwordResetLink, errors`. Forward this to the
  client; password-reset links are how members set their own password.
  Each link is single-use; if a member doesn't click in time, ask the
  admin to re-issue from the portal Settings page.

### Idempotency

- Re-running with the same file is a no-op.
- Adding rows = new docs.
- Editing a row's non-key fields = those fields get overwritten on the
  existing doc. Portal-added fields that aren't in the sheet (bios,
  interests, gallery, privacy toggles) are **preserved**.
- **Removing rows from the sheet does NOT delete anything from
  Firestore.** Deletions are manual via the admin UI. This is a
  deliberate safety property.

---

## Troubleshooting

**"serviceAccount.json not found"** — see Service-account setup above.

**"validation errors" listing rows** — fix the rows in the sheet, save,
re-run. Validation runs before any writes, so it's safe to iterate.

**"FirebaseError: 16 UNAUTHENTICATED"** — the service-account JSON is
for the wrong project. Re-download from the right Firebase project.

**Users disappear from a group after re-running** — they shouldn't.
Memberships are only added, never removed. If you see this, capture
the output and open an issue.

**Password-reset links expire** — Firebase reset links are usually
valid for a few hours. If you can't distribute in time, re-run with
the same sheet — the script will skip existing users and not generate
new links. Have the admin re-issue from the Settings page for stragglers.
