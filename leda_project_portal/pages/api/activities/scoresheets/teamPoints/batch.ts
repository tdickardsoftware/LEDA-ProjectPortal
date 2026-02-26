/**
 * API Route: /api/activities/scoresheets/teamPoints/batch
 *
 * POST — Accepts a list of team IDs and week numbers and returns a boolean
 *         status map indicating which team+week combinations already have
 *         recorded points. Used to efficiently pre-check scoresheet entry
 *         status without issuing individual per-team requests.
 *         Body: { seasonCode, weekNums[], division, subdivision, teamIds[] }.
 * Requires an authenticated session.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";

interface TeamPointsRow {
	teamLedaId: string;
	weekNum: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;

	if (req.method === "POST") {
		const { seasonCode, weekNums, division, subdivision, teamIds } = req.body as {
			seasonCode: string;
			weekNums: (string | number)[];
			division: string;
			subdivision: string;
			teamIds: (string | number)[];
		};

		if (!seasonCode || !weekNums || !Array.isArray(weekNums) || !division || !subdivision || !teamIds || !Array.isArray(teamIds)) {
			return res.status(400).json({
				message: "Missing required parameters: seasonCode, weekNums[], division, subdivision, teamIds[]",
			});
		}

		if (teamIds.length === 0 || weekNums.length === 0) {
			return res.status(200).json({});
		}

		try {
			// Build parameterized query for batch lookup across all weeks
			const weekNumParams = weekNums.map((_, i) => `$${i + 4}`).join(", ");
			const teamIdStartIdx = 4 + weekNums.length;
			const teamIdParams = teamIds.map((_, i) => `$${teamIdStartIdx + i}`).join(", ");
			
			const queryText = `
				SELECT "teamLedaId", "weekNum"
				FROM public.leda_weekly_team_scores 
				WHERE "seasonCode" = $1 
				AND "division" = $2 
				AND "subdivision" = $3 
				AND "weekNum" IN (${weekNumParams})
				AND "teamLedaId" IN (${teamIdParams})
			`;
			const values = [
				seasonCode,
				division,
				subdivision,
				...weekNums.map(w => w.toString()),
				...teamIds.map(id => id.toString()),
			];

			const result = await query<TeamPointsRow>(queryText, values);

			// Build a map of "teamId-weekNum" -> hasPoints
			const pointsStatusMap: Record<string, boolean> = {};
			
			// Initialize all combinations as false
			weekNums.forEach(week => {
				teamIds.forEach(id => {
					pointsStatusMap[`${id}-${week}`] = false;
				});
			});

			// Mark teams with points as true
			result.rows.forEach(row => {
				pointsStatusMap[`${row.teamLedaId}-${row.weekNum}`] = true;
			});

			res.status(200).json(pointsStatusMap);
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch batch team points status",
				error,
			});
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
