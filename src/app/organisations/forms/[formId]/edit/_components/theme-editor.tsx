'use client';

import { Palette } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Field, SelectField, ToggleField } from './inspector-fields';
import { CURATED_FONTS } from '@/lib/forms/theme';
import type { FontConfig, FormTheme, FormThemeColors } from '@/lib/forms/schema';

const COLOR_FIELDS: { key: keyof FormThemeColors; label: string }[] = [
  { key: 'background', label: 'Page background' },
  { key: 'surface', label: 'Card surface' },
  { key: 'text', label: 'Text' },
  { key: 'textMuted', label: 'Muted text' },
  { key: 'primary', label: 'Primary / buttons' },
  { key: 'primaryText', label: 'Text on primary' },
  { key: 'border', label: 'Borders' },
  { key: 'error', label: 'Error' },
];

const WEIGHTS: FontConfig['weight'][] = [300, 400, 500, 600, 700, 800, 900];

interface ThemeEditorProps {
  theme: FormTheme;
  onChange: (theme: FormTheme) => void;
}

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  const setColor = (key: keyof FormThemeColors, value: string) =>
    onChange({ ...theme, colors: { ...theme.colors, [key]: value } });

  const setFont = (role: 'heading' | 'body' | 'button', patch: Partial<FontConfig>) =>
    onChange({ ...theme, fonts: { ...theme.fonts, [role]: { ...theme.fonts[role], ...patch } } });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Palette className="h-4 w-4" />
          Theme
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Form theme</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Colors</h3>
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-muted-foreground">
                    {theme.colors[key]}
                  </span>
                  <input
                    type="color"
                    aria-label={label}
                    value={theme.colors[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Typography</h3>
            {(['heading', 'body', 'button'] as const).map((role) => (
              <div key={role} className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-xs font-semibold capitalize text-muted-foreground">{role}</p>
                <Field label="Font">
                  <Select
                    value={theme.fonts[role].family}
                    onValueChange={(family) => setFont(role, { family })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {CURATED_FONTS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    label="Weight"
                    value={String(theme.fonts[role].weight)}
                    onChange={(v) => setFont(role, { weight: Number(v) as FontConfig['weight'] })}
                    options={WEIGHTS.map((w) => ({ value: String(w), label: String(w) }))}
                  />
                  <div className="flex items-end">
                    <ToggleField
                      label="Italic"
                      checked={theme.fonts[role].italic}
                      onChange={(italic) => setFont(role, { italic })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Shape</h3>
            <Field label={`Corner radius — ${theme.radius}px`}>
              <input
                type="range"
                min={0}
                max={24}
                value={theme.radius}
                onChange={(e) => onChange({ ...theme, radius: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </Field>
            <SelectField
              label="Button style"
              value={theme.buttonStyle}
              onChange={(buttonStyle) => onChange({ ...theme, buttonStyle })}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
              ]}
            />
          </section>

          <div
            className="rounded-xl border p-4"
            style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
          >
            <p className="mb-2 text-xs font-medium" style={{ color: theme.colors.textMuted }}>
              Preview
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: theme.colors.text, fontFamily: theme.fonts.heading.family }}
            >
              Sample heading
            </p>
            <p className="text-sm" style={{ color: theme.colors.text, fontFamily: theme.fonts.body.family }}>
              Body text preview in the chosen font.
            </p>
            <span
              className="mt-3 inline-block rounded px-3 py-1.5 text-sm font-medium"
              style={{
                borderRadius: theme.radius,
                fontFamily: theme.fonts.button.family,
                ...(theme.buttonStyle === 'solid'
                  ? { background: theme.colors.primary, color: theme.colors.primaryText }
                  : { border: `1px solid ${theme.colors.primary}`, color: theme.colors.primary }),
              }}
            >
              Button
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
