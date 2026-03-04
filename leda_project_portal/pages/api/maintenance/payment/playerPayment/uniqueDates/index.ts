// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/payment/playerPayment/uniqueDates");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		log.info({ method: "GET", ledaId: req.query.ledaId }, "Fetch player payment unique dates request");
		if (req.query.ledaId) {
			try {
				// Execute the database query to fetch unique payment dates for a specific ledaId
				const result = await query(
					'SELECT DISTINCT "date" FROM maint.leda_maint_player_payment_history WHERE "ledaId" = $1 ORDER BY "date";',
					[req.query.ledaId as string]
				);
				// Always ensure we return an array, even if result.rows is undefined or empty
				log.info({ ledaId: req.query.ledaId, count: result.rows.length }, "Fetched player payment unique dates by ledaId");
				res.status(200).json(result.rows || []);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch player payment unique dates by ledaId");
				res.status(500).json({
					message: "Failed to fetch unique payment dates for ledaId",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch unique payment dates
				const result = await query(
					'SELECT DISTINCT "date" FROM maint.leda_maint_player_payment_history ORDER BY "date";'
				);
				// Always ensure we return an array, even if result.rows is undefined or empty
				log.info({ count: result.rows.length }, "Fetched all player payment unique dates");
				res.status(200).json(result.rows || []);
			} catch (error) {
				// Handle any errors that occur during the query
				log.error({ err: error }, "Failed to fetch player payment unique dates");
				res.status(500).json({
					message: "Failed to fetch unique payment dates",
					error,
				});
			}
		}
	} else {
		// Handle unsupported HTTP methods
		log.warn({ method: req.method }, "Method not allowed");
		res.setHeader("Allow", ["GET"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
