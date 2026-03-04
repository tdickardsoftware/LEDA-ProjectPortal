// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { TrailsDateData } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
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
			res.status(500).json({
				message: "Failed to fetch season code ",
				error,
			});
		}
	} else if (req.method === "PUT") {
		try {
			// get data passed to body
			const data = req.body as TrailsDateData;
			// create query to update trails history
			const query = `UPDATE public.leda_trails_history SET "trailsPoints" = $3, "singlesPlace" = $4, "doublesPlace" = $5, "notes" = $6 WHERE "ledaId" = $1 AND "trailsDate" = $2;`;
			const values = [
				data.ledaId,
				data.trailsDate,
				data.trailsPoints,
				data.singlesPlace,
				data.doublesPlace,
				data.notes,
			];
			// create query to get old points from old record
			const query2 =
				'SELECT "trailsPoints" FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;';
			const values2 = [data.ledaId, data.trailsDate];
			const oldPoints = (await queryPost(query2, values2)).rows[0]
				.trailsPoints;
			// calculate change in points
			const changeBy = Number(data.trailsPoints) - Number(oldPoints);
			// create query to get old total
			const query4 =
				'SELECT "totalPoints" FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1 order by "modifyDate" desc;';
			const values4 = [data.ledaId];
			const oldTotalPointsResult = await queryPost(query4, values4);
			// Handle case where no rows are returned
			let oldTotalPoints = 0;
			if (oldTotalPointsResult.rows.length > 0) {
				oldTotalPoints = oldTotalPointsResult.rows[0].totalPoints;
			}
			// calculate new total
			const newTotalPoints = Number(oldTotalPoints) + changeBy;
			// create query to insert audit record
			const query3 =
				'INSERT into public.leda_trails_point_totals_audit ("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate", "singlesPlace", "doublesPlace") VALUES ($1, current_timestamp, $2, $3, $4, $5, $6, $7);';
			const values3 = [
				data.ledaId,
				oldTotalPoints,
				newTotalPoints,
				changeBy,
				data.trailsDate,
				data.singlesPlace,
				data.doublesPlace,
			];
			const result3 = await queryPost(query3, values3);
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result, update2: result3 });
		} catch (error) {
			console.error("Error in PeopleTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "POST") {
		// get data passed to body
		const data = req.body as TrailsDateData;
		// create query to insert new record
		const query = `INSERT INTO public.leda_trails_history ("ledaId", "trailsDate", "trailsPoints", "singlesPlace", "doublesPlace", "notes") VALUES ($1, $2, $3, $4, $5, $6);`;
		const values = [
			data.ledaId,
			data.trailsDate,
			data.trailsPoints,
			data.singlesPlace,
			data.doublesPlace,
			data.notes,
		];
		// create query to get old total
		const query2 =
			'SELECT "totalPoints" FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1 order by "modifyDate" desc;';
		const values2 = [data.ledaId];
		// get old total points
		const oldTotalRows = await queryPost(query2, values2);
		// if no old total points, set to 0
		let oldTotalPoints: number;
		if (oldTotalRows.rows.length === 0) {
			oldTotalPoints = 0;
		} else {
			oldTotalPoints = oldTotalRows.rows[0].totalPoints;
		}
		// calculate new total points
		const newTotalPoints =
			Number(oldTotalPoints) + Number(data.trailsPoints);
		// create query to insert audit record
		const query3 =
			'INSERT into public.leda_trails_point_totals_audit ("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate", "singlesPlace", "doublesPlace") VALUES ($1, current_timestamp, $2, $3, $4, $5, $6, $7);';
		const values3 = [
			data.ledaId,
			oldTotalPoints,
			newTotalPoints,
			data.trailsPoints,
			data.trailsDate,
			data.singlesPlace,
			data.doublesPlace,
		];

		const query4 =
			'select "lastTrailsDate" from public.leda_membership_info where "ledaId" = $1;';
		const values4 = [data.ledaId];
		// Get query result and handle the case where it might not exist
		const lastTrailsDateResult = await queryPost(query4, values4);
		let lastTrailsDate = null;
		let result4 = null;

		// Check if we have results before accessing them
		if (lastTrailsDateResult.rows && lastTrailsDateResult.rows.length > 0) {
			lastTrailsDate = lastTrailsDateResult.rows[0].lastTrailsDate;
		}

		// Make sure dates are properly compared by parsing them
		const newTrailsDate = new Date(data.trailsDate);
		const currentLastDate = lastTrailsDate
			? new Date(lastTrailsDate)
			: null;

		// Update only if null or if new date is later
		if (
			lastTrailsDate === null ||
			currentLastDate === null ||
			newTrailsDate > currentLastDate
		) {
			const query5 =
				'update public.leda_membership_info set "lastTrailsDate" = $2 where "ledaId" = $1;';
			const values5 = [data.ledaId, data.trailsDate];
			result4 = await queryPost(query5, values5);
		}

		// execute queries
		const result3 = await queryPost(query3, values3);
		const result = await queryPost(query, values);
		res.status(201).json({
			insert1: result,
			insert2: result3,
			update1: result4,
		});
	} else if (req.method === "DELETE") {
		// get data passed to body
		const data = req.body as TrailsDateData;
		const query = `DELETE FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;`;
		// create query to get old total
		const query2 =
			'SELECT "totalPoints" FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1 order by "modifyDate" desc;';
		const values2 = [data.ledaId];
		const oldTotalPointsResult = await queryPost(query2, values2);
		// Handle case where no rows are returned
		let oldTotalPoints = 0;
		if (oldTotalPointsResult.rows.length > 0) {
			oldTotalPoints = oldTotalPointsResult.rows[0].totalPoints;
		}
		// create query to get old points from old record
		const query3 =
			'SELECT "trailsPoints" FROM public.leda_trails_history WHERE "ledaId" = $1 AND "trailsDate" = $2;';
		const values3 = [data.ledaId, data.trailsDate];
		const oldPoints = (await queryPost(query3, values3)).rows[0]
			.trailsPoints;
		// calculate change in points
		const changeBy = Number(oldPoints) * -1;
		const newTotalPoints = Number(oldTotalPoints) + changeBy;
		// create query to insert audit record
		const query4 =
			'INSERT into public.leda_trails_point_totals_audit ("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate", "singlesPlace", "doublesPlace") VALUES ($1, current_timestamp, $2, $3, $4, $5, $6, $7);';
		const values4 = [
			data.ledaId,
			oldTotalPoints,
			newTotalPoints,
			changeBy,
			data.trailsDate,
			null,
			null,
		];
		// execute queries
		const result4 = await queryPost(query4, values4);
		const values = [data.ledaId, data.trailsDate];
		const result = await queryPost(query, values);
		res.status(201).json({ delete1: result, delete2: result4 });
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}
