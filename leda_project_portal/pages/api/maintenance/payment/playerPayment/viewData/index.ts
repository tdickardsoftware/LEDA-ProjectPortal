/**
 * Read-only view endpoint for player payment status.
 *
 * GET - Returns paid/unpaid status for players from leda_player_paid_status.
 *       Supports three query modes:
 *         - ?seasonCode (no ledaId)          → all player statuses for that season
 *         - ?ledaId (no seasonCode)          → most recent status record for that player
 *         - ?seasonCode&ledaId              → status for a specific player+season
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { HistoryView } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/payment/playerPayment/viewData");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch player payment view data request");
		if (req.query.seasonCode && !req.query.ledaId) {
			try {
				// Fetch all player paid statuses for the given season
				const result = await query<HistoryView>(
					`SELECT "ledaId", "status" FROM public.leda_player_paid_status where "seasonCode" = $1`,
					[req.query.seasonCode as string]
				);
				log.info({ seasonCode: req.query.seasonCode, count: result.rows.length }, "Fetched player paid status by season");
				res.status(200).json(result.rows);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch player paid status by season");
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else if (req.query.ledaId && !req.query.seasonCode) {
			try {
				// Fetch the most recent payment status record for a specific player
				const result = await query<HistoryView>(
					`SELECT "seasonCode", "status", "fiscalYear", "desc" FROM public.leda_player_paid_status where "ledaId" = $1 order by "date1" desc`,
					[req.query.ledaId as string]
				);
				log.info({ ledaId: req.query.ledaId }, "Fetched player paid status by ledaId");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch player paid status by ledaId");
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		
		} else if (req.query.seasonCode && req.query.ledaId) {
			try {
				// Fetch paid status for a specific player in a specific season
				const result = await query<HistoryView>(
					`SELECT "status" FROM public.leda_player_paid_status where "seasonCode" = $1 and "playerid" = $2`,
					[req.query.seasonCode as string, req.query.ledaId as string]
				);
				
				// Check if we have results before trying to access rows[0]
				if (result.rows && result.rows.length > 0) {
					log.info({ seasonCode: req.query.seasonCode, ledaId: req.query.ledaId }, "Fetched player paid status by season+player");
					res.status(200).json(result.rows[0]);
				} else {
					// Return an empty object or a default status when no records found
					res.status(200).json({ status: "UNPAID" });
				}
			} catch (error) {
				log.error({ err: error }, "Failed to fetch player paid status by season+player");
				res.status(500).json({
					message: "Failed to fetch roster information",
					error: String(error),
				});
			}

		}else {
			log.warn({ query: req.query }, "Missing seasonCode or ledaId");
			res.status(400).json({
				message: "seasonCode query parameter is required",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
