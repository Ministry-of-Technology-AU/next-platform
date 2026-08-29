'use client';

import { useState, useEffect } from 'react';
import { Palette, Type, Sliders, PaintBucket } from 'lucide-react';

function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const isValidHex = (hex: string) => {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  };

  const handleTextChange = (newVal: string) => {
    setLocalVal(newVal);
    if (isValidHex(newVal)) {
      onChange(newVal);
    } else if (/^[0-9A-Fa-f]{6}$/.test(newVal)) {
      onChange('#' + newVal);
    }
  };

  const handleBlur = () => {
    let normalized = localVal.trim();
    if (normalized && !normalized.startsWith('#')) {
      normalized = '#' + normalized;
    }
    if (isValidHex(normalized)) {
      onChange(normalized);
      setLocalVal(normalized);
    } else {
      setLocalVal(value);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <input
        type="text"
        className="w-20 rounded-md border border-border bg-background px-1.5 py-0.5 text-center font-mono text-xs uppercase text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        value={localVal}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={handleBlur}
      />
      <label className="relative flex h-7 w-8 cursor-pointer items-center justify-center rounded-lg border border-border/80 overflow-hidden shadow-2xs">
        <input
          type="color"
          aria-label={label}
          value={isValidHex(value) ? value : '#000000'}
          onChange={(e) => {
            onChange(e.target.value);
            setLocalVal(e.target.value);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className="h-full w-full"
          style={{ backgroundColor: isValidHex(value) ? value : '#000000' }}
        />
      </label>
    </div>
  );
}
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

const COLOR_FIELDS: { key: keyof FormThemeColors; label: string; desc: string }[] = [
  { key: 'primary', label: 'Primary Accent', desc: 'Buttons, checkboxes, active rings' },
  { key: 'primaryText', label: 'Text on Primary', desc: 'Button label text' },
  { key: 'background', label: 'Background', desc: 'Main canvas page background' },
  { key: 'surface', label: 'Surface', desc: 'Card and container background' },
  { key: 'text', label: 'Text', desc: 'Headings and question titles' },
  { key: 'textMuted', label: 'Muted Text', desc: 'Helper text, placeholders' },
  { key: 'border', label: 'Border', desc: 'Dividers and input outlines' },
  { key: 'error', label: 'Error', desc: 'Validation and required asterisks' },
];

const PRESETS: { name: string; colors: FormThemeColors }[] = [
  {
    name: 'Ashoka Modern',
    colors: {
      background: '#09090b',
      surface: '#18181b',
      text: '#fafafa',
      textMuted: '#a1a1aa',
      primary: '#e11d48',
      primaryText: '#ffffff',
      border: '#27272a',
      error: '#f43f5e',
    },
  },
  {
    name: 'Minimal Clean',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textMuted: '#64748b',
      primary: '#0f172a',
      primaryText: '#ffffff',
      border: '#e2e8f0',
      error: '#ef4444',
    },
  },
  {
    name: 'Emerald Forest',
    colors: {
      background: '#064e3b',
      surface: '#022c22',
      text: '#f0fdf4',
      textMuted: '#86efac',
      primary: '#10b981',
      primaryText: '#ffffff',
      border: '#065f46',
      error: '#f87171',
    },
  },
  {
    name: 'Indigo Violet',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      primary: '#6366f1',
      primaryText: '#ffffff',
      border: '#334155',
      error: '#f43f5e',
    },
  },
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

  const applyPreset = (presetColors: FormThemeColors) => {
    onChange({ ...theme, colors: { ...presetColors } });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8.5 gap-1.5 rounded-lg text-xs font-medium">
          <Palette className="h-3.5 w-3.5" />
          <span>Theme</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md p-0">
        <SheetHeader className="border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold">Theme & Styling</SheetTitle>
              <p className="text-xs text-muted-foreground">Customize palette, typography, and buttons</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6 pb-12">
          {/* Quick Presets */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <PaintBucket className="h-3.5 w-3.5" />
              <span>Theme Presets</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.colors)}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]"
                >
                  <span className="text-xs font-medium text-foreground">{preset.name}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-border/50 shadow-2xs"
                      style={{ background: preset.colors.primary }}
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-border/50 shadow-2xs"
                      style={{ background: preset.colors.background }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Color Tokens */}
          <section className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
              Colors
            </h3>
            <div className="space-y-2.5">
              {COLOR_FIELDS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-foreground">{label}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{desc}</span>
                  </div>
                  <ColorInput
                    value={theme.colors[key]}
                    onChange={(val) => setColor(key, val)}
                    label={label}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <Type className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Typography
              </h3>
            </div>

            {(['heading', 'body', 'button'] as const).map((role) => (
              <div key={role} className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-xs font-bold capitalize text-foreground">{role} Font</p>
                <Field label="Font Family">
                  <Select
                    value={theme.fonts[role].family}
                    onValueChange={(family) => setFont(role, { family })}
                  >
                    <SelectTrigger className="h-8.5 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {CURATED_FONTS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }} className="text-xs">
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-2 pt-1">
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

          {/* Shape & Form */}
          <section className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <Sliders className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Shapes & Buttons
              </h3>
            </div>

            <Field label={`Corner Radius — ${theme.radius}px`}>
              <div className="flex items-center gap-2">
                {[0, 6, 12, 18, 24].map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={theme.radius === r ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 flex-1 text-xs rounded-lg"
                    onClick={() => onChange({ ...theme, radius: r })}
                  >
                    {r}px
                  </Button>
                ))}
              </div>
            </Field>

            <SelectField
              label="Button Style"
              value={theme.buttonStyle}
              onChange={(buttonStyle) => onChange({ ...theme, buttonStyle })}
              options={[
                { value: 'solid', label: 'Solid Background' },
                { value: 'outline', label: 'Outline Border' },
              ]}
            />
          </section>

          {/* Live Preview Card */}
          <div
            className="rounded-2xl border p-5 shadow-sm space-y-2 transition-all"
            style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>
                Live Theme Preview
              </span>
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: theme.colors.text, fontFamily: theme.fonts.heading.family }}
            >
              Sample Question Header
            </p>
            <p className="text-xs leading-relaxed" style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body.family }}>
              This is an accurate preview of how respondents will experience fonts, colors, and button styles on the live form.
            </p>
            <div className="pt-2">
              <span
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold shadow-xs"
                style={{
                  borderRadius: `${theme.radius}px`,
                  fontFamily: theme.fonts.button.family,
                  ...(theme.buttonStyle === 'solid'
                    ? { background: theme.colors.primary, color: theme.colors.primaryText }
                    : { border: `1.5px solid ${theme.colors.primary}`, color: theme.colors.primary, background: 'transparent' }),
                }}
              >
                Submit Form
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
