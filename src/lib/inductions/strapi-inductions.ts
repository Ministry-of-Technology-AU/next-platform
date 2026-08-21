import 'server-only';

/**
 * Server-only data access for induction cycles, roles, pipeline rounds, and applicants.
 * All Strapi API calls using STRAPI_API_TOKEN live here or in route handlers.
 */

import { strapiGet, strapiPost, strapiPut, strapiDelete, type StrapiFilters } from '@/lib/apis/strapi';
import type {
  InductionCycleSummary,
  InductionRole,
  PipelineRound,
  RoleTier,
  CycleStatus,
  PipelineRoundType,
} from '@/app/organisations/inductions/types';
import { PLACEHOLDER_CYCLE_STATS, PLACEHOLDER_ROLE_STATS } from '@/app/organisations/inductions/types';
import type { ApplicantRow, ApplicantStatus } from '@/app/organisations/inductions/_components/role-applicants';
import { createForm, getFormByUid } from '@/lib/forms/strapi-forms';
import { normalizeStartDateToStartOfDay, normalizeEndDateToEndOfDay } from '@/lib/date-utils';

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function attrs<T = Record<string, unknown>>(entry: any): T {
  return (entry?.attributes ?? entry ?? {}) as T;
}

export function normalizeCycle(entry: any): InductionCycleSummary | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  return {
    id: id.toString(),
    name: a.name || 'Untitled Cycle',
    status: (a.status as CycleStatus) || 'draft',
    startDate: a.start_date ?? null,
    endDate: a.end_date ?? null,
    stats: a.stats || PLACEHOLDER_CYCLE_STATS,
    createdAt: a.createdAt || new Date().toISOString(),
  };
}

export function normalizeRole(entry: any): InductionRole | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  return {
    id: id.toString(),
    name: a.name || 'Untitled Role',
    tier: (a.tier as RoleTier) || 'tier-1',
    department: a.department || null,
    description: a.description || null,
    stats: a.stats || PLACEHOLDER_ROLE_STATS,
    createdAt: a.createdAt || new Date().toISOString(),
  };
}

export function normalizePipelineRound(entry: any): PipelineRound | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  const formEntry = a.form?.data ?? a.form;
  const formAttrs = formEntry?.attributes ?? formEntry;
  const extractedFormId =
    formAttrs?.form_uid ??
    formAttrs?.uid ??
    formEntry?.id ??
    (typeof a.form === 'string' || typeof a.form === 'number' ? a.form : null);

  const formIdStr =
    extractedFormId != null && typeof extractedFormId !== 'object'
      ? String(extractedFormId)
      : null;

  return {
    id: id.toString(),
    type: (a.type as PipelineRoundType) || 'form',
    label: a.label || 'Round',
    formId: formIdStr && formIdStr !== '[object Object]' ? formIdStr : null,
    deadline: a.deadline ?? null,
    description: a.description ?? null,
    order: typeof a.order === 'number' ? a.order : 0,
    interviewConfig: a.interview_config ?? a.interviewConfig ?? null,
  };
}

export function normalizeApplicant(entry: any): ApplicantRow | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  const respondent = a.respondent?.data?.attributes ?? a.respondent ?? {};
  const respondentEmail = a.respondent_email || respondent.email || '';

  // Extract applicant name from user profile or form submission fields
  const formData = typeof a.data === 'object' && a.data !== null ? a.data : {};
  const formName =
    formData.name ||
    formData.fullName ||
    formData['full_name'] ||
    formData['Full Name'] ||
    formData['applicant_name'] ||
    (formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : null);

  const fallbackName = respondentEmail
    ? respondentEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Applicant';

  const respondentName = respondent.name || respondent.username || formName || fallbackName;

  let status: ApplicantStatus = 'submitted';
  if (a.application_status === 'approved' || a.application_status === 'advanced') {
    status = 'advanced';
  } else if (a.application_status === 'rejected') {
    status = 'rejected';
  } else if (a.state === 'draft') {
    status = 'draft';
  } else {
    status = 'submitted';
  }

  return {
    id: id.toString(),
    email: respondentEmail,
    name: respondentName,
    submittedAt: a.submitted_at || a.createdAt || null,
    status,
    currentRound: typeof a.current_round === 'number' ? a.current_round : 0,
  };
}

