import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { normaliseReport } from "./schema";
import type { ParsedCGPAData } from "./types";

/**
 * Strapi access for the CGPA report saved on a user (`cgpa_data`).
 * Called by the route handlers and directly by the page, so the page never fetches its own API.
 * Per-user data: never cached on the server (caching.md, rule 2).
 */

type StrapiUserWithReport = { cgpa_data?: unknown; updatedAt?: string } | null;

export type SavedReport = { report: ParsedCGPAData | null; updatedAt: string | null };

export async function getCGPAReport(uid: number): Promise<SavedReport> {
  const user = (await strapiGet(`/users/${uid}`, { populate: { cgpa_data: true } })) as StrapiUserWithReport;
  // Reports saved before v2 lack kind/status/codes; normalising fills them in.
  const report = user?.cgpa_data ? normaliseReport(user.cgpa_data) : null;
  return { report, updatedAt: user?.updatedAt ?? null };
}

export async function saveCGPAReport(uid: number, report: ParsedCGPAData): Promise<void> {
  await strapiPut(`/users/${uid}`, { cgpa_data: report });
}

export async function clearCGPAReport(uid: number): Promise<void> {
  await strapiPut(`/users/${uid}`, { cgpa_data: null });
}
