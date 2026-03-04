/**
 * Read-only view endpoint for place payment status.
 *
 * GET - Returns paid/unpaid status for places from leda_place_paid_status.
 *       Supports two query modes:
 *         - ?seasonCode  → returns all place statuses for that season
 *         - ?ledaId      → returns the most recent payment record for that place
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { HistoryView } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/payment/placePayment/viewData");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch place payment view data request");
		if (req.query.seasonCode) {
			try {
				// Fetch all place paid statuses for the given season
				const result = await query<HistoryView>(
					`SELECT "ledaId", "status" FROM public.leda_place_paid_status where "seasonCode" = $1`,
					[req.query.seasonCode as string]
				);
				log.info({ seasonCode: req.query.seasonCode, count: result.rows.length }, "Fetched place paid status by season");
				res.status(200).json(result.rows);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch place paid status by season");
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else if (req.query.ledaId) {
			try {
				// Fetch the most recent payment status record for a specific place
				const result = await query<HistoryView>(
					`SELECT "seasonCode", "status", "fiscalYear", "desc" FROM public.leda_place_paid_status where "ledaId" = $1 order by "date1" desc`,
					[req.query.ledaId as string]
				);
				log.info({ ledaId: req.query.ledaId }, "Fetched place paid status by ledaId");
				res.status(200).json(result.rows[0]);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch place paid status by ledaId");
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else {
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
