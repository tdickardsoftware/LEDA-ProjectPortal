/**
 * API Route: /api/activities/roster/rosterUpserter
 *
 * POST — Copies teamInformation from a source season into a target season,
 *         inserting a new record or overwriting an existing one (upsert).
 *         Body: { sourceSeasonCode, targetSeasonCode }.
 *         Requires an authenticated session.
 */
import { NextApiRequest, NextApiResponse } from "next";

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
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
