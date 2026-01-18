import { SMTPClient } from 'emailjs';

export const client = new SMTPClient({
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    host: process.env.SMTP_HOST,
    ssl: false,
    tls: true,
    port: Number(process.env.SMTP_PORT),
});