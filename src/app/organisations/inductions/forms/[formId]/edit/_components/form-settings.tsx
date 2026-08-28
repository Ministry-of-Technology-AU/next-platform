'use client';

import { Settings, Calendar, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/form';
import { RichTextEditor as UIRichTextEditor } from '@/components/ui/rich-text-editor';
import { Field, TextField, ToggleField, SelectField } from './inspector-fields';
import type { FormSettings } from '@/lib/forms/schema';
import type { FormStatus } from '@/lib/forms/strapi-forms';

interface FormSettingsSheetProps {
  status: FormStatus;
  startDate: string | null;
  endDate: string | null;
  settings: FormSettings;
  onMeta: (patch: { status?: FormStatus; startDate?: string | null; endDate?: string | null }) => void;
  onSettings: (settings: FormSettings) => void;
}

export function FormSettingsSheet({
  status,
  startDate,
  endDate,
  settings,
  onMeta,
  onSettings,
}: FormSettingsSheetProps) {
  const patchSettings = (patch: Partial<FormSettings>) => onSettings({ ...settings, ...patch });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8.5 gap-1.5 rounded-lg text-xs font-medium">
          <Settings className="h-3.5 w-3.5" />
          <span>Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md p-0">
        <SheetHeader className="border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold">Form Settings</SheetTitle>
              <p className="text-xs text-muted-foreground">Configure schedule, status, and responses</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6 pb-12">
          {/* Availability & Access */}
          <section className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Availability & Schedule
              </h3>
            </div>

            <SelectField
              label="Form Status"
              hint={
                status === 'active'
                  ? 'Live — anyone with the share link can submit responses.'
                  : status === 'draft'
                    ? 'Draft — question schema can be edited freely; respondents cannot submit.'
                    : 'Inactive — form is closed to respondents.'
              }
              value={status}
              onChange={(v) => onMeta({ status: v })}
              options={[
                { value: 'draft', label: 'Draft (Editing)' },
                { value: 'active', label: 'Active (Live)' },
                { value: 'inactive', label: 'Inactive (Closed)' },
              ]}
            />

            <div className="grid grid-cols-1 gap-3 pt-1">
              <Field label="Opens At" hint="Optional. Responses allowed only after this date.">
                <DateTimePicker
                  title=""
                  value={startDate ?? undefined}
                  onChange={(v) => onMeta({ startDate: v || null })}
                  placeholder="Immediately available"
                />
              </Field>
              <Field label="Closes At" hint="Optional. Automatically closes after this date.">
                <DateTimePicker
                  title=""
                  value={endDate ?? undefined}
                  onChange={(v) => onMeta({ endDate: v || null })}
                  placeholder="No expiration"
                />
              </Field>
            </div>
          </section>

          {/* Submission Behavior */}
          <section className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Send className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Submission Behavior
              </h3>
            </div>

            <TextField
              label="Submit Button Text"
              value={settings.submitButtonText}
              placeholder="Submit Application"
              onChange={(submitButtonText) => patchSettings({ submitButtonText })}
            />

            <ToggleField
              label="Show Progress Bar"
              hint="Displays completion indicator across multi-page forms."
              checked={settings.showProgressBar}
              onChange={(showProgressBar) => patchSettings({ showProgressBar })}
            />

            <ToggleField
              label="Email Respondents a Copy"
              hint="Sends each respondent an automated summary of their submitted answers."
              checked={settings.sendEmailCopy}
              onChange={(sendEmailCopy) => patchSettings({ sendEmailCopy })}
            />
          </section>

          {/* Confirmation Message */}
          <section className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Completion Screen
              </h3>
            </div>

            <TextField
              label="Confirmation Title"
              value={settings.confirmationTitle}
              placeholder="Application Submitted!"
              onChange={(confirmationTitle) => patchSettings({ confirmationTitle })}
            />

            <Field label="Confirmation Message" hint="Shown on screen after successful submission.">
              <UIRichTextEditor
                value={settings.confirmationHtml}
                onChange={(confirmationHtml) => patchSettings({ confirmationHtml })}
              />
            </Field>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
