/**
 * API Route: /api/activities/roster/rostersWithData
 *
 * GET — Returns season codes for all populated rosters.
 *        When `getSeasonCodeInfo=true`, also joins season metadata
 *        (description, isCurrentSeason) from the maintenance seasons table.
 */
import { query } from "@/lib/dbTypeGet";
import { SeasonCode, Roster } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/roster/rostersWithData");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch rosters with data");
		if (req.query.getSeasonCodeInfo === "true") {
			try {
				const querySelect = `SELECT r."seasonCode", s."desc", s."isCurrentSeason" FROM public.leda_roster_info r JOIN maint.leda_maint_seasons s ON r."seasonCode" = s."seasonCode" WHERE r."teamInformation" IS NOT NULL`;
				const result = await query<SeasonCode>(querySelect);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch season code information",
					error,
				});
			}
		} else {
			try {
				const result = await query<Roster>(
					`SELECT "seasonCode" FROM public.leda_roster_info where "teamInformation" is not null`
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
