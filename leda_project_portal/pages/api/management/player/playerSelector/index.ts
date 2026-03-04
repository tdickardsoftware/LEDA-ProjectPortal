// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlayerSelector } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/management/player/playerSelector");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch player selector request");
		try {
			const { search = "", limit = "50", offset = "0" } = req.query;
			
			// Build search condition
			const searchCondition = search
				? `AND (p."fullName" ILIKE $1 OR p."ledaId"::text ILIKE $1)`
				: "";
			
			const params = search ? [`%${search}%`] : [];
			const limitValue = parseInt(limit as string) || 50;
			const offsetValue = parseInt(offset as string) || 0;
			
			// Add limit and offset to params
			const limitIndex = params.length + 1;
			const offsetIndex = params.length + 2;
			params.push(limitValue.toString(), offsetValue.toString());
			
			// Execute the database query to fetch player information
			const result = await query<PlayerSelector>(
				`SELECT p."ledaId", 
				        p."fullName", 
				        m."cannotBeCaptain" 
				 FROM public.leda_player_info p 
				 JOIN public.leda_membership_info m ON p."ledaId" = m."ledaId"
				 WHERE 1=1 ${searchCondition}
				 ORDER BY p."ledaId"
				 LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
				params
			);
			// Respond with the query result
			log.info({ count: result.rows.length }, "Fetched player selector");
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch players",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}