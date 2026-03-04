/**
 * API Route: /api/user/invite
 *
 * POST — Sends an account-creation invitation email to the specified address.
 *         The body must include `email` and `token`. The token is embedded in
 *         a sign-up link that the recipient uses to complete registration.
 *         Requires an active admin session.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { requireApiSession } from "@/lib/require-session";
import { client } from "@/lib/email";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/user/invite");

/**
 * Derives the public base URL from the incoming request headers or
 * environment variables, falling back to localhost for local development.
 */
function getBaseUrl(req: NextApiRequest) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
  if (proto && host) return `${proto}://${host}`;
  if (req.headers.origin) return String(req.headers.origin);
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await requireApiSession(req, res);
  // Only POST is supported
  if (req.method !== "POST") {
    log.warn({ method: req.method }, "Method not allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  log.info({ method: "POST" }, "Send user invitation email");
  try {
    const { email, token } = (req.body ?? {}) as { email?: string; token?: string };
    if (!email || !token) {
      return res.status(400).json({ error: "Missing email or token" });
    }
    const base = getBaseUrl(req);
    // Build the sign-up deep link that the invitee will follow
  const link = `${base}/sign-up/?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    try {
      const message = await client.sendAsync({
        text: `Hello,

An administrator has invited you to create an account. Visit the link below to complete your registration:
${link}

If the link doesn't work, copy and paste this URL into your browser:
${link}`,
        from: `"Account Management" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Create your account",
        attachment: [
          {
            data: `
        <p>Hello,</p>
        <p>An administrator has invited you to create an account. Click the link below to complete your registration:</p>
        <p><a href="${link}" target="_blank" rel="noopener noreferrer">Create your account</a></p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><code>${link}</code></p>
      `,
            alternative: true,
          },
        ],
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: String(error), details: String(error) });
    } finally {
      client.smtp.close();
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
}}