// ---------------------------------------------------------------------------
// Induction Cycles
// ---------------------------------------------------------------------------

export async function listCyclesByOrg(organisationId: number): Promise<InductionCycleSummary[]> {
  const res = await strapiGet('/induction-cycles', {
    filters: {
      organisation: { id: { $eq: organisationId } },
    },
    populate: {
      roles: { fields: ['id'] },
    },
    sort: 'createdAt:desc',
    pagination: { pageSize: 100 },
  });

  const rows = res?.data ?? [];
  return rows.map(normalizeCycle).filter((c: InductionCycleSummary | null): c is InductionCycleSummary => c !== null);
}

export async function getCycleById(cycleId: string | number): Promise<InductionCycleSummary | null> {
  const res = await strapiGet(`/induction-cycles/${cycleId}`, {
    populate: {
      organisation: { fields: ['id', 'name'] },
      roles: { fields: ['id', 'name', 'tier', 'department'] },
      timeline: true,
    },
  });

  return normalizeCycle(res?.data);
}

export async function createCycle(input: {
  organisationId: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}): Promise<InductionCycleSummary | null> {
  const res = await strapiPost('/induction-cycles', {
    data: {
      name: input.name,
      status: 'draft',
      start_date: input.startDate ? normalizeStartDateToStartOfDay(input.startDate) : undefined,
      end_date: input.endDate ? normalizeEndDateToEndOfDay(input.endDate) : undefined,
      description: input.description || undefined,
      stats: PLACEHOLDER_CYCLE_STATS,
      organisation: input.organisationId,
    },
  });

  return normalizeCycle(res?.data);
}

export async function updateCycle(
  cycleId: string | number,
  patch: Partial<{
    name: string;
    status: CycleStatus;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    stats: any;
  }>,
): Promise<InductionCycleSummary | null> {
  const data: Record<string, any> = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.startDate !== undefined) data.start_date = patch.startDate ? normalizeStartDateToStartOfDay(patch.startDate) : null;
  if (patch.endDate !== undefined) data.end_date = patch.endDate ? normalizeEndDateToEndOfDay(patch.endDate) : null;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.stats !== undefined) data.stats = patch.stats;

  const res = await strapiPut(`/induction-cycles/${cycleId}`, { data });
  return normalizeCycle(res?.data);
}

export async function deleteCycle(cycleId: string | number): Promise<void> {
  // Cascading cleanup of roles
  const roles = await listRolesByCycle(cycleId);
  for (const role of roles) {
    await deleteRole(role.id);
  }
  await strapiDelete(`/induction-cycles/${cycleId}`);
}

// ---------------------------------------------------------------------------
// Induction Roles
// ---------------------------------------------------------------------------

export async function listRolesByCycle(cycleId: string | number): Promise<InductionRole[]> {
  const res = await strapiGet('/induction-roles', {
    filters: {
      induction_cycle: { id: { $eq: cycleId } },
    },
    sort: 'createdAt:asc',
    pagination: { pageSize: 100 },
  });

  const rows = res?.data ?? [];
  return rows.map(normalizeRole).filter((r: InductionRole | null): r is InductionRole => r !== null);
}

export async function getRoleById(roleId: string | number): Promise<InductionRole | null> {
  const res = await strapiGet(`/induction-roles/${roleId}`, {
    populate: {
      induction_cycle: { fields: ['id', 'name'] },
      pipeline_rounds: true,
    },
  });

  return normalizeRole(res?.data);
}

export async function createRole(input: {
  cycleId: string | number;
  name: string;
  tier: RoleTier;
  department?: string | null;
  description?: string | null;
}): Promise<InductionRole | null> {
  const res = await strapiPost('/induction-roles', {
    data: {
      name: input.name,
      tier: input.tier || 'tier-1',
      department: input.department || undefined,
      description: input.description || undefined,
      stats: PLACEHOLDER_ROLE_STATS,
      induction_cycle: input.cycleId,
    },
  });

  const created = normalizeRole(res?.data);
  if (created) {
    // 1. Try to fetch cycle to get organisationId and auto-create the application form
    let formDbId: number | undefined = undefined;
    try {
      const cycleRaw = await strapiGet(`/induction-cycles/${input.cycleId}`, {
        populate: { organisation: { fields: ['id'] } },
      });
      const orgId =
        cycleRaw?.data?.attributes?.organisation?.data?.id ??
        cycleRaw?.data?.organisation?.id ??
        cycleRaw?.data?.organisation;

      if (orgId) {
        const formRecord = await createForm(`${input.name} Application Form`, Number(orgId));
        if (formRecord?.id) {
          formDbId = formRecord.id;
        }
      }
    } catch (err) {
      console.error('Failed to auto-create form for role:', err);
    }

    // 2. Create single default pipeline round (Application Form) linked to the created form
    await strapiPost('/pipeline-rounds', {
      data: {
        label: 'Application Form',
        type: 'form',
        order: 0,
        description: 'Initial application form for candidates.',
        form: formDbId ?? null,
        role: created.id,
      },
    });
  }

  return created;
}

