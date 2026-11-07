import 'server-only';
import { PLACEHOLDER_DOCUMENTS, PLACEHOLDER_FOLDERS } from '../data';
import type { WikiData } from '../types';

// Phase 1 reads placeholders. The Strapi swap happens here and nowhere else.
export async function getWikiData(): Promise<WikiData> {
  return { folders: PLACEHOLDER_FOLDERS, documents: PLACEHOLDER_DOCUMENTS };
}
