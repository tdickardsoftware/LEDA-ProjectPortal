import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		if (req.query.ledaId) {
			try {
				const result = await query(
					`SELECT "seasonCode", "weekNum", "ledaId", penaltycode, points, notes, "teamLabel" FROM public.leda_team_penalty_history where "ledaId" = $1`,
					[req.query.ledaId as string]
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
				message: "ledaId query parameter is required",
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
