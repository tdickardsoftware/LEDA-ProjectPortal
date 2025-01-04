// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Division } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
			// Execute the database query to fetch division information
			const result = await query<Division>(
				'SELECT "divisionName" FROM maint.leda_maint_divisions;'
			);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({ error: (error as Error).message });
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
			const results = req.body as Division;

			// Define the query to insert a new division
			const query = `INSERT INTO maint.leda_maint_divisions(
                        "divisionName")
                        VALUES ($1);`;
			const values = [results.divisionName];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			// Handle any errors that occur during the insert operation
			console.error("Error in PlayerHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			}); // Send error info in JSON
		}
	}
	// Respond with a 405 status code for unsupported methods
	else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
