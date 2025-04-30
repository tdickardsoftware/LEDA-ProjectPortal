// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsPlayerHistory } from "@/lib/definitions";
import { format } from "date-fns";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
        if (!req.query.ledaId) {
            return res.status(400).json({ message: "LEDA ID is required" });
        }
		try {
            const ledaId = req.query.ledaId as string;
			// Execute the database query to fetch season code information
			const result = await query<TrailsPlayerHistory>(
				'SELECT "trailsDate", "previousTotalPoints", "totalPoints", "changeBy", "modifyDate", "singlesPlace", "doublesPlace" from public.leda_trails_point_totals_audit WHERE "ledaId" = $1 ORDER BY "modifyDate" desc, "trailsDate" desc;',
                [ledaId]
			);
			// Format the trailsDate
			const formattedResult = result.rows.map((item) => ({
				...item,
				trailsDate: format(new Date(item.trailsDate), "MM-dd-yyyy"),
                modifyDate: format(new Date(item.modifyDate), "MM-dd-yyyy"),
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
		res.status(405).json({ error: "Method not allowed" });
	}
}
 