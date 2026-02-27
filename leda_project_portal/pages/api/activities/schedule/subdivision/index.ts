/**
 * API Route: /api/activities/schedule/subdivision
 *
 * GET — Returns the match schedule for a single subdivision within a season.
 *        Requires seasonCode, division, and subdivision query params.
 *        Transforms normalised rows into the nested ScheduleData structure.
 * Requires an authenticated session.
 */
import { NextApiRequest, NextApiResponse } from "next";
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
	matchDateTime: string | Date;
	home: boolean;
}

// Transform normalized rows into nested schedule structure for a single subdivision
function transformSubdivisionToNested(rows: NormalizedScheduleRow[]): ScheduleData {
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
		let matchDate: string;
		let matchTime: string;
		
		if (row.matchDateTime instanceof Date) {
			matchDate = row.matchDateTime.toISOString().split('T')[0];
			matchTime = row.matchDateTime.toTimeString().slice(0, 5);
		} else if (typeof row.matchDateTime === 'string') {
			const [datePart, timePart] = row.matchDateTime.split(' ');
			matchDate = datePart;
			matchTime = timePart ? timePart.slice(0, 5) : '19:00';
		} else {
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

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;

	if (req.method === "GET") {
		const { seasonCode, division, subdivision } = req.query;


		if (!seasonCode || !division || !subdivision) {
			return res.status(400).json({
				message: "Missing required parameters: seasonCode, division, subdivision",
			});
		}

		try {
			// Query matchups for specific subdivision
			const result = await query<NormalizedScheduleRow>(
				`SELECT "seasonCode", "weekNum", division, subdivision,
				        "teamId", "teamName", "teamLetter",
				        "oppTeamId", "oppTeamLetter", "matchDateTime", home
				 FROM public.leda_schedule
				 WHERE "seasonCode" = $1 AND division = $2 AND subdivision = $3
				 ORDER BY "weekNum", "teamLetter"`,
				[seasonCode as string, division as string, subdivision as string]
			);


			// Transform to nested structure
			const scheduleData = transformSubdivisionToNested(result.rows);


			res.status(200).json({
				seasonCode,
				division,
				subdivision,
				scheduleData,
			});
		} catch (error) {
			console.error("Error fetching subdivision schedule:", error);
			res.status(500).json({
				message: "Failed to fetch subdivision schedule",
				error,
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
