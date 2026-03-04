/**
 * API route for retrieving a team's player roster.
 *
 * GET - Returns player info from leda_player_team_info for a given team.
 *       Two query modes:
 *         - ?ledaId (no playerId)          → all members of the team
 *         - ?ledaId&playerId              → a specific player on the team
 *       Requires: ledaId query parameter.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/management/team/memberInfo");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", ledaId: req.query.ledaId, playerId: req.query.playerId }, "Fetch team member info request");
		if (req.query.ledaId && !req.query.playerId) {
			try {
				// Fetch the full roster for the given team
				const result = await query(
					`SELECT "teamLedaId", "ledaId", "isCaptain", "fullName", "cannotBeCaptain", "badStanding" FROM public.leda_player_team_info where "teamLedaId" = $1`,
					[req.query.ledaId as string]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else if (req.query.ledaId && req.query.playerId) {
			try {
				// Fetch a specific player's membership record on this team
				const result = await query(
					`SELECT "teamLedaId", "ledaId", "isCaptain", "fullName", "cannotBeCaptain", "badStanding" FROM public.leda_player_team_info where "teamLedaId" = $1 and "ledaId" = $2`,
					[req.query.ledaId as string, req.query.playerId as string]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else {
			res.status(400).json({
				message: "ledaId query parameter is required",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
