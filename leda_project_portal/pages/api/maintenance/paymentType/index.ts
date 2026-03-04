// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PaymentType } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/paymentType");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch payment type request");
		if (req.query.paymentType) {
			try {
				const paymentType = req.query.paymentType;
				const result = await query<PaymentType>(
					`SELECT "paymentType", "desc" FROM maint.leda_maint_payment_types WHERE "paymentType" = $1;`,
					[paymentType as string]
				);
				log.info({ paymentType: req.query.paymentType }, "Fetched single payment type");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch payment type");
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
				log.info({ count: result.rows.length }, "Fetched all payment types");
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch payment types");
				res.status(500).json({
					message: "Failed to fetch payment types ",
					error,
				});
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create payment type request");
		try {
			const results = req.body as PaymentType;

			// Define the query to insert a new payment type
			const query = `INSERT INTO maint.leda_maint_payment_types(
                        "paymentType", "desc")
                        VALUES ($1, $2);`;
			const values = [results.paymentType, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ paymentType: results.paymentType }, "Created payment type");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate payment type");
				res.status(422).json({
					message: "payment type already exists",
				});
			} else {
				log.error({ err: error }, "Failed to create payment type");
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", paymentType: req.body?.paymentType }, "Delete payment type request");
		try {
			const data = req.body as PaymentType;
			const query = `DELETE FROM maint.leda_maint_payment_types WHERE "paymentType" = $1;`;
			const values = [data.paymentType];
			const result = await queryPost(query, values);
			log.info({ paymentType: data.paymentType }, "Deleted payment type");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete payment type");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		log.info({ method: "PUT", paymentType: req.body?.paymentType }, "Update payment type request");
		try {
			const data = req.body as PaymentType;
			const query = `UPDATE maint.leda_maint_payment_types SET "desc" = $2 WHERE "paymentType" = $1;`;
			const values = [data.paymentType, data.desc];
			const result = await queryPost(query, values);
			log.info({ paymentType: data.paymentType }, "Updated payment type");
			res.status(201).json({ update1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to update payment type");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
