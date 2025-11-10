import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { HistoryView, WeeklyScoresheetsScoresheetTeamInfo } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	if (req.method === "GET") {
		if (req.query.seasonCode && req.query.division && req.query.subdivision && req.query.teamLetter) {
			try {
				const result = await query<WeeklyScoresheetsScoresheetTeamInfo>(
					`SELECT "seasonCode", "ledaid", "teamLetter" FROM public.leda_roster_teams_view where "seasonCode" = $1 AND "division" = $2 AND "subdivision" = $3 AND "teamLetter" = $4`,
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
				const result = await query<HistoryView>(
					`SELECT "ledaid" FROM public.leda_roster_teams_view where "seasonCode" = $1`,
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