export async function updateRole(
  roleId: string | number,
  patch: Partial<{
    name: string;
    tier: RoleTier;
    department: string | null;
    description: string | null;
    stats: any;
  }>,
): Promise<InductionRole | null> {
  const data: Record<string, any> = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.tier !== undefined) data.tier = patch.tier;
  if (patch.department !== undefined) data.department = patch.department;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.stats !== undefined) data.stats = patch.stats;

  const res = await strapiPut(`/induction-roles/${roleId}`, { data });
  return normalizeRole(res?.data);
}

export async function deleteRole(roleId: string | number): Promise<void> {
  // Clean up pipeline rounds
  const rounds = await listPipelineByRole(roleId);
  for (const r of rounds) {
    await strapiDelete(`/pipeline-rounds/${r.id}`);
  }
  await strapiDelete(`/induction-roles/${roleId}`);
}

// ---------------------------------------------------------------------------
// Pipeline Rounds
// ---------------------------------------------------------------------------

export async function listPipelineByRole(roleId: string | number): Promise<PipelineRound[]> {
  const res = await strapiGet('/pipeline-rounds', {
    filters: {
      role: { id: { $eq: roleId } },
    },
    populate: {
      form: { fields: ['id', 'form_uid', 'title'] },
    },
    sort: 'order:asc',
    pagination: { pageSize: 50 },
  });

  const rows = res?.data ?? [];
  return rows.map(normalizePipelineRound).filter((r: PipelineRound | null): r is PipelineRound => r !== null);
}

export async function syncPipeline(roleId: string | number, rounds: PipelineRound[]): Promise<PipelineRound[]> {
  const existing = await listPipelineByRole(roleId);
  const existingIds = new Set(existing.map((r) => r.id));
  const nextIds = new Set(rounds.map((r) => r.id));

  // Delete removed rounds
  for (const ex of existing) {
    if (!nextIds.has(ex.id)) {
      await strapiDelete(`/pipeline-rounds/${ex.id}`);
    }
  }

  // Upsert rounds (Enforce: Round 0 is ALWAYS form, Round 1+ are interview rounds)
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    const enforcedType: PipelineRoundType = i === 0 ? 'form' : 'interview';

    let formDbId: number | null = null;
    if (enforcedType === 'form' && round.formId && round.formId !== 'none' && round.formId !== '[object Object]') {
      if (!isNaN(Number(round.formId)) && !round.formId.includes('-')) {
        formDbId = Number(round.formId);
      } else {
        const formRecord = await getFormByUid(round.formId);
        if (formRecord?.id) {
          formDbId = formRecord.id;
        }
      }
    }

    const data = {
      label: round.label,
      type: enforcedType,
      order: i,
      deadline: round.deadline ? normalizeEndDateToEndOfDay(round.deadline) : undefined,
      description: round.description || undefined,
      form: enforcedType === 'form' ? formDbId ?? null : null,
      role: parseInt(roleId.toString(), 10),
      interview_config: enforcedType === 'interview' ? round.interviewConfig ?? null : null,
    };

    if (existingIds.has(round.id)) {
      await strapiPut(`/pipeline-rounds/${round.id}`, { data });
    } else {
      await strapiPost('/pipeline-rounds', { data });
    }
  }

  return listPipelineByRole(roleId);
}

// ---------------------------------------------------------------------------
// Interview Scheduling Data Access
// ---------------------------------------------------------------------------

export interface PopulatedPipelineRound extends PipelineRound {
  role?: {
    id: string;
    name: string;
    tier: string;
    department?: string | null;
  } | null;
  cycle?: {
    id: string;
    name: string;
  } | null;
  organisation?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    email?: string | null;
  } | null;
}

