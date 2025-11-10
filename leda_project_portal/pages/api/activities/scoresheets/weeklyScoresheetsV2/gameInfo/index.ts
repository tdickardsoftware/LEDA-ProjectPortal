// Imports
import { NextApiRequest, NextApiResponse } from "next";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { WeeklyScoresheetsGameInfo} from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await requireApiSession(req, res);
    // Handle Post Requests
    if (req.method === "POST") {
        // Cast data to expected type
        const data = req.body as WeeklyScoresheetsGameInfo;
        // Define the upsert query
        const query = `INSERT INTO public.leda_weekly_scoresheets_team_game_info ("seasonCode", "weekNum", "division", "subdivision", "homeTeamId", "awayTeamId", "homePoints", "awayPoints", "completed", "gameInfo") 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                        ON CONFLICT ("seasonCode", "weekNum", "division", "subdivision", "homeTeamId", "awayTeamId") 
                        DO UPDATE SET "homePoints" = $7, "awayPoints" = $8, "completed" = $9, "gameInfo" = $10`
        // Define the values array
        const values = [data.seasonCode, data.weekNum, data.division, data.subdivision, data.homeTeamId, data.awayTeamId, data.homePoints, data.awayPoints, data.completed, data.gameInfo];
        // Execute the query
        try {
            await queryPost(query, values);
            res.status(200).json({ message: "Game info inserted/updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to insert/update game info", error });
        }
        
    } else if (req.method === "GET") {
        // Handle lightweight status check first to avoid matching the broader branch below
        if (req.query.seasonCode && req.query.weekNum && req.query.division && req.query.subdivision && req.query.homeTeamId && req.query.awayTeamId && req.query.getStatus) {
            const queryGetStatus = `SELECT "completed" FROM public.leda_weekly_scoresheets_team_game_info WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "division" = $3 AND "subdivision" = $4 AND "homeTeamId" = $5 AND "awayTeamId" = $6`;
            try {
                const result = await query<{ completed: boolean }>(
                    queryGetStatus,
                    [
                        req.query.seasonCode as string,
                        req.query.weekNum as string,
                        req.query.division as string,
                        req.query.subdivision as string,
                        req.query.homeTeamId as string,
                        req.query.awayTeamId as string
                    ]
                );
                if (result.rows.length === 0) {
                    res.status(204).json({ message: "No Game Info Found, Not Created Yet." });
                } else {
                    res.status(200).json(result.rows[0].completed);
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch game status", error });
            }
        } else if (req.query.seasonCode && req.query.weekNum && req.query.division && req.query.subdivision && req.query.homeTeamId && req.query.awayTeamId) {
            const queryGet = `SELECT * FROM public.leda_weekly_scoresheets_team_game_info WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "division" = $3 AND "subdivision" = $4 AND "homeTeamId" = $5 AND "awayTeamId" = $6`;
            try {
                const result = await query<WeeklyScoresheetsGameInfo>(
                    queryGet,
                    [
                        req.query.seasonCode as string,
                        req.query.weekNum as string,
                        req.query.division as string,
                        req.query.subdivision as string,
                        req.query.homeTeamId as string,
                        req.query.awayTeamId as string
                    ]
                );
                if (result.rows.length === 0) {
                    res.status(204).json({ message: "No Game Info Found, Not Created Yet." });
                } else {
                    res.status(200).json(result.rows);
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch game info", error });
            }
        } else {
            res.status(400).json({ error: "seasonCode, weekNum, division, subdivision, homeTeamId, and awayTeamId are required" });
        }
    } else if (req.method === "DELETE") {
        if (req.query.seasonCode && req.query.weekNum && req.query.division && req.query.subdivision && req.query.homeTeamId && req.query.awayTeamId) {
            const delQuery = `DELETE FROM public.leda_weekly_scoresheets_team_game_info WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "division" = $3 AND "subdivision" = $4 AND "homeTeamId" = $5 AND "awayTeamId" = $6`;
            try {
                await queryPost(delQuery, [
                    req.query.seasonCode as string,
                    req.query.weekNum as string,
                    req.query.division as string,
                    req.query.subdivision as string,
                    req.query.homeTeamId as string,
                    req.query.awayTeamId as string,
                ]);
                res.status(200).json({ message: "Game info deleted" });
            } catch (error) {
                res.status(500).json({ message: "Failed to delete game info", error });
            }
        } else {
            res.status(400).json({ error: "seasonCode, weekNum, division, subdivision, homeTeamId, and awayTeamId are required" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}