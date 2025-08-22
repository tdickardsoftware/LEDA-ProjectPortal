import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/auth";

/**
 * Ensures the request has a valid Better Auth session.
 * Returns the session on success; sends 401 and returns null otherwise.
 */
export async function requireApiSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Convert Node-style headers into Web Headers expected by better-auth
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(","));
      else if (typeof value === "string") headers.set(key, value);
    }
    // Validate session using server-side auth API and request headers
    const session = await auth.api.getSession({ headers });
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }
    return session;
  } catch {
    // Any failure while checking the session should be treated as unauthorized
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}
