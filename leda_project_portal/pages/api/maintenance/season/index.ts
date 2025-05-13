// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Season } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.seasonCode) {
			try {
				const seasonCode = req.query.seasonCode;
				const result = await query<Season>(
					`SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`,
					[seasonCode as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
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
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({
					message: "Failed to fetch season information",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			const results = req.body as Season;

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
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "Season Code already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Season;
			const query = `DELETE FROM maint.leda_maint_seasons WHERE "seasonCode" = $1 AND "fiscalYear" = $2 AND "isCurrentSeason" = $3;`;
			const values = [
				data.seasonCode,
				data.fiscalYear,
				data.isCurrentSeason,
			];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in DivisionHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as Season;
			const query = `UPDATE maint.leda_maint_seasons SET "fiscalYear" = $2, "dates" = $3, "desc" = $4, "isCurrentSeason" = $5 WHERE "seasonCode" = $1;`;
			const values = [
				data.seasonCode,
				data.fiscalYear,
				data.dates,
				data.desc,
				data.isCurrentSeason,
			];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in DivisionHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
