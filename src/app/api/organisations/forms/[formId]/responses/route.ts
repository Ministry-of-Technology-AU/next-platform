import { NextResponse } from 'next/server';
import { requireOrgSession, resolveOrgForm, jsonOk, jsonError, csvEscape } from '@/lib/forms/api-helpers';
import { getResponsesByForm, type ResponseRecord } from '@/lib/forms/strapi-forms';
import { isInputBlock, type FormSchema, type InputBlock } from '@/lib/forms/schema';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

/** Ordered list of input blocks across all pages (CSV column order). */
function orderedInputBlocks(schema: FormSchema): InputBlock[] {
  const blocks: InputBlock[] = [];
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block)) blocks.push(block);
    }
  }
  return blocks;
}

function formatAnswer(block: InputBlock, value: unknown): string {
  if (value == null || value === '') return '';
  switch (block.type) {
    case 'select': {
      const opt = block.options.find((o) => o.value === value);
      return opt?.label ?? String(value);
    }
    case 'multi-select': {
      if (!Array.isArray(value)) return String(value);
      return value
        .map((v) => block.options.find((o) => o.value === v)?.label ?? String(v))
        .join('; ');
    }
    case 'checkbox':
      return value === true ? 'Yes' : 'No';
    case 'file-upload': {
      if (!Array.isArray(value)) return '';
      return (value as Array<{ filename?: string; url?: string }>)
        .map((f) => f.url ?? f.filename ?? '')
        .join('; ');
    }
    case 'rich-text':
      // Strip tags for the spreadsheet cell.
      return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    default:
      return String(value);
  }
}

function buildCsv(schema: FormSchema, rows: ResponseRecord[]): string {
  const blocks = orderedInputBlocks(schema);
  const header = ['Email', 'Submitted at', ...blocks.map((b) => b.title)];
  const lines = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    const cells = [
      row.respondentEmail,
      row.submittedAt ?? '',
      ...blocks.map((b) => formatAnswer(b, row.data[b.id])),
    ];
    lines.push(cells.map(csvEscape).join(','));
  }
  return lines.join('\r\n');
}

/**
 * GET /api/organisations/forms/[formId]/responses
 * Query: ?state=submitted|draft|all (default submitted), ?page, ?pageSize,
 *        ?format=csv (streams a CSV download of submitted responses).
 */
export async function GET(request: Request, ctx: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;
    const { formId } = await ctx.params;

    const form = await resolveOrgForm(formId, org.organisationId);
    if (form instanceof NextResponse) return form;

    const url = new URL(request.url);
    const stateParam = url.searchParams.get('state') ?? 'submitted';
    const state = (['submitted', 'draft', 'all'].includes(stateParam) ? stateParam : 'submitted') as
      | 'submitted'
      | 'draft'
      | 'all';
    const format = url.searchParams.get('format');

    if (format === 'csv') {
      const { rows } = await getResponsesByForm(form.id, 'submitted', 1, 1000);
      const csv = buildCsv(form.schema, rows);
      const safeName = form.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeName || 'responses'}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 25));
    const { rows, total } = await getResponsesByForm(form.id, state, page, pageSize);

    return jsonOk({
      responses: rows.map((r) => ({
        id: r.id,
        email: r.respondentEmail,
        state: r.state,
        data: r.data,
        submittedAt: r.submittedAt,
        lastSavedAt: r.lastSavedAt,
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error('GET responses failed:', err);
    return jsonError('Failed to load responses', 500);
  }
}
