import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/apis/mail';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feedback: string = body.feedback || '';
    const page: string = body.page || 'general';

    // Get server-side session for sender details (name, email)
    const session = await auth();
    const senderName = session?.user?.name?.toString().trim() || 'Anonymous';
    const senderEmailRaw = session?.user?.email?.toString().trim() || '';

    // Small helper to escape HTML in the injected values
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Resolve recipients: prefer FEEDBACK_RECIPIENTS, fallback to TECHMAIL_ID if present
    const recipientsRaw = (process.env.FEEDBACK_RECIPIENTS || '').trim();
    let recipients: string[] = [];
    if (recipientsRaw) {
      recipients = recipientsRaw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (recipients.length === 0) {
      const fallback = process.env.TECHMAIL_ID;
      if (fallback) {
        recipients = [fallback];
      } else {
        return NextResponse.json({ success: false, error: 'No feedback recipients configured (set FEEDBACK_RECIPIENTS or TECHMAIL_ID)' }, { status: 500 });
      }
    }

    const subject = `Platform Feedback - ${page}`;

    const html = `
      <p><strong>Feedback scope:</strong> ${escapeHtml(page)}</p>
      <p><strong>From:</strong> ${escapeHtml(senderName)} &lt;${escapeHtml(senderEmailRaw || 'Not provided')}&gt;</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(feedback).replace(/\n/g, '<br/>')}</p>
      <hr/>
      <p>Sent from platform feedback form</p>
    `;

    const text = `Feedback scope: ${page}\nFrom: ${senderName} <${senderEmailRaw || 'Not provided'}>\n\n${feedback}`;

    const mailParams: any = {
      to: recipients,
      subject,
      text,
      html,
      // Use alias so the From header shows a friendly name for feedback
      alias: 'Platform Feedback',
    };

    // If we have an authenticated user's email, set it as replyTo
    if (senderEmailRaw && senderEmailRaw.includes('@')) {
      mailParams.replyTo = senderEmailRaw;
    }

    await sendMail(mailParams);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending feedback email', error);
    return NextResponse.json({ success: false, error: (error as Error).message || 'Unknown error' }, { status: 500 });
  }
}
