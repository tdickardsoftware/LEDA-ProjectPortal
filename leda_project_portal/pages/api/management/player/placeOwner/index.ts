// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Player } from "@/lib/definitions";
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
			// Execute the database query to fetch player information
			const result =
				await query<Player>(`SELECT p."ledaId", CONCAT(COALESCE(p."firstName", ''), ' ', COALESCE(p."middleInitial", ''), ' ', COALESCE(p."lastName", '')) as "fullName" FROM public.leda_player_info p 
            JOIN public.leda_membership_info m ON p."ledaId" = m."ledaId" WHERE m."memberType" = 'BAR' OR m."memberType" = 'MEM' ORDER BY p."ledaId";`);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({ message: "Failed to fetch place owners ", error });
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
