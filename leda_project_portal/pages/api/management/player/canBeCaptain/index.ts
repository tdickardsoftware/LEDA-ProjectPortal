/**
 * Lightweight read endpoint to check whether a specific player is eligible to be a captain.
 *
 * GET - Returns the cannotBeCaptain boolean from leda_membership_info for the given ledaId.
 *       Requires: ledaId query parameter.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.ledaId) {
			try {
				// Check the cannotBeCaptain flag for the given player
				const result = await query(
					`SELECT "cannotBeCaptain" FROM public.leda_membership_info where "ledaId" = $1`,
					[req.query.ledaId as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else {
			res.status(400).json({
				message: "ledaId query parameter is required",
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
