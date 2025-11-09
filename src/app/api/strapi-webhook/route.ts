import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { broadcast } from "../../../lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.STRAPI_WEBHOOK_SECRET}`;

  if (authHeader !== expected) {
    console.warn("Unauthorized webhook call");
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  console.log("Secure webhook triggered:", payload);

  broadcast("match-updated");
  revalidatePath("/platform/match-scores");

  return NextResponse.json({ ok: true });
}
