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
    } else if (req.method === "GET") {
        if (req.query.seasonCode && req.query.weekNum && req.query.division && req.query.subdivision && req.query.teamLetter) {
            try {
                const result = await query<WeeklyScoresheetsTeamInfo>(
                    `SELECT * FROM public.leda_weekly_scoresheets_team_info WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "division" = $3 AND "subdivision" = $4 AND "teamLetter" = $5`,
                    [
                        req.query.seasonCode as string,
                        req.query.weekNum as string,
                        req.query.division as string,
                        req.query.subdivision as string,
                        req.query.teamLetter as string
                    ]
                );
                const homeResult = result.rows[0]
                if (homeResult) {

                    const opposingResult = await query<WeeklyScoresheetsTeamInfo>(
                        `SELECT * FROM public.leda_weekly_scoresheets_team_info WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "teamId" = $3`,
                        [
                            req.query.seasonCode as string,
                            req.query.weekNum as string,
                            homeResult.opposingTeamId
                        ]
                    );
                    const awayResult = opposingResult.rows[0];
                    res.status(200).json([homeResult, awayResult]);
                } else {
                    res.status(204).json({ message: "No Team Matchup Info Found, Not Created Yet."})
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch team info", error });
            }
        }

    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
