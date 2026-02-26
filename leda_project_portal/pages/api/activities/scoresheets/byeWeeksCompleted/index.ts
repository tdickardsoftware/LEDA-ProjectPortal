// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  WeeklyScoresheetsByeWeeksProcessed, WeeklyScoresheetsScoresheetCount } from "@/lib/definitions";
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
                const result = await query<WeeklyScoresheetsByeWeeksProcessed>(
                    'SELECT "seasonCode", "weekNum", "allByeWeeksProcessed" FROM public.leda_scoresheets_processed_bye_weeks WHERE "seasonCode" = $1 AND "weekNum" = $2',
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
				message: "Failed to fetch bye weeks processed",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}