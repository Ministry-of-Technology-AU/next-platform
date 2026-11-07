import type { WikiDocument, WikiFolder } from './types';

// Placeholder data for phase 1. Replaced by Strapi later (see PRD section 5).

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
    pdfUrl: null,
  })),
);

const otherDocuments: WikiDocument[] = [
  { id: 'doc-sl-0', title: 'Hostel Handbook', folderId: 'student-life', tags: ['Hostel', 'Rules'], updatedAt: '2026-08-14' },
  { id: 'doc-sl-1', title: 'Clubs and Societies Guide', folderId: 'student-life', tags: ['Clubs', 'Societies'], updatedAt: '2026-09-02' },
  { id: 'doc-sl-2', title: 'Mess and Dining Guide', folderId: 'student-life', tags: ['Mess', 'Food'], updatedAt: '2026-07-21' },
  { id: 'doc-g-0', title: 'Undergraduate Handbook', folderId: 'general', tags: ['Handbook', 'Policies'], updatedAt: '2026-06-30' },
  { id: 'doc-g-1', title: 'Academic Calendar', folderId: 'general', tags: ['Calendar', 'Dates'], updatedAt: '2026-08-01' },
  { id: 'doc-g-2', title: 'Campus Map', folderId: 'general', tags: ['Campus', 'Map'], updatedAt: '2026-05-18' },
].map((d) => ({ ...d, thumbnailUrl: null, pdfUrl: null }));

export const PLACEHOLDER_DOCUMENTS: WikiDocument[] = [...majorDocuments, ...otherDocuments];
