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
	            if (req.query.seasonCode && req.query.weekNum) {
			// Execute the database query to fetch season code information
			const result = await query<WeeklyScoresheetsMatchupInfo>(
				'SELECT "seasonCode", "weekNum", "matchupData" FROM public.leda_scoresheets_matchups WHERE "seasonCode" = $1 AND "weekNum" = $2',
				[req.query.seasonCode as string, req.query.weekNum as string]
			);
			if (result.rows.length === 0) {
				res.status(204).json({ message: "No matchups found for season/week." });
			} else {
				// Respond with the first row (unique per season/week)
				res.status(200).json(result.rows[0]);
			}
	        } else {
	            // If no season code is provided, return an error
	            res.status(400).json({ error: "seasonCode and weekNum are required" });
	        }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch matchups ",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}