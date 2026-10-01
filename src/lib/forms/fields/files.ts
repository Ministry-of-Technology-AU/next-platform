/**
 * File policy shared by the upload fields and the `/api/uploads` route.
 *
 * A file is accepted only when its extension, its declared MIME type and its
 * leading bytes (magic number) all agree on the same kind. The client checks
 * this before a file enters form state; the server checks it again before
 * anything reaches Cloudinary. Pure module — runs in the browser and in Node.
 */

export const MB = 1024 * 1024;

/** Hard ceiling for a single upload, enforced client and server side. */
export const MAX_UPLOAD_MB = 10;

export type FileKind =
  | 'image'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'text'
  | 'archive';

interface KindRule {
  label: string;
  exts: readonly string[];
  mimes: readonly string[];
}

export const FILE_KINDS: Record<FileKind, KindRule> = {
  image: {
    label: 'Image',
    exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.heic', '.heif'],
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif'],
  },
  pdf: {
    label: 'PDF',
    exts: ['.pdf'],
    mimes: ['application/pdf'],
  },
  document: {
    label: 'Word document',
    exts: ['.doc', '.docx', '.odt', '.rtf'],
    mimes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/rtf',
      'text/rtf',
    ],
  },
  spreadsheet: {
    label: 'Spreadsheet',
    exts: ['.xls', '.xlsx', '.ods', '.csv'],
    mimes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/csv',
    ],
  },
  presentation: {
    label: 'Presentation',
    exts: ['.ppt', '.pptx', '.odp'],
    mimes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',
    ],
  },
  text: {
    label: 'Text file',
    exts: ['.txt', '.md'],
    mimes: ['text/plain', 'text/markdown'],
  },
  archive: {
    label: 'ZIP archive',
    exts: ['.zip'],
    mimes: ['application/zip', 'application/x-zip-compressed'],
  },
};

/** Minimal structural type so the helpers work on `File` in both runtimes. */
export interface FileLike {
  name: string;
  type: string;
  size: number;
  slice(start?: number, end?: number): Blob;
}

export function getExtension(name: string): string {
  const match = /\.[^./\\]+$/.exec(name.toLowerCase());
  return match ? match[0] : '';
}

/**
 * Resolve the kind a file claims to be. Extension decides; the MIME type must
 * either agree or be empty/generic (some OSes send `application/octet-stream`).
 */
export function detectFileKind(file: Pick<FileLike, 'name' | 'type'>): FileKind | null {
  const ext = getExtension(file.name);
  const mime = file.type.toLowerCase();
  const genericMime = mime === '' || mime === 'application/octet-stream';

  for (const [kind, rule] of Object.entries(FILE_KINDS) as [FileKind, KindRule][]) {
    if (!rule.exts.includes(ext)) continue;
    if (genericMime || rule.mimes.includes(mime)) return kind;
  }
  return null;
}

/** Canonical MIME for a file — used so uploads are stored with a matching doctype. */
export function canonicalMime(file: Pick<FileLike, 'name' | 'type'>): string {
  const kind = detectFileKind(file);
  if (!kind) return 'application/octet-stream';
  const mime = file.type.toLowerCase();
  const rule = FILE_KINDS[kind];
  if (rule.mimes.includes(mime)) return mime;
  // Fall back to the MIME at the same index as the extension, else the first.
  const idx = rule.exts.indexOf(getExtension(file.name));
  return rule.mimes[Math.min(Math.max(idx, 0), rule.mimes.length - 1)] ?? 'application/octet-stream';
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

const ZIP = [0x50, 0x4b, 0x03, 0x04] as const;
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const;

/** Does the byte header match what a file of `kind` must start with? */
function headerMatches(kind: FileKind, ext: string, bytes: Uint8Array): boolean {
  switch (kind) {
    case 'image':
      if (ext === '.png') return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (ext === '.jpg' || ext === '.jpeg') return startsWith(bytes, [0xff, 0xd8, 0xff]);
      if (ext === '.gif') return startsWith(bytes, [0x47, 0x49, 0x46, 0x38]);
      if (ext === '.webp') return startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
      // AVIF / HEIC: ISO-BMFF `ftyp` box at offset 4.
      return startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4);
    case 'pdf':
      return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
    case 'archive':
      return startsWith(bytes, ZIP);
    case 'document':
    case 'spreadsheet':
    case 'presentation':
      if (ext === '.rtf') return startsWith(bytes, [0x7b, 0x5c, 0x72, 0x74, 0x66]);
      if (ext === '.csv') return isProbablyText(bytes);
      if (ext === '.doc' || ext === '.xls' || ext === '.ppt') return startsWith(bytes, OLE);
      return startsWith(bytes, ZIP);
    case 'text':
      return isProbablyText(bytes);
  }
}

