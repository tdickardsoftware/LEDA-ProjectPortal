/**
 * API route for managing individual player mention history records.
 *
 * POST   - Inserts a new mention history entry with an Eastern-time timestamp.
 * GET    - Retrieves mention history; supports three filter combinations:
 *            ledaId + seasonCode + weekNum + teamId  → single week records
 *            ledaId + seasonCode + teamId           → full season records
 *            ledaId only                            → all records for a player
 * PUT    - Updates an existing mention history record by mentionId.
 * DELETE - Bulk deletes by matchup (seasonCode+weekNum+homeTeamId+awayTeamId)
 *          or individual delete by mentionId.
 */
import { MentionPlayerHistory } from "@/lib/definitions";
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle POST requests
	if (req.method === "POST") {
		try {
			const data = req.body as MentionPlayerHistory;
			const query = `INSERT INTO public.leda_player_mention_history("ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", "count", "teamId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;
			const values = [
				data.ledaId,
				data.mentionCode,
				data.mentionDesc,
				data.mentionPoints,
				data.seasonCode,
				data.weekNum,
				data.notes,
				new Date(
					new Date().toLocaleString("en-US", {
						timeZone: "America/New_York",
					})
				),
				data.mentionId,
				data.count,
				data.teamId,
			];

			const result = await queryPost(query, values);
			res.status(200).json({
				message: "Mention history added successfully",
				result,
			});
		} catch (error) {
			res.status(500).json({
				message: "Failed to add mention history",
				error,
			});
		}
	} else if (req.method === "GET") {
		// GET: fetch mention history, filtered by ledaId + optional seasonCode/weekNum/teamId
		if (
			req.query.ledaId &&
			req.query.seasonCode &&
			req.query.weekNum &&
			req.query.teamId
		) {
			const ledaId = req.query.ledaId as string;
			const seasonCode = req.query.seasonCode as string;
			const weekNum = req.query.weekNum as string;
			const teamId = req.query.teamId as string;
			try {
				const result = await query<MentionPlayerHistory>(
					`SELECT "ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", "count" FROM public.leda_player_mention_history WHERE "ledaId" = $1 and "seasonCode" = $2 and "weekNum" = $3 and "teamId" = $4 ORDER BY "creationDate" DESC;`,
					[ledaId, seasonCode, weekNum, teamId]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch mention history",
					error,
				});
			}
		} else if (
			req.query.ledaId &&
			req.query.seasonCode &&
			req.query.teamId
		) {
			const ledaId = req.query.ledaId as string;
			const seasonCode = req.query.seasonCode as string;
			const teamId = req.query.teamId as string;
			try {
				const result = await query<MentionPlayerHistory>(
					`SELECT "ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", "count" FROM public.leda_player_mention_history WHERE "ledaId" = $1 and "seasonCode" = $2 and "teamId" = $3 ORDER BY "creationDate" DESC;`,
					[ledaId, seasonCode, teamId]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch mention history",
					error,
				});
			}
		} else if (req.query.ledaId) {
			try {
				const ledaId = req.query.ledaId as string;
				const result = await query<MentionPlayerHistory>(
					`SELECT "ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", "count" FROM public.leda_player_mention_history WHERE "ledaId" = $1 ORDER BY "creationDate" DESC;`,
					[ledaId]
				);
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch mention history",
					error,
				});
			}
		}
	} else if (req.method === "PUT") {
		// PUT: update an existing mention record fields by mentionId
		try {
			const data = req.body as MentionPlayerHistory;
			const query = `UPDATE public.leda_player_mention_history SET "mentionCode" = $1, "mentionDesc" = $2, "mentionPoints" = $3, notes = $4, "creationDate" = $5, "count" = $6 WHERE "mentionId" = $7 and "seasonCode" = $8 and "weekNum" = $9 and "ledaId" = $10 and "teamId" = $11;`;
			const values = [
				data.mentionCode,
				data.mentionDesc,
				data.mentionPoints,
				data.notes,
				new Date(
					new Date().toLocaleString("en-US", {
						timeZone: "America/New_York",
					})
				),
				data.count,
				data.mentionId,
				data.seasonCode,
				data.weekNum,
				data.ledaId,
				data.teamId,
			];

			const result = await queryPost(query, values);
			res.status(200).json({
				message: "Mention history updated successfully",
				result,
			});
		} catch (error) {
			res.status(500).json({
				message: "Failed to update mention history",
				error,
			});
		}
	} else if (req.method === "DELETE") {
		// Bulk delete by matchup (seasonCode + weekNum + homeTeamId + awayTeamId)
		if (req.query.seasonCode && req.query.weekNum && req.query.homeTeamId && req.query.awayTeamId) {
			try {
				const result = await query(
					`DELETE FROM public.leda_player_mention_history WHERE "seasonCode" = $1 AND "weekNum" = $2 AND "teamId" IN ($3, $4)`,
					[
						req.query.seasonCode as string,
						req.query.weekNum as string,
						req.query.homeTeamId as string,
						req.query.awayTeamId as string,
					]
				);
				res.status(200).json({ message: "Mention history deleted successfully", result });
			} catch (error) {
				res.status(500).json({ message: "Failed to delete mention history", error });
			}
		} else {
			// Single mention delete by ID (existing behaviour)
			try {
				const data = req.body as MentionPlayerHistory;
				const q = `DELETE FROM public.leda_player_mention_history WHERE "mentionId" = $1 and "seasonCode" = $2 and "weekNum" = $3 and "ledaId" = $4 and "teamId" = $5;`;
				const values = [
					data.mentionId,
					data.seasonCode,
					data.weekNum,
					data.ledaId,
					data.teamId,
				];

				const result = await queryPost(q, values);
				res.status(200).json({
					message: "Mention history deleted successfully",
					result,
				});
			} catch (error) {
				res.status(500).json({
					message: "Failed to delete mention history",
					error,
				});
			}
		}
	} else {
		res.status(405).json({
			message: "Method not allowed",
		});
	}
}
