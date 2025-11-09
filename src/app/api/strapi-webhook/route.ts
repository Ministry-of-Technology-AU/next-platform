import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { broadcast } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Extract and normalize header
  const authHeader = (req.headers.get("authorization") || "").trim();

  const validTokens = [
    `Bearer ${(process.env.STRAPI_WEBHOOK_SECRET || "").trim()}`,
    `Bearer ${(process.env.NEXT_PUBLIC_STRAPI_WEBHOOK_SECRET || "").trim()}`,
  ];

  console.log("🔍 Received Authorization header:", authHeader);
  console.log("🔍 Expected any of:", validTokens);

  // ✅ Verify against both secrets
  if (!authHeader || !validTokens.includes(authHeader)) {
    console.warn("🚨 Unauthorized webhook call");
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.text();  // Get raw body first
    console.log("� Received webhook body:", body);
    
    const payload = JSON.parse(body);
    console.log("🔔 Parsed webhook payload:", payload);

    // For match score updates, broadcast immediately
    if (payload.model === 'match-score') {
      const entry = payload.entry;
      // Send minimal data for instant updates
      const updateData = {
        type: payload.event,
        model: 'match-score',
        entry: {
          id: entry.id,
          team_a_score: entry.team_a_score,
          team_b_score: entry.team_b_score,
          status: entry.status
        }
      };
      
      console.log("📤 Broadcasting update:", updateData);
      broadcast(JSON.stringify(updateData));
      
      // Send full data update after scores
      const fullData = {
        type: payload.event,
        model: payload.model,
        entry: {
          id: entry.id,
          match_name: entry.match_name,
          league_name: entry.league_name,
          team_a_name: entry.team_a_name,
          team_b_name: entry.team_b_name,
          team_a_score: entry.team_a_score,
          team_b_score: entry.team_b_score,
          status: entry.status,
          date: entry.date
        }
      };
      setTimeout(() => broadcast(JSON.stringify(fullData)), 100);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
