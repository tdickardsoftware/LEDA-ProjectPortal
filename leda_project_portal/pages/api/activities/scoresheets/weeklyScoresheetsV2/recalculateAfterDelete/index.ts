import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/activities/scoresheets/weeklyScoresheetsV2/recalculateAfterDelete");
import { TeamPoints, PlayerPoints } from "@/lib/definitions";

/**
 * POST /api/activities/scoresheets/weeklyScoresheetsV2/recalculateAfterDelete
 *
 * After a scoresheet deletion, recalculates and cascades cumulative points for
 * both teams and all their players so that every subsequent week remains accurate.
 *
 * Body: { seasonCode, weekNum, division, subdivision, homeTeamId, awayTeamId }
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;

	if (req.method !== "POST") {
		log.warn({ method: req.method }, "Method not allowed");
		return res.status(405).json({ message: "Method not allowed" });
	}

	log.info({ method: "POST" }, "Recalculate points after scoresheet delete");
	const { seasonCode, weekNum, division, subdivision, homeTeamId, awayTeamId } =
		req.body as {
			seasonCode: string;
			weekNum: number | string;
			division: string;
			subdivision: string;
			homeTeamId: string;
			awayTeamId: string;
		};

	if (!seasonCode || weekNum == null || !division || !subdivision || !homeTeamId || !awayTeamId) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	const weekNumInt = Number(weekNum);
	const errors: string[] = [];

	// -------------------------------------------------------------------------
	// 1. Recalculate team-level cumulative points for both teams
	// -------------------------------------------------------------------------
	for (const teamLedaId of [homeTeamId, awayTeamId]) {
		try {
			// Fetch the deleted week's record (if it still exists) or find the
			// prevTotalPoints anchor from the week before the deletion.
			const prevWeekResult = await query<TeamPoints>(
				`SELECT "totalPoints" FROM public.leda_weekly_team_scores
				 WHERE "seasonCode" = $1 AND "weekNum" < $2
				   AND "division" = $3 AND "subdivision" = $4 AND "teamLedaId" = $5
				 ORDER BY "weekNum" DESC LIMIT 1`,
				[seasonCode, weekNumInt, division, subdivision, teamLedaId]
			);

			// The new "running total" coming into the deleted week is whatever the
			// last surviving prior week recorded, or 0 if this was week 1.
			const anchorTotal =
				prevWeekResult.rows.length > 0
					? Number(prevWeekResult.rows[0].totalPoints)
					: 0;

			// Delete the points row for the removed week (may already be gone, that's fine).
			await queryPost(
				`DELETE FROM public.leda_weekly_team_scores
				 WHERE "seasonCode" = $1 AND "weekNum" = $2
				   AND "division" = $3 AND "subdivision" = $4 AND "teamLedaId" = $5`,
				[seasonCode, weekNumInt, division, subdivision, teamLedaId]
			);

			// Cascade updates to every week that followed.
			await cascadeTeamPoints(
				seasonCode,
				division,
				subdivision,
				weekNumInt,
				teamLedaId,
				anchorTotal
			);
		} catch (err) {
			const msg = `Team points cascade failed for teamLedaId=${teamLedaId}: ${err instanceof Error ? err.message : String(err)}`;
			log.error({ err, teamLedaId }, msg);
			errors.push(msg);
		}
	}

	// -------------------------------------------------------------------------
	// 2. Recalculate player-level cumulative points for both teams
	// -------------------------------------------------------------------------
	for (const teamLedaId of [homeTeamId, awayTeamId]) {
		try {
			// Find every player who had a points record for the deleted week on this team.
			const deletedRows = await query<PlayerPoints>(
				`SELECT * FROM public.leda_weekly_player_points
				 WHERE "seasonCode" = $1 AND "weekNum" = $2
				   AND "division" = $3 AND "subdivision" = $4 AND "teamLedaId" = $5`,
				[seasonCode, weekNumInt, division, subdivision, teamLedaId]
			);

			for (const row of deletedRows.rows) {
				const pointsThisWeek =
					Number(row.totalPoints) - Number(row.prevTotalPoints);

				// Delete the week's record.
				await queryPost(
					`DELETE FROM public.leda_weekly_player_points
					 WHERE "seasonCode" = $1 AND "weekNum" = $2
					   AND "division" = $3 AND "subdivision" = $4
					   AND "ledaId" = $5 AND "teamLedaId" = $6`,
					[
						seasonCode,
						weekNumInt,
						division,
						subdivision,
						row.ledaId,
						teamLedaId,
					]
				);

				// Cascade: every subsequent week loses the contribution this week made.
				if (pointsThisWeek !== 0) {
					await cascadePlayerPoints(
						seasonCode,
						weekNumInt,
						division,
						subdivision,
						row.ledaId.toString(),
						teamLedaId,
						-pointsThisWeek
					);
				}
			}
		} catch (err) {
			const msg = `Player points cascade failed for teamLedaId=${teamLedaId}: ${err instanceof Error ? err.message : String(err)}`;
			log.error({ err, teamLedaId }, msg);
			errors.push(msg);
		}
	}

	if (errors.length > 0) {
		return res.status(207).json({
			message: "Recalculation completed with errors",
			errors,
		});
	}

	return res.status(200).json({ message: "Recalculation completed successfully" });
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * After removing a team's weekly score, walk all later weeks and shift their
 * prevTotalPoints / totalPoints so the running total chain stays consistent.
 */
