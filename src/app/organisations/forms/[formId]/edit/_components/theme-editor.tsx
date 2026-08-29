'use client';

import { useState, useEffect } from 'react';
import { Palette, Italic, X, PictureInPicture } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Field, SelectField } from './inspector-fields';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewFloating, setIsPreviewFloating] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPreviewFloating(true);
      setShowNotification(false);
    }
  }, [isOpen]);

  const setColor = (key: keyof FormThemeColors, value: string) =>
    onChange({ ...theme, colors: { ...theme.colors, [key]: value } });

  const setFont = (role: 'heading' | 'body' | 'button', patch: Partial<FontConfig>) =>
    onChange({ ...theme, fonts: { ...theme.fonts, [role]: { ...theme.fonts[role], ...patch } } });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-muted"
              aria-label="Theme"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          Theme
        </TooltipContent>
      </Tooltip>
      <SheetContent side="right" className="w-full p-0 gap-0 sm:max-w-md flex flex-col h-full">
        <SheetHeader className="p-4 border-b border-border shrink-0">
          <SheetTitle>Form theme</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-4 pb-8 pt-4">
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
              <div key={role} className="space-y-4 rounded-lg border border-border p-3">
                <p className="text-xs font-semibold capitalize text-muted-foreground">{role}</p>
                
                <Field label="Font">
                  <div className="flex items-center gap-2">
                    <Select
                      value={theme.fonts[role].family}
                      onValueChange={(family) => setFont(role, { family })}
                    >
                      <SelectTrigger className="flex-1">
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
                    <Button
                      type="button"
                      variant={theme.fonts[role].italic ? 'default' : 'outline'}
                      size="icon"
                      className={`h-9 w-9 shrink-0 rounded-full ${
                        theme.fonts[role].italic
                          ? ''
                          : 'border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:border-foreground'
                      }`}
                      onClick={() => setFont(role, { italic: !theme.fonts[role].italic })}
                      aria-label="Toggle Italic"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>
                </Field>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Weight</span>
                  <div className="text-[11px] font-semibold text-muted-foreground leading-none">
                    {theme.fonts[role].weight}
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={900}
                    step={100}
                    value={theme.fonts[role].weight}
                    onChange={(e) => setFont(role, { weight: Number(e.target.value) as FontConfig['weight'] })}
                    className="w-full accent-primary cursor-pointer"
                  />
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
 
          {!isPreviewFloating && (
            <div
              className="relative rounded-xl border p-4 transition-all duration-200 hover:shadow-xs mt-6"
              style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: theme.colors.textMuted }}>
                  Preview
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsPreviewFloating(true)}
                  aria-label="Float Preview"
                  title="Float Preview"
                >
                  <PictureInPicture className="h-3.5 w-3.5" />
                </Button>
              </div>
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
          )}
        </div>

        {/* Floating preview and overlay rendered dynamically inside SheetContent context */}
        {isPreviewFloating && (
          <>
            {/* Custom blur overlay covering the main page layout, but ending where the sidebar starts */}
            <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] mr-0 sm:mr-[448px]" />
            
            {/* Floating Preview Card - Centers on mobile, floats next to sidebar on desktop */}
            <div
              className="fixed sm:absolute z-50 top-1/2 left-1/2 sm:left-auto -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:right-[calc(100%+24px)] w-[calc(100vw-32px)] sm:w-[360px] md:w-[400px] rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95"
              style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full"
                  onClick={() => {
                    setIsPreviewFloating(false);
                    setShowNotification(true);
                  }}
                  aria-label="Close Preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p
                className="text-lg font-bold mb-1"
                style={{ color: theme.colors.text, fontFamily: theme.fonts.heading.family }}
              >
                Sample heading
              </p>
              <p className="text-sm mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts.body.family }}>
                Body text preview in the chosen font.
              </p>
              <span
                className="inline-block rounded px-4 py-2 text-sm font-medium"
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
          </>
        )}

        {/* Notification banner */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-[60] animate-in fade-in-0 slide-in-from-top-4 duration-300">
            <div className="relative rounded-full border border-green/20 bg-[#e2f0d9] dark:bg-[#2b3a24] px-5 py-2.5 shadow-md flex items-center text-green-800 dark:text-green-200 font-semibold text-xs gap-3">
              <button
                type="button"
                onClick={() => setShowNotification(false)}
                className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 shadow-sm cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
              <span>Preview now available at the bottom of the sidebar</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