function isProbablyText(bytes: Uint8Array): boolean {
  // Binary formats almost always contain a NUL within the first few hundred bytes.
  return !bytes.includes(0x00);
}

/**
 * Read the first bytes of a file and confirm they match its extension.
 * Rejects renamed executables, HTML disguised as images and similar tricks.
 */
export async function verifyFileSignature(file: FileLike): Promise<boolean> {
  const kind = detectFileKind(file);
  if (!kind) return false;
  if (file.size === 0) return false;
  const buffer = await file.slice(0, 512).arrayBuffer();
  return headerMatches(kind, getExtension(file.name), new Uint8Array(buffer));
}

/**
 * Does `file` satisfy an HTML `accept` string (".pdf,image/*,application/zip")?
 * Empty or wildcard accept strings allow every known kind.
 */
export function matchesAccept(file: Pick<FileLike, 'name' | 'type'>, accept: string | undefined): boolean {
  const tokens = (accept ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0 || tokens.includes('*/*') || tokens.includes('*')) return true;

  const ext = getExtension(file.name);
  const mime = canonicalMime(file);
  return tokens.some((token) => {
    if (token.startsWith('.')) return token === ext;
    if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1));
    return token === mime;
  });
}

/** Build an `accept` attribute from a list of kinds. */
export function acceptForKinds(kinds: readonly FileKind[]): string {
  return kinds.flatMap((kind) => [...FILE_KINDS[kind].exts, ...FILE_KINDS[kind].mimes]).join(',');
}

/** Human-readable list of kinds allowed by an accept string, for helper text. */
export function describeAccept(accept: string | undefined): string {
  const tokens = (accept ?? '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tokens.length === 0 || tokens.includes('*/*')) return 'Any supported file';
  const labels = new Set<string>();
  for (const [kind, rule] of Object.entries(FILE_KINDS) as [FileKind, KindRule][]) {
    const hit = tokens.some(
      (t) => rule.exts.includes(t) || rule.mimes.includes(t) || (t.endsWith('/*') && rule.mimes.some((m) => m.startsWith(t.slice(0, -1)))),
    );
    if (hit) labels.add(kind === 'image' ? 'Images' : FILE_KINDS[kind].label + 's');
  }
  return labels.size > 0 ? [...labels].join(', ') : tokens.join(', ');
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exp;
  return `${value >= 10 || exp === 0 ? Math.round(value) : value.toFixed(1)} ${units[exp]}`;
}

/** Kinds a browser can render inline in a preview dialog. */
export function previewKind(file: Pick<FileLike, 'name' | 'type'>): 'image' | 'pdf' | 'text' | null {
  const kind = detectFileKind(file);
  if (kind === 'image') {
    // HEIC/HEIF do not render outside Safari.
    const ext = getExtension(file.name);
    return ext === '.heic' || ext === '.heif' ? null : 'image';
  }
  if (kind === 'pdf') return 'pdf';
  if (kind === 'text' || getExtension(file.name) === '.csv') return 'text';
  return null;
}
