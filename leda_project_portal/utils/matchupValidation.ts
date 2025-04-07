import { FormattedScoreData } from "@/lib/weekly-scoresheet-definitions";

/**
 * Check if a specific matchup has valid data
 *
 * This function validates that a matchup has all required data populated:
 * - Team information exists for both teams
 * - Team members exist
 * - Game stats are recorded
 * - Game information exists
 * - Team points are calculated
 */
export const isMatchupValid = (
	data: FormattedScoreData,
	division: string,
	subdivision: string,
	matchupKey: string
): boolean => {
	try {
		// Check if division, subdivision, and matchup exist
		if (
			!data[division] ||
			!data[division][subdivision] ||
			!data[division][subdivision][matchupKey]
		) {
			return false;
		}

		const matchupData = data[division][subdivision][matchupKey];

		// Check if teamInformation exists
		if (!matchupData.teamInformation) {
			return false;
		}

		// Get team IDs
		const teamIds = Object.keys(matchupData.teamInformation);
		if (teamIds.length !== 2) {
			return false;
		}

		// Check both teams have necessary data
		for (const teamId of teamIds) {
			const team = matchupData.teamInformation[teamId];

			// Check if team exists and has required properties
			if (!team || !team.teamMembers) {
				return false;
			}

			// Check if team has at least one member
			const teamMemberIds = Object.keys(team.teamMembers);
			if (teamMemberIds.length === 0) {
				return false;
			}

			// Check if game stats are recorded for each member
			for (const memberId of teamMemberIds) {
				const member = team.teamMembers[memberId];
				if (!member || !member.gameStats) {
					return false;
				}

				// Check if at least one game is recorded
				const gameStatsValues = Object.values(member.gameStats);
				if (gameStatsValues.length === 0) {
					return false;
				}
			}
		}

		// Check if game information exists
		if (
			!matchupData.gameInformation ||
			Object.keys(matchupData.gameInformation).length === 0
		) {
			return false;
		}

		// Check if team points are calculated
		if (
			!matchupData.teamPoints ||
			!matchupData.teamPoints.homePoints ||
			!matchupData.teamPoints.awayPoints
		) {
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error validating matchup:", error);
		return false;
	}
};
