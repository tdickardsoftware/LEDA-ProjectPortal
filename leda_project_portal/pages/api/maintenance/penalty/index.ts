// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Penalty } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.penaltyCode) {
			try {
				const penaltyCode = req.query.penaltyCode;
				const result = await query<Penalty>(
					`SELECT "penaltyCode", "desc" FROM maint.leda_maint_penalties WHERE "penaltyCode" = $1;`,
					[penaltyCode as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
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
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({
					message: "Failed to fetch penalties ",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
			const results = req.body as Penalty;

			// Define the query to insert a new penalty
			const query = `INSERT INTO maint.leda_maint_penalties(
                        "penaltyCode", "desc")
                        VALUES ($1, $2);`;
			const values = [results.penaltyCode, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "penaltyCode already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Penalty;
			const query = `DELETE FROM maint.leda_maint_penalties WHERE "penaltyCode" = $1;`;
			const values = [data.penaltyCode];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in PenaltyHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as Penalty;
			const query = `UPDATE maint.leda_maint_penalties SET "desc" = $2 WHERE "penaltyCode" = $1;`;
			const values = [data.penaltyCode, data.desc];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in PenaltyHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
