// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PaymentType } from "@/lib/definitions";
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
		if (req.query.paymentType) {
			try {
				const paymentType = req.query.paymentType;
				const result = await query<PaymentType>(
					`SELECT "paymentType", "desc" FROM maint.leda_maint_payment_types WHERE "paymentType" = $1;`,
					[paymentType as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch payment types ",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch payment type information
				const result = await query<PaymentType>(
					'SELECT "paymentType", "desc" FROM maint.leda_maint_payment_types ORDER BY "paymentType"; '
				);
				// Respond with the query result
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({
					message: "Failed to fetch payment types ",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
			const results = req.body as PaymentType;

			// Define the query to insert a new payment type
			const query = `INSERT INTO maint.leda_maint_payment_types(
                        "paymentType", "desc")
                        VALUES ($1, $2);`;
			const values = [results.paymentType, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "payment type already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as PaymentType;
			const query = `DELETE FROM maint.leda_maint_payment_types WHERE "paymentType" = $1;`;
			const values = [data.paymentType];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in PaymentTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as PaymentType;
			const query = `UPDATE maint.leda_maint_payment_types SET "desc" = $2 WHERE "paymentType" = $1;`;
			const values = [data.paymentType, data.desc];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in PaymentTypeHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
