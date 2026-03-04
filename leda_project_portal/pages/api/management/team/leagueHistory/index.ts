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

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.ledaId) {
			try {
				// Fetch all league seasons and point totals for the given team
				const result = await query(
					`SELECT "seasonCode", "ledaId", "teamLabel", "totalPoints" FROM public.leda_team_league_history where "ledaId" = $1`,
					[req.query.ledaId as string]
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
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
