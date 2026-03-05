/**
 * API Route: /api/run-migration
 *
 * GET  — Returns pending migrations (tables to create, fields to add) and the
 *         compiled SQL — does NOT modify the database.
 * POST — Runs the pending better-auth migrations against the database.
 *
 * Both methods are protected by the x-migrate-secret header.
 * DELETE THIS FILE after running once.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { getMigrations } from "better-auth/db";
import { auth } from "@/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["GET", "POST"].includes(req.method ?? "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers["x-migrate-secret"] !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { toBeCreated, toBeAdded, runMigrations, compileMigrations } =
      await getMigrations(auth.options);

    if (req.method === "GET") {
      // Dry-run: return what would be migrated + the SQL, no DB changes
      const sql = await compileMigrations();
      return res.status(200).json({
        ok: true,
        toBeCreated,
        toBeAdded,
        sql,
      });
    }

    // POST: execute the migrations
    await runMigrations();
    return res.status(200).json({
      ok: true,
      message: "Migration completed successfully.",
      toBeCreated,
      toBeAdded,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
