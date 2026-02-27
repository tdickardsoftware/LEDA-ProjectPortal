/**
 * API Route: /api/activities/scoresheets/playerPoints
 *
 * POST — Upserts weekly player point totals (cumulative). Automatically
 *          fetches the previous week's running total and propagates any
 *          point delta forward through all subsequent weeks.
 * GET  — Retrieves player point data filtered by various combinations of
 *          seasonCode, weekNum, ledaId, teamLedaId, division, and subdivision.
 *          Supports report views for top-darter totals and per-week breakdowns.
 * Requires an authenticated session.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import {
	PlayerPoints,
	TopDarterTotals,
	WeeklyTopDarterScores,
} from "@/lib/definitions";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "POST") {
		try {
			const data = req.body as PlayerPoints;
			let originalTotalPoints = 0;
			let isUpdate = false;

			// Check if this is an update to an existing record
			try {
				const existingRecord = await query<PlayerPoints>(
					`SELECT "totalPoints" FROM public.leda_weekly_player_points WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "division" = $3 AND "subdivision" = $4 AND "ledaId" = $5 AND "teamLedaId" = $6`,
					[
						data.seasonCode,
						data.weekNum,
						data.division,
						data.subdivision,
						data.ledaId,
						data.teamLedaId,
					]
				);
				if (existingRecord.rows.length > 0) {
					originalTotalPoints = existingRecord.rows[0].totalPoints;
					isUpdate = true;
				}
			} catch (error) {
				console.error("Error checking for existing record:", error);
				// Continue processing despite this error
			}

			if (data.weekNum != 1) {
				try {
					const queryText = `SELECT "totalPoints" from public.leda_weekly_player_points where "seasonCode" = $1 and "weekNum" = $2 and "division" = $3 and "subdivision" = $4 and "ledaId" = $5 and "teamLedaId" = $6`;
					const values = [
						data.seasonCode,
						data.weekNum - 1,
						data.division,
						data.subdivision,
						data.ledaId,
						data.teamLedaId,
					];
					const result = await query<PlayerPoints>(queryText, values);
					if (result.rows.length !== 0) {
						data.prevTotalPoints = result.rows[0].totalPoints;
					} else {
						data.prevTotalPoints = 0;
					}
				} catch (error) {
					console.error(
						"Failed to fetch previous weekly player points:",
						error
					);
					res.status(500).json({
						message:
							"Failed to fetch previous weekly player points information",
						error:
							error instanceof Error
								? error.message
								: String(error),
					});
					return;
				}
			} else {
				data.prevTotalPoints = 0;
			}

			try {
				const newTotalPoints =
					Number(data.prevTotalPoints) + Number(data.totalPoints);
				const queryString = `
                    INSERT INTO public.leda_weekly_player_points ("seasonCode", "weekNum", "division", "subdivision", "ledaId", "prevTotalPoints", "totalPoints", "teamLedaId")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT ("seasonCode", "weekNum", "division", "subdivision", "ledaId", "teamLedaId")
                    DO UPDATE SET "prevTotalPoints" = $6, "totalPoints" = $7;
                `;
				const values = [
					data.seasonCode,
					data.weekNum,
					data.division,
					data.subdivision,
					data.ledaId,
					data.prevTotalPoints,
					newTotalPoints,
					data.teamLedaId,
				];
				const result = await queryPost(queryString, values);

				// If this is an update and the total points have changed, update subsequent weeks
				if (isUpdate && originalTotalPoints !== newTotalPoints) {
					try {
						await updateSubsequentWeeks(
							data.seasonCode,
							data.weekNum,
							data.division,
							data.subdivision,
							data.ledaId.toString(),
							data.teamLedaId.toString(),
							newTotalPoints - originalTotalPoints
						);
					} catch (updateError) {
						console.error(
							"Error updating subsequent weeks:",
							updateError
						);
						// Don't fail the whole request if just the propagation fails
						// Consider returning a partial success message
					}
				}

				res.status(201).json(result);
			} catch (error) {
				console.error("Failed to upsert weekly player points:", error);
				res.status(500).json({
					message:
						"Failed to upsert weekly player points information",
					error:
						error instanceof Error ? error.message : String(error),
				});
			}
		} catch (error) {
			console.error("Unexpected error in POST handler:", error);
			res.status(500).json({
				message: "Unexpected error processing the request",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	} else if (req.method === "GET") {
		if (req.query.seasonCode && req.query.weekNum && req.query.ledaId && req.query.teamLedaId && req.query.division && req.query.subdivision) {
			try {
				const seasonCode = req.query.seasonCode;
				const weekNum = req.query.weekNum;
				const ledaId = req.query.ledaId;
				const teamLedaId = req.query.teamLedaId;
				const division = req.query.division;
				const subdivision = req.query.subdivision;
				const result = await query<PlayerPoints>(
					`SELECT * FROM public.leda_weekly_player_points WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "division" = $3 AND "subdivision" = $4 AND "ledaId" = $5 and "teamLedaId" = $6`,
					[
						seasonCode as string,
						weekNum as string,
						division as string,
						subdivision as string,
						ledaId as string,
						teamLedaId as string,
					]
				);
				if (result.rows.length !== 0) {
					res.status(200).json(result.rows[0]);
				} else {
					res.status(404).json({
						message:
							"No weekly player points information found for the specified season code, weekNum, and TeamId",
					});
				}
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch weekly team scores information",
					error,
				});
			}
		} else if (
			req.query.viewPlayerTopDarterPoints === "true" &&
			req.query.ledaId
		) {
			const ledaId = req.query.ledaId;
			const result = await query<TopDarterTotals>(
				`SELECT DISTINCT ON ("seasonCode") "seasonCode", "totalPoints"
				FROM public.leda_weekly_player_points
				WHERE "ledaId" = $1
				ORDER BY "seasonCode", "weekNum" DESC`,
				[ledaId as string]
			);
			res.status(200).json(result.rows);
		} else if (
			req.query.getSeasonWeekPoints === "true" &&
			req.query.seasonCode &&
			req.query.ledaId
		) {
			const seasonCode = req.query.seasonCode;
			const ledaId = req.query.ledaId;
			const result = await query<WeeklyTopDarterScores>(
				`SELECT lwpp."weekNum", lwpp."totalPoints",
				CONCAT('Game ', lwpp."weekNum") as "gameName",
				(lwpp."totalPoints" - lwpp."prevTotalPoints") as "changeBy",
				lwpp."prevTotalPoints",
				lwpp."teamLedaId",
				lti."teamName"
				FROM public.leda_weekly_player_points lwpp
				LEFT JOIN public.leda_team_info lti ON lwpp."teamLedaId" = lti."ledaId"
				WHERE lwpp."seasonCode" = $1 AND lwpp."ledaId" = $2
				ORDER BY lwpp."teamLedaId", lwpp."weekNum"`,
				[seasonCode as string, ledaId as string]
			);
			res.status(200).json(result.rows);
		} else if (req.query.seasonCode) {
			const seasonCode = req.query.seasonCode;
			const result = await query<PlayerPoints>(
				`SELECT * FROM public.leda_weekly_player_points WHERE "seasonCode" = $1`,
				[seasonCode as string]
			);
			if (result.rows.length !== 0) {
				res.status(200).json(result.rows);
			} else {
				res.status(404).json({
					message:
						"No weekly player points information found for the specified season code",
				});
			}
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}

// Function to update all subsequent weeks when a week's points are updated
/**
 * Cascades a point delta forward through all recorded weeks after the
 * edited week, keeping prevTotalPoints and totalPoints consistent for
 * the given player within a season/division/subdivision.
 */
