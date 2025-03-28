import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { TeamPoints } from "@/lib/definitions";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const data = req.body as TeamPoints;

        if (data.weekNum != 1){
            try {
                const queryText = `SELECT "totalPoints" from public.leda_weekly_team_scores where "seasonCode" = $1 and "weekNum" = $2 and "teamLedaId" = $3`;
                const values = [data.seasonCode, data.weekNum-1, data.ledaId];
                const result = await query<TeamPoints>(queryText, values);
                if (result.rows.length !== 0) {
                    data.prevTotalPoints = result.rows[0].totalPoints;
                } else {
                    data.prevTotalPoints = 0;
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch previous weekly teams scores information", error });
            }
        } else {
            data.prevTotalPoints = 0;
        }
        try {
            const query = `
                INSERT INTO public.leda_weekly_team_scores ("seasonCode", "weekNum", "teamLedaId", "prevTotalPoints", "totalPoints")
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT ("seasonCode", "weekNum", "teamLedaId")
                DO UPDATE SET "totalPoints" = $5;
            `;
            const values = [data.seasonCode, data.weekNum, data.ledaId, data.prevTotalPoints, Number(data.prevTotalPoints) + Number(data.totalPoints)];
            const result = await queryPost(query, values);
            
            // Update subsequent weeks
            await updateSubsequentWeeks(
                data.seasonCode, 
                data.weekNum, 
                data.ledaId.toString(), 
                Number(data.prevTotalPoints) + Number(data.totalPoints)
            );
            
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to upsert weekly team scoresinformation", error });
        }
    } else if (req.method === "GET") {
        if (req.query.seasonCode && req.query.weekNum && req.query.teamLedaId) {
            try {
                const seasonCode = req.query.seasonCode;
                const weekNum = req.query.weekNum;
                const teamLedaId = req.query.teamLedaId;
                const result = await query<TeamPoints>(`SELECT * FROM public.leda_weekly_team_scores WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "teamLedaId" = $3`, [seasonCode as string, weekNum as string, teamLedaId as string]);
                if (result.rows.length !== 0) {
                    res.status(200).json(result.rows[0]);
                } else {
                    res.status(404).json({ message: "No weekly team scores information found for the specified season code, weekNum, and TeamId" });
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch weekly team scores information", error });
            }
        } else if (req.query.seasonCode) {
            const seasonCode = req.query.seasonCode;
            const result = await query<TeamPoints>(`SELECT * FROM public.leda_weekly_team_scores WHERE "seasonCode" = $1`, [seasonCode as string]);
            if (result.rows.length !== 0) {
                res.status(200).json(result.rows);
            } else {
                res.status(404).json({ message: "No weekly team scores information found for the specified season code" });
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}

/**
 * Updates all subsequent weeks' scores when a previous week's score has been updated
 */
async function updateSubsequentWeeks(
    seasonCode: string, 
    currentWeekNum: number, 
    teamLedaId: string, 
    newTotalPoints: number
): Promise<void> {
    try {
        // Fetch all subsequent weeks for this team
        const subsequentWeeksQuery = `
            SELECT * FROM public.leda_weekly_team_scores 
            WHERE "seasonCode" = $1 
            AND "weekNum" > $2 
            AND "teamLedaId" = $3
            ORDER BY "weekNum" ASC
        `;
        const values = [seasonCode, currentWeekNum, teamLedaId];
        const result = await query<TeamPoints>(subsequentWeeksQuery, values);
        
        // No subsequent weeks found, nothing to update
        if (result.rows.length === 0) return;
        
        // Process each subsequent week
        for (const week of result.rows) {
            // Calculate the points scored in this week (difference between total and prev)
            const pointsScored = Number(week.totalPoints) - Number(week.prevTotalPoints);
            
            // Update this week with new prevTotalPoints (which is the newTotalPoints from previous week)
            // and recalculate totalPoints
            const updatedTotalPoints = Number(newTotalPoints) + Number(pointsScored);
            
            const updateQuery = `
                UPDATE public.leda_weekly_team_scores 
                SET "prevTotalPoints" = $1, "totalPoints" = $2
                WHERE "seasonCode" = $3 AND "weekNum" = $4 AND "teamLedaId" = $5
            `;
            
            await queryPost(
                updateQuery, 
                [newTotalPoints, updatedTotalPoints, seasonCode, week.weekNum, teamLedaId]
            );
            
            // Update newTotalPoints for the next iteration
            newTotalPoints = updatedTotalPoints;
        }
    } catch (error) {
        console.error("Error updating subsequent weeks:", error);
        // We don't throw here to prevent breaking the main flow
    }
}