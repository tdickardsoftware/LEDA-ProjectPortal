import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlayerMemberInfo } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

// Batch API endpoint for fetching multiple players at once
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed. Use POST." });
	}

	try {
		const { playerIds } = req.body as { playerIds: Array<string | number> };

		if (!Array.isArray(playerIds) || playerIds.length === 0) {
			return res
				.status(400)
				.json({ error: "playerIds array is required and must not be empty" });
		}

		const uniquePlayerIds = [...new Set(playerIds.map((id) => String(id)))].filter(
			(id) => id && typeof id === "string" && id.trim() !== ""
		);

		if (uniquePlayerIds.length === 0) {
			return res.status(400).json({ error: "No valid player IDs provided" });
		}

		// Limit batch size to prevent abuse
		if (uniquePlayerIds.length > 200) {
			return res
				.status(400)
				.json({ error: "Maximum 200 player IDs allowed per batch request" });
		}

		const placeholders = uniquePlayerIds
			.map((_, index) => `$${index + 1}`)
			.join(", ");

		// Mirror the single-player GET shape from /api/management/player?ledaId=...
		const batchQuery = `
			SELECT 
				m."ledaId",
				m."establishedDate",
				m."badStanding",
				m."badStandingReason",
				m."takeOffMailing",
				m."mailStandings",
				m."formOnFile",
				m."needsMemberCard",
				m."inactiveDate",
				m."lastMembershipFeePayment",
				m."lastTrailsDate",
				m."memberType",
				m."cannotBeCaptain",
				m."lifetimeMember",
				m."lifetimeMemberReason",
				p."lastName",
				p."firstName",
				p."middleInitial",
				p."addressOne",
				p."addressTwo",
				p.city,
				p.state,
				p.zip,
				p."phoneNumber",
				p."otherNumber",
				p.email,
				p.gender,
				p."dateOfBirth",
				p."fullName"
			FROM public.leda_membership_info m
			JOIN public.leda_player_info p ON m."ledaId" = p."ledaId"
			WHERE m."ledaId" IN (${placeholders})
		`;

		const result = await query<PlayerMemberInfo>(batchQuery, uniquePlayerIds);

		const playersMap: Record<string, PlayerMemberInfo> = {};
		result.rows.forEach((player) => {
			playersMap[String(player.ledaId)] = player;
		});

		// Ensure caller gets a key for each requested ID
		uniquePlayerIds.forEach((id) => {
			if (!(id in playersMap)) {
				// Leave missing IDs out of DB but include a null marker
				// so clients can reliably map requested -> returned.
				// (Typed as any to avoid widening response type for other consumers.)
				(playersMap as any)[id] = null; // eslint-disable-line @typescript-eslint/no-explicit-any
			}
		});

		return res.status(200).json(playersMap);
	} catch (error) {
		console.error("Batch player fetch error:", error);
		return res.status(500).json({
			error: "Failed to fetch players",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
