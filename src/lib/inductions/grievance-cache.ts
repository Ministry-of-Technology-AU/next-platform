/**
 * Ultra-resilient, multi-layer browser cache for induction grievance submissions.
 *
 * Implements a redundant 3-tier persistent storage architecture:
 * 1. Tier 1: LocalStorage (Fast synchronous lookup)
 * 2. Tier 2: Persistent Cookies with 2-year expiration (Survives web storage flushes)
 * 3. Tier 3: IndexedDB (Structured, durable binary storage)
 *
 * Features:
 * - Automatic Storage Persistence: Requests `navigator.storage.persist()`
 * - Cross-Tier Self-Healing: If a record is detected in ANY tier, it automatically
 *   restores and re-persists the record across all other tiers.
 */

export interface GrievanceCacheRecord {
  applicationId: number | string;
  submittedAt: string;
  subject?: string;
  version: number;
}

const DB_NAME = 'ashoka_inductions_persistent_v1';
const STORE_NAME = 'grievances';
const DB_VERSION = 1;
const LS_PREFIX = 'sg_grv_app_';
const COOKIE_PREFIX = 'sg_grv_';
const COOKIE_MAX_AGE_SECS = 60 * 60 * 24 * 365 * 2; // 2 years

// ---------------------------------------------------------------------------
// Tier 1: LocalStorage
// ---------------------------------------------------------------------------

function getLsKey(applicationId: number | string): string {
  return `${LS_PREFIX}${applicationId}`;
}

function readFromLocalStorage(applicationId: number | string): GrievanceCacheRecord | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(getLsKey(applicationId));
    if (!raw) return null;
    return JSON.parse(raw) as GrievanceCacheRecord;
  } catch {
    return null;
  }
}

function writeToLocalStorage(record: GrievanceCacheRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(getLsKey(record.applicationId), JSON.stringify(record));
  } catch {
    // quota or private mode protection
  }
}

// ---------------------------------------------------------------------------
// Tier 2: Persistent Cookies
// ---------------------------------------------------------------------------

function getCookieName(applicationId: number | string): string {
  return `${COOKIE_PREFIX}${applicationId}`;
}

function readFromCookie(applicationId: number | string): GrievanceCacheRecord | null {
  if (typeof document === 'undefined') return null;
  try {
    const name = getCookieName(applicationId);
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
    if (!match || !match[2]) return null;
    const decoded = decodeURIComponent(match[2]);
    try {
      return JSON.parse(decoded) as GrievanceCacheRecord;
    } catch {
      // If legacy simple timestamp string was stored
      return {
        applicationId,
        submittedAt: decoded,
        version: 1,
      };
    }
  } catch {
    return null;
  }
}

function writeToCookie(record: GrievanceCacheRecord): void {
  if (typeof document === 'undefined') return;
  try {
    const name = getCookieName(record.applicationId);
    const value = encodeURIComponent(JSON.stringify(record));
    document.cookie = `${name}=${value}; max-age=${COOKIE_MAX_AGE_SECS}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie write errors
  }
}

// ---------------------------------------------------------------------------
// Tier 3: IndexedDB
// ---------------------------------------------------------------------------

function openGrievanceDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'applicationId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readFromIndexedDB(applicationId: number | string): Promise<GrievanceCacheRecord | null> {
  const db = await openGrievanceDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(applicationId));
      req.onsuccess = () => {
        resolve(req.result ? (req.result as GrievanceCacheRecord) : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeToIndexedDB(record: GrievanceCacheRecord): Promise<void> {
  const db = await openGrievanceDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        ...record,
        applicationId: String(record.applicationId),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// Request Browser Storage Persistence (anti-eviction)
// ---------------------------------------------------------------------------

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fast synchronous check using LocalStorage and Cookies.
 * Returns true if a grievance record is present in either tier.
 */
export function isGrievanceSubmitted(applicationId: number | string): boolean {
  if (typeof window === 'undefined') return false;
  const lsRecord = readFromLocalStorage(applicationId);
  if (lsRecord) return true;

  const cookieRecord = readFromCookie(applicationId);
  if (cookieRecord) {
    // Self-heal LocalStorage
    writeToLocalStorage(cookieRecord);
    return true;
  }

  return false;
}

/**
 * Full deep asynchronous check across all 3 tiers (LocalStorage, Cookies, IndexedDB).
 * If found in any single tier, self-heals by replicating the record across all other tiers.
 */
export async function checkGrievanceSubmittedAsync(
  applicationId: number | string,
): Promise<GrievanceCacheRecord | null> {
  if (typeof window === 'undefined') return null;

  // 1. Check LocalStorage
  const lsRecord = readFromLocalStorage(applicationId);

  // 2. Check Cookie
  const cookieRecord = readFromCookie(applicationId);

  // 3. Check IndexedDB
  const idbRecord = await readFromIndexedDB(applicationId);

  // Determine authoritative record
  const record = lsRecord || cookieRecord || idbRecord;

  if (record) {
    // Self-heal any missing tiers
    if (!lsRecord) writeToLocalStorage(record);
    if (!cookieRecord) writeToCookie(record);
    if (!idbRecord) {
      await writeToIndexedDB(record);
    }
    return record;
  }

  return null;
}

/**
 * Strongly writes a grievance submission record across all 3 browser storage tiers
 * and requests persistent storage protection from the browser.
 */
export async function recordGrievanceSubmission(
  applicationId: number | string,
  details?: { subject?: string; timestamp?: string },
): Promise<void> {
  const record: GrievanceCacheRecord = {
    applicationId: String(applicationId),
    submittedAt: details?.timestamp || new Date().toISOString(),
    subject: details?.subject,
    version: 1,
  };

  // Write Tier 1: LocalStorage
  writeToLocalStorage(record);

  // Write Tier 2: Cookies
  writeToCookie(record);

  // Write Tier 3: IndexedDB
  await writeToIndexedDB(record);

  // Request browser storage persistence
  await requestPersistentStorage();
}
