// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsDateData } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
            if (req.query.trailsDate) {
                const trailsDate = req.query.trailsDate;
			    // Execute the database query to fetch season code information
                const result = await query<TrailsDateData>(
					'SELECT * FROM public.leda_trails_history WHERE "trailsDate" = $1;',
					[trailsDate as string]
                );
                
                // Respond with the query result
                res.status(200).json(result);
            }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({ message: "Failed to fetch season code ", error });
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
