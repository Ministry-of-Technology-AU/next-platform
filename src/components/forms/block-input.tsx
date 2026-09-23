'use client';

/**
 * Maps a single input block → the existing controlled components in
 * `src/components/form.tsx`. This switch is the ONLY place block types are
 * bound to UI, and it is shared by the filler and the builder preview so they
 * can never drift (spec §9.2). Do not fork the underlying components.
 */

import { format } from 'date-fns';
import {
  TextInput,
  RichTextInput,
  PhoneInput,
  SingleSelect,
  MultiSelectCheckbox,
  MultiSelectDropdown,
  CheckboxComponent,
  DatePicker,
  DateTimePicker,
} from '@/components/form';
import { FileUploadField, type UploadFn, type DeleteFn } from './file-upload-field';
import type { FileDescriptor, InputBlock } from '@/lib/forms/schema';

interface BlockInputProps {
  block: InputBlock;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  uploadFile?: UploadFn;
  deleteFile?: DeleteFn;
}

/** Parse a stored date value (either `yyyy-MM-dd` or a full ISO string). */
function parseDateValue(v: unknown): Date | undefined {
  if (typeof v !== 'string' || !v) return undefined;
  const d = new Date(v.length === 10 ? `${v}T00:00:00` : v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function BlockInput({ block, value, onChange, error, uploadFile, deleteFile }: BlockInputProps) {
  switch (block.type) {
    case 'short-text':
      return (
        <TextInput
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? ''}
          isRequired={block.required}
          errorMessage={error}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      );

    case 'long-text':
      return (
        <TextInput
          isParagraph
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? ''}
          isRequired={block.required}
          errorMessage={error}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      );

    case 'email':
      return (
        <TextInput
          type="email"
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? 'you@ashoka.edu.in'}
          isRequired={block.required}
          errorMessage={error}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      );

    case 'number':
      return (
        <TextInput
          type="number"
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? ''}
          isRequired={block.required}
          errorMessage={error}
          value={value == null ? '' : String(value)}
          onChange={onChange}
        />
      );

    case 'rich-text':
      return (
        <RichTextInput
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder}
          isRequired={block.required}
          errorMessage={error}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      );

    case 'phone':
      return (
        <PhoneInput
          title={block.title}
          description={block.subtitle ?? ''}
          placeholder={block.placeholder ?? '9876543210'}
          defaultCountryCode={block.defaultCountryCode ?? '+91'}
          isRequired={block.required}
          errorMessage={error}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      );

    case 'checkbox':
      return (
        <CheckboxComponent
          title={block.title}
          description={block.subtitle}
          isRequired={block.required}
          errorMessage={error}
          value={value === true}
          onChange={onChange}
        />
      );

    case 'select':
      return (
        <SingleSelect
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? 'Select an option'}
          isRequired={block.required}
          errorMessage={error}
          items={block.options.map((o) => ({ value: o.value, label: o.label }))}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
      );

    case 'multi-select':
      return block.style === 'dropdown' ? (
        <MultiSelectDropdown
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? 'Select…'}
          isRequired={block.required}
          errorMessage={error}
          items={block.options.map((o) => ({ value: o.value, label: o.label }))}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      ) : (
        <MultiSelectCheckbox
          title={block.title}
          description={block.subtitle}
          isRequired={block.required}
          errorMessage={error}
          items={block.options.map((o) => ({ value: o.value, label: o.label }))}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );

    case 'date':
      return (
        <DatePicker
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? 'Select date'}
          isRequired={block.required}
          errorMessage={error}
          value={parseDateValue(value)}
          onChange={(d) => onChange(d ? format(d, 'yyyy-MM-dd') : '')}
        />
      );

    case 'datetime':
      return (
        <DateTimePicker
          title={block.title}
          description={block.subtitle}
          placeholder={block.placeholder ?? 'Select date & time'}
          isRequired={block.required}
          errorMessage={error}
          value={typeof value === 'string' ? value : undefined}
          onChange={onChange}
        />
      );

    case 'file-upload':
      return (
        <FileUploadField
          block={block}
          value={Array.isArray(value) ? (value as FileDescriptor[]) : []}
          onChange={onChange}
          errorMessage={error}
          uploadFile={uploadFile}
          deleteFile={deleteFile}
        />
      );

    default: {
      // Forward compatibility: unknown input types render nothing (spec §3.2).
      const _never: never = block;
      void _never;
      return null;
    }
  }
}
