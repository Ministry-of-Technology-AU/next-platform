/**
 * Form theming — colors + Google Fonts, injected as scoped CSS variables.
 *
 * Shared server/client module (no server-only imports). See spec §5.
 */

import type { CSSProperties } from 'react';
import type { FontConfig, FormTheme } from './schema';

/**
 * Curated Google Fonts allowlist. The validator rejects any family outside
 * this list — this is also an XSS / URL-injection guard because family names
 * end up in a fonts.googleapis.com URL.
 */
export const CURATED_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Nunito',
  'Nunito Sans',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Source Serif 4',
  'DM Sans',
  'DM Serif Display',
  'Space Grotesk',
  'Work Sans',
  'Rubik',
  'Karla',
  'Libre Baskerville',
  'IBM Plex Sans',
  'IBM Plex Serif',
  'Crimson Text',
  'Josefin Sans',
  'Fraunces',
] as const;

export type CuratedFont = (typeof CURATED_FONTS)[number];

export function isCuratedFont(family: string): family is CuratedFont {
  return (CURATED_FONTS as readonly string[]).includes(family);
}

/** Generic fallback stack appended after the chosen family. */
const FALLBACK_STACK = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/**
 * defaultTheme mirrors the platform brand (terracotta on warm white, Nunito).
 * See spec §5.3.
 */
export const defaultTheme: FormTheme = {
  colors: {
    background: '#faf7f2',
    surface: '#ffffff',
    text: '#232020',
    textMuted: '#6b6560',
    primary: '#87281b',
    primaryText: '#ffffff',
    border: '#e5ddd3',
    error: '#ba1a1a',
  },
  fonts: {
    heading: { family: 'Nunito', weight: 700, italic: false },
    body: { family: 'Nunito Sans', weight: 400, italic: false },
    button: { family: 'Nunito Sans', weight: 600, italic: false },
  },
  radius: 12,
  buttonStyle: 'solid',
};

function fontFamilyValue(font: FontConfig): string {
  const safe = isCuratedFont(font.family) ? font.family : 'Nunito Sans';
  return `'${safe}', ${FALLBACK_STACK}`;
}

/**
 * Returns a React.CSSProperties object of custom properties only.
 *
 * These are consumed two ways by the filler renderer:
 *  1. Directly as `--form-*` vars (e.g. `bg-[var(--form-surface)]`).
 *  2. As local overrides of the shadcn tokens (`--primary`, `--background`,
 *     `--ring`, etc.) so the existing `form.tsx` components inherit the theme
 *     without modification — scoped to the `.form-theme-root` wrapper.
 */
export function themeToCssVars(theme: FormTheme): CSSProperties {
  const { colors, fonts, radius } = theme;
  const vars: Record<string, string> = {
    // Public form vars
    '--form-bg': colors.background,
    '--form-surface': colors.surface,
    '--form-text': colors.text,
    '--form-text-muted': colors.textMuted,
    '--form-primary': colors.primary,
    '--form-primary-text': colors.primaryText,
    '--form-border': colors.border,
    '--form-error': colors.error,
    '--form-radius': `${radius}px`,
    '--form-font-heading': fontFamilyValue(fonts.heading),
    '--form-font-body': fontFamilyValue(fonts.body),
    '--form-font-button': fontFamilyValue(fonts.button),
    '--form-weight-heading': String(fonts.heading.weight),
    '--form-weight-body': String(fonts.body.weight),
    '--form-weight-button': String(fonts.button.weight),
    '--form-style-heading': fonts.heading.italic ? 'italic' : 'normal',
    '--form-style-body': fonts.body.italic ? 'italic' : 'normal',
    '--form-style-button': fonts.button.italic ? 'italic' : 'normal',

    // Scoped shadcn token overrides so existing components inherit the theme.
    '--background': colors.surface,
    '--foreground': colors.text,
    '--card': colors.surface,
    '--card-foreground': colors.text,
    '--popover': colors.surface,
    '--popover-foreground': colors.text,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryText,
    '--muted': colors.background,
    '--muted-foreground': colors.textMuted,
    '--accent': colors.background,
    '--accent-foreground': colors.text,
    '--destructive': colors.error,
    '--border': colors.border,
    '--input': colors.border,
    '--ring': colors.primary,
    '--radius': `${radius}px`,
    '--font-body': fontFamilyValue(fonts.body),
    '--font-heading': fontFamilyValue(fonts.heading),
  };
  return vars as CSSProperties;
}

/** Distinct families used by a theme (deduped, allowlisted, max 3). */
export function themeFontFamilies(theme: FormTheme): CuratedFont[] {
  const seen = new Set<string>();
  const families: CuratedFont[] = [];
  for (const font of [theme.fonts.heading, theme.fonts.body, theme.fonts.button]) {
    if (isCuratedFont(font.family) && !seen.has(font.family)) {
      seen.add(font.family);
      families.push(font.family);
    }
  }
  return families.slice(0, 3);
}

/**
 * Builds a single combined Google Fonts CSS URL for the families/weights a
 * theme uses. Rendered as a `<link>` from the filler server component so there
 * is no FOUT-inducing client fetch. `next/font` cannot be used here because the
 * families are runtime-dynamic. Returns null when no allowlisted font is used.
 */
export function buildFontHref(theme: FormTheme): string | null {
  const fonts = [theme.fonts.heading, theme.fonts.body, theme.fonts.button];
  // Group requested weights by allowlisted family.
  const byFamily = new Map<CuratedFont, Set<number>>();
  for (const f of fonts) {
    if (!isCuratedFont(f.family)) continue;
    const set = byFamily.get(f.family) ?? new Set<number>();
    set.add(f.weight);
    byFamily.set(f.family, set);
  }
  if (byFamily.size === 0) return null;

  const familyParams = Array.from(byFamily.entries())
    .slice(0, 3)
    .map(([family, weights]) => {
      const encoded = family.replace(/ /g, '+');
      const sorted = Array.from(weights).sort((a, b) => a - b);
      return `family=${encoded}:wght@${sorted.join(';')}`;
    });

  return `https://fonts.googleapis.com/css2?${familyParams.join('&')}&display=swap`;
}