export async function getPipelineRoundDetails(roundId: string | number): Promise<PopulatedPipelineRound | null> {
  try {
    const res = await strapiGet(`/pipeline-rounds/${roundId}`, {
      populate: {
        form: { fields: ['id', 'form_uid', 'title'] },
        role: {
          populate: {
            induction_cycle: {
              populate: {
                organisation: {
                  fields: ['id', 'name', 'profile_url', 'email', 'induction_mail_sender'],
                },
              },
            },
          },
        },
      },
    });

    const entry = res?.data;
    if (!entry) return null;

    const baseRound = normalizePipelineRound(entry);
    if (!baseRound) return null;

    const a = attrs<any>(entry);
    const roleEntry = a.role?.data ?? a.role;
    const roleAttrs = roleEntry?.attributes ?? roleEntry;

    const cycleEntry = roleAttrs?.induction_cycle?.data ?? roleAttrs?.induction_cycle;
    const cycleAttrs = cycleEntry?.attributes ?? cycleEntry;

    const orgEntry = cycleAttrs?.organisation?.data ?? cycleAttrs?.organisation;
    const orgAttrs = orgEntry?.attributes ?? orgEntry;

    return {
      ...baseRound,
      role: roleEntry?.id
        ? {
            id: roleEntry.id.toString(),
            name: roleAttrs?.name || 'Role',
            tier: roleAttrs?.tier || 'tier-1',
            department: roleAttrs?.department || null,
          }
        : null,
      cycle: cycleEntry?.id
        ? {
            id: cycleEntry.id.toString(),
            name: cycleAttrs?.name || 'Induction Cycle',
          }
        : null,
      organisation: orgEntry?.id
        ? {
            id: orgEntry.id.toString(),
            name: orgAttrs?.name || 'Organisation',
            logoUrl: orgAttrs?.profile_url || null,
            email: orgAttrs?.email || orgAttrs?.induction_mail_sender || null,
          }
        : null,
    };
  } catch (err) {
    console.error('Error fetching pipeline round details for ID:', roundId, err);
    return null;
  }
}

export async function bookInterviewSlot(
  roundId: string | number,
  booking: {
    slotKey: string;
    candidateEmail: string;
    candidateName?: string;
  },
): Promise<{ success: boolean; round?: PipelineRound | null; error?: string }> {
  try {
    const roundDetails = await getPipelineRoundDetails(roundId);
    if (!roundDetails) {
      return { success: false, error: 'Interview round not found' };
    }

    if (roundDetails.type !== 'interview') {
      return { success: false, error: 'This round is not configured for interview scheduling' };
    }

    const currentConfig = roundDetails.interviewConfig || {
      eventTitle: roundDetails.label,
      eventDescription: roundDetails.description || '',
      invitees: [],
      dateMode: 'dates',
      slotMode: 'default',
      slotDuration: 30,
      selectedSlots: [],
      bookings: [],
    };

    const existingBookings = currentConfig.bookings || [];

    // Check if slot is already booked
    const isAlreadyBooked = existingBookings.some((b) => b.slotKey === booking.slotKey);
    if (isAlreadyBooked) {
      return { success: false, error: 'This time slot has already been booked by another candidate.' };
    }

    // Add booking (or update if this candidate already booked another slot in this round)
    const filteredBookings = existingBookings.filter(
      (b) => b.candidateEmail.toLowerCase() !== booking.candidateEmail.toLowerCase(),
    );

    const newBooking = {
      slotKey: booking.slotKey,
      candidateEmail: booking.candidateEmail,
      candidateName: booking.candidateName || undefined,
      bookedAt: new Date().toISOString(),
    };

    const updatedConfig = {
      ...currentConfig,
      bookings: [...filteredBookings, newBooking],
    };

    const res = await strapiPut(`/pipeline-rounds/${roundId}`, {
      data: {
        interview_config: updatedConfig,
      },
    });

    return {
      success: true,
      round: normalizePipelineRound(res?.data),
    };
  } catch (err: any) {
    console.error('Error booking interview slot for round:', roundId, err);
    return { success: false, error: err.message || 'Failed to book slot' };
  }
}

// ---------------------------------------------------------------------------
// Applicants (Form Responses linked to a role)
// ---------------------------------------------------------------------------

