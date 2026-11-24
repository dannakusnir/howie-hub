# Portal ingest: the per-session routine

After each coaching session, Athena (the Claude Code session) turns the material in the
session's Drive folder into a DRAFT in the portal. Howie reads it, edits it if needed, and
publishes it himself. The automation cannot publish: there is no publish call in the ingest
path, and the database refuses a published row that has no `published_by`.

## What goes in the Drive folder

- the session transcript
- the debrief audio and its transcript
- the slides (PDF)

## Steps

1. **Write the summary and lists.** Athena reads the folder and writes, in Howie's voice
   and from his experience: a title, a summary (Markdown), the tasks for the client, and
   the "next time" checklist.
2. **Fill in the session file.** One JSON file per session (example below). Assets are
   listed by local file path; the script works out size, checksum and storage path.
3. **Dry run first.**
   ```
   export PORTAL_BASE_URL=https://<portal host>
   export PORTAL_INGEST_TOKEN=<the ingest token>
   npx tsx --conditions=react-server scripts/portal-ingest.mts session.json --dry-run
   ```
   It validates everything and prints what it would send. Nothing is uploaded.
4. **Real run.** Same command without `--dry-run`. The script uploads each file straight to
   the private store (through a short-lived token from `/api/portal/upload`), then posts the
   draft to `/api/portal/ingest/session`, and prints the result and the edit link.
5. **Howie opens the edit link**, fixes anything, and publishes. Only then does the client see it.

## Session file

```json
{
  "orgId": "<organisation uuid>",
  "schemaVersion": 1,
  "org": "acme",
  "program": "yes-causing-course",
  "sessionNumber": 3,
  "heldOn": "2026-12-15",
  "title": "...",
  "summaryMd": "...",
  "tasks": [{ "text": "..." }],
  "nextTime": [{ "text": "..." }],
  "assets": [
    { "kind": "slides_pdf", "file": "./slides.pdf", "label": "Slides" },
    { "kind": "audio", "file": "./session.m4a", "label": "Session audio" }
  ],
  "source": { "driveFolderId": "<drive folder id>", "contentHash": "<any stable hash of the inputs>" }
}
```

`orgId` is only for the script (it builds the storage path); it is not sent to the portal.
Asset kinds and their allowed file types and sizes are in `lib/portal/asset-kinds.ts`.
Never add a `status` field: the portal rejects unknown fields with a 400 naming the field.

## Running it twice

- Same content again: the answer is `unchanged`, no duplicate.
- Changed content on a draft nobody has touched: `updated`. Files dropped from the list are
  deleted from storage.
- Howie has edited the draft by hand: refused (409 `human_edited`) so his edits are not lost.
  Add `"force": true` to the session file only if you really mean to overwrite them.
- Already published: refused (409 `already_published`). Always.

## Answers you may see

| Answer | Meaning |
| --- | --- |
| refusing to run: environment variable(s) not set | Set `PORTAL_BASE_URL` and `PORTAL_INGEST_TOKEN` (or name other variables with `--base-url-env` / `--token-env`). |
| 401 | Wrong or missing token. |
| 503 `ingest_not_configured` | The portal has no `PORTAL_INGEST_TOKEN` set; nothing is accepted until it does. |
| 400 `invalid_body` | The file does not match the schema; the message names the field. |
| 404 | Unknown organisation, program, or no engagement for that pair. |
| 409 | `already_published` or `human_edited` (see above). |
| 422 | Session number out of range, or an asset path outside this session's folder or already in use. |

Uploaded files get a name that includes a fingerprint of their content, so re-running with
the same file reuses it and a changed file gets a new name (existing files are never overwritten).
