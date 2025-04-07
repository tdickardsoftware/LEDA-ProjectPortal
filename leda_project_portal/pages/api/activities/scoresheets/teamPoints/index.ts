import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { TeamPoints } from "@/lib/definitions";
import { query } from "@/lib/dbTypeGet";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const data = req.body as TeamPoints;

		if (data.weekNum != 1) {
			try {
				data.prevTotalPoints = await findPrevTotalPoints(
					data.seasonCode,
					data.weekNum,
					data.ledaId
				);
			} catch (error) {
				res.status(500).json({
					message:
						"Failed to fetch previous weekly teams scores information",
					error,
				});
			}
		} else {
			data.prevTotalPoints = 0;
		}
		try {
			const query = `
                INSERT INTO public.leda_weekly_team_scores ("seasonCode", "weekNum", "teamLedaId", "prevTotalPoints", "totalPoints")
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT ("seasonCode", "weekNum", "teamLedaId")
                DO UPDATE SET "totalPoints" = $5;
            `;
			const values = [
				data.seasonCode,
				data.weekNum,
				data.ledaId,
				data.prevTotalPoints,
				Number(data.prevTotalPoints) + Number(data.totalPoints),
			];
			const result = await queryPost(query, values);

			// Update subsequent weeks
			await updateSubsequentWeeks(
				data.seasonCode,
				data.weekNum,
				data.ledaId.toString(),
				Number(data.prevTotalPoints) + Number(data.totalPoints)
			);

			res.status(201).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to upsert weekly team scoresinformation",
				error,
			});
		}
	} else if (req.method === "GET") {
		if (req.query.seasonCode && req.query.weekNum && req.query.teamLedaId) {
			try {
				const seasonCode = req.query.seasonCode;
				const weekNum = req.query.weekNum;
				const teamLedaId = req.query.teamLedaId;
				const result = await query<TeamPoints>(
					`SELECT * FROM public.leda_weekly_team_scores WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "teamLedaId" = $3`,
					[
						seasonCode as string,
						weekNum as string,
						teamLedaId as string,
					]
				);
				if (result.rows.length !== 0) {
					res.status(200).json(result.rows[0]);
				} else {
					res.status(404).json({
						message:
							"No weekly team scores information found for the specified season code, weekNum, and TeamId",
					});
				}
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch weekly team scores information",
					error,
				});
			}
		} else if (
			req.query.seasonCode &&
			req.query.totalWeeks &&
			req.query.teamLedaIds
		) {
			const seasonCode = req.query.seasonCode;
			const totalWeeks = req.query.totalWeeks;

			// Fix for the teamLedaIds type issue
			let teamLedaIds: string[] = [];
			if (Array.isArray(req.query.teamLedaIds)) {
				teamLedaIds = req.query.teamLedaIds;
			} else if (typeof req.query.teamLedaIds === "string") {
				// If it's a comma-separated string, split it
				teamLedaIds = req.query.teamLedaIds.includes(",")
					? req.query.teamLedaIds.split(",")
					: [req.query.teamLedaIds];
			}

			const result = await query<TeamPoints>(
				`
                SELECT 
                    ranked_scores."teamLedaId", 
                    ranked_scores."totalPoints", 
                    tiers."place", 
                    tiers."amount"
                FROM (
                    SELECT 
                        scores."teamLedaId", 
                        scores."totalPoints",
                        ROW_NUMBER() OVER (ORDER BY scores."totalPoints" DESC) as "rank"
                    FROM public.leda_weekly_team_scores AS scores
                    WHERE scores."seasonCode" = $1 
                    AND scores."weekNum" = $2 
                    AND scores."teamLedaId" IN (${teamLedaIds
						.map((id) => `'${id}'`)
						.join(",")})
                ) as ranked_scores
                LEFT JOIN maint.leda_maint_payout_tiers AS tiers
                ON ranked_scores."rank" = tiers."place"
                ORDER BY ranked_scores."totalPoints" DESC
            `,
				[seasonCode as string, totalWeeks as string]
			);
			if (result.rows.length !== 0) {
				res.status(200).json(result.rows);
			} else {
				res.status(404).json({
					message:
						"No weekly team scores information found for the specified season code and team IDs",
				});
			}
		} else if (req.query.seasonCode) {
			const seasonCode = req.query.seasonCode;
			const result = await query<TeamPoints>(
				`SELECT * FROM public.leda_weekly_team_scores WHERE "seasonCode" = $1`,
				[seasonCode as string]
			);
			if (result.rows.length !== 0) {
				res.status(200).json(result.rows);
			} else {
				res.status(404).json({
					message:
						"No weekly team scores information found for the specified season code",
				});
			}
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}

/**
 * Recursively searches for the most recent previous week's points
 * Handles cases where teams might have bye weeks with no records
 */
async function findPrevTotalPoints(
	seasonCode: string,
	currentWeek: number,
	teamLedaId: number
): Promise<number> {
	// Base case: if we've checked all the way to week 1 and found nothing
	if (currentWeek <= 1) {
		return 0;
	}

	// Try to fetch the previous week
	const queryText = `SELECT "totalPoints" from public.leda_weekly_team_scores where "seasonCode" = $1 and "weekNum" = $2 and "teamLedaId" = $3`;
	const values = [seasonCode, currentWeek - 1, teamLedaId];
	const result = await query<TeamPoints>(queryText, values);

	// If we found data for the previous week, return those points
	if (result.rows.length !== 0) {
		return result.rows[0].totalPoints;
	}

	// Otherwise, recursively check the week before
	return findPrevTotalPoints(seasonCode, currentWeek - 1, teamLedaId);
}

/**
 * Updates all subsequent weeks' scores when a previous week's score has been updated
 */
async function updateSubsequentWeeks(
	seasonCode: string,
	currentWeekNum: number,
	teamLedaId: string,
	newTotalPoints: number
): Promise<void> {
	try {
		// Fetch all subsequent weeks for this team
		const subsequentWeeksQuery = `
            SELECT * FROM public.leda_weekly_team_scores 
            WHERE "seasonCode" = $1 
            AND "weekNum" > $2 
            AND "teamLedaId" = $3
            ORDER BY "weekNum" ASC
        `;
		const values = [seasonCode, currentWeekNum, teamLedaId];
		const result = await query<TeamPoints>(subsequentWeeksQuery, values);

		// No subsequent weeks found, nothing to update
		if (result.rows.length === 0) return;

		// Process each subsequent week
		for (const week of result.rows) {
			// Calculate the points scored in this week (difference between total and prev)
			const pointsScored =
				Number(week.totalPoints) - Number(week.prevTotalPoints);

			// Update this week with new prevTotalPoints (which is the newTotalPoints from previous week)
			// and recalculate totalPoints
			const updatedTotalPoints =
				Number(newTotalPoints) + Number(pointsScored);

			const updateQuery = `
                UPDATE public.leda_weekly_team_scores 
                SET "prevTotalPoints" = $1, "totalPoints" = $2
                WHERE "seasonCode" = $3 AND "weekNum" = $4 AND "teamLedaId" = $5
            `;

			await queryPost(updateQuery, [
				newTotalPoints,
				updatedTotalPoints,
				seasonCode,
				week.weekNum,
				teamLedaId,
			]);

			// Update newTotalPoints for the next iteration
			newTotalPoints = updatedTotalPoints;
		}
	} catch (error) {
		console.error("Error updating subsequent weeks:", error);
		// We don't throw here to prevent breaking the main flow
	}
}
