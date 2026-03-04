/**
 * API Route: /api/activities/roster/rosterWithData
 *
 * GET — Returns season codes for all rosters where teamInformation is
 *        populated (i.e., the roster has been built out).
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/roster/rosterWithData");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch roster season codes");
		try {
			const result = await query(
				`SELECT "seasonCode" FROM public.leda_roster_info WHERE "teamInformation" IS NOT NULL`
			);
			res.status(200).json(result.rows);
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
