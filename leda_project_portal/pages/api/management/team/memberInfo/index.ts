import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";


export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
        if (req.query.ledaId && !req.query.playerId) {
            try {
                const result = await query(
                    `SELECT "teamLedaId", "ledaId", "isCaptain", "fullName", "cannotBeCaptain", "badStanding" FROM public.leda_player_team_info where "teamLedaId" = $1`,
                    [req.query.ledaId as string]
                );
                res.status(200).json(result.rows);
            } catch (error) {
                res.status(500).json({
                    message: "Failed to fetch roster information",
                    error,
                });
            }
        } else if (req.query.ledaId && req.query.playerId) {
            try {
                const result = await query(
                    `SELECT "teamLedaId", "ledaId", "isCaptain", "fullName", "cannotBeCaptain", "badStanding" FROM public.leda_player_team_info where "teamLedaId" = $1 and "playerLedaId" = $2`,
                    [req.query.ledaId as string, req.query.playerId as string]
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