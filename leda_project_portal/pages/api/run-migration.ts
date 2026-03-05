/**
 * API Route: /api/run-migration
 *
 * POST — Runs the better-auth database migration (creates/updates auth tables).
 *        Protected by a secret header. DELETE THIS FILE after running once.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers["x-migrate-secret"] !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // @ts-expect-error — migrate() exists at runtime but may not be typed
    await auth.api.migrate();
    return res.status(200).json({ ok: true, message: "Migration completed successfully." });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
