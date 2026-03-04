/**
 * API route for retrieving a team's penalty history.
 *
 * GET - Returns all penalty records for the given team from leda_team_penalty_history.
 *       Includes season, week, penalty code, points, notes, and team label.
 *       Requires: ledaId query parameter.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/management/team/penaltyHistory");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", ledaId: req.query.ledaId }, "Fetch team penalty history request");
		if (req.query.ledaId) {
			try {
				// Fetch all penalty records for the given team
				const result = await query(
					`SELECT "seasonCode", "weekNum", "team_id", penaltycode, points, notes, "teamlabel" FROM public.leda_team_penalty_history where "team_id" = $1`,
					[req.query.ledaId as string]
				);
				log.info({ count: result.rows.length }, "Fetched team penalty history");
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
