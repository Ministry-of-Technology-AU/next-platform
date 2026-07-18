/**
 * Conditional logic engine — pure functions, no React, unit-testable.
 *
 * Shared server/client module. See spec §4 for the normative evaluation rules.
 */

import {
  isInputBlock,
  type ConditionRule,
  type FormBlock,
  type FormPage,
  type FormResponseData,
  type FormSchema,
  type RuleGroup,
} from './schema';

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Parse both sides as numbers; returns null if either side isn't numeric. */
function asNumbers(a: unknown, b: unknown): [number, number] | null {
  const na = typeof a === 'number' ? a : Number(a);
  const nb = typeof b === 'number' ? b : Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return [na, nb];
  return null;
}

/** Parse both sides as dates; returns null if either side isn't a valid date. */
function asDates(a: unknown, b: unknown): [number, number] | null {
  const da = Date.parse(String(a));
  const db = Date.parse(String(b));
  if (Number.isFinite(da) && Number.isFinite(db)) return [da, db];
  return null;
}

function compare(a: unknown, b: unknown): number | null {
  const nums = asNumbers(a, b);
  if (nums) return nums[0] - nums[1];
  const dates = asDates(a, b);
  if (dates) return dates[0] - dates[1];
  return null;
}

function looseEquals(answer: unknown, target: unknown): boolean {
  if (typeof answer === 'boolean' || typeof target === 'boolean') {
    return String(answer) === String(target);
  }
  const cmp = compare(answer, target);
  if (cmp !== null) return cmp === 0;
  return String(answer) === String(target);
}

/**
 * Evaluates one rule against the raw answers.
 * Rule 1 (spec §4): an unanswered block is true only for `isEmpty`.
 */
export function evaluateRule(rule: ConditionRule, answers: FormResponseData): boolean {
  const answer = answers[rule.blockId];
  const blank = isBlank(answer);

  switch (rule.operator) {
    case 'isEmpty':
      return blank;
    case 'isNotEmpty':
      return !blank;
    default:
      break;
  }

  // Every operator other than isEmpty is false for an unanswered block.
  if (blank) return false;

  switch (rule.operator) {
    case 'equals':
      // `equals` on arrays is invalid semantics — always false (spec §4.4).
      if (Array.isArray(answer)) return false;
      return looseEquals(answer, rule.value);

    case 'notEquals':
      if (Array.isArray(answer)) return true;
      return !looseEquals(answer, rule.value);

    case 'contains': {
      if (Array.isArray(answer)) {
        return answer.map(String).includes(String(rule.value));
      }
      if (typeof answer === 'string') {
        return answer.toLowerCase().includes(String(rule.value ?? '').toLowerCase());
      }
      return false;
    }

    case 'notContains': {
      if (Array.isArray(answer)) {
        return !answer.map(String).includes(String(rule.value));
      }
      if (typeof answer === 'string') {
        return !answer.toLowerCase().includes(String(rule.value ?? '').toLowerCase());
      }
      return false;
    }

    case 'greaterThan': {
      const cmp = compare(answer, rule.value);
      return cmp !== null && cmp > 0;
    }

    case 'lessThan': {
      const cmp = compare(answer, rule.value);
      return cmp !== null && cmp < 0;
    }

    default:
      return false;
  }
}

/** Undefined group → always visible (true). */
export function evaluateRuleGroup(
  group: RuleGroup | undefined,
  answers: FormResponseData,
): boolean {
  if (!group || group.rules.length === 0) return true;
  if (group.combinator === 'all') {
    return group.rules.every((rule) => evaluateRule(rule, answers));
  }
  return group.rules.some((rule) => evaluateRule(rule, answers));
}

/** Pages whose page-level condition currently passes, in order. */
export function visiblePages(schema: FormSchema, answers: FormResponseData): FormPage[] {
  return schema.pages.filter((page) => evaluateRuleGroup(page.visibleWhen, answers));
}

/** Blocks on a page whose condition currently passes, in order. */
export function visibleBlocks(page: FormPage, answers: FormResponseData): FormBlock[] {
  return page.blocks.filter((block) => evaluateRuleGroup(block.visibleWhen, answers));
}

/**
 * The set of input-block ids that are currently visible across all visible
 * pages. Used to (a) validate only visible required blocks and (b) strip
 * hidden answers from the submitted payload (spec §4.5).
 */
export function visibleInputBlockIds(
  schema: FormSchema,
  answers: FormResponseData,
): Set<string> {
  const ids = new Set<string>();
  for (const page of visiblePages(schema, answers)) {
    for (const block of visibleBlocks(page, answers)) {
      if (isInputBlock(block)) ids.add(block.id);
    }
  }
  return ids;
}
