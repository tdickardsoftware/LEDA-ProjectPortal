import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";

type RosterUpserter = {
	sourceSeasonCode: string;
	targetSeasonCode: string;
};
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const data = req.body as RosterUpserter;
		try {
			const query = `
                INSERT INTO public.leda_roster_info ("seasonCode", "teamInformation")
                SELECT $2, "teamInformation"
                FROM public.leda_roster_info
                WHERE "seasonCode" = $1
                ON CONFLICT ("seasonCode")
                DO UPDATE SET "teamInformation" = EXCLUDED."teamInformation";
            `;
			const values = [data.sourceSeasonCode, data.targetSeasonCode];
			const result = await queryPost(query, values);
			res.status(201).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to upsert roster information",
				error,
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
