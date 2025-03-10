import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Roster } from "@/lib/definitions";
import { queryPost } from "@/lib/query";


export default async function handler(
    req: NextApiRequest,
	res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const result = await query<Roster>(`SELECT "seasonCode", "teamInformation" FROM public.leda_roster_info`);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch roster information", error });
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
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}