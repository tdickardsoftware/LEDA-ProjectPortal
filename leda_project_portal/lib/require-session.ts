import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/auth";
import { defineAbilitesFor, type Actions, type Subjects } from "@/lib/abilities";

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
    // Enforce role/ability checks by API area and HTTP method
    const path = req.url ?? "";
    let subject: Subjects = "all";
    if (path.startsWith("/api/management")) subject = "Management";
    else if (path.startsWith("/api/maintenance")) subject = "Maintenance";
    else if (path.startsWith("/api/activities")) subject = "Activities";
    else if (path.startsWith("/api/reports")) subject = "Reports";

    const method = req.method || "GET";
    // CSRF check for unsafe methods
    if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
      // Double-submit cookie pattern: header must match cookie
      const headerToken = (req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"]) as string | undefined;
      const cookieHeader = req.headers["cookie"] as string | undefined;
      let cookieToken: string | undefined;
      if (cookieHeader) {
        const parts = cookieHeader.split(/;\s*/);
        for (const p of parts) {
          const [k, v] = p.split("=");
          if (k === "csrfToken") {
            cookieToken = decodeURIComponent(v ?? "");
            break;
          }
        }
      }
      if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        res.status(403).json({ error: "Invalid CSRF token" });
        return null;
      }
    }

    const action: Actions =
      method === "POST"
        ? "write"
        : method === "PUT"
        ? "update"
        : method === "DELETE"
        ? "delete"
        : "read";

    // Extract role from session (support both shapes)
    const role =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((session as any)?.data?.user?.role as string | undefined) ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((session as any)?.user?.role as string | undefined) ??
      "User";
    // Optional role emulation via cookie for privileged users
    const cookieHeader = req.headers["cookie"] as string | undefined;
    let emulatedRole: string | undefined;
    if (cookieHeader) {
      const parts = cookieHeader.split(/;\s*/);
      for (const p of parts) {
        const [k, v] = p.split("=");
        if (k === "emulatedRole") {
          emulatedRole = decodeURIComponent(v ?? "");
          break;
        }
      }
    }
    const allowedToEmulate = role === "Developer" || role === "Office Admin";
    let effectiveRole = role;
    if (allowedToEmulate && emulatedRole) {
      if (
        (role === "Developer" && (emulatedRole === "Office Admin" || emulatedRole === "User")) ||
        (role === "Office Admin" && emulatedRole === "User")
      ) {
        effectiveRole = emulatedRole;
      }
    }
    const ability = defineAbilitesFor(effectiveRole);
    if (!ability.can(action, subject)) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }
    return session;
  } catch {
    // Any failure while checking the session should be treated as unauthorized
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}
