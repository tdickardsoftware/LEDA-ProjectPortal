import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		if (req.query.seasonCode) {
			try {
				const result = await query(
					`SELECT DISTINCT "teamId", "teamName", "placeId", "divisionName", "subdivisionNumber", "placeName", "phoneNumber", "addressFirstLine", "addressSecondLine", "seasonCode", "teamLetter", "paidStatus", "desc" FROM public.leda_reports_captains_mtg_team_report_team_place_info WHERE "seasonCode" = $1`,
					[req.query.seasonCode as string]
				);

                const resultRaw = await Promise.all(
                    result.rows.map(async (row) => ({
                        ...row,
                        playerArray: (await query(
                            `SELECT "teamId", "playerId", "isCaptain", "fullName", "phoneNumber", "needForm", "datesDuesPaid" FROM public.leda_reports_captains_mtg_team_report_player_info WHERE "teamId" = $1`,
                            [row.teamId]
                        )).rows
                    }))
                );

                res.status(200).json(resultRaw);
            } catch (error) {
                res.status(500).json({
                    message: "Failed to fetch team roster information",
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