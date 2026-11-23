import type { WikiDocument, WikiDocumentBody, WikiFolder } from './types';

// Placeholder data for phase 1. Replaced by Strapi later (see PRD section 5).

const SAMPLE_PDF: WikiDocumentBody = {
  kind: 'pdf',
  url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
};

const SAMPLE_CONTENT: WikiDocumentBody = {
  kind: 'content',
  markdown: `## Before you start

This is **sample rich text**, the way a document written in Strapi's rich text field will look.

### What to bring

- Your student ID card
- A copy of your *course registration* form
- Any forms your department asks for

### Steps

1. Read the requirements for your major.
2. Plan your courses with the [Trajectory Planner](/platform/trajectory-planner).
3. Check with your faculty advisor before registration closes.

> Rules change every year. Check the date at the top before relying on this.

Questions? Write to \`academics@ashoka.edu.in\`.`,
};

const MAJORS: { id: string; name: string }[] = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'economics', name: 'Economics' },
  { id: 'ecofin', name: 'Ecofin' },
  { id: 'cs-x', name: 'CS+X' },
  { id: 'philosophy', name: 'Philosophy' },
  { id: 'psychology', name: 'Psychology' },
  { id: 'sociology', name: 'Sociology' },
  { id: 'ppe', name: 'PPE' },
  { id: 'physics', name: 'Physics' },
  { id: 'biology', name: 'Biology' },
  { id: 'chemistry', name: 'Chemistry' },
];

export const PLACEHOLDER_FOLDERS: WikiFolder[] = [
  { id: 'academic', name: 'Academic', parentId: null },
  ...MAJORS.map((m) => ({ id: `academic-${m.id}`, name: m.name, parentId: 'academic' })),
  { id: 'student-life', name: 'Student Life', parentId: null },
  { id: 'general', name: 'General', parentId: null },
];

const DOC_KINDS = ['Major Requirements', 'Course Map', 'Study Guide'];

const majorDocuments: WikiDocument[] = MAJORS.flatMap((m, majorIndex) =>
  DOC_KINDS.map((kind, kindIndex) => ({
    id: `doc-${m.id}-${kindIndex}`,
    title: `${m.name} ${kind}`,
    folderId: `academic-${m.id}`,
    tags: [m.name, kind.split(' ')[0]],
    updatedAt: `2026-${String(((majorIndex + kindIndex) % 9) + 1).padStart(2, '0')}-${String(((majorIndex * 3 + kindIndex * 7) % 27) + 1).padStart(2, '0')}`,
    thumbnailUrl: null,
    // Every third document is rich text so both kinds show up in the grid.
    body: kindIndex === 2 ? SAMPLE_CONTENT : SAMPLE_PDF,
  })),
);

const otherDocuments: WikiDocument[] = [
  { id: 'doc-sl-0', title: 'Hostel Handbook', folderId: 'student-life', tags: ['Hostel', 'Rules'], updatedAt: '2026-08-14', body: SAMPLE_PDF },
  { id: 'doc-sl-1', title: 'Clubs and Societies Guide', folderId: 'student-life', tags: ['Clubs', 'Societies'], updatedAt: '2026-09-02', body: SAMPLE_CONTENT },
  { id: 'doc-sl-2', title: 'Mess and Dining Guide', folderId: 'student-life', tags: ['Mess', 'Food'], updatedAt: '2026-07-21', body: SAMPLE_CONTENT },
  { id: 'doc-g-0', title: 'Undergraduate Handbook', folderId: 'general', tags: ['Handbook', 'Policies'], updatedAt: '2026-06-30', body: SAMPLE_PDF },
  { id: 'doc-g-1', title: 'Academic Calendar', folderId: 'general', tags: ['Calendar', 'Dates'], updatedAt: '2026-08-01', body: SAMPLE_PDF },
  { id: 'doc-g-2', title: 'Campus Map', folderId: 'general', tags: ['Campus', 'Map'], updatedAt: '2026-05-18', body: SAMPLE_CONTENT },
].map((d) => ({ ...d, thumbnailUrl: null }));

export const PLACEHOLDER_DOCUMENTS: WikiDocument[] = [...majorDocuments, ...otherDocuments];
