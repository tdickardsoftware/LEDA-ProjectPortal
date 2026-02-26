/**
 * API Route: /api/activities/roster/rosterPlayerView
 *
 * GET — Returns LEDA IDs from the leda_roster_players_view materialized view
 *        for the specified season. The `seasonCode` query param is required.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { HistoryView } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.seasonCode) {
			try {
				// Fetch LEDA IDs visible in the players view for the given season
				const result = await query<HistoryView>(
					`SELECT "ledaId" FROM public.leda_roster_players_view where "seasonCode" = $1`,
					[req.query.seasonCode as string]
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
				message: "seasonCode query parameter is required",
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}

