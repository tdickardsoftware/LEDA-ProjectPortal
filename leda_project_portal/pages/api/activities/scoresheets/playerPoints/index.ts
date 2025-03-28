import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { PlayerPoints } from "@/lib/definitions";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const data = req.body as PlayerPoints;

        if (data.weekNumber != 1) {
            try {
                const queryText = `SELECT "totalPoints" from public.leda_weekly_player_points where "seasonCode" = $1 and "weekNum" = $2 and "ledaId" = $3 and "teamLedaId" = $4`;
                const values = [data.seasonCode, data.weekNumber - 1, data.ledaId, data.teamLedaId];
                const result = await query<PlayerPoints>(queryText, values);
                if (result.rows.length !== 0) {
                    data.prevTotalPoints = result.rows[0].totalPoints;
                } else {
                    data.prevTotalPoints = 0;
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch previous weekly player points information", error });
            }
        } else {
            data.prevTotalPoints = 0;
        }
        try {
            const query = `
                INSERT INTO public.leda_weekly_player_points ("seasonCode", "weekNum", "ledaId", "prevTotalPoints", "totalPoints", "teamLedaId")
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT ("seasonCode", "weekNum", "ledaId", "teamLedaId")
                DO UPDATE SET "totalPoints" = $5;
            `;
            const values = [data.seasonCode, data.weekNumber, data.ledaId, data.prevTotalPoints, data.prevTotalPoints + data.totalPoints, data.teamLedaId];
            const result = await queryPost(query, values);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to upsert weekly player points information", error });
        }
    } else if (req.method === "GET") {
        if (req.query.seasonCode && req.query.weekNum && req.query.ledaId) {
            try {
                const seasonCode = req.query.seasonCode;
                const weekNum = req.query.weekNum;
                const ledaId = req.query.ledaId;
                const teamLedaId = req.query.teamLedaId;
                const result = await query<PlayerPoints>(
                    `SELECT * FROM public.leda_weekly_player_points WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "ledaId" = $3 and "teamLedaId" = $4`,
                    [seasonCode as string, weekNum as string, ledaId as string, teamLedaId as string]
                );
                if (result.rows.length !== 0) {
                    res.status(200).json(result.rows[0]);
                } else {
                    res.status(404).json({ message: "No weekly player points information found for the specified season code, weekNum, and TeamId" });
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch weekly team scores information", error });
            }
        } else if (req.query.seasonCode) {
            const seasonCode = req.query.seasonCode;
            const result = await query<PlayerPoints>(
                `SELECT * FROM public.leda_weekly_player_points WHERE "seasonCode" = $1`,
                [seasonCode as string]
            );
            if (result.rows.length !== 0) {
                res.status(200).json(result.rows);
            } else {
                res.status(404).json({ message: "No weekly player points information found for the specified season code" });
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}