async function updateSubsequentWeeks(
	seasonCode: string,
	weekNum: number,
	division: string,
	subdivision: string,
	ledaId: string,
	teamLedaId: string,
	pointDifference: number
) {

	try {
		// Get all subsequent weeks for this player
		const subsequentWeeks = await query<PlayerPoints>(
			`SELECT * FROM public.leda_weekly_player_points 
             WHERE "seasonCode" = $1 AND "weekNum" > $2 AND "division" = $3 AND "subdivision" = $4 AND "ledaId" = $5 AND "teamLedaId" = $6
             ORDER BY "weekNum" ASC`,
			[seasonCode, weekNum, division, subdivision, ledaId, teamLedaId]
		);
		// Process each subsequent week
		for (const week of subsequentWeeks.rows) {
			// Calculate new values
			const newPrevTotalPoints =
				Number(week.prevTotalPoints) + Number(pointDifference);
			const weeklyPoints = week.totalPoints - week.prevTotalPoints; // Extract just this week's points
			const newTotalPoints =
				Number(newPrevTotalPoints) + Number(weeklyPoints);

			// Sanity check for unusual values
			if (Math.abs(pointDifference) > 100 || newTotalPoints > 1000) {
				console.warn(
					`Potentially incorrect point calculation detected for Week ${week.weekNum}!`
				);
			}

			// Update the database
			await queryPost(
				`UPDATE public.leda_weekly_player_points 
                 SET "prevTotalPoints" = $1, "totalPoints" = $2
                 WHERE "seasonCode" = $3 AND "weekNum" = $4 AND "division" = $5 AND "subdivision" = $6 AND "ledaId" = $7 AND "teamLedaId" = $8`,
				[
					newPrevTotalPoints,
					newTotalPoints,
					seasonCode,
					week.weekNum,
					week.division,
					week.subdivision,
					ledaId,
					teamLedaId,
				]
			);

			// Log the completed update
		}
	} catch (error) {
		console.error("Error in updateSubsequentWeeks:", error);
		throw new Error(
			`Failed to update subsequent weeks: ${
				error instanceof Error ? error.message : String(error)
			}`
		);
	}
}
