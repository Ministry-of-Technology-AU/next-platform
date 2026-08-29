'use client';

/**
 * Condition (visibility) editor for a block or a page. Enforces the operator
 * allowlist per source block type and the no-forward-reference rule (spec §8.4,
 * §4.6): a block may reference input blocks on the same or an earlier page
 * (not itself); a page may only reference earlier pages.
 */

import { Plus, X, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  isInputBlock,
  type ConditionOperator,
  type ConditionRule,
  type FormSchema,
  type InputBlock,
  type RuleGroup,
} from '@/lib/forms/schema';

const OPERATORS_BY_TYPE: Record<InputBlock['type'], ConditionOperator[]> = {
  'short-text': ['equals', 'notEquals', 'contains', 'notContains', 'isEmpty', 'isNotEmpty'],
  'long-text': ['equals', 'notEquals', 'contains', 'notContains', 'isEmpty', 'isNotEmpty'],
  'rich-text': ['equals', 'notEquals', 'contains', 'notContains', 'isEmpty', 'isNotEmpty'],
  email: ['equals', 'notEquals', 'contains', 'notContains', 'isEmpty', 'isNotEmpty'],
  phone: ['equals', 'notEquals', 'contains', 'notContains', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty'],
  date: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty'],
  datetime: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty'],
  select: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'],
  'multi-select': ['contains', 'notContains', 'isEmpty', 'isNotEmpty'],
  checkbox: ['equals'],
  'file-upload': ['isEmpty', 'isNotEmpty'],
};

const OPERATOR_LABEL: Record<ConditionOperator, string> = {
  equals: 'is',
  notEquals: 'is not',
  contains: 'contains',
  notContains: "doesn't contain",
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty',
  greaterThan: 'is greater than',
  lessThan: 'is less than',
};

const NEEDS_VALUE = (op: ConditionOperator) => op !== 'isEmpty' && op !== 'isNotEmpty';

interface ConditionEditorProps {
  schema: FormSchema;
  currentPageId: string;
  /** Block id, or null when editing a page-level condition. */
  ownerId: string | null;
  isPage: boolean;
  group: RuleGroup | undefined;
  onChange: (group: RuleGroup | undefined) => void;
}

export function ConditionEditor({
  schema,
  currentPageId,
  ownerId,
  isPage,
  group,
  onChange,
}: ConditionEditorProps) {
  const pageIndex = schema.pages.findIndex((p) => p.id === currentPageId);
  const sources: InputBlock[] = [];
  schema.pages.forEach((page, pi) => {
    const allowed = isPage ? pi < pageIndex : pi <= pageIndex;
    if (!allowed) return;
    for (const block of page.blocks) {
      if (isInputBlock(block) && block.id !== ownerId) sources.push(block);
    }
  });

  const sourceById = (id: string) => sources.find((s) => s.id === id);

  const enabled = !!group;

  const makeDefaultRule = (): ConditionRule => {
    const first = sources[0];
    const op = first ? OPERATORS_BY_TYPE[first.type][0] : 'isNotEmpty';
    return { blockId: first?.id ?? '', operator: op };
  };

  const toggle = (on: boolean) => {
    onChange(on ? { combinator: 'all', rules: [makeDefaultRule()] } : undefined);
  };

  const patchRule = (index: number, patch: Partial<ConditionRule>) => {
    if (!group) return;
    const rules = group.rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange({ ...group, rules });
  };

  const changeSource = (index: number, blockId: string) => {
    const src = sourceById(blockId);
    const op = src ? OPERATORS_BY_TYPE[src.type][0] : 'isNotEmpty';
    patchRule(index, { blockId, operator: op, value: undefined });
  };

  const addRule = () => {
    if (!group) return;
    onChange({ ...group, rules: [...group.rules, makeDefaultRule()] });
  };

  const removeRule = (index: number) => {
    if (!group) return;
    const rules = group.rules.filter((_, i) => i !== index);
    onChange(rules.length ? { ...group, rules } : undefined);
  };

  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        <GitBranch className="mx-auto mb-2 h-5 w-5" />
        Add a question {isPage ? 'on an earlier page' : 'above this one'} to control when this{' '}
        {isPage ? 'page' : 'block'} appears.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggle(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        Only show when…
      </label>

      {enabled && group && (
        <div className="space-y-2 rounded-lg border border-border p-3">
          {group.rules.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Match
              <Select
                value={group.combinator}
                onValueChange={(v) => onChange({ ...group, combinator: v as 'all' | 'any' })}
              >
                <SelectTrigger className="h-7 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">all</SelectItem>
                  <SelectItem value="any">any</SelectItem>
                </SelectContent>
              </Select>
              of these
            </div>
          )}

          {group.rules.map((rule, i) => {
            const src = sourceById(rule.blockId);
            const ops = src ? OPERATORS_BY_TYPE[src.type] : ['isNotEmpty' as ConditionOperator];
            return (
              <div key={i} className="space-y-1.5 rounded-md bg-muted/40 p-2">
                <div className="flex items-center gap-1.5">
                  <Select value={rule.blockId} onValueChange={(v) => changeSource(i, v)}>
                    <SelectTrigger className="h-8 flex-1">
                      <SelectValue placeholder="Question" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title || 'Untitled'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-7 text-muted-foreground hover:text-destructive"
                    aria-label="Remove condition"
                    onClick={() => removeRule(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={rule.operator}
                    onValueChange={(v) => patchRule(i, { operator: v as ConditionOperator, value: undefined })}
                  >
                    <SelectTrigger className="h-8 flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ops.map((op) => (
                        <SelectItem key={op} value={op}>
                          {OPERATOR_LABEL[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {NEEDS_VALUE(rule.operator) && src && (
                    <ValueInput block={src} value={rule.value} onChange={(v) => patchRule(i, { value: v })} />
                  )}
                </div>
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={addRule} className="w-full gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add condition
          </Button>
        </div>
      )}
    </div>
  );
}

function ValueInput({
  block,
  value,
  onChange,
}: {
  block: InputBlock;
  value: ConditionRule['value'];
  onChange: (v: ConditionRule['value']) => void;
}) {
  if (block.type === 'select' || block.type === 'multi-select') {
    return (
      <Select value={typeof value === 'string' ? value : ''} onValueChange={onChange}>
        <SelectTrigger className="h-8 flex-1">
          <SelectValue placeholder="value" />
        </SelectTrigger>
        <SelectContent>
          {block.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (block.type === 'checkbox') {
    return (
      <Select value={value === true ? 'true' : 'false'} onValueChange={(v) => onChange(v === 'true')}>
        <SelectTrigger className="h-8 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">checked</SelectItem>
          <SelectItem value="false">unchecked</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  if (block.type === 'number') {
    return (
      <Input
        type="number"
        className="h-8 flex-1"
        value={value == null ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
  }
  if (block.type === 'date') {
    return (
      <Input
        type="date"
        className="h-8 flex-1"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (block.type === 'datetime') {
    return (
      <Input
        type="datetime-local"
        className="h-8 flex-1"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <Input
      className="h-8 flex-1"
      placeholder="value"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
