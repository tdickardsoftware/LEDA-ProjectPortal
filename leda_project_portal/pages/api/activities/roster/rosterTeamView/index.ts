/**
 * API Route: /api/activities/roster/rosterTeamView
 *
 * GET — Returns team data from leda_roster_teams_view for the specified season.
 *        When all four params (seasonCode, division, subdivision, teamLetter) are
 *        provided, returns the matching team's full info. When only seasonCode is
 *        given, returns all teamIds for that season.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { HistoryView, WeeklyScoresheetsScoresheetTeamInfo } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/roster/rosterTeamView");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch roster team view");
		if (req.query.seasonCode && req.query.division && req.query.subdivision && req.query.teamLetter) {
			try {
				// Fetch a specific team's info when all filter params are provided
				const result = await query<WeeklyScoresheetsScoresheetTeamInfo>(
					`SELECT "seasonCode", "teamId", "teamLetter" FROM public.leda_roster_teams_view where "seasonCode" = $1 AND "division" = $2 AND "subdivision_number" = $3 AND "teamLetter" = $4`,
					[req.query.seasonCode as string, req.query.division as string, req.query.subdivision as string, req.query.teamLetter as string]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else if (req.query.seasonCode) {
			try {
				// Fetch all team IDs for the season when only seasonCode is provided
				const result = await query<HistoryView>(
					`SELECT "teamId" FROM public.leda_roster_teams_view where "seasonCode" = $1`,
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
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
