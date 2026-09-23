# Strapi collection types for the Form Builder

Paste-ready Strapi v4 content-type schemas. Create them via the Content-Type
Builder, or drop each JSON into `src/api/<name>/content-types/<name>/schema.json`
on the **Strapi** repo (not this Next.js repo), then restart Strapi.

## Order of operations
1. Create **`form`** (`form.json`).
2. Create **`form-response`** (`form-response.json`).
3. Add the inverse relation on the existing **`organisation`** content type:
   a `oneToMany` field named `forms` targeting `api::form.form`, mapped by
   `organisation`. (The `form.json` below already declares its side.)
4. In **Settings → Roles → Authenticated / Public**, do **not** expose these
   publicly — all access goes through the Next.js API using the server
   `STRAPI_API_TOKEN`. The token needs find/findOne/create/update/delete on both
   collections.

## Notes
- `form.form_uid` is the public uuid used in URLs; numeric ids never reach the browser.
- `form.stats` JSON shape: `{ "uniqueVisits": 0, "draftCount": 0, "submissionCount": 0, "lastSubmissionAt": null }`. `completionRate` is derived at read time, never stored.
- One `form-response` row per `(form, respondent_email)` doubles as the visit record, draft, and submission. Uniqueness is enforced in the Next.js API layer, not by a DB constraint.
