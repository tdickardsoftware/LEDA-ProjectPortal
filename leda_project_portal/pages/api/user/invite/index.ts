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
      await client.sendAsync({
        from: `"Account Management" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Create your account",
        text: `Hello,\n\nAn administrator has invited you to create an account. Visit the link below to complete your registration:\n${link}\n\nIf the link doesn't work, copy and paste this URL into your browser:\n${link}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Create your account</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">🎯 Lake Erie Dart Association</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">You&rsquo;ve been invited!</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">
                An administrator has invited you to create an account on the LEDA Project Portal.
                Click the button below to complete your registration and get started.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 32px;">
                <tr>
                  <td style="border-radius:6px;background-color:#18181b;">
                    <a href="${link}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                      Create your account
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;">If the button doesn&rsquo;t work, copy and paste this URL into your browser:</p>
              <p style="margin:0;font-size:12px;word-break:break-all;color:#3f3f46;background-color:#f4f4f5;padding:12px;border-radius:4px;">${link}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                This invitation was sent by an administrator of the Lake Erie Dart Association portal.<br />
                If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: String(error), details: String(error) });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
}}
