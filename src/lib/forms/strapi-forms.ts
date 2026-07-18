import 'server-only';

/**
 * Server-only data access for forms and form responses.
 *
 * All Strapi calls (which carry the STRAPI_API_TOKEN) live here or in route
 * handlers — never in client components. Reads are defensive about Strapi's
 * `attributes`-nested vs flat shapes (see codebase precedent). See spec §6, §7.
 */

import { unstable_cache, revalidateTag } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { strapiGet, strapiPost, strapiPut, strapiDelete, type StrapiFilters } from '@/lib/apis/strapi';
import { deleteImageFromCloudinary } from '@/lib/apis/cloudinary';
import { createDefaultSchema } from './defaults';
import type { FileDescriptor, FormSchema } from './schema';

export type FormStatus = 'draft' | 'active' | 'inactive';

export interface FormStats {
  uniqueVisits: number;
  draftCount: number;
  submissionCount: number;
  lastSubmissionAt: string | null;
}

export interface FormRecord {
  /** Numeric Strapi id — server-only, never sent to the browser. */
  id: number;
  uid: string;
  title: string;
  schema: FormSchema;
  status: FormStatus;
  startDate: string | null;
  endDate: string | null;
  stats: FormStats;
  organisationId: number | null;
  updatedAt: string | null;
}

export interface ResponseRecord {
  id: number;
  state: 'draft' | 'submitted';
  data: Record<string, unknown>;
  files: FileDescriptor[];
  respondentEmail: string;
  visitedAt: string | null;
  lastSavedAt: string | null;
  submittedAt: string | null;
}

export const zeroStats: FormStats = {
  uniqueVisits: 0,
  draftCount: 0,
  submissionCount: 0,
  lastSubmissionAt: null,
};

function formTag(uid: string) {
  return `form:${uid}`;
}

// ---------------------------------------------------------------------------
// Normalisers (defensive attributes-or-flat reads)
// ---------------------------------------------------------------------------

function attrs<T = Record<string, unknown>>(entry: any): T {
  return (entry?.attributes ?? entry ?? {}) as T;
}

function relationId(rel: any): number | null {
  if (rel == null) return null;
  if (typeof rel === 'number') return rel;
  if (rel?.data?.id != null) return rel.data.id;
  if (rel?.id != null) return rel.id;
  return null;
}

function normalizeForm(entry: any): FormRecord | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;
  return {
    id,
    uid: a.form_uid,
    title: a.title,
    schema: a.schema as FormSchema,
    status: (a.form_status as FormStatus) ?? 'draft',
    startDate: a.start_date ?? null,
    endDate: a.end_date ?? null,
    stats: { ...zeroStats, ...(a.stats ?? {}) },
    organisationId: relationId(a.organisation),
    updatedAt: a.updatedAt ?? null,
  };
}

