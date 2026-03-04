// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Penalty } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/penalty");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch penalty request");
		if (req.query.penaltyCode) {
			try {
				const penaltyCode = req.query.penaltyCode;
				const result = await query<Penalty>(
					`SELECT "penaltyCode", "desc" FROM maint.leda_maint_penalties WHERE "penaltyCode" = $1;`,
					[penaltyCode as string]
				);
				log.info({ penaltyCode: req.query.penaltyCode }, "Fetched single penalty");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch penalty");
				res.status(500).json({
					message: "Failed to fetch penalties ",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch penalty information
				const result = await query<Penalty>(
					'SELECT "penaltyCode", "desc" FROM maint.leda_maint_penalties ORDER BY "penaltyCode";'
				);
				// Respond with the query result
				log.info({ count: result.rows.length }, "Fetched all penalties");
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch penalties");
				res.status(500).json({
					message: "Failed to fetch penalties ",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create penalty request");
		try {
			const results = req.body as Penalty;

			// Define the query to insert a new penalty
			const query = `INSERT INTO maint.leda_maint_penalties(
                        "penaltyCode", "desc")
                        VALUES ($1, $2);`;
			const values = [results.penaltyCode, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ penaltyCode: results.penaltyCode }, "Created penalty");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate penalty code");
				res.status(422).json({
					message: "penaltyCode already exists",
				});
			} else {
				log.error({ err: error }, "Failed to create penalty");
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", penaltyCode: req.body?.penaltyCode }, "Delete penalty request");
		try {
			const data = req.body as Penalty;
			const query = `DELETE FROM maint.leda_maint_penalties WHERE "penaltyCode" = $1;`;
			const values = [data.penaltyCode];
			const result = await queryPost(query, values);
			log.info({ penaltyCode: data.penaltyCode }, "Deleted penalty");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete penalty");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		log.info({ method: "PUT", penaltyCode: req.body?.penaltyCode }, "Update penalty request");
		try {
			const data = req.body as Penalty;
			const query = `UPDATE maint.leda_maint_penalties SET "desc" = $2 WHERE "penaltyCode" = $1;`;
			const values = [data.penaltyCode, data.desc];
			const result = await queryPost(query, values);
			log.info({ penaltyCode: data.penaltyCode }, "Updated penalty");
			res.status(201).json({ update1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to update penalty");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
