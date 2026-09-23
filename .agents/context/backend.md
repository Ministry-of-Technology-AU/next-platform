# BACKEND GUIDELINES

> **STUB — content pending.** Architecture overview: `.agents/context/architecture.md`.

Server-side concerns for `next-platform`: route handlers, auth, Strapi access, Google Workspace,
Cloudinary. The frontend never talks to an external service directly — it goes through
`src/app/api/`.

## Where things live now
| Concern | Source of truth |
|---------|-----------------|
| Route handler contract | `.agents/blueprints/route.md` |
| Strapi queries | `.agents/blueprints/strapi.md` + `src/lib/apis/strapi.ts` |
| Caching tiers | `.agents/blueprints/caching.md` |
| SSE / realtime | `.agents/blueprints/realtime.md` |
| Google Workspace | `.agents/blueprints/google-workspace.md` |
| Cloudinary | `src/lib/apis/CLOUDINARY-API-GUIDE.md` |
| Auth + access checks | `src/lib/auth.ts` |

## TODO
- [ ] Auth model — roles, `hasAccess` conventions, who gets what
- [ ] Error + response envelope conventions (`{ success, data, error }`)
- [ ] Rate limiting and abuse handling
- [ ] Webhooks (`WEBHOOK_SECRET_TOKEN`)
- [ ] Logging and observability on the EC2 box
