'use client';

/** Right pane: edits the selected block. Content tab = per-type config;
 *  Logic tab = visibility conditions (spec §8.1, §8.4). */

import { Plus, X, MousePointerClick } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RichTextEditor as UIRichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Field,
  TextField,
  TextAreaField,
  NumberField,
  ToggleField,
  SelectField,
  OptionsEditor,
} from './inspector-fields';
import { ConditionEditor } from './condition-editor';
import { BLOCK_META } from './block-meta';
import {
  isInputBlock,
  type FormBlock,
  type FormSchema,
  type InputBlock,
  type RuleGroup,
  type SocialPlatform,
} from '@/lib/forms/schema';

interface BlockInspectorProps {
  block: FormBlock | null;
  schema: FormSchema;
  currentPageId: string;
  onUpdate: (patch: Partial<FormBlock>) => void;
}

export function BlockInspector({ block, schema, currentPageId, onUpdate }: BlockInspectorProps) {
  if (!block) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
        <MousePointerClick className="mb-2 h-6 w-6" />
        Select a block to edit its settings.
      </div>
    );
  }

  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold">{meta.label}</span>
      </div>

      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="logic">Logic</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">{renderTypeFields(block, onUpdate)}</div>
        </TabsContent>

        <TabsContent value="logic" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ConditionEditor
            schema={schema}
            currentPageId={currentPageId}
            ownerId={block.id}
            isPage={false}
            group={block.visibleWhen}
            onChange={(group: RuleGroup | undefined) => onUpdate({ visibleWhen: group })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Patch = (patch: any) => void;

function CommonInputFields({ block, update }: { block: InputBlock; update: Patch }) {
  const hasPlaceholder = !['checkbox', 'rich-text', 'file-upload'].includes(block.type);
  return (
    <>
      <TextField label="Question" value={block.title} onChange={(title) => update({ title })} />
      <TextField
        label="Helper text"
        value={block.subtitle ?? ''}
        onChange={(subtitle) => update({ subtitle })}
        placeholder="Optional description"
      />
      {hasPlaceholder && (
        <TextField
          label="Placeholder"
          value={block.placeholder ?? ''}
          onChange={(placeholder) => update({ placeholder })}
        />
      )}
      <ToggleField
        label="Required"
        checked={block.required}
        onChange={(required) => update({ required })}
      />
    </>
  );
}

function renderTypeFields(block: FormBlock, update: Patch) {
  if (isInputBlock(block)) {
    return (
      <>
        <CommonInputFields block={block} update={update} />
        {renderInputExtras(block, update)}
      </>
    );
  }
  return renderDisplayFields(block, update);
}

function renderInputExtras(block: InputBlock, update: Patch) {
  switch (block.type) {
    case 'short-text':
      return (
        <>
          <TextField
            label="Default value"
            value={block.defaultValue ?? ''}
            onChange={(v) => update({ defaultValue: v })}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Min length"
              value={block.validation?.minLength}
              onChange={(v) => update({ validation: { ...block.validation, minLength: v } })}
            />
            <NumberField
              label="Max length"
              value={block.validation?.maxLength}
              onChange={(v) => update({ validation: { ...block.validation, maxLength: v } })}
            />
          </div>
          <TextField
            label="Pattern (regex)"
            value={block.validation?.pattern ?? ''}
            onChange={(v) => update({ validation: { ...block.validation, pattern: v || undefined } })}
            placeholder="e.g. ^[A-Z]{2}\\d+$"
          />
        </>
      );
    case 'long-text':
      return (
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Min length"
            value={block.validation?.minLength}
            onChange={(v) => update({ validation: { ...block.validation, minLength: v } })}
          />
          <NumberField
            label="Max length"
            value={block.validation?.maxLength}
            onChange={(v) => update({ validation: { ...block.validation, maxLength: v } })}
          />
        </div>
      );
    case 'rich-text':
      return (
        <NumberField
          label="Max length"
          value={block.validation?.maxLength}
          onChange={(v) => update({ validation: { maxLength: v } })}
        />
      );
    case 'email':
      return (
        <>
          <TextField
            label="Restrict to domain"
            value={block.restrictToDomain ?? ''}
            onChange={(v) => update({ restrictToDomain: v || undefined })}
            placeholder="ashoka.edu.in"
          />
          <TextField
            label="Default value"
            value={block.defaultValue ?? ''}
            onChange={(v) => update({ defaultValue: v })}
          />
        </>
      );
    case 'phone':
      return (
        <TextField
          label="Country code"
          value={block.defaultCountryCode ?? '+91'}
          onChange={(v) => update({ defaultCountryCode: v })}
        />
      );
    case 'number':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Min"
              value={block.validation?.min}
              onChange={(v) => update({ validation: { ...block.validation, min: v } })}
            />
            <NumberField
              label="Max"
              value={block.validation?.max}
              onChange={(v) => update({ validation: { ...block.validation, max: v } })}
            />
          </div>
          <ToggleField
            label="Whole numbers only"
            checked={block.validation?.integer ?? false}
            onChange={(v) => update({ validation: { ...block.validation, integer: v } })}
          />
        </>
      );
    case 'checkbox':
      return (
        <ToggleField
          label="Checked by default"
          checked={block.defaultValue ?? false}
          onChange={(v) => update({ defaultValue: v })}
        />
      );
    case 'select':
      return (
        <OptionsEditor options={block.options} onChange={(options) => update({ options })} />
      );
    case 'multi-select':
      return (
        <>
          <SelectField
            label="Display as"
            value={block.style}
            onChange={(style) => update({ style })}
            options={[
              { value: 'checkboxes', label: 'Checkboxes' },
              { value: 'dropdown', label: 'Dropdown (tags)' },
            ]}
          />
          <OptionsEditor options={block.options} onChange={(options) => update({ options })} />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Min selected"
              value={block.validation?.minSelected}
              onChange={(v) => update({ validation: { ...block.validation, minSelected: v } })}
            />
            <NumberField
              label="Max selected"
              value={block.validation?.maxSelected}
              onChange={(v) => update({ validation: { ...block.validation, maxSelected: v } })}
            />
          </div>
        </>
      );
    case 'date':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Earliest">
            <Input
              type="date"
              value={block.validation?.minDate ?? ''}
              onChange={(e) => update({ validation: { ...block.validation, minDate: e.target.value || undefined } })}
            />
          </Field>
          <Field label="Latest">
            <Input
              type="date"
              value={block.validation?.maxDate ?? ''}
              onChange={(e) => update({ validation: { ...block.validation, maxDate: e.target.value || undefined } })}
            />
          </Field>
        </div>
      );
    case 'datetime':
      return null;
    case 'file-upload':
      return (
        <>
          <SelectField
            label="Accepts"
            value={block.accept}
            onChange={(accept) => update({ accept })}
            options={[
              { value: 'both', label: 'Images & documents' },
              { value: 'images', label: 'Images only' },
              { value: 'documents', label: 'Documents only' },
            ]}
          />
          <ToggleField
            label="Allow multiple files"
            checked={block.multiple}
            onChange={(multiple) => update({ multiple, maxFiles: multiple ? block.maxFiles : 1 })}
          />
          {block.multiple && (
            <NumberField
              label="Max files (≤ 5)"
              value={block.maxFiles}
              onChange={(v) => update({ maxFiles: Math.min(5, Math.max(1, v ?? 1)) })}
            />
          )}
          <NumberField
            label="Max size MB (≤ 10)"
            value={block.maxSizeMB}
            onChange={(v) => update({ maxSizeMB: Math.min(10, Math.max(1, v ?? 5)) })}
          />
        </>
      );
    default:
      return null;
  }
}

