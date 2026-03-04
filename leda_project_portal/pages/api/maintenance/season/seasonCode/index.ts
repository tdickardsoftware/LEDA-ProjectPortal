// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Season } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/season/seasonCode");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET" }, "Fetch season codes request");
		try {
			// Execute the database query to fetch season code information
			const result = await query<Season>(
				'SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons ORDER BY "seasonCode";'
			);
			// Respond with the query result
			log.info({ count: result.rows.length }, "Fetched all season codes");
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			log.error({ err: error }, "Failed to fetch season codes");
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
