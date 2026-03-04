/**
 * API Route: /api/activities/scoresheets/weekCompleted
 *
 * GET — Returns the completion record for a specific season week, indicating
 *        whether all scoresheets for that week have been processed.
 *        Both `seasonCode` and `weekNum` query params are required.
 */
// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  WeeklyScoresheetsCompletedWeek } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/scoresheets/weekCompleted");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch week completion status");
		try {
            if (req.query.seasonCode && req.query.weekNum) {
                // Execute the database query to fetch season code information
                const result = await query<WeeklyScoresheetsCompletedWeek>(
                    'SELECT "seasonCode", "weekNum", "scoresheetsProcessed" FROM public.leda_scoresheets_completed_weeks WHERE "seasonCode" = $1 AND "weekNum" = $2',
                    [req.query.seasonCode as string, req.query.weekNum as string]
                );
            
                // Respond with the first row (unique per season/week)
                res.status(200).json(result.rows[0]);
	        } else {
	            // If no season code or week number is provided, return an error
	            res.status(400).json({ error: "seasonCode and weekNum are required" });
	        }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch completed week scoresheets information",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}