function renderDisplayFields(block: FormBlock, update: Patch) {
  switch (block.type) {
    case 'title':
      return (
        <>
          <TextField label="Text" value={block.text} onChange={(text) => update({ text })} />
          <SelectField
            label="Level"
            value={String(block.level)}
            onChange={(v) => update({ level: Number(v) as 1 | 2 | 3 })}
            options={[
              { value: '1', label: 'Heading 1' },
              { value: '2', label: 'Heading 2' },
              { value: '3', label: 'Heading 3' },
            ]}
          />
          <SelectField
            label="Alignment"
            value={block.align}
            onChange={(align) => update({ align })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </>
      );
    case 'paragraph':
      return (
        <Field label="Text">
          <UIRichTextEditor value={block.html} onChange={(html) => update({ html })} />
        </Field>
      );
    case 'divider':
      return <p className="text-sm text-muted-foreground">A horizontal divider. Nothing to configure.</p>;
    case 'image':
      return (
        <>
          <TextField
            label="Image URL (Cloudinary)"
            value={block.url}
            onChange={(url) => update({ url })}
            placeholder="https://res.cloudinary.com/…"
          />
          <TextField label="Alt text" value={block.alt} onChange={(alt) => update({ alt })} />
          <SelectField
            label="Width"
            value={block.width}
            onChange={(width) => update({ width })}
            options={[
              { value: 'full', label: 'Full width' },
              { value: 'half', label: 'Half width' },
            ]}
          />
        </>
      );
    case 'social-links':
      return <SocialLinksEditor block={block} update={update} />;
    default:
      return null;
  }
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'instagram',
  'linkedin',
  'twitter',
  'website',
  'youtube',
  'discord',
];

function SocialLinksEditor({
  block,
  update,
}: {
  block: Extract<FormBlock, { type: 'social-links' }>;
  update: Patch;
}) {
  const links = block.links;
  const set = (next: typeof links) => update({ links: next });
  return (
    <Field label="Links">
      <div className="space-y-1.5">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-1">
            <Select
              value={link.platform}
              onValueChange={(v) =>
                set(links.map((l, idx) => (idx === i ? { ...l, platform: v as SocialPlatform } : l)))
              }
            >
              <SelectTrigger className="h-8 w-32 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-8 flex-1"
              placeholder="https://…"
              value={link.url}
              onChange={(e) => set(links.map((l, idx) => (idx === i ? { ...l, url: e.target.value } : l)))}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-7 text-muted-foreground hover:text-destructive"
              aria-label="Remove link"
              onClick={() => set(links.filter((_, idx) => idx !== i))}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => set([...links, { platform: 'instagram', url: '' }])}
          className="w-full gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add link
        </Button>
      </div>
    </Field>
  );
}
