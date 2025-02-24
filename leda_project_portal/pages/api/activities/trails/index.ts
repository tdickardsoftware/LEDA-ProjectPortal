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
			// get data passed to body
			const data = req.body as TrailsDateData;
			// create query to update trails history
			const query = `UPDATE public.leda_trails_history SET "trailsPoints" = $3, "singlesPlace" = $4, "doublesPlace" = $5, "notes" = $6 WHERE "ledaId" = $1 AND "trailsDate" = $2;`;
			const values = [data.ledaId, data.trailsDate, data.trailsPoints, data.singlesPlace, data.doublesPlace, data.notes];
			// create query to get old points from old record
			const query2 = 'SELECT "trailsPoints" FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;';
			const values2 = [data.ledaId, data.trailsDate];
			const oldPoints = (await queryPost(query2, values2)).rows[0].trailsPoints;
			// calculate change in points
			const changeBy = Number(data.trailsPoints) - Number(oldPoints);
			// create query to get old total
			const query4 = 'SELECT "totalPoints" FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1 order by "modifyDate" desc;';
			const values4 = [data.ledaId];
			const oldTotalPoints = (await queryPost(query4, values4)).rows[0].totalPoints;
			// calculate new total
			const newTotalPoints = Number(oldTotalPoints) + changeBy;
			// create query to insert audit record
			const query3 = 'INSERT into public.leda_trails_point_totals_audit ("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate") VALUES ($1, current_timestamp, $2, $3, $4, $5);';
			const values3 = [data.ledaId, oldTotalPoints, newTotalPoints, changeBy, data.trailsDate];
			const result3 = await queryPost(query3, values3);
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result, update2: result3 });
		} catch (error) {
			console.error("Error in PeopleTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === 'POST') {
		// get data passed to body
		const data = req.body as TrailsDateData;
		// create query to insert new record
		const query = `INSERT INTO public.leda_trails_history ("ledaId", "trailsDate", "trailsPoints", "singlesPlace", "doublesPlace", "notes") VALUES ($1, $2, $3, $4, $5, $6);`;
		const values = [data.ledaId, data.trailsDate, data.trailsPoints, data.singlesPlace, data.doublesPlace, data.notes];
		// create query to get old total
		const query2 = 'SELECT "totalPoints" FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1 order by "modifyDate" desc;';
		const values2 = [data.ledaId];
		// get old total points
		const oldTotalRows = (await queryPost(query2, values2));
		// if no old total points, set to 0
		let oldTotalPoints: number;
		if (oldTotalRows.rows.length === 0) {
			oldTotalPoints = 0;
		} else {
			oldTotalPoints = oldTotalRows.rows[0].totalPoints;
		}
		// calculate new total points
		const newTotalPoints = Number(oldTotalPoints) + Number(data.trailsPoints);
		// create query to insert audit record
		const query3 = 'INSERT into public.leda_trails_point_totals_audit ("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate") VALUES ($1, current_timestamp, $2, $3, $4, $5);';
		const values3 = [data.ledaId, oldTotalPoints, newTotalPoints, data.trailsPoints, data.trailsDate];
		// execute queries
		const result3 = await queryPost(query3, values3);
		const result = await queryPost(query, values);
		res.status(201).json({ insert1: result, insert2: result3 });
	} else if (req.method === 'DELETE') {
		// get data passed to body
		const data = req.body as TrailsDateData;
		const query = `DELETE FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;`;
		// create query to get old total
		const query2 = 'SELECT "totalPoints" FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1 order by "modifyDate" desc;';
		const values2 = [data.ledaId];
		const oldTotalPoints = (await queryPost(query2, values2)).rows[0].totalPoints;
		// create query to get old points from old record
		const query3 = 'SELECT "trailsPoints" FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;';
		const values3 = [data.ledaId, data.trailsDate];
		const oldPoints = (await queryPost(query3, values3)).rows[0].trailsPoints;
		// calculate change in points
		const changeBy = Number(oldPoints) * -1;
		const newTotalPoints = Number(oldTotalPoints) + changeBy;
		// create query to insert audit record
		const query4 = 'INSERT into public.leda_trails_point_totals_audit ("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate") VALUES ($1, current_timestamp, $2, $3, $4, $5);';
		const values4 = [data.ledaId, oldTotalPoints, newTotalPoints, changeBy, data.trailsDate];
		// execute queries
		const result4 = await queryPost(query4, values4);
		const values = [data.ledaId, data.trailsDate];
		const result = await queryPost(query, values);
		res.status(201).json({ delete1: result, delete2: result4 });
	}else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
