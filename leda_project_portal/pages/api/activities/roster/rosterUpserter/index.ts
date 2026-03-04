/**
 * API Route: /api/activities/roster/rosterUpserter
 *
 * POST — Copies teamInformation from a source season into a target season,
 *         inserting a new record or overwriting an existing one (upsert).
 *         Body: { sourceSeasonCode, targetSeasonCode }.
 *         Requires an authenticated session.
 */
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/roster/rosterUpserter");

type RosterUpserter = {
	sourceSeasonCode: string;
	targetSeasonCode: string;
};
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "POST") {
		log.info({ method: "POST" }, "Upsert roster from source season");
		const data = req.body as RosterUpserter;
		try {
			// Copy teamInformation from the source season into the target season,
			// creating the record if it doesn't exist or overwriting if it does
			const query = `
                INSERT INTO public.leda_roster_info ("seasonCode", "teamInformation")
                SELECT $2, "teamInformation"
                FROM public.leda_roster_info
                WHERE "seasonCode" = $1
                ON CONFLICT ("seasonCode")
                DO UPDATE SET "teamInformation" = EXCLUDED."teamInformation";
            `;
			const values = [data.sourceSeasonCode, data.targetSeasonCode];
			const result = await queryPost(query, values);
			res.status(201).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to upsert roster information",
				error,
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
