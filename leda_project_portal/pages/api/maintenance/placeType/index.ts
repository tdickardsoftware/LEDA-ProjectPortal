// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlaceType } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/placeType");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch place type request");
		if (req.query.placeTypeCode) {
			try {
				const placeTypeCode = req.query.placeTypeCode;
				const result = await query<PlaceType>(
					`SELECT "placeTypeCode", "desc" FROM maint.leda_maint_place_types WHERE "placeTypeCode" = $1;`,
					[placeTypeCode as string]
				);
				log.info({ placeTypeCode: req.query.placeTypeCode }, "Fetched single place type");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch place type");
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
				log.info({ count: result.rows.length }, "Fetched all place types");
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch place types");
				res.status(500).json({
					message: "Failed to fetch place type",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create place type request");
		try {
			const results = req.body as PlaceType;

			// Define the query to insert a new place type
			const query = `INSERT INTO maint.leda_maint_place_types(
                        "placeTypeCode", "desc")
                        VALUES ($1, $2);`;
			const values = [results.placeTypeCode, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ placeTypeCode: results.placeTypeCode }, "Created place type");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate place type code");
				res.status(422).json({
					message: "Place type code already exists",
				});
			} else {
				log.error({ err: error }, "Failed to create place type");
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", placeTypeCode: req.body?.placeTypeCode }, "Delete place type request");
		try {
			const data = req.body as PlaceType;
			const query = `DELETE FROM maint.leda_maint_place_types WHERE "placeTypeCode" = $1;`;
			const values = [data.placeTypeCode];
			const result = await queryPost(query, values);
			log.info({ placeTypeCode: data.placeTypeCode }, "Deleted place type");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete place type");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		log.info({ method: "PUT", placeTypeCode: req.body?.placeTypeCode }, "Update place type request");
		try {
			const data = req.body as PlaceType;
			const query = `UPDATE maint.leda_maint_place_types SET "desc" = $2 WHERE "placeTypeCode" = $1;`;
			const values = [data.placeTypeCode, data.desc];
			const result = await queryPost(query, values);
			log.info({ placeTypeCode: data.placeTypeCode }, "Updated place type");
			res.status(201).json({ update1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to update place type");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
