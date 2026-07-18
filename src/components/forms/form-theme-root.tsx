'use client';

/**
 * Scopes a form's theme to its subtree. Emits the `--form-*` custom properties
 * plus local overrides of the shadcn tokens (see themeToCssVars), so the
 * existing `form.tsx` components inherit the authored theme without any change
 * to those components or to globals.css (spec §5.1).
 */

import type { ReactNode } from 'react';
import { themeToCssVars } from '@/lib/forms/theme';
import type { FormTheme } from '@/lib/forms/schema';

interface FormThemeRootProps {
  theme: FormTheme;
  children: ReactNode;
  className?: string;
}

export function FormThemeRoot({ theme, children, className = '' }: FormThemeRootProps) {
  return (
    <div
      className={`form-theme-root ${className}`}
      style={{
        ...themeToCssVars(theme),
        backgroundColor: 'var(--form-bg)',
        color: 'var(--form-text)',
        fontFamily: 'var(--form-font-body)',
      }}
    >
      {children}
    </div>
  );
}
