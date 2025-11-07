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
        
    }
}