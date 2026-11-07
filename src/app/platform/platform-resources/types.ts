export interface WikiFolder {
  id: string;
  name: string;
  /** null for top-level folders. */
  parentId: string | null;
}

export interface WikiDocument {
  id: string;
  title: string;
  folderId: string;
  /** Subject tags shown on the card, 3 at most. */
  tags: string[];
  /** ISO date. */
  updatedAt: string;
  /** Page-1 image of the PDF. null shows a placeholder tile. */
  thumbnailUrl: string | null;
  /** null until files are connected. The preview pane shows a stub. */
  pdfUrl: string | null;
}

export interface WikiData {
  folders: WikiFolder[];
  documents: WikiDocument[];
}

/** The landing view. Any other view is a folder id. */
export const FAVOURITES_VIEW = 'favourites';
