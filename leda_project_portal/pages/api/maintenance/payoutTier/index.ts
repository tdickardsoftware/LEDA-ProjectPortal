// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PayoutTier } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
			// Execute the database query to fetch payout tier information
			const result = await query<PayoutTier>(
				`SELECT "place", trunc("amount"::numeric, 2) as "amount"  FROM maint.leda_maint_payout_tiers;`
			);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({ message: "Failed to fetch payout tiers ", error });
		}
	}
	// Handle PUT requests
	else if (req.method === "PUT") {
		try {
			console.log(req.body);
			const results = req.body as PayoutTier;

			// Define the query to insert a new payout tier
			const query = `INSERT INTO maint.leda_maint_payout_tiers(
                        "place", "amount")
                        VALUES ($1, $2);`;
			const values = [results.place, results.amount.toPrecision(2)];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			// Handle any errors that occur during the insert operation
			console.error("Error in PayoutTierHandler:", error);
			res.status(500).json({ message: (error as Error).message || "Server error" }); // Send error info in JSON
		}
	}
	// Respond with a 405 status code for unsupported methods
	else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
