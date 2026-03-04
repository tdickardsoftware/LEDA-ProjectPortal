/**
 * API Route: /api/activities/roster/rosterDivision
 *
 * GET — Returns division entries from leda_roster_divisions for the
 *        specified season. The `seasonCode` query param is required.
 */
// Import necessary types and database query function
import { query } from "@/lib/dbTypeGet";
import { RosterDivision } from "@/lib/definitions";
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
            if (req.query.seasonCode) {
			// Execute the database query to fetch season code information
			const result = await query<RosterDivision>(
				'SELECT "seasonCode", division FROM public.leda_roster_divisions WHERE "seasonCode" = $1',
                [req.query.seasonCode as string]
			);
			// Respond with the query result
			res.status(200).json(result.rows);
        } else {
            // If no season code is provided, return an error
            res.status(400).json({ error: "Season code is required" });
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