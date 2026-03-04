/**
 * API Route: /api/activities/roster/rosterHistory
 *
 * GET — Returns a player's full roster history across seasons, ordered by
 *        season descending. Requires `ledaId` as a query param.
 */
import { query } from "@/lib/dbTypeGet";
import { PlayerRosterHistory } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/roster/rosterHistory");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch roster change history");
		try {
			if (req.query.ledaId) {
				// Fetch all season roster entries for the given player, most recent first
				const result = await query<PlayerRosterHistory>(
					`SELECT player_id, team_id, team_letter, team_name, division, subdivision, "seasonCode", "totalPoints", place FROM public.leda_players_roster_history WHERE player_id = $1 ORDER BY "seasonCode" DESC`,
					[req.query.ledaId as string]
				);
				res.status(200).json(result.rows);
			}
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch roster information",
				error,
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
