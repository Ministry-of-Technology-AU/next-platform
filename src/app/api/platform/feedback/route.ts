import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/apis/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feedback: string = body.feedback || '';
    const page: string = body.page || 'general';

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
      <p><strong>Feedback scope:</strong> ${page}</p>
      <p><strong>Message:</strong></p>
      <p>${feedback.replace(/\n/g, '<br/>')}</p>
      <hr/>
      <p>Sent from platform feedback form</p>
    `;

    await sendMail({
      to: recipients,
      subject,
      text: feedback,
      html,
      // Use alias so the From header shows a friendly name for feedback
      alias: 'Platform Feedback',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending feedback email', error);
    return NextResponse.json({ success: false, error: (error as Error).message || 'Unknown error' }, { status: 500 });
  }
}
