/**
 * API Route: /api/activities/roster
 *
 * GET    — Fetches roster records from leda_roster_info.
 *           Scoped to a single season when `seasonCode` is provided;
 *           returns all seasons otherwise.
 * POST   — Inserts a new roster record for a season.
 * PUT    — Updates teamInformation for an existing season's roster.
 * DELETE — Removes the roster record for the specified season.
 * Requires an authenticated session.
 */
import { query } from "@/lib/dbTypeGet";
import { Roster } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/roster");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch roster");
		if (req.query.seasonCode) {
			try {
				const seasonCode = req.query.seasonCode;
				// Fetch a single season's roster record by season code
				const result = await query<Roster>(
					`SELECT "seasonCode", "teamInformation" FROM public.leda_roster_info WHERE "seasonCode" = $1`,
					[seasonCode as string]
				);
				if (result.rows.length !== 0) {
					res.status(200).json(result.rows[0]);
				} else {
					res.status(404).json({
						message:
							"No roster information found for the specified season code",
					});
				}
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		} else {
			try {
				// No season code provided — return all roster records
				const result = await query<Roster>(
					`SELECT "seasonCode", "teamInformation" FROM public.leda_roster_info`
				);
				res.status(200).json(result);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch roster information",
					error,
				});
			}
		}
	} else if (req.method === "POST") {
		try {
			// Insert a new roster record for the given season
			const data = req.body as Roster;
			const query = `INSERT INTO public.leda_roster_info ("seasonCode", "teamInformation") VALUES ($1, $2);`;
			const values = [data.seasonCode, data.teamInformation];
			const result = await queryPost(query, values);
			res.status(201).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to insert roster information",
				error,
			});
		}
	} else if (req.method === "PUT") {
		try {
			// Update teamInformation for an existing roster record
			const data = req.body as Roster;
			const query = `UPDATE public.leda_roster_info SET "teamInformation" = $2 WHERE "seasonCode" = $1;`;
			const values = [data.seasonCode, data.teamInformation];
			const result = await queryPost(query, values);
			res.status(200).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to update roster information",
				error,
			});
		}
	} else if (req.method === "DELETE") {
		try {
			// Delete roster record for the given season code
			const seasonCode = req.query.seasonCode;
			const query = `DELETE FROM public.leda_roster_info WHERE "seasonCode" = $1;`;
			const values = [seasonCode as string];
			const result = await queryPost(query, values);
			res.status(200).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to delete roster information",
				error,
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method not allowed" });
	}
}
