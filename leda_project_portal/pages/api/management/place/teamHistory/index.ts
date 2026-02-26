/**
 * API route for retrieving a place's team history.
 *
 * GET - Returns all teams that have been associated with a given place (bar/venue)
 *       across seasons, queried from leda_place_team_history.
 *       Requires: ledaId query parameter.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlaceTeamHistoryView } from "@/lib/definitions";
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
				// Fetch all seasons and team names for teams that played at this place
				const result = await query<PlaceTeamHistoryView>(
					`SELECT "seasonCode", "teamId", "teamName" FROM public.leda_place_team_history where "placeId" = $1`,
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
