// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PayoutTier } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.place) {
			try {
				const place = req.query.place;
				const result = await query<PayoutTier>(
					`SELECT "place", trunc("amount"::numeric, 2) as "amount" FROM maint.leda_maint_payout_tiers WHERE "place" = $1;`,
					[place as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch payout tiers ",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch payout tier information
				const result = await query<PayoutTier>(
					`SELECT "place", trunc("amount"::numeric, 2) as "amount"  FROM maint.leda_maint_payout_tiers ORDER BY "place";`
				);
				// Respond with the query result
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({ message: "Failed to fetch payout tiers ", error });
			}
		}
	}
	// Handle PUT requests
	else if (req.method === "POST") {
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
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "place already exists",
				});
			} else {
				res.status(500).json({ message: (error as Error).message || "Server error" }); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as PayoutTier;
			const query = `DELETE FROM maint.leda_maint_payout_tiers WHERE "place" = $1 AND "amount" = $2;`;
			const values = [data.place, data.amount];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in PayoutTierHandler:", error as Error);
			res.status(500).json({ message: (error as Error).message || "Server error" });
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as PayoutTier;
			const query = `UPDATE maint.leda_maint_payout_tiers SET "amount" = $1 WHERE "place" = $2;`;
			const values = [data.amount, data.place];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in PayoutTierHandler:", error as Error);
			res.status(500).json({ message: (error as Error).message || "Server error" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
