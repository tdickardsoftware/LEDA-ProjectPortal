/**
 * Shared Resend client for sending transactional emails.
 *
 * Requires RESEND_API_KEY environment variable.
 * The sender address is controlled by SMTP_USER.
 */
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);