export async function apiGet<T = any>(path: string, init: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const res = await fetch(`${base}${path}`, {
    credentials: "include", // keep this, so re-enabling auth later works
    headers: { Accept: "application/json" },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`GET ${path} failed: ${res.status} ${msg}`);
  }
  return res.json() as Promise<T>;
}