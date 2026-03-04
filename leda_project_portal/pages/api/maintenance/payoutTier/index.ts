// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PayoutTier } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/payoutTier");

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch payout tier request");
		if (req.query.place) {
			try {
				const place = req.query.place;
				const result = await query<PayoutTier>(
					`SELECT "place", trunc("amount"::numeric, 2) as "amount" FROM maint.leda_maint_payout_tiers WHERE "place" = $1;`,
					[place as string]
				);
				log.info({ place: req.query.place }, "Fetched single payout tier");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch payout tier");
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
				log.info({ count: result.rows.length }, "Fetched all payout tiers");
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch payout tiers");
				res.status(500).json({
					message: "Failed to fetch payout tiers ",
					error,
				});
			}
		}
	}
	// Handle PUT requests
	else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create payout tier request");
		try {
			const results = req.body as PayoutTier;

			// Define the query to insert a new payout tier
			const query = `INSERT INTO maint.leda_maint_payout_tiers(
                        "place", "amount")
                        VALUES ($1, $2);`;
			const values = [results.place, results.amount.toPrecision(2)];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			log.info({ place: results.place }, "Created payout tier");
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate payout tier place");
				res.status(422).json({
					message: "place already exists",
				});
			} else {
				log.error({ err: error }, "Failed to create payout tier");
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", place: req.body?.place }, "Delete payout tier request");
		try {
			const data = req.body as PayoutTier;
			const query = `DELETE FROM maint.leda_maint_payout_tiers WHERE "place" = $1 AND "amount" = $2;`;
			const values = [data.place, data.amount];
			const result = await queryPost(query, values);
			log.info({ place: data.place }, "Deleted payout tier");
			res.status(201).json({ delete1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to delete payout tier");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		log.info({ method: "PUT", place: req.body?.place }, "Update payout tier request");
		try {
			const data = req.body as PayoutTier;
			const query = `UPDATE maint.leda_maint_payout_tiers SET "amount" = $1 WHERE "place" = $2;`;
			const values = [data.amount, data.place];
			const result = await queryPost(query, values);
			log.info({ place: data.place }, "Updated payout tier");
			res.status(201).json({ update1: result });
		} catch (error) {
			log.error({ err: error }, "Failed to update payout tier");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
