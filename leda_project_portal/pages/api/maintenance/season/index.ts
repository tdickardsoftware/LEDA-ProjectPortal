// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Season } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
			// Execute the database query to fetch season information
			const result = await query<Season>(
				'SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons;'
			);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch season information", error
			});
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
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
			// Handle any errors that occur during the insert operation
			console.error("Error in SeasonHandler:", error);
			res.status(500).json({ message: (error as Error).message || "Server error" }); // Send error info in JSON
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Season;
			const query = `DELETE FROM maint.leda_maint_seasons WHERE "seasonCode" = $1 AND "fiscalYear" = $2 AND "desc" = $3 AND "isCurrentSeason" = $4;`;
			const values = [data.seasonCode, data.fiscalYear, data.desc, data.isCurrentSeason];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in DivisionHandler:", error as Error);
			res.status(500).json({ message: (error as Error).message || "Server error" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
