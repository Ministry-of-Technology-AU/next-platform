# Google Workspace Integration

> **STUB — content pending.** The wrappers exist and are the source of truth until this is
> filled in. Read `src/lib/apis/drive.ts`, `calendar.ts`, `mail.ts`, `sheets.ts` directly.

## Overview

All Google Workspace access is **server-side only**, through the `googleapis` SDK with
refresh-token auth. The browser never holds Google credentials — it calls our own route
handlers under `src/app/api/`, which call these wrappers.

## Wrappers

| File | Exports |
|------|---------|
| `src/lib/apis/drive.ts` | `uploadToDrive`, `downloadFromDrive`, `deleteFromDrive`, `getEmailAttachments`, `extractFileIds`, `getPublicEmbedLink`, `uploadImageAndGetEmbedLink`; types `DriveFile`, `UploadedFile` |
| `src/lib/apis/calendar.ts` | `GoogleEvent` type and calendar reads |
| `src/lib/apis/mail.ts` | `sendMail`, `sendMailSG` |
| `src/lib/apis/sheets.ts` | Sheets reads |

## Environment

Referenced by name only — never open `.env`.

`DRIVE_CLIENT_ID` · `DRIVE_CLIENT_SECRET` · `DRIVE_REFRESH_TOKEN` · `GOOGLE_DRIVE_FOLDER_ID` ·
`GOOGLE_CALENDAR_ID` · `CALENDAR_CALLBACK_URL` · `GOOGLE_REDIRECT_URI` ·
`GOOGLE_REFRESH_TOKEN` · `GOOGLE_API_TOKEN_READONLY` · `SGMAIL_ID` / `SGMAIL_PWD` ·
`TECHMAIL_ID` / `TECHMAIL_PWD` · `MAIL_SERVICE`

## TODO

- [ ] Auth setup — how refresh tokens were obtained, and how to rotate them
- [ ] Drive: folder conventions, permission model, attachment path format
- [ ] Calendar: which calendar, event shape, sync strategy
- [ ] Mail: when to use `sendMail` vs `sendMailSG`, templates, rate limits
- [ ] Sheets: which sheets, expected schemas
- [ ] Quota limits and failure handling
