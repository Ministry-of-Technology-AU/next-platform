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

    // Get all files (multiple files support)
    const files = form.getAll("files") as File[];

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
      <!-- New RTI Submission (Email HTML) -->
      <div style="font-family: Arial, sans-serif; color:#111; background:#f8f9fb; padding:24px;">
        <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e6e6e6; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <div style="padding:20px 24px; background:linear-gradient(0deg,#f7fff9,#ffffff); border-bottom:1px solid #e6e6e6;">
            <h2 style="margin:0; font-size:22px; color:#87281b; letter-spacing:0.2px;">New RTI Submission</h2>
            <p style="margin:8px 0 0; font-size:13px; color:#444;">
              <strong>Submitted At:</strong> ${new Date().toLocaleString()}
            </p>
          </div>

          <!-- Body / Table -->
          <div style="padding:6px 8px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate; border-spacing:0; width:100%;">
              <!-- Row helper function emulation via repeated markup -->

              <!-- Requester -->
              <tr>
                <td style="width:240px; padding:14px 16px; background:#fafafa; border-bottom:1px solid #eee; vertical-align:top; font-weight:bold; font-size:14px;">
                  Requester
                </td>
                <td style="padding:14px 16px; border-bottom:1px solid #eee; font-size:14px; color:#222;">
                  ${anonymous 
                    ? '<em>Submitted anonymously</em>' 
                    : `Name: ${escapeHtml(name)}<br/>Email: ${escapeHtml(email)}`
                  }
                </td>
              </tr>

              <!-- Information Requested -->
              <tr>
                <td style="width:240px; padding:14px 16px; background:#fafafa; border-bottom:1px solid #eee; vertical-align:top; font-weight:bold; font-size:14px;">
                  Information Requested
                </td>
                <td style="padding:14px 16px; border-bottom:1px solid #eee; font-size:14px; color:#222;">
                  ${escapeHtml(information).replace(/\n/g, '<br/>')}
                </td>
              </tr>

              <!-- Additional Details / Context -->
              <tr>
                <td style="width:240px; padding:14px 16px; background:#fafafa; border-bottom:1px solid #eee; vertical-align:top; font-weight:bold; font-size:14px;">
                  Additional Details / Context
                </td>
                <td style="padding:14px 16px; border-bottom:1px solid #eee; font-size:14px; color:#222;">
                  ${escapeHtml(details).replace(/\n/g, '<br/>') || '<em>None</em>'}
                </td>
              </tr>

              <!-- Urgency / Preferred Timeline -->
              <tr>
                <td style="width:240px; padding:14px 16px; background:#fafafa; border-bottom:1px solid #eee; vertical-align:top; font-weight:bold; font-size:14px;">
                  Urgency / Preferred Timeline
                </td>
                <td style="padding:14px 16px; border-bottom:1px solid #eee; font-size:14px; color:#222;">
                  ${escapeHtml(timeline)}${timeline === 'urgent' ? ` — Reason: ${escapeHtml(urgentReason)}` : ''}
                </td>
              </tr>

              ${files.length > 0 ? `
              <!-- Attachments -->
              <tr>
                <td style="width:240px; padding:14px 16px; background:#fafafa; border-bottom:1px solid #eee; vertical-align:top; font-weight:bold; font-size:14px;">
                  Attachments
                </td>
                <td style="padding:14px 16px; border-bottom:1px solid #eee; font-size:14px; color:#222;">
                  ${files.map(f => escapeHtml(f.name)).join('<br/>')}
                </td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Footer -->
          <div style="padding:14px 18px; background:#f6fff7; border-top:1px solid #e6f1e6; text-align:center;">
            <p style="margin:0; font-size:12px; color:#87281b;">
              Feature brought to you by <strong>Ministry of Technology</strong>.
            </p>
          </div>

        </div>
      </div>
    `;

    // Prepare attachments for all files
    const attachments = [];
    for (const file of files) {
      if (file && file.size > 0) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          attachments.push({
            filename: file.name || 'attachment',
            content: buffer,
            contentType: file.type || 'application/octet-stream',
          });
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
        }
      }
    }

    const requestId = generateRandomNumber(6);

    // Send mail using the existing sendMail function
    await sendMail({
      alias: `Platform RTI - ${requestId}`,
      to: RTI_POC,
      cc: anonymous ? undefined : email || undefined,
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

function generateRandomNumber(length: number): number {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
