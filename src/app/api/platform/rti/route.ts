"use server";

import { sendMail } from "@/lib/apis/mail";

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const anonymous = form.get("anonymous") === "1";
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const information = String(form.get("information") || "");
    const details = String(form.get("details") || "");
    const timeline = String(form.get("timeline") || "standard");
    const urgentReason = String(form.get("urgentReason") || "");

    // File (if provided)
    const file = form.get("file") as File | null;

    // Validate required fields
    if (!information.trim()) {
      return new Response(JSON.stringify({ error: "Information requested is required" }), { status: 400 });
    }

    const RTI_POC = process.env.RTI_POC_EMAIL;
    if (!RTI_POC) {
      console.error("RTI_POC_EMAIL not configured");
      return new Response(JSON.stringify({ error: "Server not configured to send RTI emails" }), { status: 500 });
    }

    // Build pretty HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2 style="color:#0b5;">New RTI Submission</h2>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
        <h3>Requester</h3>
        <p>${anonymous ? '<em>Submitted anonymously</em>' : `Name: ${escapeHtml(name)}<br/>Email: ${escapeHtml(email)}`}</p>
        <h3>Information Requested</h3>
        <p>${escapeHtml(information).replace(/\n/g, '<br/>')}</p>
        <h3>Additional Details / Context</h3>
        <p>${escapeHtml(details).replace(/\n/g, '<br/>') || '<em>None</em>'}</p>
        <h3>Urgency / Preferred Timeline</h3>
        <p>${escapeHtml(timeline)}${timeline === 'urgent' ? ` — Reason: ${escapeHtml(urgentReason)}` : ''}</p>
      </div>
    `;

    // Prepare attachments if file is provided
    const attachments = [];
    if (file && typeof (file as any).arrayBuffer === 'function') {
      const arrayBuffer = await (file as any).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: (file as any).name || 'attachment',
        content: buffer,
      });
    }

    // Send mail using the existing sendMail function
    await sendMail({
      alias: "Platform RTI",
      to: RTI_POC,
      replyTo: anonymous ? undefined : email || undefined,
      subject: `RTI Submission${anonymous ? ' (Anonymous)' : ''}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error sending RTI email:", err);
    return new Response(JSON.stringify({ error: 'Failed to send RTI' }), { status: 500 });
  }
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
