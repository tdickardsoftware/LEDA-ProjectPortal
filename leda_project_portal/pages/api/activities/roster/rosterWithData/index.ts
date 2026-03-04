/**
 * API Route: /api/activities/roster/rosterWithData
 *
 * GET — Returns season codes for all rosters where teamInformation is
 *        populated (i.e., the roster has been built out).
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	if (req.method === "GET") {
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
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
