// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlaceType } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.placeTypeCode) {
			try {
				const placeTypeCode = req.query.placeTypeCode;
				const result = await query<PlaceType>(
					`SELECT "placeTypeCode", "desc" FROM maint.leda_maint_place_types WHERE "placeTypeCode" = $1;`,
					[placeTypeCode as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch place type",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch place type information
				const result = await query<PlaceType>(
					'SELECT "placeTypeCode", "desc" FROM maint.leda_maint_place_types ORDER BY "placeTypeCode";'
				);
				// Respond with the query result
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({
					message: "Failed to fetch place type",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
			const results = req.body as PlaceType;

			// Define the query to insert a new place type
			const query = `INSERT INTO maint.leda_maint_place_types(
                        "placeTypeCode", "desc")
                        VALUES ($1, $2);`;
			const values = [results.placeTypeCode, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "Place type code already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as PlaceType;
			const query = `DELETE FROM maint.leda_maint_place_types WHERE "placeTypeCode" = $1;`;
			const values = [data.placeTypeCode];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in PlaceTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as PlaceType;
			const query = `UPDATE maint.leda_maint_place_types SET "desc" = $2 WHERE "placeTypeCode" = $1;`;
			const values = [data.placeTypeCode, data.desc];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in PlaceTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
