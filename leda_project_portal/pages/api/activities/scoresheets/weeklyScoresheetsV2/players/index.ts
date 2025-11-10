// Imports
import { NextApiRequest, NextApiResponse } from "next";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { WeeklyScoresheetsPlayerInfo } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await requireApiSession(req, res);
    if (req.method === "POST") {
        // Accept either a single object or an array of objects
        const body = req.body;
        const rows: WeeklyScoresheetsPlayerInfo[] = Array.isArray(body) ? body : [body];

        const queryStr = `INSERT INTO public.leda_weekly_scoresheets_player_info ("seasonCode", "weekNum", "division", "subdivision", "ledaId", "teamId", "gameStats") 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT ("seasonCode", "weekNum", "division", "subdivision", "ledaId", "teamId") 
        DO UPDATE SET "gameStats" = $7`;

        try {
            await Promise.all(
                rows.map(data => {
                    const values = [
                        data.seasonCode,
                        data.weekNum,
                        data.division,
                        data.subdivision,
                        data.ledaId,
                        data.teamId,
                        data.gameStats,
                    ];
                    return queryPost(queryStr, values);
                })
            );
            res.status(200).json({ message: "Player info inserted/updated successfully", count: rows.length });
        } catch (error) {
            res.status(500).json({ message: "Failed to insert/update player info", error });
        }
    } else if (req.method === "GET") {
        if (req.query.seasonCode && req.query.weekNum && req.query.teamId) {
            const queryGet = `SELECT * FROM public.leda_weekly_scoresheets_player_info WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "teamId" = $3`;
            try {
                const result = await query<WeeklyScoresheetsPlayerInfo>(
                    queryGet,
                    [
                        req.query.seasonCode as string,
                        req.query.weekNum as string,
                        req.query.teamId as string
                    ]
                );
                if (result.rows.length === 0) {
                    res.status(204).json({ message: "No Player Info Found, Not Created Yet." });
                } else {
                    res.status(200).json(result.rows);
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch player info", error });
            }
        } else {
            res.status(400).json({ error: "seasonCode, weekNum, and teamId are required" });
        }
    }
}
