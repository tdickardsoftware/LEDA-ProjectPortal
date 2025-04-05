import { FormattedScoreData } from "@/lib/weekly-scoresheet-definitions";

/**
 * Determines if a matchup is valid (not blank).
 * Checks game participation, win records, and points.
 */
export const isMatchupValid = (
	data: FormattedScoreData,
	divisionName: string,
	subdivisionName: string,
	matchupKey: string
): boolean => {
	const matchupData = data?.[divisionName]?.[subdivisionName]?.[matchupKey];
	if (!matchupData) {
		return false; // No data for this matchup
	}

	// Check if all home team game stats are blank
	const isHomeGameDataBlank = Object.values(
		matchupData.teamInformation["1"].teamMembers
	).every((member) =>
		Object.values(member.gameStats).every((game) => !game)
	);

	// Check if all away team game stats are blank
	const isAwayGameDataBlank = Object.values(
		matchupData.teamInformation["2"].teamMembers
	).every((member) =>
		Object.values(member.gameStats).every((game) => !game)
	);

	// Check if all game wins and points are blank
	const areHomeWinsBlank = Object.values(matchupData.gameInformation).every(
		(game) => !game.homeWin
	);
	const areHomePointsBlank = Object.values(
		matchupData.gameInformation
	).every((game) => game.homePoints === "" || game.homePoints === "0");
	const areAwayPointsBlank = Object.values(
		matchupData.gameInformation
	).every((game) => game.awayPoints === "" || game.awayPoints === "0");

	// Return true if any data is present
	return !(
		isHomeGameDataBlank &&
		isAwayGameDataBlank &&
		areHomeWinsBlank &&
		areHomePointsBlank &&
		areAwayPointsBlank
	);
};
