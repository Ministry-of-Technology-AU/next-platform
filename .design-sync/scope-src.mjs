// Mirrors src/components/ into a scoped copy that excludes files with
// module-top-level `process.env` reads (Next-inlined env vars that only
// resolve inside a real Next.js/webpack build — under esbuild's browser IIFE
// bundle there is no `process` global, and a top-level access crashes the
// WHOLE shared bundle before window.AshokaDS is ever assigned, since synth-entry
// mode does `export * from <every src file>` with no per-file exclusion knob).
// cfg.srcDir points here instead of src/components directly. Re-run before
// every package-build.mjs, same as compile-css.mjs.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const SRC = 'src/components';
const OUT = '.design-sync/.cache/scoped-src';

// Files with a confirmed module-top-level `process.env.*` read (not inside a
// function/render body — those only fail their own component, not the bundle).
// Add to this list if the self-heal loop finds another one.
const EXCLUDE = [
  'apl/knockout-bracket-tree.tsx', // module-top-level process.env.NEXT_PUBLIC_STRAPI_URL
  'sidebar/app-sidebar.tsx', // imports next/image AND next/link (both read process.env at module top level)
  'landing-page/platform-carousel.tsx', // imports next/image
  'landing-page/popular-tools-grid.tsx', // imports next/link, whose has-base-path.js reads process.env.__NEXT_ROUTER_BASEPATH at module top level
  'landing-page/recently-visited.tsx', // imports next/link, same as above
  'navbar/navbar.tsx', // imports next/link, same as above
  'whats-new-modal.tsx', // imports next/link, same as above
  'sign-out-button.tsx', // imports next-auth/react directly, same crash as the real session-provider had
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(SRC, OUT, { recursive: true });
for (const rel of EXCLUDE) {
  rmSync(`${OUT}/${rel}`, { force: true });
}

// NextAuthProvider (providers/session-provider.tsx) is the unavoidable outer
// wrapper for every preview (cfg.provider) — can't be excluded like the files
// above. Its real implementation imports next-auth/react, whose react.js
// reads process.env.NEXTAUTH_URL/VERCEL_URL in a module-top-level object
// literal, so it crashes the whole bundle the instant it's evaluated,
// regardless of whether any preview actually uses auth. This preview-only
// stand-in renders children directly — matches the real provider's practical
// behavior in the sandbox anyway (session fetch 404s harmlessly, falls back
// to unauthenticated either way). NOT the real component; never upload this
// file's *contents* as a synced component (it's excluded from the visible
// list via componentSrcMap.NextAuthProvider: null, same as before).
// Also fixes a separate latent bug: the real file is `export default
// function NextAuthProvider`, and export-* entry synthesis never re-exports
// defaults, so window.AshokaDS.NextAuthProvider would have stayed undefined
// even with the crash fixed. This stub uses a named export instead.
writeFileSync(
  `${OUT}/providers/session-provider.tsx`,
  `import { ReactNode } from 'react'\n\n` +
    `// design-sync preview stub — see .design-sync/scope-src.mjs\n` +
    `export function NextAuthProvider({ children }: { children: ReactNode }) {\n` +
    `  return <>{children}</>\n` +
    `}\n`,
);

console.log(`wrote ${OUT} (mirrored ${SRC}, excluded: ${EXCLUDE.join(', ')}, stubbed: providers/session-provider.tsx)`);
