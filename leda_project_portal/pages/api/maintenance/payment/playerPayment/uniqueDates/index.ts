// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		if (req.query.ledaId) {
			try {
				// Execute the database query to fetch unique payment dates for a specific ledaId
				const result = await query(
					'SELECT DISTINCT "date" FROM maint.leda_maint_player_payment_history WHERE "ledaId" = $1 ORDER BY "date";',
					[req.query.ledaId as string]
				);
				// Always ensure we return an array, even if result.rows is undefined or empty
				res.status(200).json(result.rows || []);
			} catch (error) {
				// Handle any errors that occur during the query
				console.error(
					"Failed to fetch unique payment dates for ledaId:",
					error
				);
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
				res.status(200).json(result.rows || []);
			} catch (error) {
				// Handle any errors that occur during the query
				console.error("Failed to fetch unique payment dates:", error);
				res.status(500).json({
					message: "Failed to fetch unique payment dates",
					error,
				});
			}
		}
	} else {
		// Handle unsupported HTTP methods
		res.setHeader("Allow", ["GET"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
