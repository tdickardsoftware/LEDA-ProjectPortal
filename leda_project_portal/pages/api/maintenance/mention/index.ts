// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Mention } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.mentionCode) {
			try {
				const mentionCode = req.query.mentionCode;
				const result = await query<Mention>(
					`SELECT "mentionCode", "desc", "points", "mentionBasis" FROM maint.leda_maint_mentions WHERE "mentionCode" = $1;`,
					[mentionCode as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
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
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({
					message: "Failed to fetch mentions ",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
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
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "Mention code already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Mention;
			const query = `DELETE FROM maint.leda_maint_mentions WHERE "mentionCode" = $1;`;
			const values = [data.mentionCode];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in MentionHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
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
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in MentionHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
