/**
 * API Route: /api/activities/schedule/placeCaptainSeasonInfo
 *
 * GET — Returns place and captain details for each team for the given season,
 *        sourced from the captains-meeting schedule report view. Used when
 *        generating captains meeting documents.
 *        The `seasonCode` query param is required.
 */
// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		try {
            if (req.query.seasonCode) {
			// Execute the database query to fetch season code information
			const result = await query<CaptainsMtgSchedulePlaceCaptainSeasonInfo>(
				'SELECT "seasonCode", "desc", "teamId", "placeId", division, subdivision, "placeName", "addressFirstLine", "addressSecondLine", "placePhoneNumber", "captainId", "captainFullName", "captainPhoneNumber" FROM public.leda_reports_captains_mtg_schedules_place_captain_season_info WHERE "seasonCode" = $1',
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