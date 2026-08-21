'use client';

import { Settings } from 'lucide-react';
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
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Form settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Availability</h3>
            <SelectField
              label="Status"
              hint={
                status === 'active'
                  ? 'Live — anyone with the link can respond.'
                  : status === 'draft'
                    ? 'Not yet published. Only you can see it.'
                    : 'Closed — the link shows a 404.'
              }
              value={status}
              onChange={(v) => onMeta({ status: v })}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Field label="Opens" hint="Optional. Before this, the form is unavailable.">
              <DateTimePicker
                title=""
                value={startDate ?? undefined}
                onChange={(v) => onMeta({ startDate: v || null })}
                placeholder="No start date"
              />
            </Field>
            <Field label="Closes" hint="Optional. After this, the form auto-closes.">
              <DateTimePicker
                title=""
                value={endDate ?? undefined}
                onChange={(v) => onMeta({ endDate: v || null })}
                placeholder="No end date"
              />
            </Field>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Submission</h3>
            <TextField
              label="Submit button text"
              value={settings.submitButtonText}
              onChange={(submitButtonText) => patchSettings({ submitButtonText })}
            />
            <ToggleField
              label="Show progress bar"
              checked={settings.showProgressBar}
              onChange={(showProgressBar) => patchSettings({ showProgressBar })}
            />
            <ToggleField
              label="Email respondents a copy"
              hint="Sends each person their answers after submitting."
              checked={settings.sendEmailCopy}
              onChange={(sendEmailCopy) => patchSettings({ sendEmailCopy })}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Confirmation</h3>
            <TextField
              label="Confirmation title"
              value={settings.confirmationTitle}
              onChange={(confirmationTitle) => patchSettings({ confirmationTitle })}
            />
            <Field label="Confirmation message">
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
