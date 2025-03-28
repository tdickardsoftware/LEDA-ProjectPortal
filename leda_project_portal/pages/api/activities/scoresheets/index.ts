import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { WeeklyScoresheet } from "@/lib/definitions";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const data = req.body as WeeklyScoresheet;
        try {
            const query = `
                INSERT INTO public.leda_weekly_scoresheets ("seasonCode", "weekNum", "scoresheetData")
                VALUES ($1, $2, $3)
                ON CONFLICT ("seasonCode", "weekNum")
                DO UPDATE SET "scoresheetData" = $3;
            `;
            const values = [data.seasonCode, data.weekNumber, data.scoresheetData];
            const result = await queryPost(query, values);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to upsert weekly scoresheet information", error });
        }
    } else if (req.method === "GET") {
        if (req.query.seasonCode && req.query.weekNumber) {
            try {
                const seasonCode = req.query.seasonCode;
                const weekNumber = req.query.weekNumber;
                const result = await query<WeeklyScoresheet>(`SELECT "seasonCode", "weekNum", "scoresheetData" FROM public.leda_weekly_scoresheets WHERE "seasonCode" = $1 AND "weekNum" = $2`, [seasonCode as string, weekNumber as string]);
                if (result.rows.length !== 0) {
                    res.status(200).json(result.rows[0]);
                } else {
                    res.status(404).json({ message: "No weekly scoresheet information found for the specified season code and week number" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch weekly scoresheet information", error });
            }
        }else if (req.query.seasonCode) {
            try {
                const seasonCode = req.query.seasonCode;
                const result = await query<WeeklyScoresheet>(`SELECT "seasonCode", "weekNum", "scoresheetData" FROM public.leda_weekly_scoresheets WHERE "seasonCode" = $1`, [seasonCode as string]);
                if (result.rows.length !== 0) {
                    res.status(200).json(result.rows[0]);
                } else {
                    res.status(404).json({ message: "No weekly scoresheet information found for the specified season code" });
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch weekly scoresheet information", error });
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}