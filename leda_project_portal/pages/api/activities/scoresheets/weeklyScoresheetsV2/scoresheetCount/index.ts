// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  WeeklyScoresheetsScoresheetCount } from "@/lib/definitions";
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
	            if (req.query.seasonCode) {
			// Execute the database query to fetch season code information
			const result = await query<WeeklyScoresheetsScoresheetCount>(
				'SELECT * FROM public.leda_scoresheets_tally WHERE "seasonCode" = $1',
				[req.query.seasonCode as string]
			);
			if (result.rows.length === 0) {
				res.status(204).json({ message: "No scoresheet count found for season" });
			} else {
				// Respond with the first row (unique per season/week)
				res.status(200).json(result.rows[0]);
			}
	        } else {
	            // If no season code is provided, return an error
	            res.status(400).json({ error: "seasonCode is required" });
	        }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch scoresheet count",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}