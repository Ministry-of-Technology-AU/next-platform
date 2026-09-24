# Google Workspace Blueprint

How `next-platform` talks to Google: Drive, Calendar, mail, and Google sign-in tokens used
outside NextAuth. Read this before adding anything that calls a Google API or sends mail.

Everything here runs **on the server**. The browser never holds our Google credentials; it calls
our route handlers, which call the wrappers in `src/lib/apis/`. The one exception is the semester
planner, which uses the student's **own** Google token (section 5).

---

## 1. What we use and how

| Service | How | Wrapper | Acting as |
|---|---|---|---|
| Drive | `@googleapis/drive` | `src/lib/apis/drive.ts` | The platform's Google account (refresh token) |
| Calendar (shared calendars) | `@googleapis/calendar` | `src/lib/apis/calendar.ts` | The platform's Google account (refresh token) |
| Calendar (a student's own) | Plain `fetch` to the REST API | inside `api/platform/semester-planner/calendar/route.ts` | The student, via a short-lived OAuth token |
| Mail | SMTP through `nodemailer` (not the Gmail API) | `src/lib/apis/mail.ts` | Tech Ministry or SG mailbox, with an app password |
| Google userinfo | Plain `fetch` | inside `api/platform/cgpa-planner/route.ts` | Verifies a bearer token from an external client |
| Sheets | Not used | `src/lib/apis/sheets.ts` is an empty file | |

### 1.1 Why the per-API packages

We import `@googleapis/drive` and `@googleapis/calendar`, **not** `googleapis`. The full SDK
loads all 317 Google APIs when it is imported: 182 MB on disk and about 107 MB of RAM (measured).
The two packages together are about 4 MB on disk and about 20 MB of RAM, with the same API.

Need another Google API? Install its own package (`@googleapis/sheets`, `@googleapis/gmail` …).
**Never add `googleapis` back.**

```ts
import { auth, drive as createDrive } from '@googleapis/drive'

const client = new auth.OAuth2(clientId, clientSecret, redirectUri)
client.setCredentials({ refresh_token })
const drive = createDrive({ version: 'v3', auth: client })
```

---

## 2. Drive (`src/lib/apis/drive.ts`)

Auth: an OAuth2 client (`DRIVE_CLIENT_ID`, `DRIVE_CLIENT_SECRET`) with a long-lived
`DRIVE_REFRESH_TOKEN`. The redirect URI is the OAuth Playground, which is where the refresh token
was generated.

| Export | Does |
|---|---|
| `uploadToDrive(file)` | Uploads into `GOOGLE_DRIVE_FOLDER_ID`, makes it **readable by anyone with the link**, returns id and links |
| `downloadFromDrive(fileId)` | Metadata and full contents as a `Buffer` |
| `deleteFromDrive(fileId)` | Deletes the file |
| `extractFileIds(path)` | File ids from a comma-separated list of Drive links |
| `getEmailAttachments(path)` | Downloads every file in that list, skipping ones that fail |
| `getPublicEmbedLink(fileId)` | `drive.google.com/uc?export=view&id=…` |
| `uploadImageAndGetEmbedLink(file, name)` | Upload, then the embed link |
| `drive` | The raw client, for calls the wrapper doesn't cover |

Types: `DriveFile` (`filename`, `content`, `contentType`), `UploadedFile`.

**Used by:** SG Compose. `sg-compose/new` uploads attachments; `sg-compose/dashboard` downloads
them to attach to the outgoing mail, then deletes them.

**Conventions**

- Everything goes into the one folder, `GOOGLE_DRIVE_FOLDER_ID`.
- An attachment "path" stored in Strapi is a comma-separated list of Drive links. Parse it with
  `extractFileIds`.
- **Uploaded files are public by link.** Don't upload anything private through `uploadToDrive`.
- **Images go to Cloudinary, not Drive.** Drive embed links are slow, get rate-limited when used
  as `<img src>`, and have no resizing. See `src/lib/apis/CLOUDINARY-API-GUIDE.md`.
- Downloads are held in memory in full. Fine for email attachments; don't use it for large files.

---

## 3. Calendar, shared calendars (`src/lib/apis/calendar.ts`)

Auth: an OAuth2 client (`DRIVE_CLIENT_ID`, `DRIVE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) with
`GOOGLE_REFRESH_TOKEN`. Same Google Cloud client as Drive, different refresh token.

| Export | Does |
|---|---|
| `getEvents(calId, start, end, eventId?)` | Events in a range, or one event by id |
| `addEvent(calId, event, sendUpdates = 'all')` | Creates an event |
| `updateEvent(calId, eventId, event, sendUpdates = 'all')` | Replaces an event |
| `deleteEvent(calId, eventId, sendUpdates = 'all')` | Deletes an event |
| `GoogleEvent` | Our event shape, loosely matching `calendar_v3.Schema$Event` |

`calId` defaults to `GOOGLE_CALENDAR_ID` when passed as `undefined`.

**The calendars**

| Env key | Calendar | Used by |
|---|---|---|
| `GOOGLE_CALENDAR_ID` | Campus events | `api/platform/events`, `events/[id]` (Events Calendar tool) |
| `INDUCTIONS_CALENDAR_ID` | Induction deadlines | `lib/inductions/calendar-sync.ts`, `api/organisations/profile`, `api/platform/organisations-catalogue/track/[id]` |

**Inductions calendar.** Each organisation's active cycle gets one all-day event on its deadline,
with the open roles and form links in the description. Its id is saved back to the organisation
in Strapi as `calendar_event_id`. When a student tracks an organisation, they are added as an
attendee, so the deadline appears in their own calendar.

**`sendUpdates`.** The default `'all'` emails every attendee on every change. Pass `'none'` for
background syncs and attendee changes, as the inductions code does. A loop that updates events
with `'all'` sends a flood of emails.

---

## 4. Mail (`src/lib/apis/mail.ts`)

SMTP through `nodemailer`, using a Gmail app password. Not the Gmail API.

| Function | Sends as | Env | Use for |
|---|---|---|---|
| `sendMail(params)` | Tech Ministry mailbox | `TECHMAIL_ID`, `TECHMAIL_PWD` | Everything platform-generated: feedback, RTI, Wi-Fi tickets, Wordle invites, form and induction emails, ad submissions |
| `sendMailSG(params)` | SG mailbox | `SGMAIL_ID`, `SGMAIL_PWD` | Only SG Compose, where mail must come from the Student Government |

`MAIL_SERVICE` picks the nodemailer service (default `gmail`). Spaces are stripped from the
passwords, since Google shows app passwords in groups of four.

`params`: `to`, `subject`, `text` and/or `html`, and optionally `from`, `alias` (display name,
giving `Alias <address>`), `cc`, `bcc`, `replyTo`, `attachments`.

**Rules**

- Mail is sent from the request that triggers it. Keep it off hot paths, and don't await it
  inside a loop over many recipients; batch them into `bcc` or send in parallel with a small cap.
- Google Workspace limits how much one account can send per day (in the low thousands; check
  Google's current numbers). A bulk send can lock the mailbox for 24 hours, which stops every
  platform email. Large announcements go through SG Compose, not a loop over `sendMail`.
- Never put a student's email in `to` for mail about someone else. Use `bcc` for group sends.

---

## 5. Calendar, a student's own (semester planner)

The semester planner adds a student's timetable to **their own** Google Calendar. This does not
use NextAuth or the wrappers above.

```
client ── GET /api/platform/semester-planner?action=oauth-url ──► Google consent screen (popup)
                                                                   scope: calendar.events
Google ── redirect ──► /api/calendar/callback
                         └─ exchanges the code for tokens (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET)
                         └─ postMessage({ accessToken }) to the opener, then closes
client ── POST /api/platform/semester-planner/calendar (Bearer accessToken) ──► Google Calendar REST
```

- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` is a **separate** OAuth client from the sign-in one
  (`AUTH_CLIENT_ID` / `AUTH_CLIENT_SECRET`). `CALENDAR_CALLBACK_URL` must match a redirect URI
  registered on it.
- Only the access token is kept, in the browser, for about an hour. The refresh token is thrown
  away, so nothing about the student's Google account is stored.
- Events carry a `TIMETABLE_SYNC_<academic year>` marker so a re-sync finds and replaces its own
  events without touching the student's other events.

---

## 6. CGPA planner: Google bearer tokens

`api/platform/cgpa-planner` accepts either the normal session or an `Authorization: Bearer
<Google access token>` from an external client (CORS is open for this). It verifies the token by
calling Google's userinfo endpoint and checks the email is on `ALLOWED_EMAIL_DOMAIN`. Copy this
pattern only if another tool needs to accept calls from outside the site.

---

## 7. Environment keys

Referenced by name only. Never open `.env`.

| Key | Used for |
|---|---|
| `DRIVE_CLIENT_ID`, `DRIVE_CLIENT_SECRET` | OAuth client for Drive **and** shared calendars |
| `DRIVE_REFRESH_TOKEN` | Drive |
| `GOOGLE_DRIVE_FOLDER_ID` | Upload folder |
| `GOOGLE_REFRESH_TOKEN`, `GOOGLE_REDIRECT_URI` | Shared calendars |
| `GOOGLE_CALENDAR_ID` | Campus events calendar |
| `INDUCTIONS_CALENDAR_ID` | Induction deadlines calendar |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `CALENDAR_CALLBACK_URL` | Semester planner's per-student OAuth |
| `TECHMAIL_ID`, `TECHMAIL_PWD` | `sendMail` |
| `SGMAIL_ID`, `SGMAIL_PWD` | `sendMailSG` |
| `MAIL_SERVICE` | nodemailer service name |
| `GOOGLE_API_TOKEN_READONLY` | API key read by unused code in `events-calendar/data/calendar-data.ts` |

### 7.1 Refresh tokens

The Drive and Calendar refresh tokens were generated in the Google OAuth Playground against the
platform's OAuth client. If Drive or Calendar calls start failing with `invalid_grant`, the
token has been revoked or has expired (for example, a password change on that Google account,
or the OAuth app being in "Testing" mode, where tokens expire after 7 days). To replace one:

1. OAuth Playground → settings → "Use your own OAuth credentials" → the client id and secret.
2. Authorise the scope (`https://www.googleapis.com/auth/drive` or
   `https://www.googleapis.com/auth/calendar`) signed in as the platform account.
3. Exchange the code, copy the refresh token into the server's env, restart the app.

Which Google account owns each token: TBD. Record it here when confirmed.

---

## 8. Cost and caching

- Google calls go out to the internet and are slow (100 to 500 ms). Never call Google in a loop
  inside a request.
- Campus events are the same for everyone. When the Events Calendar page is fixed, cache
  `getEvents` for `GOOGLE_CALENDAR_ID` in L2 with a tag (see `caching.md`), keyed by calendar
  and month only.
- Ask for the fields you use. `getEvents` currently requests `fields: "*"`, the largest possible
  response.
- Drive downloads and mail attachments sit in Node's memory while they are processed. Keep them
  small.

---

## 9. Known issues

Fix these when you work on the file.

| Where | Issue | Fix |
|---|---|---|
| `api/platform/events/route.ts`, `events/[id]/route.ts` | Take `calId` from the query string, so any signed-in user can read any calendar the platform account can see | Allow only known calendar ids |
| Same files | Start with `"use server"`, which is for server actions, not route handlers | Remove it |
| `lib/apis/calendar.ts` | `fields: "*"` and logs whole event lists | Request the fields used; log counts |
| `lib/apis/mail.ts` | `sendMail` and `sendMailSG` are copies, and each call opens a new SMTP connection | One helper taking the account; reuse the transporter |
| `lib/apis/drive.ts` | Every upload is public by link | Make public sharing an explicit option |
| `events-calendar/data/calendar-data.ts` | `getCalendarEvents()` and `GOOGLE_API_TOKEN_READONLY` are unused | Delete |
| `lib/apis/sheets.ts` | Empty file | Delete, or add `@googleapis/sheets` when needed |
