import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Roster } from "@/lib/definitions";
import { queryPost } from "@/lib/query";


export default async function handler(
    req: NextApiRequest,
	res: NextApiResponse
) {
    if (req.method === "GET") {
        if (req.query.seasonCode) {
            try {
                const seasonCode = req.query.seasonCode;
                console.log(seasonCode);
                const result = await query<Roster>(`SELECT "seasonCode", "teamInfomation" FROM public.leda_roster_info WHERE "seasonCode" = $1`, [seasonCode as string]);
                if (result.rows.length !== 0) {
                    res.status(200).json(result.rows[0]);
                } else {
                    res.status(404).json({ message: "No roster information found for the specified season code" });
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch roster information", error });
            }
        } else {
            try {
                const result = await query<Roster>(`SELECT "seasonCode", "teamInfomation" FROM public.leda_roster_info`);
                res.status(200).json(result);
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch roster information", error });
            }
        }
    } else if (req.method === "POST") {
        try {
            const data = req.body as Roster;
            const query = `INSERT INTO public.leda_roster_info ("seasonCode", "teamInfomation") VALUES ($1, $2);`;
            const values = [data.seasonCode, data.teamInformation];
            const result = await queryPost(query, values);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to insert roster information", error });
        }
    } else if (req.method === 'PUT') {
        try {
            const data = req.body as Roster;
            const query = `UPDATE public.leda_roster_info SET "teamInfomation" = $2 WHERE "seasonCode" = $1;`;
            const values = [data.seasonCode, data.teamInformation];
            const result = await queryPost(query, values);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to update roster information", error });
        }
    } else if (req.method === 'DELETE') {
        try {
            const seasonCode = req.query.seasonCode;
            const query = `DELETE FROM public.leda_roster_info WHERE "seasonCode" = $1;`;
            const values = [seasonCode as string];
            const result = await queryPost(query, values);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete roster information", error });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}