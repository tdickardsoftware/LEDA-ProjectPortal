/**
 * API Route: /api/activities/scoresheets
 *
 * POST — Upserts a weekly scoresheet record (scoresheetData + finishedScoresheet flag).
 * GET  — Retrieves scoresheet data filtered by:
 *          • seasonCode + weekNumber → a single week's scoresheet
 *          • seasonCode + countOfFinishedWeeks → count of completed weeks
 *          • seasonCode alone → first scoresheet row for the season
 * Requires an authenticated session.
 */
import { query } from "@/lib/dbTypeGet";
import { WeeklyScoresheet } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/scoresheets");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "POST") {
		log.info({ method: "POST" }, "Upsert weekly scoresheet request");
		// Upsert the weekly scoresheet (scoresheetData and finishedScoresheet) for the given season and week
		const data = req.body as WeeklyScoresheet;
		try {
			const query = `
                INSERT INTO public.leda_weekly_scoresheets ("seasonCode", "weekNum", "scoresheetData", "finishedScoresheet")
                VALUES ($1, $2, $3, $4)
                ON CONFLICT ("seasonCode", "weekNum")
                DO UPDATE SET "scoresheetData" = $3, "finishedScoresheet" = $4;
            `;
			const values = [
				data.seasonCode,
				data.weekNumber,
				data.scoresheetData,
				data.finishedScoresheet, // Save the finishedScoresheet status
			];
			const result = await queryPost(query, values);
			res.status(201).json(result);
		} catch (error) {
			log.error({ err: error }, "Failed to upsert weekly scoresheet");
			res.status(500).json({
				message: "Failed to upsert weekly scoresheet information",
				error,
			});
		}
	} else if (req.method === "GET") {
		// Retrieve scoresheet data based on the provided query parameters
		if (req.query.seasonCode && req.query.weekNumber) {
			try {
				const seasonCode = req.query.seasonCode;
				const weekNumber = req.query.weekNumber;
				const result = await query<WeeklyScoresheet>(
					`SELECT "seasonCode", "weekNum", "scoresheetData" FROM public.leda_weekly_scoresheets WHERE "seasonCode" = $1 AND "weekNum" = $2`,
					[seasonCode as string, weekNumber as string]
				);
				if (result.rows.length !== 0) {
					res.status(200).json(result.rows[0]);
				} else {
					res.status(404).json({
						message:
							"No weekly scoresheet information found for the specified season code and week number",
					});
				}
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch weekly scoresheet information",
					error,
				});
			}
		} else if (req.query.seasonCode && req.query.countOfFinishedWeeks) {
			try {
				// Count how many weeks have been marked as finished for this season
				const seasonCode = req.query.seasonCode;
				const result = await query(
					`SELECT COUNT(*) FROM public.leda_weekly_scoresheets WHERE "seasonCode" = $1 AND "finishedScoresheet" = true`,
					[seasonCode as string]
				);
				if (result.rows.length !== 0) {
					res.status(200).json(result.rows[0]);
				} else {
					res.status(404).json({
						message:
							"No weekly scoresheet information found for the specified season code",
					});
				}
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch weekly scoresheet information",
					error,
				});
			}
		} else if (req.query.seasonCode) {
			try {
				const seasonCode = req.query.seasonCode;
				const result = await query<WeeklyScoresheet>(
					`SELECT "seasonCode", "weekNum", "scoresheetData" FROM public.leda_weekly_scoresheets WHERE "seasonCode" = $1`,
					[seasonCode as string]
				);
				if (result.rows.length !== 0) {
					res.status(200).json(result.rows[0]);
				} else {
					res.status(404).json({
						message:
							"No weekly scoresheet information found for the specified season code",
					});
				}
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch weekly scoresheet information",
					error,
				});
			}
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
