# LIBRARIES

> **STUB — content pending.** Shared **util functions** in `src/lib/`. Not components —
> for components see `.agents/blueprints/components.md` and `src/components/`.

| Path | What it does |
|------|--------------|
| `src/lib/platform-logger.ts` | `platform.log()` — the only logger. Never `console.log()`. |
| `src/lib/auth.ts` | `getAuthenticatedUser`, `requireAuth`, `hasAccess`, `isStudent`, `isOrganizationMember` |
| `src/lib/utils.ts` | `cn()` and general helpers |
| `src/lib/date-utils.ts` | Date formatting / comparison |
| `src/lib/userid.ts` | User identifier helpers |
| `src/lib/apis.ts` | `apiGet` — thin fetch wrapper over `NEXT_PUBLIC_BACKEND_URL` |
| `src/lib/apis/` | Service clients — see `.agents/context/architecture.md` |
| `src/lib/sse/` | Event emitters — see `.agents/blueprints/realtime.md` |
| `src/lib/cgpa-utils.ts`, `cgpa-types.ts` | CGPA domain logic |
| `src/lib/apl-knockout.ts`, `apl-substitution-compliance.ts` | APL domain logic |
| `src/lib/constants/` | Shared constants (`dept-rep-map.ts`) |
| `src/lib/rate-limit.ts` | `checkRateLimit`, `tooManyRequests`, `limitApiRequest` — global `/api` limit (middleware) and per-route limits |
| `src/lib/haptics.ts` | `triggerHaptic()`, `haptic.*` — the shared haptics helper |
| `src/lib/forms/` | Form builder — schema, zod validator, conditions engine, theme, sanitize, Strapi access |
| `src/lib/inductions/` | Inductions — access guards, Strapi access, emails, calendar sync, role stats |
| `src/lib/admin/` | Admin portal — allowed clubs, Strapi admin queries |
| `src/lib/metrics/` | `getCachedPlatformMetrics` — cached platform metrics |

## TODO
- [ ] Per-function signatures and usage examples
- [ ] Which helpers are server-only vs safe on the client
