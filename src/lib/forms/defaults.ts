/**
 * Factories for new forms and blocks. Shared server/client module.
 *
 * `createBlock` produces a sensible default for each block type so the builder
 * can add a block with one click. `createDefaultSchema` is what a brand-new
 * form is seeded with server-side on create.
 */

import { v4 as uuidv4 } from 'uuid';
import { defaultTheme } from './theme';
import {
  FORM_SCHEMA_VERSION,
  type FormBlock,
  type FormBlockType,
  type FormPage,
  type FormSchema,
  type FormSettings,
} from './schema';

export const defaultSettings: FormSettings = {
  confirmationTitle: 'Response recorded',
  confirmationHtml: '<p>Thanks for your response! We’ll be in touch soon.</p>',
  submitButtonText: 'Submit',
  sendEmailCopy: true,
  showProgressBar: true,
};

/** Human-friendly default question label per input type. */
const DEFAULT_TITLES: Partial<Record<FormBlockType, string>> = {
  'short-text': 'Short answer',
  'long-text': 'Long answer',
  'rich-text': 'Rich text answer',
  email: 'Email address',
  phone: 'Phone number',
  number: 'Number',
  checkbox: 'I agree',
  select: 'Choose one',
  'multi-select': 'Select all that apply',
  date: 'Pick a date',
  datetime: 'Pick a date & time',
  'file-upload': 'Upload a file',
};

export function createBlock(type: FormBlockType): FormBlock {
  const id = uuidv4();
  switch (type) {
    // --- Display blocks ---
    case 'title':
      return { id, type, text: 'Heading', level: 2, align: 'left' };
    case 'paragraph':
      return { id, type, html: '<p>Add some descriptive text here.</p>' };
    case 'divider':
      return { id, type };
    case 'image':
      return { id, type, url: '', alt: '', width: 'full' };
    case 'social-links':
      return { id, type, links: [] };

    // --- Input blocks ---
    case 'short-text':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'long-text':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'rich-text':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'email':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'phone':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false, defaultCountryCode: '+91' };
    case 'number':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'checkbox':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'select':
      return {
        id,
        type,
        title: DEFAULT_TITLES[type]!,
        required: false,
        options: [
          { value: 'option-1', label: 'Option 1' },
          { value: 'option-2', label: 'Option 2' },
        ],
      };
    case 'multi-select':
      return {
        id,
        type,
        title: DEFAULT_TITLES[type]!,
        required: false,
        style: 'checkboxes',
        options: [
          { value: 'option-1', label: 'Option 1' },
          { value: 'option-2', label: 'Option 2' },
        ],
      };
    case 'date':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'datetime':
      return { id, type, title: DEFAULT_TITLES[type]!, required: false };
    case 'file-upload':
      return {
        id,
        type,
        title: DEFAULT_TITLES[type]!,
        required: false,
        accept: 'both',
        multiple: false,
        maxFiles: 1,
        maxSizeMB: 5,
      };
    default: {
      // Exhaustiveness guard.
      const _never: never = type;
      throw new Error(`Unknown block type: ${_never}`);
    }
  }
}

export function createPage(title?: string): FormPage {
  return { id: uuidv4(), title, blocks: [] };
}

export function createDefaultSchema(): FormSchema {
  return {
    schemaVersion: FORM_SCHEMA_VERSION,
    pages: [createPage('Page 1')],
    theme: structuredClone(defaultTheme),
    settings: { ...defaultSettings },
  };
}
