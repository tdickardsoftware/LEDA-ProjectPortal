import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlayerRosterHistory } from "@/lib/definitions";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		try {
			if (req.query.ledaId) {
				const result = await query<PlayerRosterHistory>(
					`SELECT player_id, team_id, team_letter, team_name, division, subdivision, "seasonCode", "totalPoints", place FROM public.leda_players_roster_history WHERE player_id = $1 ORDER BY "seasonCode" DESC`,
					[req.query.ledaId as string]
				);
				res.status(200).json(result.rows);
			}
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
