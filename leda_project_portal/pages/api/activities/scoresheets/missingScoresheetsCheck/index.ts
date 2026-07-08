/**
 * API Route: /api/activities/scoresheets/missingScoresheetsCheck
 *
 * GET — Returns all matchups for the given seasonCode + weekNum that are either
 *        missing a scoresheet row entirely or have completed = false.
 *        Backed by the public.leda_activities_missing_scoresheets view.
 *        Both `seasonCode` and `weekNum` query params are required.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/scoresheets/missingScoresheetsCheck");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await requireApiSession(req, res);

	if (req.method === "GET") {
		const { seasonCode, weekNum } = req.query;
		log.info({ method: "GET", query: req.query }, "Fetch missing scoresheets");

		if (!seasonCode || !weekNum) {
			return res.status(400).json({ error: "seasonCode and weekNum are required" });
		}

		try {
			const result = await query<{
				seasonCode: string;
				weekNum: number;
				division: string;
				subdivision: string;
				teamAId: string;
				teamBId: string;
				issueType: string;
			}>(
				`SELECT "seasonCode", "weekNum", division, subdivision, "teamAId", "teamBId", "issueType"
				 FROM public.leda_activities_missing_scoresheets
				 WHERE "seasonCode" = $1 AND "weekNum" = $2
				 ORDER BY division, subdivision, "teamAId"`,
				[seasonCode as string, weekNum as string]
			);

			if (result.rows.length === 0) {
				return res.status(204).end();
			}

			return res.status(200).json(result.rows);
		} catch (error) {
			log.error({ error }, "Failed to fetch missing scoresheets");
			return res.status(500).json({ message: "Failed to fetch missing scoresheets", error });
		}
	}

	return res.status(405).json({ error: "Method not allowed" });
}
