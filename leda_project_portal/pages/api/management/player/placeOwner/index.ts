// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlaceOwner} from "@/lib/definitions";
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
			// Get search parameter, limit, and offset for pagination
			const search = (req.query.search as string) || "";
			const limit = parseInt(req.query.limit as string) || 50;
			const offset = parseInt(req.query.offset as string) || 0;
			
			let searchCondition = "";
			const searchParams: any[] = [];
			
			if (search) {
				const searchTerm = `%${search}%`;
				searchCondition = `AND (p."fullName" ILIKE $1 OR CAST(p."ledaId" AS TEXT) ILIKE $1)`;
				searchParams.push(searchTerm);
			}
			
			// Execute the database query to fetch filtered player information
			const sqlQuery = `
				SELECT 
					p."ledaId", 
					p."fullName" 
				FROM public.leda_player_info p 
				JOIN public.leda_membership_info m ON p."ledaId" = m."ledaId" 
				WHERE (m."memberType" = 'BAR' OR m."memberType" = 'MEM') 
				${searchCondition}
				ORDER BY p."ledaId" 
				LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
			`;
			
			const result = await query<PlaceOwner>(sqlQuery, [...searchParams, limit, offset]);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			console.error("Database query error:", error);
			res.status(500).json({ message: "Failed to fetch place owners ", error });
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
