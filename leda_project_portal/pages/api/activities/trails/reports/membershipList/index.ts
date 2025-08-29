// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsMembershipHistory } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		try {
			// Execute the database query to fetch season code information
			const result = await query<TrailsMembershipHistory>(
				'SELECT "ledaId", "fullName" FROM public.leda_reports_trails_member_history'
			);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch trails history of wins",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
