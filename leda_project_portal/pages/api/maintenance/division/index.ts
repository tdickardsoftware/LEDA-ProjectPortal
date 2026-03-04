// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Division } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/division");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET" }, "Fetch divisions request");
		try {
			// Execute the database query to fetch division information
			const result = await query<Division>(
				'SELECT "divisionName" FROM maint.leda_maint_divisions ORDER BY "divisionName";'
			);
			// Respond with the query result
			log.info({ count: result.rows.length }, "Fetched all divisions");
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			log.error({ err: error }, "Failed to fetch divisions");
			res.status(500).json({ error: (error as Error).message });
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create division request");
		try {
			const results = req.body as Division;

			// Define the query to insert a new division
			const query = `INSERT INTO maint.leda_maint_divisions(
                        "divisionName")
                        VALUES ($1);`;
			const values = [results.divisionName];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ divisionName: results.divisionName }, "Created division");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate division name");
				res.status(422).json({
					message: "division name already exists",
				});
			}
			log.error({ err: error }, "Failed to create division");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			}); // Send error info in JSON
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", divisionName: req.body?.divisionName }, "Delete division request");
		try {
			const data = req.body as Division;
			const query = `DELETE FROM maint.leda_maint_divisions WHERE "divisionName" = $1;`;
			const values = [data.divisionName];
			const result = await queryPost(query, values);
			log.info({ divisionName: data.divisionName }, "Deleted division");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete division");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