function normalizeResponse(entry: any): ResponseRecord | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;
  return {
    id,
    state: (a.state as 'draft' | 'submitted') ?? 'draft',
    data: (a.data as Record<string, unknown>) ?? {},
    files: (a.files as FileDescriptor[]) ?? [],
    respondentEmail: a.respondent_email ?? '',
    visitedAt: a.visited_at ?? null,
    lastSavedAt: a.last_saved_at ?? null,
    submittedAt: a.submitted_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// Active check (spec §7.4) — single source of truth
// ---------------------------------------------------------------------------

export function isFormActive(form: Pick<FormRecord, 'status' | 'startDate' | 'endDate'>): boolean {
  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;
  const now = new Date();
  return form.status === 'active' && (!start || start <= now) && (!end || end > now);
}

/** True when an active form's end date has elapsed (needs a lazy flip). */
export function hasExpired(form: Pick<FormRecord, 'status' | 'endDate'>): boolean {
  if (form.status !== 'active' || !form.endDate) return false;
  return new Date(form.endDate) <= new Date();
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Uncached fetch by public uid — use for writes / org routes / submit. */
export async function getFormByUid(uid: string): Promise<FormRecord | null> {
  const res = await strapiGet('/forms', {
    filters: { form_uid: { $eq: uid } },
    populate: { organisation: { fields: ['id'] } },
    pagination: { pageSize: 1 },
  });
  const entry = res?.data?.[0];
  return normalizeForm(entry);
}

/**
 * Cached fetch by public uid, tagged `form:<uid>`. Used by the filler read
 * path; invalidated on builder save and on lazy inactive-flip.
 */
export function getFormByUidCached(uid: string): Promise<FormRecord | null> {
  return unstable_cache(() => getFormByUid(uid), ['form-by-uid', uid], {
    revalidate: 300,
    tags: [formTag(uid)],
  })();
}

export async function listFormsByOrg(organisationId: number): Promise<FormRecord[]> {
  const res = await strapiGet('/forms', {
    filters: { organisation: { id: { $eq: organisationId } } },
    populate: { organisation: { fields: ['id'] } },
    sort: 'updatedAt:desc',
    pagination: { pageSize: 100 },
  });
  const rows = res?.data ?? [];
  return rows.map(normalizeForm).filter((f: FormRecord | null): f is FormRecord => f !== null);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createForm(title: string, organisationId: number): Promise<FormRecord> {
  const uid = uuidv4();
  const res = await strapiPost('/forms', {
    data: {
      title,
      form_uid: uid,
      schema: createDefaultSchema(),
      form_status: 'draft',
      stats: zeroStats,
      organisation: organisationId,
    },
  });
  const created = normalizeForm(res?.data);
  if (!created) throw new Error('Failed to create form');
  return created;
}

interface FormPatch {
  title?: string;
  schema?: FormSchema;
  form_status?: FormStatus;
  start_date?: string | null;
  end_date?: string | null;
  stats?: FormStats;
}

/** Persist a patch to a form by numeric id, then invalidate its cache tag. */
export async function updateForm(id: number, uid: string, patch: FormPatch): Promise<FormRecord | null> {
  const res = await strapiPut(`/forms/${id}`, { data: patch });
  revalidateTag(formTag(uid));
  return normalizeForm(res?.data);
}

/** Read-modify-write the stats JSON. Single choke point (spec §7.3). */
export async function bumpStats(
  form: Pick<FormRecord, 'id' | 'uid' | 'stats'>,
  patchFn: (stats: FormStats) => FormStats,
): Promise<void> {
  const next = patchFn({ ...zeroStats, ...form.stats });
  await strapiPut(`/forms/${form.id}`, { data: { stats: next } });
  // Stats do not affect the cached public schema payload, but keep the tag
  // fresh so org dashboards reading the cached form see updated numbers.
  revalidateTag(formTag(form.uid));
}

/** Lazy inactive flip when an active form's end date has elapsed (spec §7.4). */
export async function flipToInactive(form: Pick<FormRecord, 'id' | 'uid'>): Promise<void> {
  try {
    await strapiPut(`/forms/${form.id}`, { data: { form_status: 'inactive' } });
    revalidateTag(formTag(form.uid));
  } catch (err) {
    console.error('flipToInactive failed:', err);
  }
}

/**
 * Delete a form and everything attached to it: response rows and their
 * Cloudinary assets. Only call after verifying submissionCount === 0 at the
 * route layer (spec §7.1).
 */
export async function deleteFormCascade(form: FormRecord): Promise<void> {
  const responses = await getResponsesByForm(form.id, 'all', 1, 500);
  for (const r of responses.rows) {
    for (const file of r.files) {
      if (file.publicId) {
        try {
          await deleteImageFromCloudinary(file.publicId);
        } catch (err) {
          console.error('Cloudinary cleanup failed for', file.publicId, err);
        }
      }
    }
    try {
      await strapiDelete(`/form-responses/${r.id}`);
    } catch (err) {
      console.error('Response delete failed for', r.id, err);
    }
  }
  await strapiDelete(`/forms/${form.id}`);
  revalidateTag(formTag(form.uid));
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

/** The caller's own row for a form (one per user, ever). */
export async function getResponseRow(
  formId: number,
  email: string,
): Promise<ResponseRecord | null> {
  const res = await strapiGet('/form-responses', {
    filters: {
      form: { id: { $eq: formId } },
      respondent_email: { $eq: email },
    },
    sort: 'createdAt:asc',
    pagination: { pageSize: 1 },
  });
  return normalizeResponse(res?.data?.[0]);
}

export async function createResponseRow(input: {
  formId: number;
  userId: number | null;
  email: string;
  data?: Record<string, unknown>;
  state?: 'draft' | 'submitted';
  visitedAt?: string;
  submittedAt?: string;
}): Promise<ResponseRecord | null> {
  const now = new Date().toISOString();
  const res = await strapiPost('/form-responses', {
    data: {
      form: input.formId,
      respondent: input.userId ?? undefined,
      respondent_email: input.email,
      data: input.data ?? {},
      state: input.state ?? 'draft',
      visited_at: input.visitedAt ?? now,
      last_saved_at: now,
      submitted_at: input.submittedAt ?? undefined,
      files: [],
    },
  });
  return normalizeResponse(res?.data);
}

export async function updateResponseRow(
  id: number,
  patch: Record<string, unknown>,
): Promise<ResponseRecord | null> {
  const res = await strapiPut(`/form-responses/${id}`, { data: patch });
  return normalizeResponse(res?.data);
}

export interface ResponsePage {
  rows: ResponseRecord[];
  total: number;
}

export async function getResponsesByForm(
  formId: number,
  state: 'submitted' | 'draft' | 'all',
  page: number,
  pageSize: number,
): Promise<ResponsePage> {
  const filters: StrapiFilters = { form: { id: { $eq: formId } } };
  if (state !== 'all') filters.state = { $eq: state };
  const res = await strapiGet('/form-responses', {
    filters,
    sort: 'submitted_at:desc',
    pagination: { page, pageSize },
  });
  const rows = (res?.data ?? [])
    .map(normalizeResponse)
    .filter((r: ResponseRecord | null): r is ResponseRecord => r !== null);
  const total = res?.meta?.pagination?.total ?? rows.length;
  return { rows, total };
}

/** completionRate is derived at read time — never stored (spec §13). */
export function withCompletionRate(stats: FormStats): FormStats & { completionRate: number } {
  return { ...stats, completionRate: stats.submissionCount / Math.max(stats.uniqueVisits, 1) };
}
