/**
 * API route for temporary player management.
 *
 * GET    — Returns all temporary players.
 * POST   — Creates a new temporary player. Auto-assigns a tempId that is
 *           at least max(leda_player_info.ledaId) + 10000 and also strictly
 *           greater than any existing tempId.
 * DELETE — Deletes a temporary player by ?tempId=.
 * PUT    — Converts a temporary player to a full member when body.action === "convert".
 *           Creates entries in leda_player_info and leda_membership_info, re-keys
 *           all saved scoresheet rows, player-point rows, and mention-history rows
 *           from the old tempId to the new ledaId, then removes the temp record.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";
import { PlayerMemberInfo } from "@/lib/definitions";
import { DatabaseError } from "pg";

const log = createRouteLogger("/api/management/player/temp");

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

	// ── PUT (convert) ────────────────────────────────────────────────────────
	} else if (req.method === "PUT") {
		const { action, tempId, ...playerData } = req.body as {
			action: string;
			tempId: number;
		} & PlayerMemberInfo;

		if (action !== "convert") {
			return res.status(400).json({ message: "Unknown action. Use action=convert." });
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
