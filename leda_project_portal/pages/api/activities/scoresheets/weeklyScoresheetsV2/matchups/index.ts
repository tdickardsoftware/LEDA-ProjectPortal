// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { WeeklyScoresheetsMatchupInfo } from "@/lib/definitions";
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
            if (req.query.seasonCode && req.query.minimumPoints) {
			// Execute the database query to fetch season code information
			const result = await query<WeeklyScoresheetsMatchupInfo>(
				'SELECT "seasonCode", "weekNum", "matchupData" FROM public.leda_scoresheets_matchups WHERE "seasonCode" = $1 AND "weekNum" = $2',
                [req.query.seasonCode as string, req.query.minimumPoints as string]
			);
			// Respond with the query result
			res.status(200).json(result.rows[0]);
        } else {
            // If no season code is provided, return an error
            res.status(400).json({ error: "Season code and minimumPoints is required" });
        }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch season code ",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}