/**
 * API Route: /api/ping
 *
 * GET — Returns server response time and non-sensitive database connectivity
 *       information. Useful for diagnosing connection issues in production.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "@/lib/getPool";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now();

  let db: {
    connected: boolean;
    database?: string;
    user?: string;
    serverVersion?: string;
    latencyMs?: number;
    error?: string;
  } = { connected: false };

  try {
    const dbStart = Date.now();
    const result = await pool.query<{
      current_database: string;
      current_user: string;
      version: string;
    }>(
      "SELECT current_database(), current_user, version()"
    );
    const row = result.rows[0];
    db = {
      connected: true,
      database: row.current_database,
      user: row.current_user,
      // e.g. "PostgreSQL 15.4 on x86_64-pc-linux-gnu ..."  — trim to just the version number
      serverVersion: row.version.split(" ")[1],
      latencyMs: Date.now() - dbStart,
    };
  } catch (err) {
    db = {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return res.status(200).json({
    ok: true,
    responseTimeMs: Date.now() - start,
    timestamp: new Date().toISOString(),
    db,
  });
}
