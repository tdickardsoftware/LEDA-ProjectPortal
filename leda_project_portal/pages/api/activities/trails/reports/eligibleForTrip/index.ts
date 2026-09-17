// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsTripEligible } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/trails/reports/eligibleForTrip");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch trails eligible-for-trip list");
		try {
			// Execute the database query to fetch season code information
			// LEFT JOIN temp player info so temp players (not yet in leda_player_info,
			// which the view sources names from) still get a name instead of a blank one
			const result = await query<TrailsTripEligible>(
				`SELECT v."ledaId",
						CASE WHEN tp."tempId" IS NOT NULL THEN
							CONCAT_WS(', ', tp."lastName", TRIM(CONCAT_WS(' ', tp."firstName", tp."middleInitial")))
						ELSE v."fullName" END as "fullName",
						v."addressFull", v."totalpoints"
				 FROM public.leda_reports_trails_trip_eligible v
				 LEFT JOIN public.leda_temp_player_info tp ON v."ledaId" = tp."tempId"`
			);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch season code ",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
} 