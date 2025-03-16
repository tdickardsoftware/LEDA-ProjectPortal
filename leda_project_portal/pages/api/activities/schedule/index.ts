import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { Schedule } from "@/lib/definitions";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const data = req.body as Schedule;
        try {
            const query = `
                INSERT INTO public.leda_schedule ("seasonCode", "scheduleData")
                VALUES ($1, $2)
                ON CONFLICT ("seasonCode")
                DO UPDATE SET "scheduleData" = $2;
            `;
            const values = [data.seasonCode, data.scheduleData];
            const result = await queryPost(query, values);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to upsert roster information", error });
        }
    } else if (req.method === "GET") {
        if (req.query.seasonCode) {
            try {
                const seasonCode = req.query.seasonCode;
                const result = await query<Schedule>(`SELECT "seasonCode", "scheduleData" FROM public.leda_schedule WHERE "seasonCode" = $1`, [seasonCode as string]);
                if (result.rows.length !== 0) {
                    res.status(200).json(result.rows[0]);
                } else {
                    res.status(404).json({ message: "No schedule information found for the specified season code" });
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch schedule information", error });
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}