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
		if (req.query.seasonCode && !req.query.ledaId) {
			try {
				const result = await query<HistoryView>(
					`SELECT "ledaId", "status" FROM public.leda_player_paid_status where "seasonCode" = $1`,
					[req.query.seasonCode as string]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else if (req.query.ledaId && !req.query.seasonCode) {
			try {
				const result = await query<HistoryView>(
					`SELECT "seasonCode", "status", "fiscalYear", "desc" FROM public.leda_player_paid_status where "ledaId" = $1 order by "date1" desc`,
					[req.query.ledaId as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		
		} else if (req.query.seasonCode && req.query.ledaId) {
			try {
				const result = await query<HistoryView>(
					`SELECT "status" FROM public.leda_player_paid_status where "seasonCode" = $1 and "playerid" = $2`,
					[req.query.seasonCode as string, req.query.ledaId as string]
				);
				
				// Check if we have results before trying to access rows[0]
				if (result.rows && result.rows.length > 0) {
					res.status(200).json(result.rows[0]);
				} else {
					// Return an empty object or a default status when no records found
					res.status(200).json({ status: null });
				}
			} catch (error) {
				console.error("Error fetching payment status:", error);
				res.status(500).json({
					message: "Failed to fetch roster information",
					error: String(error),
				});
			}

		}else {
			res.status(400).json({
				message: "seasonCode query parameter is required",
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
