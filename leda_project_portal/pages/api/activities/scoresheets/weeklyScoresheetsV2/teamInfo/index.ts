// Imports
import { NextApiRequest, NextApiResponse } from "next";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { WeeklyScoresheetsTeamInfo } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await requireApiSession(req, res);
    if (req.method === "POST") {
        // Accept either a single object or an array of objects
        const body = req.body;
        const rows: WeeklyScoresheetsTeamInfo[] = Array.isArray(body) ? body : [body];

        const queryStr = `INSERT INTO public.leda_weekly_scoresheets_team_info ("seasonCode", "weekNum", "division", "subdivision", "home", "teamId", "teamName", "teamLetter", "opposingTeamId", "penalties") 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                        ON CONFLICT ("seasonCode", "weekNum", "division", "subdivision", "teamId")
                        DO UPDATE SET "penalties" = $10`;

        try {
            await Promise.all(
                rows.map(data => {
                    const values = [
                        data.seasonCode,
                        data.weekNum,
                        data.division,
                        data.subdivision,
                        data.home,
                        data.teamId,
                        data.teamName,
                        data.teamLetter,
                        data.opposingTeamId,
                        data.penalties
                    ];
                    return queryPost(queryStr, values);
                })
            );
            res.status(200).json({ message: "Team info inserted/updated successfully", count: rows.length });
        } catch (error) {
            res.status(500).json({ message: "Failed to insert/update team info", error });
        }
    }
}
