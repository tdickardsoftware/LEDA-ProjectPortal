// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Mention } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/mention");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch mention request");
		if (req.query.mentionCode) {
			try {
				const mentionCode = req.query.mentionCode;
				const result = await query<Mention>(
					`SELECT "mentionCode", "desc", "points", "mentionBasis" FROM maint.leda_maint_mentions WHERE "mentionCode" = $1;`,
					[mentionCode as string]
				);
				log.info({ mentionCode: req.query.mentionCode }, "Fetched single mention");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch mention");
				res.status(500).json({
					message: "Failed to fetch mentions ",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch mention information
				const result = await query<Mention>(
					'SELECT "mentionCode", "desc", "points", "mentionBasis" FROM maint.leda_maint_mentions ORDER BY "mentionCode";'
				);
				// Respond with the query result
				log.info({ count: result.rows.length }, "Fetched all mentions");
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch mentions");
				res.status(500).json({
					message: "Failed to fetch mentions ",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create mention request");
		try {
			const results = req.body as Mention;

			// Define the query to insert a new mention
			const query = `INSERT INTO maint.leda_maint_mentions(
                        "mentionCode", "desc", "points", "mentionBasis")
                        VALUES ($1, $2, $3, $4);`;
			const values = [
				results.mentionCode,
				results.desc,
				results.points,
				results.mentionBasis,
			];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ mentionCode: results.mentionCode }, "Created mention");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate mention code");
				res.status(422).json({
					message: "Mention code already exists",
				});
			} else {
				log.error({ err: error }, "Failed to create mention");
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", mentionCode: req.body?.mentionCode }, "Delete mention request");
		try {
			const data = req.body as Mention;
			const query = `DELETE FROM maint.leda_maint_mentions WHERE "mentionCode" = $1;`;
			const values = [data.mentionCode];
			const result = await queryPost(query, values);
			log.info({ mentionCode: data.mentionCode }, "Deleted mention");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete mention");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		log.info({ method: "PUT", mentionCode: req.body?.mentionCode }, "Update mention request");
		try {
			const data = req.body as Mention;
			const query = `UPDATE maint.leda_maint_mentions
				SET 
					"desc" = $2,
					"points" = $3,
					"mentionBasis" = $4
				WHERE "mentionCode" = $1;`;
			const values = [
				data.mentionCode,
				data.desc,
				data.points,
				data.mentionBasis,
			];
			const result = await queryPost(query, values);
			log.info({ mentionCode: data.mentionCode }, "Updated mention");
			res.status(201).json({ update1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to update mention");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
