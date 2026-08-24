import {
  Heading,
  Text,
  Minus,
  Image as ImageIcon,
  Share2,
  Type,
  AlignLeft,
  FileText,
  Mail,
  Phone,
  Hash,
  SquareCheck,
  ChevronDownSquare,
  ListChecks,
  Calendar,
  Clock,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import type { FormBlockType } from '@/lib/forms/schema';

interface BlockMeta {
  label: string;
  icon: LucideIcon;
  hint: string;
}

export const BLOCK_META: Record<FormBlockType, BlockMeta> = {
  title: { label: 'Heading', icon: Heading, hint: 'Section title' },
  paragraph: { label: 'Text', icon: Text, hint: 'Rich descriptive text' },
  divider: { label: 'Divider', icon: Minus, hint: 'Horizontal rule' },
  image: { label: 'Image', icon: ImageIcon, hint: 'Display an image' },
  'social-links': { label: 'Social links', icon: Share2, hint: 'Row of social icons' },
  'short-text': { label: 'Short answer', icon: Type, hint: 'Single line' },
  'long-text': { label: 'Long answer', icon: AlignLeft, hint: 'Multi-line' },
  'rich-text': { label: 'Rich text', icon: FileText, hint: 'Formatted answer' },
  email: { label: 'Email', icon: Mail, hint: 'Validated email' },
  phone: { label: 'Phone', icon: Phone, hint: '10-digit number' },
  number: { label: 'Number', icon: Hash, hint: 'Numeric input' },
  checkbox: { label: 'Checkbox', icon: SquareCheck, hint: 'Single consent box' },
  select: { label: 'Dropdown', icon: ChevronDownSquare, hint: 'Choose one' },
  'multi-select': { label: 'Multi-select', icon: ListChecks, hint: 'Choose many' },
  date: { label: 'Date', icon: Calendar, hint: 'Date picker' },
  datetime: { label: 'Date & time', icon: Clock, hint: 'Date + time picker' },
  'file-upload': { label: 'File upload', icon: Upload, hint: 'Images or documents' },
};

export const PALETTE_GROUPS: { title: string; types: FormBlockType[] }[] = [
  { title: 'Content', types: ['title', 'paragraph', 'image', 'social-links', 'divider'] },
  {
    title: 'Questions',
    types: [
      'short-text',
      'long-text',
      'rich-text',
      'email',
      'phone',
      'number',
      'select',
      'multi-select',
      'checkbox',
      'date',
      'datetime',
      'file-upload',
    ],
  },
];
