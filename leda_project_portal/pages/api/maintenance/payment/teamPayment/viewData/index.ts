/**
 * Read-only view endpoint for team payment status.
 *
 * GET - Returns paid/unpaid status for teams from leda_team_paid_status.
 *       Supports two query modes:
 *         - ?seasonCode  → returns all team statuses for that season
 *         - ?ledaId      → returns the most recent payment record for that team
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { HistoryView } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		if (req.query.seasonCode) {
			try {
				// Fetch all team paid statuses for the given season
				const result = await query<HistoryView>(
					`SELECT "ledaId", "status" FROM public.leda_team_paid_status where "seasonCode" = $1`,
					[req.query.seasonCode as string]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else if (req.query.ledaId) {
			try {
				// Fetch the most recent payment status record for a specific team
				const result = await query<HistoryView>(
					`SELECT "seasonCode", "status", "fiscalYear", "desc" FROM public.leda_team_paid_status where "ledaId" = $1 order by "date1" desc`,
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
				message: "seasonCode query parameter is required",
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