export async function listApplicantsByRole(roleId: string | number): Promise<ApplicantRow[]> {
  try {
    const rounds = await listPipelineByRole(roleId);
    const numericFormIds: number[] = [];
    const uidFormIds: string[] = [];

    for (const round of rounds) {
      if (round.formId && round.formId !== 'none' && round.formId !== '[object Object]') {
        const raw = round.formId;
        if (!isNaN(Number(raw)) && !String(raw).includes('-')) {
          numericFormIds.push(Number(raw));
        } else {
          uidFormIds.push(raw);
          const formRecord = await getFormByUid(raw);
          if (formRecord?.id && !numericFormIds.includes(formRecord.id)) {
            numericFormIds.push(formRecord.id);
          }
        }
      }
    }

    const allEntries: any[] = [];
    const seenIds = new Set<string | number>();

    // 1. Fetch by numeric form IDs directly (guaranteed to match foreign key)
    for (const formId of numericFormIds) {
      const res = await strapiGet('/form-responses', {
        filters: { form: { id: { $eq: formId } } },
        populate: {
          respondent: { fields: ['id', 'username', 'email', 'name'] },
          form: { fields: ['id', 'title', 'form_uid'] },
        },
        sort: 'submitted_at:desc,updatedAt:desc',
        pagination: { pageSize: 200 },
      });
      const data = res?.data ?? [];
      for (const item of data) {
        const id = item.id ?? item.attributes?.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          allEntries.push(item);
        }
      }
    }

    // 2. Fetch by direct role relation if any
    const roleRes = await strapiGet('/form-responses', {
      filters: { role: { id: { $eq: Number(roleId) || roleId } } },
      populate: {
        respondent: { fields: ['id', 'username', 'email', 'name'] },
        form: { fields: ['id', 'title', 'form_uid'] },
      },
      sort: 'submitted_at:desc,updatedAt:desc',
      pagination: { pageSize: 200 },
    });
    const roleData = roleRes?.data ?? [];
    for (const item of roleData) {
      const id = item.id ?? item.attributes?.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        allEntries.push(item);
      }
    }

    return allEntries
      .map(normalizeApplicant)
      .filter((a: ApplicantRow | null): a is ApplicantRow => a !== null);
  } catch (err) {
    console.error('Error fetching applicants for role:', roleId, err);
    return [];
  }
}

export async function updateApplicantStatus(
  responseId: string | number,
  patch: {
    application_status: 'pending' | 'approved' | 'rejected' | 'advanced';
    status_message?: string;
    rejection_reason?: string;
    current_round?: number;
  },
): Promise<ApplicantRow | null> {
  const res = await strapiPut(`/form-responses/${responseId}`, {
    data: patch,
  });

  return normalizeApplicant(res?.data);
}

/**
 * Resolves the induction role and all pipeline rounds associated with a given form.
 */
export async function getPipelineForForm(formId: number | string): Promise<{
  role: { id: string; name: string; tier: string; department?: string | null } | null;
  rounds: PipelineRound[];
} | null> {
  try {
    const isNum = !isNaN(Number(formId)) && !String(formId).includes('-');
    const filters: any = isNum
      ? { form: { id: { $eq: Number(formId) } } }
      : { form: { form_uid: { $eq: String(formId) } } };

    const res = await strapiGet('/pipeline-rounds', {
      filters,
      populate: {
        role: {
          populate: {
            pipeline_rounds: true,
          },
        },
      },
      pagination: { pageSize: 1 },
    });

    const roundEntry = res?.data?.[0];
    if (!roundEntry) return null;

    const a = attrs<any>(roundEntry);
    const roleEntry = a.role?.data ?? a.role;
    const roleAttrs = roleEntry?.attributes ?? roleEntry;

    if (!roleEntry) return null;

    const roleId = roleEntry.id ?? roleAttrs?.id;
    if (!roleId) return null;

    const allRounds = await listPipelineByRole(roleId);
    return {
      role: {
        id: roleId.toString(),
        name: roleAttrs?.name || 'Role',
        tier: roleAttrs?.tier || 'tier-1',
        department: roleAttrs?.department ?? null,
      },
      rounds: allRounds,
    };
  } catch (err) {
    console.error('Error fetching pipeline for form:', formId, err);
    return null;
  }
}
