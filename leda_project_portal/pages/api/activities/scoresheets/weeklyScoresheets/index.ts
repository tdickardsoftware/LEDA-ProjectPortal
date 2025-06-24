// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { LeaguePlayWeeklyScoresheets } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
            if (req.query.seasonCode && req.query.weekNum ) {
			// Execute the database query to fetch season code information
			const result = await query<LeaguePlayWeeklyScoresheets>(
				'SELECT "seasonCode", "teamLedaId", "teamName", "weekNum", "divisionInfo", division, subdivision, "teamLetter", "prevTotalPoints", "totalPoints", "pointsScored", "penaltyPoints"  FROM public.leda_reports_league_play_weekly_scoresheets WHERE "seasonCode" = $1 AND "weekNum" = $2 ORDER BY "teamLetter" ASC',
                [req.query.seasonCode as string, req.query.weekNum as string]
			);
			// Respond with the query result
			res.status(200).json(result.rows);
        } else {
            // If no season code is provided, return an error
            res.status(400).json({ error: "Season code and minimumMentions and teamId is required" });
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