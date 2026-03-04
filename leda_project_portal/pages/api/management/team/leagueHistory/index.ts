/**
 * API route for retrieving a team's league play history.
 *
 * GET - Returns all season entries from leda_team_league_history for a given team.
 *       Includes seasonCode, ledaId, teamLabel, and totalPoints per season.
 *       Requires: ledaId query parameter.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/management/team/leagueHistory");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", ledaId: req.query.ledaId }, "Fetch team league history request");
		if (req.query.ledaId) {
			try {
				// Fetch all league seasons and point totals for the given team
				const result = await query(
					`SELECT "seasonCode", "ledaId", "teamLabel", "totalPoints" FROM public.leda_team_league_history where "ledaId" = $1`,
					[req.query.ledaId as string]
				);
				log.info({ count: result.rows.length }, "Fetched team league history");
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
