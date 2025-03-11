import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Roster } from "@/lib/definitions";

export default async function handler(
    req: NextApiRequest,
	res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const result = await query<Roster>(`SELECT "seasonCode" FROM public.leda_roster_info where "teamInfomation" is not null`);
            res.status(200).json(result.rows);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch roster information", error });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}