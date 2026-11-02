import type { Shortcut } from '@/components/shortcuts-dialog';
import type { AssetOwner, AssetTab, OwnerContact } from './types';

/** Longest loan, in days from today. The form, the calendar and the API all enforce it. */
export const MAX_BORROW_DAYS = 30;

/** An open request nobody acts on stops showing as "Requested" after this many days. */
export const REQUEST_EXPIRY_DAYS = 7;

export const REASON_MIN_LENGTH = 10;
export const REASON_MAX_LENGTH = 300;

const TECHMIN_EMAIL = 'technology.ministry@ashoka.edu.in';
const JAZBAA_EMAIL = 'culturalministry@ashoka.edu.in';

export const OWNER_CONTACTS: Record<AssetOwner, OwnerContact> = {
  Techmin: { team: 'Ministry of Technology', email: TECHMIN_EMAIL },
  Jazbaa: { team: 'Jazbaa', email: JAZBAA_EMAIL },
};

/**
 * CC'd on a request when the Strapi `borrow-assets-poc` entry can't be read. Matches the
 * defaults on that single type, so a Strapi outage still reaches each lender's team inbox.
 */
export const DEFAULT_POC_EMAILS: Record<AssetOwner, string[]> = {
  Techmin: [TECHMIN_EMAIL],
  Jazbaa: [JAZBAA_EMAIL],
};

export const TABS: ReadonlyArray<{ value: AssetTab; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'Techmin', label: 'Techmin' },
  { value: 'Jazbaa', label: 'Jazbaa' },
  { value: 'Saved', label: 'Saved' },
];

/** Friendly names for Strapi's `type` enum. Anything missing is Title Cased. */
export const TYPE_LABELS: Record<string, string> = {
  mobile: 'Phones',
  cable: 'Cables',
  adapter: 'Adapters',
};

/** Singular names for a single item's category tag on its card. */
export const CATEGORY_LABELS: Record<string, string> = {
  mobile: 'Phone',
  cable: 'Cable',
  adapter: 'Adapter',
};

/** Return-date shortcuts in the request form, in days from today. */
export const QUICK_RETURN_DAYS: ReadonlyArray<{ days: number; label: string }> = [
  { days: 1, label: 'Tomorrow' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
];

/** The borrower's undertaking, shown collapsed under the agreement checkbox. */
export const BORROWING_TERMS: readonly string[] = [
  "Use it only for the purpose you gave, and don't lend it to anyone else.",
  'Handle it with care and return it in the condition you got it.',
  'Return it on or before the return date. Late returns can cost you future borrowing.',
  'Report any damage, fault or loss to the team straight away.',
  'If it is damaged or lost through your negligence, you pay for a replacement.',
  "Don't modify, repair or open it up without permission.",
  "The university's asset borrowing policy applies.",
];

/** Every shortcut on the page, in one place. Bare keys only fire when you're not typing. */
export const SHORTCUTS: ReadonlyArray<Shortcut> = [
  { keys: ['/'], action: 'Search' },
  { keys: ['1'], action: 'All items' },
  { keys: ['2'], action: 'Techmin' },
  { keys: ['3'], action: 'Jazbaa' },
  { keys: ['4'], action: 'Saved' },
  { keys: ['Esc'], action: 'Clear search' },
  { keys: ['?'], action: 'Show this list' },
];
