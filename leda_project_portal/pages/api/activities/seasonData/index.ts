/**
 * API Route: /api/activities/seasonData
 *
 * DELETE — Wipes all in-season data for a season code in a single transaction:
 *          schedule, scoresheets, team/player points, mentions, penalties
 *          (stored with the scoresheet team info) and payouts.
 *          The season record, roster and fee payment history are kept.
 * Requires an authenticated session.
 */
import { pool } from "@/lib/getPool";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/seasonData");

const SEASON_TABLES = [
	"leda_weekly_scoresheets_player_info",
	"leda_weekly_scoresheets_team_info",
	"leda_weekly_scoresheets_team_game_info",
	"leda_weekly_scoresheets",
	"leda_weekly_player_points",
	"leda_weekly_team_scores",
	"leda_player_mention_history",
	"leda_team_payout_info",
	"leda_payouts",
	"leda_schedule",
];

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method !== "DELETE") {
		res.status(405).json({ message: "Method not allowed" });
		return;
	}

	const seasonCode = req.query.seasonCode;
	if (typeof seasonCode !== "string" || !seasonCode) {
		res.status(400).json({ message: "seasonCode is required" });
		return;
	}

	log.info({ seasonCode }, "Wipe season data");
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		for (const table of SEASON_TABLES) {
			await client.query(
				`DELETE FROM public.${table} WHERE "seasonCode" = $1`,
				[seasonCode]
			);
		}
		await client.query("COMMIT");
		res.status(200).json({ message: "Season data wiped" });
	} catch (error) {
		await client.query("ROLLBACK");
		log.error({ err: error, seasonCode }, "Failed to wipe season data");
		res.status(500).json({ message: "Failed to wipe season data" });
	} finally {
		client.release();
	}
}
