// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsDate } from "@/lib/definitions";
import { format } from "date-fns";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/trails/trailsDates");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch trails dates");
		try {
			// Execute the database query to fetch season code information
			const result = await query<TrailsDate>(
				'SELECT DISTINCT "trailsDate" FROM public.leda_trails_history ORDER BY "trailsDate" desc;'
			);
			// Format the trailsDate
			const formattedResult = result.rows.map((item) => ({
				...item,
				trailsDate: format(new Date(item.trailsDate), "MM-dd-yyyy"),
			}));
			// Respond with the query result
			res.status(200).json(formattedResult);
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
