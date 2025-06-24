// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {
	LeaguePlayMentionsDivisionInfo,
} from "@/lib/definitions";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
			const { seasonCode } = req.query;
			const params = [];
			let whereClause = '';
			if (seasonCode) {
				whereClause = 'WHERE "seasonCode" = $1';
				params.push(seasonCode as string);
			}

			const sql = `
				SELECT "ledaId", "fullName", "isCaptain", "teamId", "teamName", "divisionInfo", "placeId", name, "seasonCode", "mentionCode", "mentionDesc", "weekNum", count, "mentionsCount"
				FROM public.leda_reports_league_play_mentions
				${whereClause}
				ORDER BY "divisionInfo", "teamId", "ledaId", "weekNum", "mentionCode"
			`;

			type LeaguePlayMentionsRow = {
				divisionInfo: string;
				teamId: number;
				teamName: string;
				placeId: number;
				name: string;
				seasonCode: string;
				ledaId: number;
				fullName: string;
				isCaptain: boolean;
				mentionsCount: number;
				weekNum: number;
				mentionCode: string;
				mentionDesc: string;
				count: number;
			};

			const result = await query<LeaguePlayMentionsRow>(sql, params);

			const divisionMap = new Map<string, LeaguePlayMentionsDivisionInfo>();

			for (const row of result.rows) {
				const {
					divisionInfo,
					teamId,
					teamName,
					placeId,
					name,
					seasonCode: rowSeasonCode,
					ledaId,
					fullName,
					isCaptain,
					mentionsCount,
					weekNum,
					mentionCode,
					mentionDesc,
					count
				} = row;

				// Division
				if (!divisionMap.has(divisionInfo)) {
					divisionMap.set(divisionInfo, {
						divisionInfo,
						teams: []
					});
				}
				const division = divisionMap.get(divisionInfo)!;

				// Team
				let team = division.teams.find(t => t.teamId === teamId);
				if (!team) {
					team = {
						teamId,
						teamName,
						divisionInfo,
						placeId,
						name,
						seasonCode: rowSeasonCode,
						players: []
					};
					division.teams.push(team);
				}

				// Player
				let player = team.players.find(p => p.ledaId === ledaId);
				if (!player) {
					player = {
						ledaId,
						fullName,
						isCaptain,
						mentionsCount,
						mentions: []
					};
					team.players.push(player);
				}

				// Mention
				player.mentions.push({
					weekNum,
					mentionCode,
					mentionDesc,
					count
				});
			}

			const structuredResult = Array.from(divisionMap.values());
			res.status(200).json(structuredResult);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch league play mentions report",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}