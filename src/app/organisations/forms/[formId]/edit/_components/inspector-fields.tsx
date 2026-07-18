'use client';

/** Small reusable form controls for the inspector + settings panes. */

import { ArrowUp, ArrowDown, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { arrayMove } from '@dnd-kit/sortable';
import type { SelectOption } from '@/lib/forms/schema';

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-20"
      />
    </Field>
  );
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  hint?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === '' ? undefined : Number(raw));
        }}
      />
    </Field>
  );
}

export function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-2.5">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label?: string;
  hint?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <Field label={label} hint={hint}>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Editable list of {value,label} options. Values stay stable once created so
 *  existing conditions keep referencing them. */
export function OptionsEditor({
  options,
  onChange,
}: {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}) {
  const update = (i: number, label: string) => {
    const next = [...options];
    next[i] = { ...next[i], label };
    onChange(next);
  };
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const to = i + dir;
    if (to < 0 || to >= options.length) return;
    onChange(arrayMove(options, i, to));
  };
  const add = () => {
    const existing = new Set(options.map((o) => o.value));
    let n = options.length + 1;
    let value = `option-${n}`;
    while (existing.has(value)) value = `option-${++n}`;
    onChange([...options, { value, label: `Option ${n}` }]);
  };

  return (
    <Field label="Options">
      <div className="space-y-1.5">
        {options.map((option, i) => (
          <div key={option.value} className="flex items-center gap-1">
            <Input
              value={option.label}
              onChange={(e) => update(i, e.target.value)}
              className="h-8"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-7"
              aria-label="Move option up"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-7"
              aria-label="Move option down"
              disabled={i === options.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-7 text-muted-foreground hover:text-destructive"
              aria-label="Remove option"
              disabled={options.length <= 1}
              onClick={() => remove(i)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add} className="w-full gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add option
        </Button>
      </div>
    </Field>
  );
}