async function cascadeTeamPoints(
	seasonCode: string,
	division: string,
	subdivision: string,
	deletedWeekNum: number,
	teamLedaId: string,
	anchorTotal: number // running cumulative total of the week BEFORE the deleted one
): Promise<void> {
	const subsequent = await query<TeamPoints>(
		`SELECT * FROM public.leda_weekly_team_scores
		 WHERE "seasonCode" = $1 AND "weekNum" > $2
		   AND "division" = $3 AND "subdivision" = $4 AND "teamLedaId" = $5
		 ORDER BY "weekNum" ASC`,
		[seasonCode, deletedWeekNum, division, subdivision, teamLedaId]
	);

	let runningTotal = anchorTotal;
	for (const week of subsequent.rows) {
		const weeklyPoints =
			Number(week.totalPoints) - Number(week.prevTotalPoints);
		const newTotal = runningTotal + weeklyPoints;

		await queryPost(
			`UPDATE public.leda_weekly_team_scores
			 SET "prevTotalPoints" = $1, "totalPoints" = $2
			 WHERE "seasonCode" = $3 AND "weekNum" = $4
			   AND "division" = $5 AND "subdivision" = $6 AND "teamLedaId" = $7`,
			[
				runningTotal,
				newTotal,
				seasonCode,
				week.weekNum,
				division,
				subdivision,
				teamLedaId,
			]
		);

		runningTotal = newTotal;
	}
}

/**
 * After removing a player's weekly score, shift every subsequent week's
 * prevTotalPoints / totalPoints by the given pointDifference (negative = removal).
 */
async function cascadePlayerPoints(
	seasonCode: string,
	deletedWeekNum: number,
	division: string,
	subdivision: string,
	ledaId: string,
	teamLedaId: string,
	pointDifference: number
): Promise<void> {
	const subsequent = await query<PlayerPoints>(
		`SELECT * FROM public.leda_weekly_player_points
		 WHERE "seasonCode" = $1 AND "weekNum" > $2
		   AND "division" = $3 AND "subdivision" = $4
		   AND "ledaId" = $5 AND "teamLedaId" = $6
		 ORDER BY "weekNum" ASC`,
		[seasonCode, deletedWeekNum, division, subdivision, ledaId, teamLedaId]
	);

	for (const week of subsequent.rows) {
		const newPrev = Number(week.prevTotalPoints) + pointDifference;
		const weeklyPoints = Number(week.totalPoints) - Number(week.prevTotalPoints);
		const newTotal = newPrev + weeklyPoints;

		await queryPost(
			`UPDATE public.leda_weekly_player_points
			 SET "prevTotalPoints" = $1, "totalPoints" = $2
			 WHERE "seasonCode" = $3 AND "weekNum" = $4
			   AND "division" = $5 AND "subdivision" = $6
			   AND "ledaId" = $7 AND "teamLedaId" = $8`,
			[
				newPrev,
				newTotal,
				seasonCode,
				week.weekNum,
				division,
				subdivision,
				ledaId,
				teamLedaId,
			]
		);
	}
}
