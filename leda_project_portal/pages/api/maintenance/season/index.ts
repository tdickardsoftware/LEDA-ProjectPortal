// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Season } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/season");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch season request");
		if (req.query.seasonCode) {
			try {
				const seasonCode = req.query.seasonCode;
				const result = await query<Season>(
					`SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`,
					[seasonCode as string]
				);
				log.info({ seasonCode: req.query.seasonCode }, "Fetched single season");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch season by seasonCode");
				res.status(500).json({
					message: "Failed to fetch season information",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch season information
				const result = await query<Season>(
					'SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons ORDER BY "seasonCode";'
				);
				// Respond with the query result
				log.info({ count: result.rows.length }, "Fetched all seasons");
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch seasons");
				res.status(500).json({
					message: "Failed to fetch season information",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create season request");
		try {
			const results = req.body as Season;

			// If this season is being set as current, unset all other current seasons
			if (results.isCurrentSeason) {
				const clearCurrentQuery = `UPDATE maint.leda_maint_seasons SET "isCurrentSeason" = false WHERE "isCurrentSeason" = true;`;
				await queryPost(clearCurrentQuery, []);
			}

			// Define the query to insert a new season
			const query = `INSERT INTO maint.leda_maint_seasons(
                        "seasonCode", "fiscalYear", "dates", "desc", "isCurrentSeason")
                        VALUES ($1, $2, $3, $4, $5);`;
			const values = [
				results.seasonCode,
				results.fiscalYear,
				results.dates,
				results.desc,
				results.isCurrentSeason,
			];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ seasonCode: results.seasonCode }, "Created season");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate season code");
				res.status(422).json({
					message: "Season Code already exists",
				});
			} else {
				log.error({ err: error }, "Failed to create season");
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", seasonCode: req.body?.seasonCode }, "Delete season request");
		try {
			const data = req.body as Season;
			const query = `DELETE FROM maint.leda_maint_seasons WHERE "seasonCode" = $1 AND "fiscalYear" = $2 AND "isCurrentSeason" = $3;`;
			const values = [
				data.seasonCode,
				data.fiscalYear,
				data.isCurrentSeason,
			];
			const result = await queryPost(query, values);
			log.info({ seasonCode: data.seasonCode }, "Deleted season");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete season");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		log.info({ method: "PUT", seasonCode: req.body?.seasonCode }, "Update season request");
		try {
			const data = req.body as Season;

			// If this season is being set as current, unset all other current seasons
			if (data.isCurrentSeason) {
				const clearCurrentQuery = `UPDATE maint.leda_maint_seasons SET "isCurrentSeason" = false WHERE "isCurrentSeason" = true AND "seasonCode" != $1;`;
				await queryPost(clearCurrentQuery, [data.seasonCode]);
			}

			const query = `UPDATE maint.leda_maint_seasons SET "fiscalYear" = $2, "dates" = $3, "desc" = $4, "isCurrentSeason" = $5 WHERE "seasonCode" = $1;`;
			const values = [
				data.seasonCode,
				data.fiscalYear,
				data.dates,
				data.desc,
				data.isCurrentSeason,
			];
			const result = await queryPost(query, values);
			log.info({ seasonCode: data.seasonCode }, "Updated season");
			res.status(201).json({ update1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to update season");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
