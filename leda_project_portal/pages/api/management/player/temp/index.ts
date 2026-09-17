/**
 * API route for temporary player management.
 *
 * GET    — Returns all temporary players.
 * POST   — Creates a new temporary player. Auto-assigns a tempId that is
 *           at least max(leda_player_info.ledaId) + 10000 and also strictly
 *           greater than any existing tempId.
 * DELETE — Deletes a temporary player by ?tempId=.
 * PUT    — body.action === "convert": converts a temporary player to a full member.
 *           Creates entries in leda_player_info and leda_membership_info, re-keys
 *           all saved scoresheet rows, player-point rows, mention-history rows, and
 *           trails history/audit rows from the old tempId to the new ledaId, then
 *           removes the temp record.
 *          body.action === "link": links a temp player to an existing member
 *           (body.ledaId). Re-keys the same tables onto the existing ledaId instead
 *           of creating a new one; any row that would duplicate one the real member
 *           already has is dropped in favor of the real member's row. Trails points
 *           are merged rather than re-keyed: the temp player's running total is
 *           discarded and a fresh audit row is appended for each surviving trails
 *           date on top of whatever total the target member already had.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";
import { PlayerMemberInfo } from "@/lib/definitions";
import { DatabaseError } from "pg";

const log = createRouteLogger("/api/management/player/temp");

// Re-keys every row for `tempId` in `table` onto `newLedaId`. If a row would collide
// with one the target already has (unique constraint on ledaIdColumn + matchColumns),
// the temp duplicate is dropped instead of failing, since the real row is authoritative.
async function migrateTempRows(
	table: string,
	ledaIdColumn: string,
	matchColumns: string[],
	tempId: number | string,
	newLedaId: number | string
): Promise<{ migrated: number; duplicatesDropped: number }> {
	const rows = (
		await query<Record<string, unknown>>(
			`SELECT * FROM public.${table} WHERE "${ledaIdColumn}" = $1`,
			[tempId]
		)
	).rows;

	let migrated = 0;
	let duplicatesDropped = 0;
	for (const row of rows) {
		const matchClause = matchColumns.map((col, i) => `"${col}" = $${i + 3}`).join(" AND ");
		const matchValues = matchColumns.map((col) => row[col]);
		try {
			await queryPost(
				`UPDATE public.${table} SET "${ledaIdColumn}" = $1 WHERE "${ledaIdColumn}" = $2 AND ${matchClause}`,
				[newLedaId, tempId, ...matchValues]
			);
			migrated++;
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				// Target member already has a row for this key; discard the temp duplicate
				await queryPost(
					`DELETE FROM public.${table} WHERE "${ledaIdColumn}" = $1 AND ${matchClause}`,
					[tempId, ...matchValues]
				);
				duplicatesDropped++;
			} else {
				throw error;
			}
		}
	}
	return { migrated, duplicatesDropped };
}

// Merges a temp player's trails history onto `newLedaId`. Trails points totals are a
// running ledger (leda_trails_point_totals_audit.totalPoints carries forward from the
// previous row), so unlike the other tables a plain re-key would leave two independent
// ledgers on the same ledaId instead of one combined total. Raw history rows are moved
// with the usual duplicate-drop-on-conflict behaviour, the temp player's own ledger is
// discarded, and a fresh audit row is appended for each surviving date on top of
// whatever total the target already had.
async function mergeTrailsPoints(
	tempId: number | string,
	newLedaId: number | string
): Promise<{ migrated: number; duplicatesDropped: number }> {
	const targetDatesResult = await query<{ trailsDate: Date }>(
		`SELECT "trailsDate" FROM public.leda_trails_history WHERE "ledaId" = $1`,
		[newLedaId]
	);
	const targetDates = new Set(targetDatesResult.rows.map((r) => new Date(r.trailsDate).getTime()));

	const tempRows = (
		await query<{ trailsDate: Date; trailsPoints: number; singlesPlace: number | null; doublesPlace: number | null }>(
			`SELECT "trailsDate", "trailsPoints", "singlesPlace", "doublesPlace" FROM public.leda_trails_history WHERE "ledaId" = $1`,
			[tempId]
		)
	).rows;

	const { migrated, duplicatesDropped } = await migrateTempRows(
		"leda_trails_history", "ledaId", ["trailsDate"], tempId, newLedaId
	);

	// The temp player's own running total no longer means anything once merged
	await queryPost(`DELETE FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1`, [tempId]);

	const mergedRows = tempRows.filter((row) => !targetDates.has(new Date(row.trailsDate).getTime()));

	if (mergedRows.length > 0) {
		// A merged date can fall anywhere in the target's timeline (not just after their
		// most recent entry), so the whole ledger is rebuilt in trailsDate order and every
		// row's running total is recomputed from scratch. Appending the merge as a single
		// new row instead would leave earlier/later rows with stale totals depending on
		// how a report sorts/picks the "current" row (by trailsDate vs. modifyDate).
		const existingRows = (
			await query<{ modifyDate: Date; trailsDate: Date; changeBy: number; singlesPlace: number | null; doublesPlace: number | null }>(
				`SELECT "modifyDate", "trailsDate", "changeBy", "singlesPlace", "doublesPlace"
				 FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1`,
				[newLedaId]
			)
		).rows;

		type LedgerEntry = {
			modifyDate: Date | null;
			trailsDate: Date;
			changeBy: number;
			singlesPlace: number | null;
			doublesPlace: number | null;
		};
		const combined: LedgerEntry[] = [
			...existingRows.map((r) => ({
				modifyDate: r.modifyDate,
				trailsDate: r.trailsDate,
				changeBy: Number(r.changeBy),
				singlesPlace: r.singlesPlace,
				doublesPlace: r.doublesPlace,
			})),
			...mergedRows.map((r) => ({
				modifyDate: null,
				trailsDate: r.trailsDate,
				changeBy: Number(r.trailsPoints),
				singlesPlace: r.singlesPlace,
				doublesPlace: r.doublesPlace,
			})),
		];
		combined.sort((a, b) => {
			const dateDiff = new Date(a.trailsDate).getTime() - new Date(b.trailsDate).getTime();
			if (dateDiff !== 0) return dateDiff;
			return (a.modifyDate ? new Date(a.modifyDate).getTime() : 0) - (b.modifyDate ? new Date(b.modifyDate).getTime() : 0);
		});

		await queryPost(`DELETE FROM public.leda_trails_point_totals_audit WHERE "ledaId" = $1`, [newLedaId]);

		let runningTotal = 0;
		let latestTrailsDate: Date | null = null;
		const mergeTimestamp = Date.now();
		let mergedIndex = 0;
		for (const entry of combined) {
			const previousTotalPoints = runningTotal;
			runningTotal += entry.changeBy;
			const modifyDate = entry.modifyDate ?? new Date(mergeTimestamp + mergedIndex++);
			await queryPost(
				`INSERT INTO public.leda_trails_point_totals_audit
					("ledaId", "modifyDate", "previousTotalPoints", "totalPoints", "changeBy", "trailsDate", "singlesPlace", "doublesPlace")
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
				[newLedaId, modifyDate, previousTotalPoints, runningTotal, entry.changeBy, entry.trailsDate, entry.singlesPlace, entry.doublesPlace]
			);
			latestTrailsDate = entry.trailsDate;
		}

		if (latestTrailsDate) {
			await queryPost(
				`UPDATE public.leda_membership_info SET "lastTrailsDate" = $2
				 WHERE "ledaId" = $1 AND ("lastTrailsDate" IS NULL OR "lastTrailsDate" < $2)`,
				[newLedaId, latestTrailsDate]
			);
		}
	}

	return { migrated, duplicatesDropped };
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);

	// ── GET ──────────────────────────────────────────────────────────────────
	if (req.method === "GET") {
		log.info({ method: "GET" }, "Fetch all temp players");
		try {
			const result = await query<{
				tempId: number;
				firstName: string;
				middleInitial: string | null;
				lastName: string;
			}>(
				`SELECT "tempId", "firstName", "middleInitial", "lastName"
				 FROM public.leda_temp_player_info
				 ORDER BY "tempId"`
			);
			res.status(200).json(result.rows);
		} catch (error) {
			log.error({ err: error }, "Failed to fetch temp players");
			res.status(500).json({ message: "Failed to fetch temp players", error });
		}

	// ── POST ─────────────────────────────────────────────────────────────────
	} else if (req.method === "POST") {
		log.info({ method: "POST" }, "Create temp player");
		try {
			const { firstName, middleInitial, lastName } = req.body as {
				firstName: string;
				middleInitial?: string;
				lastName: string;
			};

			// tempId must be at least (max player ledaId + 10000) and at least (max existing tempId + 1)
			const playerMaxResult = await query<{ m: string }>(
				`SELECT COALESCE(MAX("ledaId"), 0) AS m FROM public.leda_player_info`
			);
			const tempMaxResult = await query<{ m: string }>(
				`SELECT COALESCE(MAX("tempId"), 0) AS m FROM public.leda_temp_player_info`
			);
			const playerMax = parseInt(playerMaxResult.rows[0].m);
			const tempMax = parseInt(tempMaxResult.rows[0].m);
			const tempId = Math.max(playerMax + 10000, tempMax + 1);

			await queryPost(
				`INSERT INTO public.leda_temp_player_info("tempId", "firstName", "middleInitial", "lastName")
				 VALUES ($1, $2, $3, $4)`,
				[tempId, firstName, middleInitial || null, lastName]
			);

			log.info({ tempId }, "Created temp player");
			res.status(201).json({ tempId, firstName, middleInitial: middleInitial || null, lastName });
		} catch (error) {
			log.error({ err: error }, "Failed to create temp player");
			res.status(500).json({ message: "Failed to create temp player", error });
		}

	// ── DELETE ───────────────────────────────────────────────────────────────
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", tempId: req.query.tempId }, "Delete temp player");
		try {
			const tempId = req.query.tempId as string;
			if (!tempId) {
				return res.status(400).json({ message: "tempId query param is required" });
			}
			await queryPost(
				`DELETE FROM public.leda_temp_player_info WHERE "tempId" = $1`,
				[tempId]
			);
			log.info({ tempId }, "Deleted temp player");
			res.status(200).json({ message: "Temp player deleted" });
		} catch (error) {
			log.error({ err: error }, "Failed to delete temp player");
			res.status(500).json({ message: "Failed to delete temp player", error });
		}

	// ── PUT (convert / link) ─────────────────────────────────────────────────
	} else if (req.method === "PUT") {
		const { action, tempId, ledaId, ...playerData } = req.body as {
			action: string;
			tempId: number;
			ledaId?: number;
		} & PlayerMemberInfo;

		// ── Link to an existing member ──────────────────────────────────────
		if (action === "link") {
			log.info({ method: "PUT", action, tempId, ledaId }, "Link temp player to existing member");
			try {
				const memberCheck = await query<{ ledaId: number }>(
					`SELECT "ledaId" FROM public.leda_player_info WHERE "ledaId" = $1`,
					[ledaId]
				);
				if (memberCheck.rows.length === 0) {
					return res.status(404).json({ message: "Target player not found" });
				}

				const scoresheets = await migrateTempRows(
					"leda_weekly_scoresheets_player_info", "ledaId",
					["seasonCode", "weekNum", "division", "subdivision", "teamId"],
					tempId, ledaId as number
				);
				const playerPoints = await migrateTempRows(
					"leda_weekly_player_points", "ledaId",
					["seasonCode", "weekNum", "division", "subdivision", "teamLedaId"],
					tempId, ledaId as number
				);
				const mentions = await migrateTempRows(
					"leda_player_mention_history", "ledaId",
					["seasonCode", "weekNum", "mentionId", "teamId"],
					String(tempId), String(ledaId)
				);
				const trails = await mergeTrailsPoints(tempId, ledaId as number);

				await queryPost(`DELETE FROM public.leda_temp_player_info WHERE "tempId" = $1`, [tempId]);

				const duplicatesDropped =
					scoresheets.duplicatesDropped + playerPoints.duplicatesDropped +
					mentions.duplicatesDropped + trails.duplicatesDropped;

				log.info({ tempId, ledaId, scoresheets, playerPoints, mentions, trails }, "Linked temp player to existing member");
				res.status(200).json({
					message:
						duplicatesDropped > 0
							? `Link successful. ${duplicatesDropped} duplicate record(s) already existed for this player and were discarded.`
							: "Link successful",
					ledaId,
				});
			} catch (error) {
				log.error({ err: error }, "Failed to link temp player");
				res.status(500).json({ message: (error as Error).message || "Server error" });
			}
			return;
		}

		if (action !== "convert") {
			return res.status(400).json({ message: "Unknown action. Use action=convert or action=link." });
		}

		log.info({ method: "PUT", action, tempId }, "Convert temp player to regular member");

		try {
			// Assign the next available ledaId
			const maxResult = await query<{ next_id: string }>(
				`SELECT COALESCE(MAX("ledaId"), 0) + 1 AS next_id FROM public.leda_player_info`
			);
			const newLedaId = parseInt(maxResult.rows[0].next_id);

			// Build the fullName with optional nickname and middle initial
			const fullName = [
				playerData.firstName,
				playerData.nickname ? `"${playerData.nickname}"` : null,
				playerData.middleInitial || null,
				playerData.lastName,
			].filter(Boolean).join(" ");

			// Insert into leda_player_info
			await queryPost(
				`INSERT INTO public.leda_player_info(
					"ledaId", "lastName", "firstName", "nickname", "middleInitial",
					"addressOne", "addressTwo", "city", "state", "zip",
					"phoneNumber", "otherNumber", "email", "gender", "dateOfBirth", "fullName"
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
				[
					newLedaId,
					playerData.lastName,
					playerData.firstName,
					playerData.nickname || null,
					playerData.middleInitial || null,
					playerData.addressOne,
					playerData.addressTwo || null,
					playerData.city,
					playerData.state,
					playerData.zip,
					playerData.phoneNumber,
					playerData.otherNumber || null,
					playerData.email,
					playerData.gender,
					playerData.dateOfBirth || null,
					fullName,
				]
			);

			// Insert into leda_membership_info
			await queryPost(
				`INSERT INTO public.leda_membership_info(
					"ledaId", "establishedDate", "badStanding", "badStandingReason",
					"takeOffMailing", "mailStandings", "formOnFile", "needsMemberCard",
					"inactiveDate", "lastMembershipFeePayment", "lastTrailsDate",
					"memberType", "cannotBeCaptain", "lifetimeMember", "lifetimeMemberReason"
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
				[
					newLedaId,
					playerData.establishedDate,
					playerData.badStanding,
					playerData.badStandingReason || null,
					playerData.takeOffMailing,
					playerData.mailStandings,
					playerData.formOnFile,
					playerData.needsMemberCard,
					playerData.inactiveDate || null,
					playerData.lastMembershipFeePayment || "UNPAID - New Player",
					playerData.lastTrailsDate || null,
					playerData.memberType,
					playerData.cannotBeCaptain,
					playerData.lifetimeMember,
					playerData.lifetimeMemberReason || null,
				]
			);

			// Re-key all scoresheet player rows
			await queryPost(
				`UPDATE public.leda_weekly_scoresheets_player_info SET "ledaId" = $1 WHERE "ledaId" = $2`,
				[newLedaId, tempId]
			);

			// Re-key all player-point rows
			await queryPost(
				`UPDATE public.leda_weekly_player_points SET "ledaId" = $1 WHERE "ledaId" = $2`,
				[newLedaId, tempId]
			);

			// Re-key all mention history rows (ledaId stored as TEXT)
			await queryPost(
				`UPDATE public.leda_player_mention_history SET "ledaId" = $1 WHERE "ledaId" = $2`,
				[String(newLedaId), String(tempId)]
			);

			// Re-key all trails history rows
			await queryPost(
				`UPDATE public.leda_trails_history SET "ledaId" = $1 WHERE "ledaId" = $2`,
				[newLedaId, tempId]
			);

			// Re-key all trails point totals audit rows
			await queryPost(
				`UPDATE public.leda_trails_point_totals_audit SET "ledaId" = $1 WHERE "ledaId" = $2`,
				[newLedaId, tempId]
			);

			// Remove the temp player record
			await queryPost(
				`DELETE FROM public.leda_temp_player_info WHERE "tempId" = $1`,
				[tempId]
			);

			log.info({ tempId, newLedaId }, "Converted temp player");
			res.status(200).json({ message: "Conversion successful", newLedaId });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				log.warn({ err: error }, "Duplicate ledaId during conversion");
				res.status(422).json({ message: "A player with the same ledaId already exists" });
			} else {
				log.error({ err: error }, "Failed to convert temp player");
				res.status(500).json({ message: (error as Error).message || "Server error" });
			}
		}

	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
