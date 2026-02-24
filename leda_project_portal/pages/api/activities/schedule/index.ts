import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { query } from "@/lib/dbTypeGet";
import { ScheduleData } from "@/lib/schedule";
import { requireApiSession } from "@/lib/require-session";

interface NormalizedScheduleRow {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	teamId: string;
	teamName: string;
	teamLetter: string;
	oppTeamId: string;
	oppTeamLetter: string;
	matchDateTime: string | Date; // Can be string or Date object from PostgreSQL
	home: boolean;
}

// Transform normalized rows into nested schedule structure
function transformToNestedSchedule(rows: NormalizedScheduleRow[]): ScheduleData {
	const scheduleData: ScheduleData = {};

	for (const row of rows) {
		// Initialize division if needed
		if (!scheduleData[row.division]) {
			scheduleData[row.division] = {};
		}

		// Initialize subdivision if needed
		if (!scheduleData[row.division][row.subdivision]) {
			scheduleData[row.division][row.subdivision] = {};
		}

		// Initialize team if needed
		if (!scheduleData[row.division][row.subdivision][row.teamLetter]) {
			scheduleData[row.division][row.subdivision][row.teamLetter] = {
				teamName: row.teamName,
				teamId: row.teamId,
				matchesData: {},
			};
		}

		// Parse timestamp into date and time
		// PostgreSQL returns matchDateTime as a Date object
		let matchDate: string;
		let matchTime: string;
		
		if (row.matchDateTime instanceof Date) {
			// Handle Date object from PostgreSQL
			matchDate = row.matchDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
			matchTime = row.matchDateTime.toTimeString().slice(0, 5); // HH:MM
		} else if (typeof row.matchDateTime === 'string') {
			// Handle string format "YYYY-MM-DD HH:MM:SS"
			const [datePart, timePart] = row.matchDateTime.split(' ');
			matchDate = datePart;
			matchTime = timePart ? timePart.slice(0, 5) : '19:00';
		} else {
			// Fallback default values
			matchDate = new Date().toISOString().split('T')[0];
			matchTime = '19:00';
		}

		// Add match data
		const weekKey = `week${row.weekNum}`;
		scheduleData[row.division][row.subdivision][row.teamLetter].matchesData[weekKey] = {
			matchDate,
			matchTime,
			home: row.home,
			opposingTeamId: row.oppTeamId,
			opposingTeamLetter: row.oppTeamLetter,
			subdivisionId: `${row.division}-${row.subdivision}`,
		};
	}

	return scheduleData;
}

// Transform nested schedule structure into normalized rows
function transformToNormalizedRows(seasonCode: string, scheduleData: ScheduleData): Array<{
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	teamId: string;
	teamName: string;
	teamLetter: string;
	oppTeamId: string;
	oppTeamLetter: string;
	matchDateTime: string;
	home: boolean;
}> {
	const rows: Array<{
		seasonCode: string;
		weekNum: number;
		division: string;
		subdivision: string;
		teamId: string;
		teamName: string;
		teamLetter: string;
		oppTeamId: string;
		oppTeamLetter: string;
		matchDateTime: string;
		home: boolean;
	}> = [];

	for (const [division, subdivisions] of Object.entries(scheduleData)) {
		for (const [subdivision, teams] of Object.entries(subdivisions)) {
			for (const [teamLetter, teamData] of Object.entries(teams)) {
				for (const [weekKey, matchData] of Object.entries(teamData.matchesData)) {
					// Extract week number from weekKey (e.g., "week1" -> 1)
					const weekNum = parseInt(weekKey.replace('week', ''));

					// Combine date and time into timestamp
					const matchDateTime = `${matchData.matchDate} ${matchData.matchTime}:00`;

					rows.push({
						seasonCode,
						weekNum,
						division,
						subdivision,
						teamId: teamData.teamId,
						teamName: teamData.teamName,
						teamLetter,
						oppTeamId: matchData.opposingTeamId,
						oppTeamLetter: matchData.opposingTeamLetter,
						matchDateTime,
						home: matchData.home,
					});
				}
			}
		}
	}

	return rows;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;

	if (req.method === "POST") {
		const data = req.body as { seasonCode: string; scheduleData: ScheduleData };
		try {
			// Delete existing schedule for this season
			await queryPost(
				`DELETE FROM public.leda_schedule WHERE "seasonCode" = $1`,
				[data.seasonCode]
			);

			// Transform nested structure to normalized rows
			const rows = transformToNormalizedRows(data.seasonCode, data.scheduleData);

			// Insert all rows in a single batch query
			if (rows.length > 0) {
				// Build batch insert query with multiple value sets
				const valueParams: any[] = [];
				const valueSets: string[] = [];
				
				rows.forEach((row, index) => {
					const baseIndex = index * 11; // 11 columns per row
					valueSets.push(
						`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11})`
					);
					valueParams.push(
						row.seasonCode,
						row.weekNum,
						row.division,
						row.subdivision,
						row.teamId,
						row.teamName,
						row.teamLetter,
						row.oppTeamId,
						row.oppTeamLetter,
						row.matchDateTime,
						row.home
					);
				});

				const batchInsertQuery = `
					INSERT INTO public.leda_schedule (
						"seasonCode", "weekNum", division, subdivision,
						"teamId", "teamName", "teamLetter",
						"oppTeamId", "oppTeamLetter", "matchDateTime", home
					) VALUES ${valueSets.join(', ')}
				`;

				await queryPost(batchInsertQuery, valueParams);
			}

			res.status(201).json({ message: "Schedule saved successfully" });
		} catch (error) {
			console.error("Error saving schedule:", error);
			res.status(500).json({
				message: "Failed to upsert schedule information",
				error,
			});
		}
	} else if (req.method === "GET") {
		if (req.query.seasonCode) {
			try {
				const seasonCode = req.query.seasonCode as string;
				
				// Query ALL matchups for the season from the normalized schedule table
				// This includes all teams (including BYE teams with ID "0"), all divisions,
				// all subdivisions, and all weeks for the specified season
				const result = await query<NormalizedScheduleRow>(
					`SELECT "seasonCode", "weekNum", division, subdivision,
					        "teamId", "teamName", "teamLetter",
					        "oppTeamId", "oppTeamLetter", "matchDateTime", home
					 FROM public.leda_schedule
					 WHERE "seasonCode" = $1
					 ORDER BY "weekNum", division, subdivision, "teamLetter"`,
					[seasonCode]
				);

				if (result.rows.length === 0) {
					res.status(404).json({
						message: "No schedule information found for the specified season code",
					});
				} else {
					// Transform normalized rows back to nested structure for UI compatibility
					// This groups matchups by division > subdivision > team > week
					const scheduleData = transformToNestedSchedule(result.rows);
					res.status(200).json({
						seasonCode,
						scheduleData,
					});
				}
			} catch (error) {
				console.error("Error fetching schedule:", error);
				res.status(500).json({
					message: "Failed to fetch schedule information",
					error,
				});
			}
		} else {
			res.status(400).json({ message: "Season code is required" });
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
