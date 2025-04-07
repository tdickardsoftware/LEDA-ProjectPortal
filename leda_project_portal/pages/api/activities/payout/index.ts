// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Payout } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.seasonCode) {
			const result = await query<Payout>(
				`SELECT "payoutsData" FROM public.leda_payouts WHERE "seasonCode" = $1`,
				[req.query.seasonCode as string]
			);
			return res.status(200).json(result.rows);
		}
	} else if (req.method === "POST") {
		const body = req.body as Payout;
		const query = `INSERT INTO public.leda_payouts ("seasonCode", "payoutsData") VALUES ($1, $2) ON CONFLICT ("seasonCode") DO UPDATE SET "payoutsData" = $2;`;
		const values = [body.seasonCode, body.payoutsData];
		const result = await queryPost(query, values);
		return res.status(201).json(result);
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
