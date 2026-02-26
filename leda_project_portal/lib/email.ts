/**
 * Shared SMTP client for sending transactional emails.
 *
 * Connection details are pulled from environment variables:
 * SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT.
 * TLS is enabled; SSL is disabled (STARTTLS via port 587 by default).
 */
import { SMTPClient } from 'emailjs';

export const client = new SMTPClient({
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    host: process.env.SMTP_HOST,
    ssl: false,
    tls: true,
    port: Number(process.env.SMTP_PORT),
});