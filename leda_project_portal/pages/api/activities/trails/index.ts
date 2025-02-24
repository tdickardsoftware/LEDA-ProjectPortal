// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsDateData } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

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
					`SELECT th.*, 
							CONCAT(COALESCE(pi."firstName", ''), ' ', COALESCE(pi."middleInitial", ''), ' ', COALESCE(pi."lastName", '')) as "fullName"
					 FROM public.leda_trails_history th
					 JOIN public.leda_player_info pi ON th."ledaId" = pi."ledaId"
					 WHERE th."trailsDate" = $1 order by "ledaId" asc;`,
					[trailsDate as string]
				);
                
                // Respond with the query result
                res.status(200).json(result);
            }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({ message: "Failed to fetch season code ", error });
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as TrailsDateData;
			const query = `UPDATE public.leda_trails_history SET "trailsPoints" = $3, "singlesPlace" = $4, "doublesPlace" = $5, "notes" = $6 WHERE "ledaId" = $1 AND "trailsDate" = $2;`;
			const values = [data.ledaId, data.trailsDate, data.trailsPoints, data.singlesPlace, data.doublesPlace, data.notes];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in PeopleTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === 'POST') {
		const data = req.body as TrailsDateData;
		console.log(data)
		const query = `INSERT INTO public.leda_trails_history ("ledaId", "trailsDate", "trailsPoints", "singlesPlace", "doublesPlace", "notes") VALUES ($1, $2, $3, $4, $5, $6);`;
		const values = [data.ledaId, data.trailsDate, data.trailsPoints, data.singlesPlace, data.doublesPlace, data.notes];
		const result = await queryPost(query, values);
		res.status(201).json({ insert1: result });
	} else if (req.method === 'DELETE') {
		const data = req.body as TrailsDateData;
		const query = `DELETE FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;`;
		const values = [data.ledaId, data.trailsDate];
		const result = await queryPost(query, values);
		res.status(201).json({ delete1: result });
	}else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
