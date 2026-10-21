import 'server-only';

/**
 * Modular mailer. One core function takes credentials explicitly; named exports
 * are thin wrappers that resolve the platform's standard accounts from env.
 *
 * To send from any other account: `sendMailWith({ id, password }, params)`.
 * Credentials are read server-side only — this module is marked server-only.
 */

import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MailCredentials {
  id: string;
  password: string;
  /** nodemailer service name. Defaults to 'gmail'. */
  service?: string;
}

export interface MailParams {
  from?: string;
  alias?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

/**
 * Sends an email using the supplied credentials.
 *
 * This is the single source of transport logic. All named senders below call
 * this. You can also call it directly for any one-off or future sender without
 * adding another function:
 *
 *   await sendMailWith({ id: 'foo@ashoka.edu.in', password: 'app-pwd' }, params);
 */
export async function sendMailWith(credentials: MailCredentials, params: MailParams): Promise<void> {
  const { id, password, service = 'gmail' } = credentials;
  const transporter = nodemailer.createTransport({
    service,
    secure: true,
    auth: { user: id, pass: password.replace(/\s+/g, '') },
  });
  const senderEmail = params.from ?? id;
  const fromHeader = params.alias ? `${params.alias} <${senderEmail}>` : senderEmail;
  try {
    await transporter.sendMail({
      from: fromHeader,
      to: params.to,
      replyTo: params.replyTo,
      subject: params.subject,
      text: params.text,
      html: params.html,
      cc: params.cc,
      bcc: params.bcc,
      attachments: params.attachments,
    });
  } catch (error) {
    throw new Error(
      `[mail] Failed to send via ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Env resolver (private)
// ---------------------------------------------------------------------------

/**
 * Reads a credential pair from env. Throws clearly when a key is missing so
 * the error surfaces immediately rather than silently dropping mail.
 */
function fromEnv(idKey: string, pwdKey: string): MailCredentials {
  const id = process.env[idKey];
  const password = process.env[pwdKey];
  if (!id || !password) {
    throw new Error(`[mail] Missing env variable: ${!id ? idKey : pwdKey}`);
  }
  return { id, password };
}

// ---------------------------------------------------------------------------
// Named senders — platform standard accounts
// ---------------------------------------------------------------------------

/** Techmin account (TECHMAIL_ID / TECHMAIL_PWD). */
export function sendMail(params: MailParams): Promise<void> {
  return sendMailWith(fromEnv('TECHMAIL_ID', 'TECHMAIL_PWD'), params);
}

/** Student Government account (SGMAIL_ID / SGMAIL_PWD). */
export function sendMailSG(params: MailParams): Promise<void> {
  return sendMailWith(fromEnv('SGMAIL_ID', 'SGMAIL_PWD'), params);
}

/**
 * Jazbaa account (JAZBAA_MAIL_ID / JAZBAA_MAIL_PWD).
 * Falls back to the Techmin account when those env keys are absent.
 */
export function sendMailJazbaa(params: MailParams): Promise<void> {
  const id = process.env.JAZBAA_MAIL_ID;
  const pwd = process.env.JAZBAA_MAIL_PWD;
  if (!id || !pwd) return sendMail(params);
  return sendMailWith({ id, password: pwd }, params);
}