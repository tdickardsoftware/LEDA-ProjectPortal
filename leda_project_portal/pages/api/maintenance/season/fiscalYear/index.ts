// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { FiscalYear } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/season/fiscalYear");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET" }, "Fetch fiscal years request");
		try {
			// Execute the database query to fetch fiscal year information
			const result = await query<FiscalYear>(
				'SELECT "fiscalYear" FROM public.leda_fiscal_years;'
			);
			// Respond with the query result
			log.info({ count: result.rows.length }, "Fetched all fiscal years");
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			log.error({ err: error }, "Failed to fetch fiscal years");
			res.status(500).json({
				message: "Failed to fetch fiscal year information",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}