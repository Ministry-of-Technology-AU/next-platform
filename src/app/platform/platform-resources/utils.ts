import type { WikiDocument, WikiFolder } from './types';

const FAVOURITES_KEY = 'ashoka-wiki:favourites';

// UTC so the server and the browser print the same date.
const DATE_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'Unknown' : DATE_FORMAT.format(date);
}

/** Ids of a folder and every folder under it. */
export function folderAndDescendants(folders: WikiFolder[], folderId: string): string[] {
  const children = folders.filter((f) => f.parentId === folderId);
  return [folderId, ...children.flatMap((c) => folderAndDescendants(folders, c.id))];
}

export function documentsInFolder(documents: WikiDocument[], folders: WikiFolder[], folderId: string): WikiDocument[] {
  const ids = new Set(folderAndDescendants(folders, folderId));
  return documents.filter((d) => ids.has(d.folderId));
}

/** Matches every word of the query against the title and tags. */
export function searchDocuments(documents: WikiDocument[], query: string): WikiDocument[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return documents.filter((d) => {
    const haystack = [d.title, ...d.tags].join(' ').toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

// shortcut: favourites live in this browser only, until Strapi stores them per user (PRD section 5).
export function loadFavourites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVOURITES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function saveFavourites(ids: string[]): void {
  try {
    window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked or full. Favourites still work for this visit.
  }
}
