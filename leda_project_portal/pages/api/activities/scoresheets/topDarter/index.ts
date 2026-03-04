/**
 * API Route: /api/activities/scoresheets/topDarter
 *
 * GET — Returns top darter report records for a season filtered by a minimum
 *        points threshold. Results are ordered by divisionInfo ascending.
 *        Both `seasonCode` and `minimumPoints` query params are required.
 */
// Import necessary types and database query function
import { query } from "@/lib/dbTypeGet";
import { TopDarter } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";

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
			const result = await query<TopDarter>(
				'SELECT "seasonCode", "ledaId", "fullName", "teamLedaId", "totalPoints", "divisionInfo" FROM public.leda_reports_league_play_top_darter WHERE "seasonCode" = $1 AND "totalPoints" >= $2 ORDER BY "divisionInfo" ASC',
                [req.query.seasonCode as string, req.query.minimumPoints as string]
			);
			// Respond with the query result
			res.status(200).json(result.rows);
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