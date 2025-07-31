"use client";

/**
 * Weekly Scoresheets Content Component
 *
 * This component manages the weekly scoresheets for LEDA matches, allowing users to:
 * - Select a season and week
 * - View and select team matchups
 * - Track player participation in games
 * - Record game wins, points, and penalties
 * - Calculate and save team and player points
 *
 * The component handles complex state management for tracking game data,
 * penalties, and point calculations across multiple teams and players.
 */

import { useEffect, useState, useCallback } from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import WeekSelector from "@/components/ui/week-selector";
import {
	scheduleRoute,
	teamRoute,
	playerRoute,
	weeklyScoresheetsRoute,
	mentionPlayerHistoryRoute,
} from "@/lib/apiRoutes";
import FolderTab, { FolderTabMed } from "@/components/ui/folder-tab";
import { Player } from "@/lib/definitions";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import SideNav from "./weekly-scoresheet-sidenav";
import {
	Team,
	DivisionData,
	FormattedScoreData,
	PlayerGameData,
	TeamGameData,
	PlayerPoints,
} from "@/lib/weekly-scoresheet-definitions";
import PenaltyAddForm from "@/components/forms/activities/weekly-scoresheet-add-penalty-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import MentionForm from "@/components/forms/activities/mentions-form";
import { DialogDescription } from "@radix-ui/react-dialog";
import { isMatchupValid } from "@/utils/matchupValidation";

// Utility function: Deep merge two objects
const deepMerge = <
	T extends Record<string, unknown>,
	U extends Record<string, unknown>
>(
	target: T,
	source: U
): T & U => {
	const output = { ...target } as T & U;

	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (isObject(source[key])) {
				if (!(key in target)) {
					(output as Record<string, unknown>)[key] = source[key];
				} else if (isObject(target[key])) {
					(output as Record<string, unknown>)[key] = deepMerge(
						target[key] as Record<string, unknown>,
						source[key] as Record<string, unknown>
					);
				} else {
					(output as Record<string, unknown>)[key] = source[key];
				}
			} else {
				(output as Record<string, unknown>)[key] = source[key];
			}
		});
	}

	return output;
};

// Utility function: Check if an item is an object
const isObject = (item: unknown): item is Record<string, unknown> => {
	return Boolean(item && typeof item === "object" && !Array.isArray(item));
};

// Converts raw schedule data into a structured DivisionData format
const convertScheduleData = (
	sourceData: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
	dateToDisplay: string
): DivisionData => {
	const result: DivisionData = {};

	// Iterate through all divisions
	for (const divisionName in sourceData) {
		result[divisionName] = {};

		// Iterate through all subdivisions
		for (const subdivisionName in sourceData[divisionName]) {
			result[divisionName][subdivisionName] = {};
			let gameCounter = 1;

			// Iterate through all teams
			for (const teamLetter in sourceData[divisionName][
				subdivisionName
			]) {
				const team =
					sourceData[divisionName][subdivisionName][teamLetter];

				// Check each match for this team
				for (const dateKey in team.matchesData) {
					// Skip if it doesn't match the dateToDisplay parameter
					if (dateKey !== dateToDisplay) continue;

					const match = team.matchesData[dateKey];

					// Only create a game entry if this team is the home team (to avoid duplicates)
					if (match.home) {
						result[divisionName][subdivisionName][
							gameCounter.toString()
						] = {
							homeTeamLetter: teamLetter,
							homeTeamId: team.teamId,
							awayTeamLetter: match.opposingTeamLetter,
							awayTeamId: match.opposingTeamId,
						};
						gameCounter++;
					}
				}
			}
		}
	}

	return result;
};

// Utility function to check if all matchups are filled out and valid
const areAllMatchupsValid = (data: FormattedScoreData): boolean => {
	for (const division in data) {
		for (const subdivision in data[division]) {
			for (const matchupKey in data[division][subdivision]) {
				// Use the shared utility function
				if (!isMatchupValid(data, division, subdivision, matchupKey)) {
					console.log(
						`Invalid matchup: ${division} > ${subdivision} > ${matchupKey}`
					);
					return false;
				}
			}
		}
	}
	return true;
};

// Utility to generate empty matchup data for a given matchup
const generateEmptyMatchupData = (
	division: string,
	subdivision: string,
	matchupKey: string,
	homeTeamId: string,
	awayTeamId: string,
	homeTeamLetter: string,
	awayTeamLetter: string,
	homeTeamName: string,
	awayTeamName: string
) => ({
	[division]: {
		[subdivision]: {
			[matchupKey]: {
				teamInformation: {
					[homeTeamId]: {
						teamLetter: homeTeamLetter,
						teamName: homeTeamName,
						home: true,
						teamMembers: {},
						penalties: {},
					},
					[awayTeamId]: {
						teamLetter: awayTeamLetter,
						teamName: awayTeamName,
						home: false,
						teamMembers: {},
						penalties: {},
					},
				},
				gameInformation: {},
				teamPoints: { homePoints: "0", awayPoints: "0" },
			},
		},
	},
});

export default function WeeklyScoresheetsContent({
	renderSeasonCode,
}: {
	renderSeasonCode?: string;
}) {
	// State declarations
	const [seasonCode, setSeasonCode] = useState<string>("");
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [seasonSelected, setSeasonSelected] = useState<boolean>(true);

	// Team and matchup state
	const [sidenavData, setSidenavData] = useState<DivisionData>({});
	const [formattedScoreData, setFormattedScoreData] =
		useState<FormattedScoreData | null>(null);
	const [matchSelected, setMatchSelected] = useState<boolean>(false);
	const [selectedHomeLetter, setSelectedHomeLetter] = useState<string>("");
	const [selectedAwayLetter, setSelectedAwayLetter] = useState<string>("");
	const [selectedDivision, setSelectedDivision] = useState<string>("");
	const [selectedSubdivision, setSelectedSubdivision] = useState<string>("");
	const [selectedHomeTeamId, setSelectedHomeTeamId] = useState<string>("");
	const [selectedAwayTeamId, setSelectedAwayTeamId] = useState<string>("");
	const [homeTeamInformation, setHomeTeamInformation] = useState<Team>();
	const [awayTeamInformation, setAwayTeamInformation] = useState<Team>();
	const [homeTeamPlayerInformation, setHomeTeamPlayerInformation] =
		useState<Player[]>();
	const [awayTeamPlayerInformation, setAwayTeamPlayerInformation] =
		useState<Player[]>();

	// Game data state
	const [homeTeamGameData, setHomeTeamGameData] = useState<TeamGameData>({});
	const [awayTeamGameData, setAwayTeamGameData] = useState<TeamGameData>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Game points and wins state
	const [homeWins, setHomeWins] = useState<boolean[]>(Array(11).fill(false));
	const [homePoints, setHomePoints] = useState<string[]>(Array(11).fill(""));
	const [awayPoints, setAwayPoints] = useState<string[]>(Array(11).fill(""));

	// API operation state
	const [selectedWeek, setSelectedWeek] = useState<string>("");
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isDataChanged, setIsDataChanged] = useState<boolean>(false);

	// Penalty management state
	const [homePenaltyDialogOpen, setHomePenaltyDialogOpen] =
		useState<boolean>(false);
	const [awayPenaltyDialogOpen, setAwayPenaltyDialogOpen] =
		useState<boolean>(false);
	const [selectedPenaltyTeamId, setSelectedPenaltyTeamId] =
		useState<string>("");
	const [selectedPenaltyTeamName, setSelectedPenaltyTeamName] =
		useState<string>("");
	const [penaltyEditMode, setPenaltyEditMode] = useState<boolean>(false);
	const [currentEditingPenalty, setCurrentEditingPenalty] = useState<{
		id: string;
		code: string;
		points: number;
		notes: string;
	} | null>(null);
	const [homePenaltyCounter, setHomePenaltyCounter] = useState<number>(0);
	const [awayPenaltyCounter, setAwayPenaltyCounter] = useState<number>(0);

	// Mentions management state
	const [mentionCounters, setMentionCounters] = useState<
		Record<string, number>
	>({});
	const [mentionDialogOpen, setMentionDialogOpen] = useState<boolean>(false);
	const [selectedPlayerForMention, setSelectedPlayerForMention] = useState<{
		id: string;
		name: string;
		teamId: string;
		teamName: string;
	} | null>(null);
	const [mentionEditMode, setMentionEditMode] = useState<boolean>(false);
	const [currentEditingMention, setCurrentEditingMention] = useState<{
		id: string;
		code: string;
		desc: string;
		points: number;
		notes: string;
		count: number;
	} | null>(null);

	// Use renderSeasonCode if provided
	useEffect(() => {
		if (renderSeasonCode) {
			setSeasonCode(renderSeasonCode);
			setCurrentSeason(false); // Disable current season checkbox when season code is provided
			setSeasonSelected(false); // Allow week selection

			// Call the state reset logic directly instead of calling handleSeasonCodeSelect
			// This avoids the same function being called with the same value multiple times
			setSidenavData({});
			setMatchSelected(false);
			setFormattedScoreData(null);
			setSelectedHomeLetter("");
			setSelectedAwayLetter("");
			// Add other resets as needed
		}
	}, [renderSeasonCode]); // Include renderSeasonCode in dependency array

	// Use renderSeasonCode if provided
	useEffect(() => {
		if (renderSeasonCode) {
			setSeasonCode(renderSeasonCode);
			setCurrentSeason(false); // Disable current season checkbox when season code is provided
			setSeasonSelected(false); // Allow week selection

			// Call the state reset logic directly instead of calling handleSeasonCodeSelect
			// This avoids the same function being called with the same value multiple times
			setSidenavData({});
			setMatchSelected(false);
			setFormattedScoreData(null);
			setSelectedHomeLetter("");
			setSelectedAwayLetter("");
			// Add other resets as needed
		}
	}, [renderSeasonCode]); // Include renderSeasonCode in dependency array

	// Event handlers
	const handleDataChange = () => {
		setIsDataChanged(true);
	};

	const handleSeasonCodeSelect = useCallback((value: string) => {
		setSeasonCode(value);
		setSeasonSelected(false);

		// Reset week-related state when a new season is selected
		setSelectedWeek("");
		setSidenavData({});
		setMatchSelected(false);
		setFormattedScoreData(null);

		// Reset matchup data
		setSelectedHomeLetter("");
		setSelectedAwayLetter("");
		setSelectedDivision("");
		setSelectedSubdivision("");
		setSelectedHomeTeamId("");
		setSelectedAwayTeamId("");

		// Reset team information
		setHomeTeamInformation(undefined);
		setAwayTeamInformation(undefined);
		setHomeTeamPlayerInformation(undefined);
		setAwayTeamPlayerInformation(undefined);

		// Reset game data
		setHomeTeamGameData({});
		setAwayTeamGameData({});

		// Reset game wins and points
		setHomeWins(Array(11).fill(false));
		setHomePoints(Array(11).fill(""));
		setAwayPoints(Array(11).fill(""));

		// Reset penalties and mentions counters
		setHomePenaltyCounter(0);
		setAwayPenaltyCounter(0);
		setMentionCounters({});
	}, []); // Empty dependency array since this function shouldn't change

	const handleMatchupSelection = async (
		homeLetter: string,
		awayLetter: string,
		divisionName: string,
		subdivisionName: string
	) => {
		setMatchSelected(true);
		setIsLoading(true);
		setSelectedDivision(divisionName);
		setSelectedSubdivision(subdivisionName);
		setSelectedHomeLetter(homeLetter);
		setSelectedAwayLetter(awayLetter);

		// Find team IDs from sidenavData
		let homeTeamId = "";
		let awayTeamId = "";
		const games = sidenavData[divisionName]?.[subdivisionName] || {};
		for (const gameNumber in games) {
			const game = games[gameNumber];
			if (
				game.homeTeamLetter === homeLetter &&
				game.awayTeamLetter === awayLetter
			) {
				homeTeamId = game.homeTeamId;
				awayTeamId = game.awayTeamId;
				break;
			}
		}
		setSelectedHomeTeamId(homeTeamId);
		setSelectedAwayTeamId(awayTeamId);

		// Fetch team/player info as before
		const resultsHome = await fetch(teamRoute + `?ledaId=${homeTeamId}`);
		const dataHome = await resultsHome.json();
		setHomeTeamInformation(dataHome);

		const homePlayers: Player[] = [];
		if (dataHome.memberIdList) {
			for (const playerKey in dataHome.memberIdList) {
				const playerInfo = dataHome.memberIdList[playerKey];
				const playerResponse = await fetch(
					playerRoute + `?ledaId=${playerInfo.ledaId}`
				);
				const playerData = await playerResponse.json();
				homePlayers.push(playerData);
			}
		}
		setHomeTeamPlayerInformation(homePlayers);

		const resultsAway = await fetch(teamRoute + `?ledaId=${awayTeamId}`);
		const dataAway = await resultsAway.json();
		setAwayTeamInformation(dataAway);

		const awayPlayers: Player[] = [];
		if (dataAway.memberIdList) {
			for (const playerKey in dataAway.memberIdList) {
				const playerInfo = dataAway.memberIdList[playerKey];
				const playerResponse = await fetch(
					playerRoute + `?ledaId=${playerInfo.ledaId}`
				);
				const playerData = await playerResponse.json();
				awayPlayers.push(playerData);
			}
		}
		setAwayTeamPlayerInformation(awayPlayers);

		// Initialize game data for each player (if not already present in formattedScoreData)
		const matchupKey = `${homeLetter} - ${awayLetter}`;
		const fsd = formattedScoreData || {};
		const matchupData =
			fsd[divisionName]?.[subdivisionName]?.[matchupKey] || {};

		// Home team game data
		const homeGameData: TeamGameData = {};
		homePlayers.forEach((player) => {
			const playerGameData: PlayerGameData = {};
			for (let i = 1; i <= 11; i++) {
				const gameKey = `Game ${i}`;
				playerGameData[gameKey] =
					matchupData?.teamInformation?.[homeTeamId]?.teamMembers?.[player.ledaId]?.gameStats?.[gameKey] ||
					false;
			}
			homeGameData[player.ledaId] = playerGameData;
		});
		setHomeTeamGameData(homeGameData);

		// Away team game data
		const awayGameData: TeamGameData = {};
		awayPlayers.forEach((player) => {
			const playerGameData: PlayerGameData = {};
			for (let i = 1; i <= 11; i++) {
				const gameKey = `Game ${i}`;
				playerGameData[gameKey] =
					matchupData?.teamInformation?.[awayTeamId]?.teamMembers?.[player.ledaId]?.gameStats?.[gameKey] ||
					false;
			}
			awayGameData[player.ledaId] = playerGameData;
		});
		setAwayTeamGameData(awayGameData);

		// Set homeWins, homePoints, awayPoints from matchupData if present
		const gameInformation = matchupData?.gameInformation || {};
		const homeWinsArray = Array(11)
			.fill(false)
			.map((_, i) => gameInformation[`Game ${i + 1}`]?.homeWin || false);
		const homePointsArray = Array(11)
			.fill("")
			.map((_, i) => gameInformation[`Game ${i + 1}`]?.homePoints || "");
		const awayPointsArray = Array(11)
			.fill("")
			.map((_, i) => gameInformation[`Game ${i + 1}`]?.awayPoints || "");
		setHomeWins(homeWinsArray);
		setHomePoints(homePointsArray);
		setAwayPoints(awayPointsArray);

		// Mentions counter logic (preserve existing)
		const newMentionCounters: Record<string, number> = { ...mentionCounters };
		[homeTeamId, awayTeamId].forEach((teamId) => {
			const teamMembers =
				matchupData?.teamInformation?.[teamId]?.teamMembers || {};
			Object.entries(teamMembers).forEach(([playerId, member]) => {
				if (member.mentions) {
					const mentionIds = Object.keys(member.mentions);
					if (mentionIds.length > 0) {
						const maxId = Math.max(...mentionIds.map((id) => parseInt(id)));
						const playerMentionKey = `${teamId}-${playerId}`;
						newMentionCounters[playerMentionKey] = maxId;
					}
				}
			});
		});
		setMentionCounters(newMentionCounters);

		setIsLoading(false);
	};

	const handleDateToDisplay = async (value: string) => {
		const results = await fetch(
			scheduleRoute + `?seasonCode=${seasonCode}`
		);
		const data = await results.json();
		setMatchSelected(false);
		const newSidenavData = convertScheduleData(data.scheduleData, value);
		setSidenavData(newSidenavData);

		// Extract the week number from "DateX" format
		const weekNumber = value.replace("Date", "");
		setSelectedWeek(weekNumber);
		console.log("Selected week:", weekNumber);

		// Fetch existing scoresheet data for the selected week and season code
		let dbScoreData: FormattedScoreData = {};
		try {
			const scoresheetResponse = await fetch(
				`${weeklyScoresheetsRoute}?seasonCode=${seasonCode}&weekNumber=${weekNumber}`
			);
			if (scoresheetResponse.ok) {
				const scoresheetData = await scoresheetResponse.json();
				if (scoresheetData && scoresheetData.scoresheetData) {
					dbScoreData = scoresheetData.scoresheetData;
				}
			}
		} catch (error) {
			console.error("Error fetching scoresheet data:", error);
		}

		// Build all matchups for the week from the schedule
		let allWeekMatchups: FormattedScoreData = {};
		for (const division in newSidenavData) {
			for (const subdivision in newSidenavData[division]) {
				for (const matchupNum in newSidenavData[division][subdivision]) {
					const matchup = newSidenavData[division][subdivision][matchupNum];
					const matchupKey = `${matchup.homeTeamLetter} - ${matchup.awayTeamLetter}`;
					const homeTeamId = matchup.homeTeamId;
					const awayTeamId = matchup.awayTeamId;
					const homeTeamLetter = matchup.homeTeamLetter;
					const awayTeamLetter = matchup.awayTeamLetter;

					// Try to get team names from DB data if available, else fallback to empty string
					const homeTeamName =
						dbScoreData?.[division]?.[subdivision]?.[matchupKey]?.teamInformation?.[homeTeamId]?.teamName || "";
					const awayTeamName =
						dbScoreData?.[division]?.[subdivision]?.[matchupKey]?.teamInformation?.[awayTeamId]?.teamName || "";

					// If matchup exists in DB, use DB data, else generate empty
					const matchupData =
						dbScoreData?.[division]?.[subdivision]?.[matchupKey]
							? {
									[division]: {
										[subdivision]: {
											[matchupKey]:
												dbScoreData[division][subdivision][matchupKey],
										},
									},
							  }
							: generateEmptyMatchupData(
									division,
									subdivision,
									matchupKey,
									homeTeamId,
									awayTeamId,
									homeTeamLetter,
									awayTeamLetter,
									homeTeamName,
									awayTeamName
							  );

					// Deep merge into allWeekMatchups
					allWeekMatchups = deepMerge(allWeekMatchups, matchupData);
				}
			}
		}

		// If DB had extra matchups (e.g. new ones added in DB), merge them in
		if (dbScoreData && Object.keys(dbScoreData).length > 0) {
			allWeekMatchups = deepMerge(allWeekMatchups, dbScoreData);
		}

		setFormattedScoreData(allWeekMatchups);
	};

	const handleGameToggle = (
		teamType: "home" | "away",
		playerId: string,
		gameIndex: number
	) => {
		const gameKey = `Game ${gameIndex + 1}`; // Convert index to "Game X" format

		if (teamType === "home") {
			setHomeTeamGameData((prev) => {
				const playerData = prev[playerId] || {};
				return {
					...prev,
					[playerId]: {
						...playerData,
						[gameKey]: !playerData[gameKey],
					},
				};
			});
		} else {
			setAwayTeamGameData((prev) => {
				const playerData = prev[playerId] || {};
				return {
					...prev,
					[playerId]: {
						...playerData,
						[gameKey]: !playerData[gameKey],
					},
				};
			});
		}
		handleDataChange();
	};

	const handleHomeWinToggle = (gameIndex: number) => {
		setHomeWins((prev) => {
			const newWins = [...prev];
			newWins[gameIndex] = !newWins[gameIndex];
			return newWins;
		});
		handleDataChange();
	};

	const calculatePoints = () => {
		const totalHomeWins = homeWins.filter(Boolean).length;
		const rawHomePoints = totalHomeWins;
		const rawAwayPoints = 11 - totalHomeWins;

		// Calculate penalty totals for both teams - updated for new structure
		let homePenaltyPoints = 0;
		let awayPenaltyPoints = 0;

		// Only calculate penalties if we have formatted score data
		if (formattedScoreData) {
			const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

			// Check if the team exists in the formattedScoreData and has penalties
			if (
				formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[
					matchupKey
				]?.teamInformation?.[selectedHomeTeamId]?.penalties
			) {
				const homePenalties =
					formattedScoreData[selectedDivision][selectedSubdivision][
						matchupKey
					].teamInformation[selectedHomeTeamId].penalties;
				// Sum all penalty points
				homePenaltyPoints = Object.values(homePenalties).reduce(
					(sum, penalty) => sum + penalty.points,
					0
				);
			}

			// Same for away team
			if (
				formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[
					matchupKey
				]?.teamInformation?.[selectedAwayTeamId]?.penalties
			) {
				const awayPenalties =
					formattedScoreData[selectedDivision][selectedSubdivision][
						matchupKey
					].teamInformation[selectedAwayTeamId].penalties;
				// Sum all penalty points
				awayPenaltyPoints = Object.values(awayPenalties).reduce(
					(sum, penalty) => sum + penalty.points,
					0
				);
			}
		}

		// Subtract penalty points from raw points
		const finalHomePoints = Math.max(0, rawHomePoints - homePenaltyPoints);
		const finalAwayPoints = Math.max(0, rawAwayPoints - awayPenaltyPoints);

		return {
			rawHomePoints,
			rawAwayPoints,
			homePenaltyPoints,
			awayPenaltyPoints,
			finalHomePoints,
			finalAwayPoints,
		};
	};

	const handleHomePointsChange = (gameIndex: number, value: string) => {
		setHomePoints((prev) => {
			const newPoints = [...prev];
			newPoints[gameIndex] = value;
			return newPoints;
		});
		handleDataChange();
	};

	const handleAwayPointsChange = (gameIndex: number, value: string) => {
		setAwayPoints((prev) => {
			const newPoints = [...prev];
			newPoints[gameIndex] = value;
			return newPoints;
		});
		handleDataChange();
	};

	const calculatePlayerPoints = () => {
		// Calculate home team player points
		const homePlayerPoints: PlayerPoints[] = [];

		if (homeTeamPlayerInformation) {
			homeTeamPlayerInformation.forEach((player) => {
				const playerGameData = homeTeamGameData[player.ledaId] || {};
				let totalPoints = 0;
				const pointsByGame: Record<string, number> = {};

				// Calculate points for each game
				for (let i = 0; i < 11; i++) {
					const gameKey = `Game ${i + 1}`;
					// If player participated in the game, add the points
					if (playerGameData[gameKey]) {
						const gamePoints = parseInt(homePoints[i]) || 0;
						totalPoints += gamePoints;
						pointsByGame[gameKey] = gamePoints;
					} else {
						pointsByGame[gameKey] = 0;
					}
				}

				// Add mention points to total
				const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
				const playerMentions =
					formattedScoreData?.[selectedDivision]?.[
						selectedSubdivision
					]?.[matchupKey]?.teamInformation?.[selectedHomeTeamId]
						?.teamMembers?.[String(player.ledaId)]?.mentions;

				if (playerMentions && Object.keys(playerMentions).length > 0) {
					const mentionPoints = Object.values(playerMentions).reduce(
						(sum, mention) => sum + mention.points,
						0
					);
					totalPoints += mentionPoints;
				}

				homePlayerPoints.push({
					playerId: String(player.ledaId),
					playerName: player.fullName,
					totalPoints,
					pointsByGame,
				});
			});
		}

		// Calculate away team player points
		const awayPlayerPoints: PlayerPoints[] = [];

		if (awayTeamPlayerInformation) {
			awayTeamPlayerInformation.forEach((player) => {
				const playerGameData = awayTeamGameData[player.ledaId] || {};
				let totalPoints = 0;
				const pointsByGame: Record<string, number> = {};

				// Calculate points for each game
				for (let i = 0; i < 11; i++) {
					const gameKey = `Game ${i + 1}`;
					// If player participated in the game, add the points
					if (playerGameData[gameKey]) {
						const gamePoints = parseInt(awayPoints[i]) || 0;
						totalPoints += gamePoints;
						pointsByGame[gameKey] = gamePoints;
					} else {
						pointsByGame[gameKey] = 0;
					}
				}

				// Add mention points to total
				const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
				const playerMentions =
					formattedScoreData?.[selectedDivision]?.[
						selectedSubdivision
					]?.[matchupKey]?.teamInformation?.[selectedAwayTeamId]
						?.teamMembers?.[String(player.ledaId)]?.mentions;

				if (playerMentions && Object.keys(playerMentions).length > 0) {
					const mentionPoints = Object.values(playerMentions).reduce(
						(sum, mention) => sum + mention.points,
						0
					);
					totalPoints += mentionPoints;
				}

				awayPlayerPoints.push({
					playerId: String(player.ledaId),
					playerName: player.fullName,
					totalPoints,
					pointsByGame,
				});
			});
		}

		// Format data in the requested JSON structure
		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

		// Build gameInformation object
		const gameInformation: Record<
			string,
			{ homeWin: boolean; homePoints: string; awayPoints: string }
		> = {};
		for (let i = 1; i <= 11; i++) {
			gameInformation[`Game ${i}`] = {
				homeWin: homeWins[i - 1],
				homePoints: homePoints[i - 1] || "0",
				awayPoints: awayPoints[i - 1] || "0",
			};
		}

		// Use the same calculation method as displayed in the UI
		const teamPointsCalculation = calculatePoints();

		// Build home team members with mentions preserved
		const homeTeamMembers: Record<
			string,
			{
				name: string;
				gameStats: Record<string, boolean>;
				gamePoints: string;
				mentions?: Record<
					string,
					{
						mentionCode: string;
						desc: string;
						points: number;
						notes: string;
						count?: number;
					}
				>;
			}
		> = {};
		homeTeamPlayerInformation?.forEach((player) => {
			const playerGameStats: Record<string, boolean> = {};
			for (let i = 1; i <= 11; i++) {
				const gameKey = `Game ${i}`;
				playerGameStats[gameKey] =
					homeTeamGameData[player.ledaId]?.[gameKey] || false;
			}

			// Preserve existing mentions data
			const existingMentions =
				formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[
					matchupKey
				]?.teamInformation?.[selectedHomeTeamId]?.teamMembers?.[
					String(player.ledaId)
				]?.mentions;

			homeTeamMembers[String(player.ledaId)] = {
				name: player.fullName,
				gameStats: playerGameStats,
				gamePoints: String(
					homePlayerPoints.find(
						(p) => p.playerId === String(player.ledaId)
					)?.totalPoints || 0
				),
			};

			// Only add mentions if they exist
			if (existingMentions && Object.keys(existingMentions).length > 0) {
				// Convert the mentions to ensure notes is always a string and count is always present
				const formattedMentions: Record<
					string,
					{
						mentionCode: string;
						desc: string;
						points: number;
						notes: string;
						count?: number;
					}
				> = {};

				Object.entries(existingMentions).forEach(([id, mention]) => {
					formattedMentions[id] = {
						mentionCode: mention.mentionCode,
						desc: mention.desc,
						points: mention.points,
						notes: mention.notes || "",
						count: mention.count ?? 0, // Always include count, default to 0 if missing
					};
				});

				homeTeamMembers[String(player.ledaId)].mentions =
					formattedMentions;
			}
		});

		// Build away team members with mentions preserved
		const awayTeamMembers: Record<
			string,
			{
				name: string;
				gameStats: Record<string, boolean>;
				gamePoints: string;
				mentions?: Record<
					string,
					{
						mentionCode: string;
						desc: string;
						points: number;
						notes: string;
						count?: number;
					}
				>;
			}
		> = {};
		awayTeamPlayerInformation?.forEach((player) => {
			const playerGameStats: Record<string, boolean> = {};
			for (let i = 1; i <= 11; i++) {
				const gameKey = `Game ${i}`;
				playerGameStats[gameKey] =
					awayTeamGameData[player.ledaId]?.[gameKey] || false;
			}

			// Preserve existing mentions data
			const existingMentions =
				formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[
					matchupKey
				]?.teamInformation?.[selectedAwayTeamId]?.teamMembers?.[
					String(player.ledaId)
				]?.mentions;

			awayTeamMembers[String(player.ledaId)] = {
				name: player.fullName,
				gameStats: playerGameStats,
				gamePoints: String(
					awayPlayerPoints.find(
						(p) => p.playerId === String(player.ledaId)
					)?.totalPoints || 0
				),
			};

			// Only add mentions if they exist
			if (existingMentions && Object.keys(existingMentions).length > 0) {
				// Convert the mentions to ensure notes is always a string and count is always present
				const formattedMentions: Record<
					string,
					{
						mentionCode: string;
						desc: string;
						points: number;
						notes: string;
						count?: number;
					}
				> = {};

				Object.entries(existingMentions).forEach(([id, mention]) => {
					formattedMentions[id] = {
						mentionCode: mention.mentionCode,
						desc: mention.desc,
						points: mention.points,
						notes: mention.notes || "",
						count: mention.count ?? 0,
					};

					awayTeamMembers[String(player.ledaId)].mentions =
						formattedMentions;
				});
			}
		});

		// Create the new formatted data
		const newData: FormattedScoreData = {
			[selectedDivision]: {
				[selectedSubdivision]: {
					[matchupKey]: {
						teamInformation: {
							[selectedHomeTeamId]: {
								teamLetter: selectedHomeLetter,
								teamName: homeTeamInformation?.teamName || "",
								home: true,
								teamMembers: homeTeamMembers,
								penalties:
									formattedScoreData?.[selectedDivision]?.[
										selectedSubdivision
									]?.[matchupKey]?.teamInformation?.[
										selectedHomeTeamId
									]?.penalties || {},
							},
							[selectedAwayTeamId]: {
								teamLetter: selectedAwayLetter,
								teamName: awayTeamInformation?.teamName || "",
								home: false,
								teamMembers: awayTeamMembers,
								penalties:
									formattedScoreData?.[selectedDivision]?.[
										selectedSubdivision
									]?.[matchupKey]?.teamInformation?.[
										selectedAwayTeamId
									]?.penalties || {},
							},
						},
						gameInformation: gameInformation,
						teamPoints: {
							homePoints: String(
								teamPointsCalculation.finalHomePoints
							),
							awayPoints: String(
								teamPointsCalculation.finalAwayPoints
							),
						},
					},
				},
			},
		};

		// Merge with existing data instead of overwriting
		if (formattedScoreData) {
			// Deep merge existing data with new data
			const mergedData = deepMerge(formattedScoreData, newData);
			setFormattedScoreData(mergedData as FormattedScoreData);
		} else {
			// First save, just use the new data
			setFormattedScoreData(newData);
		}

		// After calculating and formatting the data, save it to the database
		saveScoresheet(newData);
	};

	const saveScoresheet = async (data: FormattedScoreData) => {
		if (!seasonCode || !selectedWeek) {
			return;
		}

		setIsSaving(true);

		try {
			// Determine if all matchups are valid
			const finishedScoresheet = areAllMatchupsValid(data);
			console.log("Finished scoresheet:", finishedScoresheet);

			// First, try to fetch existing scoresheet data for this season and week
			const fetchResponse = await fetch(
				`${weeklyScoresheetsRoute}?seasonCode=${seasonCode}&weekNumber=${selectedWeek}`
			);

			let completeData: FormattedScoreData = data;
			let previousData: FormattedScoreData | null = null;

			// If there's existing data, merge it with our new data
			if (fetchResponse.ok) {
				const existingData = await fetchResponse.json();
				if (existingData && existingData.scoresheetData) {
					// Store previous data for mention history comparison
					previousData = JSON.parse(
						JSON.stringify(existingData.scoresheetData)
					);

					// For the current matchup, use our new data completely (including penalty removals)
					// but merge with other matchups that might exist
					const existingScoreData =
						existingData.scoresheetData as FormattedScoreData;

					// Start with a clean copy of existing data
					completeData = JSON.parse(
						JSON.stringify(existingScoreData)
					);

					// Make sure our current division and subdivision exists
					if (!completeData[selectedDivision]) {
						completeData[selectedDivision] = {};
					}
					if (!completeData[selectedDivision][selectedSubdivision]) {
						completeData[selectedDivision][selectedSubdivision] =
							{};
					}

					// Replace the entire matchup data with our new version
					// This preserves penalty removals
					const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
					if (
						data[selectedDivision]?.[selectedSubdivision]?.[
							matchupKey
						]
					) {
						completeData[selectedDivision][selectedSubdivision][
							matchupKey
						] =
							data[selectedDivision][selectedSubdivision][
								matchupKey
							];
					}
				}
			}

			// Now save the complete merged data
			const saveResponse = await fetch(weeklyScoresheetsRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					seasonCode: seasonCode,
					weekNumber: selectedWeek,
					scoresheetData: completeData,
					finishedScoresheet, // Include the finishedScoresheet status
				}),
			});

			if (!saveResponse.ok) {
				throw new Error(
					`Server responded with ${saveResponse.status}: ${saveResponse.statusText}`
				);
			}

			// Save team points for each team with penalty adjustments
			const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
			const matchupData =
				data[selectedDivision]?.[selectedSubdivision]?.[matchupKey];

			if (matchupData) {
				const homeTeamPointsPayload = {
					seasonCode,
					weekNum: parseInt(selectedWeek),
					ledaId: selectedHomeTeamId,
					totalPoints: parseInt(matchupData.teamPoints.homePoints), // Already includes penalty adjustment
				};

				const awayTeamPointsPayload = {
					seasonCode,
					weekNum: parseInt(selectedWeek),
					ledaId: selectedAwayTeamId,
					totalPoints: parseInt(matchupData.teamPoints.awayPoints), // Already includes penalty adjustment
				};

				// Save home team points
				await fetch(`${weeklyScoresheetsRoute}/teamPoints`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(homeTeamPointsPayload),
				});

				// Save away team points
				await fetch(`${weeklyScoresheetsRoute}/teamPoints`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(awayTeamPointsPayload),
				});

				// Process players and their mentions
				await processMentionHistory(
					matchupData,
					previousData,
					selectedDivision,
					selectedSubdivision,
					matchupKey,
					parseInt(selectedWeek)
				);

				// Save player points for each player in the home team
				const homePlayers =
					matchupData.teamInformation[selectedHomeTeamId].teamMembers;
				for (const playerId in homePlayers) {
					const player = homePlayers[playerId];
					const playerPointsPayload = {
						seasonCode,
						weekNum: parseInt(selectedWeek),
						ledaId: playerId,
						playerId,
						totalPoints: parseInt(player.gamePoints),
						pointsByGame: player.gameStats,
						teamLedaId: selectedHomeTeamId,
						// Include mentions data for each player if it exists
						mentions: player.mentions || {},
					};

					await fetch(`${weeklyScoresheetsRoute}/playerPoints`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(playerPointsPayload),
					});
				}

				// Save player points for each player in the away team
				const awayPlayers =
					matchupData.teamInformation[selectedAwayTeamId].teamMembers;
				for (const playerId in awayPlayers) {
					const player = awayPlayers[playerId];
					const playerPointsPayload = {
						seasonCode,
						weekNum: parseInt(selectedWeek),
						ledaId: playerId, // Correctly set to the player's ID
						playerId,
						totalPoints: parseInt(player.gamePoints),
						pointsByGame: player.gameStats,
						teamLedaId: selectedAwayTeamId, // Correctly set to the team's ID
						// Include mentions data for each player if it exists
						mentions: player.mentions || {},
					};

					await fetch(`${weeklyScoresheetsRoute}/playerPoints`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(playerPointsPayload),
					});
				}
			}

			const result = await saveResponse.json();
			console.log("Scoresheet saved successfully:", result);

			// Update the local state with the complete data to show accurate representation
			setFormattedScoreData(completeData);
			setIsDataChanged(false); // Reset data change flag after successful save
		} catch (error) {
			console.error("Error saving scoresheet:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Add this new helper function to process mentions history
	const processMentionHistory = async (
		matchupData: {
			teamInformation: Record<
				string,
				{
					teamName: string;
					teamLetter: string;
					home: boolean;
					teamMembers: Record<
						string,
						{
							name: string;
							gameStats: Record<string, boolean>;
							gamePoints: string;
							mentions?: Record<
								string,
								{
									mentionCode: string;
									desc: string;
									points: number;
									notes?: string;
									count?: number;
								}
							>;
						}
					>;
					penalties?: Record<
						string,
						{
							penaltyCode: string;
							points: number;
							notes?: string;
						}
					>;
				}
			>;
			gameInformation: Record<
				string,
				{
					homeWin: boolean;
					homePoints: string;
					awayPoints: string;
				}
			>;
			teamPoints: {
				homePoints: string;
				awayPoints: string;
			};
		},
		previousData: FormattedScoreData | null,
		division: string,
		subdivision: string,
		matchupKey: string,
		weekNum: number
	) => {
		// Process both teams
		const teamIds = [selectedHomeTeamId, selectedAwayTeamId];

		for (const teamId of teamIds) {
			const teamMembers =
				matchupData.teamInformation[teamId]?.teamMembers || {};

			// Process each player in the team
			for (const playerId in teamMembers) {
				const player = teamMembers[playerId];
				const currentMentions = player.mentions || {};

				// Get previous mentions for this player if they exist
				const previousMentions =
					previousData?.[division]?.[subdivision]?.[matchupKey]
						?.teamInformation?.[teamId]?.teamMembers?.[playerId]
						?.mentions || {};

				// Track which mentions were processed to identify deletions
				const processedMentionIds = new Set<string>();

				// Process current mentions - add new or update existing
				for (const mentionId in currentMentions) {
					const mention = currentMentions[mentionId];
					processedMentionIds.add(mentionId);

					// If this mention exists in previous data, it's an update
					if (previousMentions[mentionId]) {
						// Check if anything changed
						const prevMention = previousMentions[mentionId];
						if (
							prevMention.mentionCode !== mention.mentionCode ||
							prevMention.desc !== mention.desc ||
							prevMention.points !== mention.points ||
							prevMention.notes !== mention.notes
						) {
							// Update the mention history
							await updateMentionHistory({
								ledaId: playerId,
								mentionId,
								mentionCode: mention.mentionCode,
								mentionDesc: mention.desc,
								mentionPoints: mention.points,
								seasonCode,
								weekNum,
								notes: mention.notes || "",
								count: mention.count || 0,
								teamId: teamId, // Add teamId
							});
						}
					} else {
						// This is a new mention, add it to history
						await createMentionHistory({
							ledaId: playerId,
							mentionId,
							mentionCode: mention.mentionCode,
							mentionDesc: mention.desc,
							mentionPoints: mention.points,
							seasonCode,
							weekNum,
							notes: mention.notes || "",
							count: mention.count || 0,
							teamId: teamId, // Add teamId
						});
					}
				}

				// Check for deleted mentions
				for (const mentionId in previousMentions) {
					if (!processedMentionIds.has(mentionId)) {
						// This mention was deleted, remove it from history
						await deleteMentionHistory({
							ledaId: playerId,
							mentionId,
							seasonCode,
							weekNum,
							mentionCode: "",
							mentionDesc: "",
							mentionPoints: 0,
							notes: "",
							teamId: teamId, // Add teamId
						});
					}
				}
			}
		}
	};

	// Helper functions for mention history API calls
	const createMentionHistory = async (data: {
		ledaId: string;
		mentionId: string;
		mentionCode: string;
		mentionDesc: string;
		mentionPoints: number;
		seasonCode: string;
		weekNum: number;
		notes: string;
		count?: number; // Add count field
		teamId?: string; // Add teamId parameter
	}) => {
		try {
			const response = await fetch(mentionPlayerHistoryRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					count: data.count ?? 0, // Ensure count is always provided
					teamId:
						data.teamId ??
						(data.ledaId.startsWith(selectedHomeTeamId)
							? selectedHomeTeamId
							: selectedAwayTeamId),
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to create mention history: ${response.statusText}`
				);
			}

			console.log(
				`Created mention history for player ${data.ledaId}, mention ${data.mentionId}`
			);
		} catch (error) {
			console.error("Error creating mention history:", error);
		}
	};

	const updateMentionHistory = async (data: {
		ledaId: string;
		mentionId: string;
		mentionCode: string;
		mentionDesc: string;
		mentionPoints: number;
		seasonCode: string;
		weekNum: number;
		notes: string;
		count?: number; // Add count field
		teamId?: string; // Add teamId parameter
	}) => {
		try {
			const response = await fetch(mentionPlayerHistoryRoute, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					count: data.count ?? 0, // Ensure count is always provided
					teamId:
						data.teamId ??
						(data.ledaId.startsWith(selectedHomeTeamId)
							? selectedHomeTeamId
							: selectedAwayTeamId),
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to update mention history: ${response.statusText}`
				);
			}

			console.log(
				`Updated mention history for player ${data.ledaId}, mention ${data.mentionId}`
			);
		} catch (error) {
			console.error("Error updating mention history:", error);
		}
	};

	const deleteMentionHistory = async (data: {
		ledaId: string;
		mentionId: string;
		mentionCode: string;
		mentionDesc: string;
		mentionPoints: number;
		seasonCode: string;
		weekNum: number;
		notes: string;
		teamId?: string; // Add teamId parameter
	}) => {
		try {
			const response = await fetch(mentionPlayerHistoryRoute, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					teamId:
						data.teamId ??
						(data.ledaId.startsWith(selectedHomeTeamId)
							? selectedHomeTeamId
							: selectedAwayTeamId),
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to delete mention history: ${response.statusText}`
				);
			}

			console.log(
				`Deleted mention history for player ${data.ledaId}, mention ${data.mentionId}`
			);
		} catch (error) {
			console.error("Error deleting mention history:", error);
		}
	};

	const resetScoresheet = () => {
		if (
			window.confirm(
				"Are you sure you want to reset this scoresheet? This action cannot be undone."
			)
		) {
			// Reset home and away team game data
			setHomeTeamGameData({});
			setAwayTeamGameData({});

			// Reset home win checkboxes
			setHomeWins(Array(11).fill(false));

			// Reset points
			setHomePoints(Array(11).fill(""));
			setAwayPoints(Array(11).fill(""));

			// Reset formattedScoreData for this matchup
			if (formattedScoreData) {
				const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
				const updatedData = { ...formattedScoreData };

				if (
					updatedData[selectedDivision] &&
					updatedData[selectedDivision][selectedSubdivision] &&
					updatedData[selectedDivision][selectedSubdivision][
						matchupKey
					]
				) {
					delete updatedData[selectedDivision][selectedSubdivision][
						matchupKey
					];

					// If no matchups remain in the subdivision, remove it
					if (
						Object.keys(
							updatedData[selectedDivision][selectedSubdivision]
						).length === 0
					) {
						delete updatedData[selectedDivision][
							selectedSubdivision
						];
					}

					// If no subdivisions remain in the division, remove it
					if (
						Object.keys(updatedData[selectedDivision]).length === 0
					) {
						delete updatedData[selectedDivision];
					}
				}

				setFormattedScoreData(updatedData);
			}

			// Mark data as changed to enable the "Save Scoresheet" button
			setIsDataChanged(true);
		}
	};

	const handlePenaltyClick = (
		teamId: string,
		teamName: string | undefined,
		isHome: boolean
	) => {
		// Set the selected team information for penalties
		setSelectedPenaltyTeamId(teamId);
		setSelectedPenaltyTeamName(teamName || "");

		// Open the appropriate dialog
		if (isHome) {
			setHomePenaltyDialogOpen(true);
		} else {
			setAwayPenaltyDialogOpen(true);
		}
	};

	const handlePenaltySubmit = (
		teamId: string,
		penaltyCode: string,
		points: number,
		notes?: string
	) => {
		// Create a copy of existing data, or initialize if it doesn't exist
		const updatedData = formattedScoreData ? { ...formattedScoreData } : {};

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

		// Ensure the necessary nested structure exists
		if (!updatedData[selectedDivision]) {
			updatedData[selectedDivision] = {};
		}

		if (!updatedData[selectedDivision][selectedSubdivision]) {
			updatedData[selectedDivision][selectedSubdivision] = {};
		}

		if (!updatedData[selectedDivision][selectedSubdivision][matchupKey]) {
			updatedData[selectedDivision][selectedSubdivision][matchupKey] = {
				teamInformation: {},
				gameInformation: {},
				teamPoints: { homePoints: "0", awayPoints: "0" },
			};
		}

		// Find the right team (home or away) to add the penalty to
		const teamKey =
			teamId === selectedHomeTeamId
				? selectedHomeTeamId
				: selectedAwayTeamId;
		const isHomeTeam = teamId === selectedHomeTeamId;

		if (
			!updatedData[selectedDivision][selectedSubdivision][matchupKey]
				.teamInformation[teamKey]
		) {
			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey] = {
				teamLetter:
					teamId === selectedHomeTeamId
						? selectedHomeLetter
						: selectedAwayLetter,
				teamName:
					teamId === selectedHomeTeamId
						? homeTeamInformation?.teamName || ""
						: awayTeamInformation?.teamName || "",
				home: teamId === selectedHomeTeamId,
				teamMembers: {},
				penalties: {},
			};
		}

		// Ensure penalties object exists
		if (
			!updatedData[selectedDivision][selectedSubdivision][matchupKey]
				.teamInformation[teamKey].penalties
		) {
			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey].penalties = {};
		}

		// Get current counter and increment for next use
		const nextCounter = isHomeTeam
			? homePenaltyCounter + 1
			: awayPenaltyCounter + 1;

		// Add the new penalty using the counter as the key
		updatedData[selectedDivision][selectedSubdivision][
			matchupKey
		].teamInformation[teamKey].penalties[nextCounter.toString()] = {
			penaltyCode,
			points,
			notes: notes || "",
		};

		// Log to verify the penalty was added
		console.log(
			"Added penalty:",
			updatedData[selectedDivision][selectedSubdivision][matchupKey]
				.teamInformation[teamKey].penalties
		);

		// Update the counter state
		if (isHomeTeam) {
			setHomePenaltyCounter(nextCounter);
		} else {
			setAwayPenaltyCounter(nextCounter);
		}

		// Update state
		setFormattedScoreData(updatedData);

		// Close the appropriate dialog
		if (teamId === selectedHomeTeamId) {
			setHomePenaltyDialogOpen(false);
		} else {
			setAwayPenaltyDialogOpen(false);
		}

		// Mark data as changed
		handleDataChange();
	};

	const handlePenaltyEditing = (teamId: string, penaltyId: string) => {
		if (!formattedScoreData) return;

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
		const teamKey =
			teamId === selectedHomeTeamId
				? selectedHomeTeamId
				: selectedAwayTeamId;

		// Check if the penalty exists
		if (
			formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[
				matchupKey
			]?.teamInformation?.[teamKey]?.penalties?.[penaltyId]
		) {
			// Get the penalty data
			const penalty =
				formattedScoreData[selectedDivision][selectedSubdivision][
					matchupKey
				].teamInformation[teamKey].penalties[penaltyId];

			// Set up the editing state
			setPenaltyEditMode(true);
			setCurrentEditingPenalty({
				id: penaltyId,
				code: penalty.penaltyCode,
				points: penalty.points,
				notes: penalty.notes || "",
			});

			// Set the selected team information for penalties
			setSelectedPenaltyTeamId(teamId);
			setSelectedPenaltyTeamName(
				teamId === selectedHomeTeamId
					? homeTeamInformation?.teamName || ""
					: awayTeamInformation?.teamName || ""
			);

			// Open the appropriate dialog
			if (teamId === selectedHomeTeamId) {
				setHomePenaltyDialogOpen(true);
			} else {
				setAwayPenaltyDialogOpen(true);
			}
		}
	};

	const updatePenalty = (
		teamId: string,
		penaltyId: string,
		newCode: string,
		points: number,
		notes?: string
	) => {
		if (!formattedScoreData) return;

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

		// Create a copy of the current formatted score data
		const updatedData = { ...formattedScoreData };

		// Find the right team (home or away) to update the penalty
		const teamKey =
			teamId === selectedHomeTeamId
				? selectedHomeTeamId
				: selectedAwayTeamId;

		// Check if the penalty exists before attempting to update
		if (
			updatedData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]
				?.teamInformation?.[teamKey]?.penalties?.[penaltyId]
		) {
			// Update the existing penalty with the new values
			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey].penalties[penaltyId] = {
				penaltyCode: newCode,
				points,
				notes: notes || "",
			};

			// Update state
			setFormattedScoreData(updatedData);

			// Reset editing state
			setPenaltyEditMode(false);
			setCurrentEditingPenalty(null);

			// Close the dialogs
			setHomePenaltyDialogOpen(false);
			setAwayPenaltyDialogOpen(false);

			// Mark data as changed
			handleDataChange();
		}
	};

	const handlePenaltyRemoval = (teamId: string, penaltyId: string) => {
		if (!formattedScoreData) return;

		// Add confirmation dialog
		if (
			!window.confirm(
				`Are you sure you want to delete this penalty? This action cannot be undone.`
			)
		) {
			return; // Exit the function if user cancels
		}

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

		// Create a copy of the current formatted score data
		const updatedData = { ...formattedScoreData };

		// Find the right team (home or away) to remove the penalty from
		const teamKey =
			teamId === selectedHomeTeamId
				? selectedHomeTeamId
				: selectedAwayTeamId;

		// Check if the penalty exists before attempting to remove
		if (
			updatedData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]
				?.teamInformation?.[teamKey]?.penalties?.[penaltyId]
		) {
			// Remove the penalty
			delete updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey].penalties[penaltyId];

			// Update state
			setFormattedScoreData(updatedData);

			// Mark data as changed
			handleDataChange();
		}
	};

	const handleMentionClick = (playerId: string, teamId: string) => {
		// Find the player name based on the ID
		let playerName = "";
		let teamName = "";

		if (teamId === selectedHomeTeamId) {
			const player = homeTeamPlayerInformation?.find(
				(p) => String(p.ledaId) === playerId
			);
			playerName = player?.fullName || "";
			teamName = homeTeamInformation?.teamName || "";
		} else {
			const player = awayTeamPlayerInformation?.find(
				(p) => String(p.ledaId) === playerId
			);
			playerName = player?.fullName || "";
			teamName = awayTeamInformation?.teamName || "";
		}

		// Set the selected player for mention
		setSelectedPlayerForMention({
			id: playerId,
			name: playerName,
			teamId: teamId,
			teamName: teamName,
		});

		// Log useful debug information
		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
		console.log(
			"Opening mentions dialog for:",
			playerName,
			"Team:",
			teamName
		);
		console.log("Current matchup:", matchupKey);
		console.log("Team ID:", teamId, "Player ID:", playerId);

		if (formattedScoreData) {
			// Log the path to help debug
			console.log("Division:", selectedDivision);
			console.log("Subdivision:", selectedSubdivision);

			// Check if mentions exist
			const mentions =
				formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[
					matchupKey
				]?.teamInformation?.[teamId]?.teamMembers?.[playerId]?.mentions;

			console.log("Existing mentions:", mentions);
		}

		// Force the dialog to show properly by using a small delay
		// This ensures React has time to process state updates
		setMentionDialogOpen(false); // First close in case it was open

		setTimeout(() => {
			setMentionDialogOpen(true); // Then open with a slight delay
		}, 10);
	};

	const handleMentionEditing = (
		playerId: string,
		teamId: string,
		mentionId: string
	) => {
		if (!formattedScoreData) return;

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

		// Check if the mention exists
		if (
			formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[
				matchupKey
			]?.teamInformation?.[teamId]?.teamMembers?.[playerId]?.mentions?.[
				mentionId
			]
		) {
			// Get the mention data
			const mention =
				formattedScoreData[selectedDivision][selectedSubdivision][
					matchupKey
				].teamInformation[teamId].teamMembers[playerId].mentions![
					mentionId
				];

			// Set up the editing state
			setMentionEditMode(true);
			setCurrentEditingMention({
				id: mentionId,
				code: mention.mentionCode,
				desc: mention.desc,
				points: mention.points,
				notes: mention.notes || "",
				count: mention.count || 0,
			});

			// Find the player name based on the ID
			let playerName = "";
			let teamName = "";

			if (teamId === selectedHomeTeamId) {
				const player = homeTeamPlayerInformation?.find(
					(p) => String(p.ledaId) === playerId
				);
				playerName = player?.fullName || "";
				teamName = homeTeamInformation?.teamName || "";
			} else {
				const player = awayTeamPlayerInformation?.find(
					(p) => String(p.ledaId) === playerId
				);
				playerName = player?.fullName || "";
				teamName = awayTeamInformation?.teamName || "";
			}

			// Set the selected player for mention
			setSelectedPlayerForMention({
				id: playerId,
				name: playerName,
				teamId: teamId,
				teamName: teamName,
			});

			// Open the mention dialog
			setMentionDialogOpen(true);
		}
	};

	const updateMention = (
		mentionId: string,
		mentionCode: string,
		desc: string,
		points: number,
		count: number,
		notes?: string
	) => {
		if (!formattedScoreData || !selectedPlayerForMention) return;

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
		const playerId = selectedPlayerForMention.id;
		const teamId = selectedPlayerForMention.teamId;

		// Create a copy of the current formatted score data
		const updatedData = { ...formattedScoreData };

		// Check if the mention exists before attempting to update
		if (
			updatedData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]
				?.teamInformation?.[teamId]?.teamMembers?.[playerId]
				?.mentions?.[mentionId]
		) {
			// Update the existing mention with the new values
			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamId].teamMembers[playerId].mentions![
				mentionId
			] = {
				mentionCode: mentionCode,
				desc: desc,
				points: points,
				notes: notes || "",
				count: count || 0,
			};

			// Update state
			setFormattedScoreData(updatedData);

			// Reset editing state
			setMentionEditMode(false);
			setCurrentEditingMention(null);

			// Mark data as changed
			handleDataChange();
		}
	};

	const handleMentionSubmit = (
		mentionCode: string,
		desc: string,
		points: number,
		count: number,
		notes?: string
	) => {
		if (!formattedScoreData || !selectedPlayerForMention) {
			// Initialize data if needed
			if (!formattedScoreData) setFormattedScoreData({});
			return;
		}
		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
		const playerId = selectedPlayerForMention.id;
		const teamId = selectedPlayerForMention.teamId;

		// Create a copy of the current formatted score data
		const updatedData = { ...formattedScoreData };

		// Ensure the necessary nested structure exists
		if (!updatedData[selectedDivision]) {
			updatedData[selectedDivision] = {};
		}

		if (!updatedData[selectedDivision][selectedSubdivision]) {
			updatedData[selectedDivision][selectedSubdivision] = {};
		}

		if (!updatedData[selectedDivision][selectedSubdivision][matchupKey]) {
			updatedData[selectedDivision][selectedSubdivision][matchupKey] = {
				teamInformation: {},
				gameInformation: {},
				teamPoints: { homePoints: "0", awayPoints: "0" },
			};
		}

		// Find the right team to add the mention to
		const teamKey = teamId;
		const isHomeTeam = teamId === selectedHomeTeamId;

		if (
			!updatedData[selectedDivision][selectedSubdivision][matchupKey]
				.teamInformation[teamKey]
		) {
			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey] = {
				teamLetter: isHomeTeam
					? selectedHomeLetter
					: selectedAwayLetter,
				teamName: isHomeTeam
					? homeTeamInformation?.teamName || ""
					: awayTeamInformation?.teamName || "",
				home: isHomeTeam,
				teamMembers: {},
				penalties: {},
			};
		}

		// Ensure the team members object exists
		if (
			!updatedData[selectedDivision][selectedSubdivision][matchupKey]
				.teamInformation[teamKey].teamMembers[playerId]
		) {
			const playerName = selectedPlayerForMention.name;
			const gameStats: Record<string, boolean> = {};

			// Initialize game stats if needed
			for (let i = 1; i <= 11; i++) {
				const gameKey = `Game ${i}`;
				gameStats[gameKey] = isHomeTeam
					? homeTeamGameData[playerId]?.[gameKey] || false
					: awayTeamGameData[playerId]?.[gameKey] || false;
			}

			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey].teamMembers[playerId] = {
				name: playerName,
				gameStats: gameStats,
				gamePoints: "0",
			};
		}

		// Ensure the mentions object exists
		if (
			!updatedData[selectedDivision][selectedSubdivision][matchupKey]
				.teamInformation[teamKey].teamMembers[playerId].mentions
		) {
			updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamKey].teamMembers[playerId].mentions = {};
		}

		// Get or initialize mention counter for this player
		const playerMentionKey = `${teamId}-${playerId}`;
		const currentCounter = mentionCounters[playerMentionKey] || 0;
		const newCounter = currentCounter + 1;

		// Add the new mention using the counter as the key
		updatedData[selectedDivision][selectedSubdivision][
			matchupKey
		].teamInformation[teamKey].teamMembers[playerId].mentions![
			newCounter.toString()
		] = {
			mentionCode,
			desc,
			points,
			notes: notes || "",
			count: count || 0,
		};
		// Update the mention counter state
		setMentionCounters({
			...mentionCounters,
			[playerMentionKey]: newCounter,
		});

		// Update state with the new data
		setFormattedScoreData(updatedData);
		setTimeout(() => {
			console.log(formattedScoreData);
		}, 0);
		// Temporarily close and reopen the dialog to force a refresh
		setMentionDialogOpen(false);
		setTimeout(() => {
			setMentionDialogOpen(true);
		}, 50);

		// Mark data as changed to enable save button
		handleDataChange();
	};

	const handleMentionDelete = (
		playerId: string,
		teamId: string,
		mentionId: string
	) => {
		if (!formattedScoreData) return;

		// Add confirmation dialog
		if (
			!window.confirm(
				`Are you sure you want to delete this mention? This action cannot be undone.`
			)
		) {
			return; // Exit if user cancels
		}

		const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

		// Create a copy of the current formatted score data
		const updatedData = { ...formattedScoreData };

		// Check if the mention exists before attempting to remove
		if (
			updatedData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]
				?.teamInformation?.[teamId]?.teamMembers?.[playerId]
				?.mentions?.[mentionId]
		) {
			// Remove the mention
			delete updatedData[selectedDivision][selectedSubdivision][
				matchupKey
			].teamInformation[teamId].teamMembers[playerId].mentions![
				mentionId
			];

			// Update state
			setFormattedScoreData(updatedData);

			// Mark data as changed
			handleDataChange();
		}
	};

	// UI skeleton for loading state
	const FolderTabSkeleton = () => (
		<div className="w-full space-y-4">
			<Skeleton className="h-8 w-2/3" />
			<Skeleton className="h-6 w-1/2 mb-4" />
			<Skeleton className="h-8 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			<FolderTabMed title="Season Information" className="w-fit">
				<div className="flex gap-4">
					<SeasonCodeSelector
						disabled={currentSeason}
						handleSelect={handleSeasonCodeSelect}
						useCurrentSeason={currentSeason}
						seasonCode={seasonCode || ""}
					/>
					<div className="flex items-center gap-4">
						<Label>Current Season?</Label>
						<Checkbox
							checked={currentSeason}
							onCheckedChange={() =>
								setCurrentSeason(!currentSeason)
							}
						/>
					</div>
					<div className="flex gap-4">
						<WeekSelector
							seasonCode={seasonCode}
							disabled={seasonSelected}
							handleSelect={handleDateToDisplay}
						/>
					</div>
				</div>
			</FolderTabMed>
			<div className="mt-4">
				<Separator
					orientation="horizontal"
					className="bg-gray-400 w-100"
				/>
			</div>
			<div className="flex flex-1 overflow-hidden">
				<SideNav
					data={sidenavData}
					formattedScoreData={formattedScoreData}
					handleMatchupSelection={handleMatchupSelection}
				/>
				<div className="flex-1 p-4 overflow-auto">
					{!matchSelected ? (
						<div className="flex h-full items-center justify-center">
							<p className="text-gray-500 text-center">
								Select a matchup...
							</p>
						</div>
					) : (
						<div className="flex h-full items-start justify-start gap-2 flex-col">
							<div className="flex flex-col gap-4 w-full">
								<div className="text-2xl font-semibold">
									{selectedDivision}
								</div>
								<div className="text-xl font-semibold">
									{selectedSubdivision}
								</div>
								<div>
									Matchup for {selectedHomeLetter} vs{" "}
									{selectedAwayLetter}
								</div>
								<FolderTab title="Home">
									{isLoading || !homeTeamPlayerInformation ? (
										<FolderTabSkeleton />
									) : (
										<>
											<div className="text-lg font-bold text-gray-800">
												Team Name:{" "}
												{homeTeamInformation?.teamName}
											</div>
											<div className="text-lg font-semibold text-gray-800">
												Team ID: {selectedHomeTeamId}
											</div>
											<div className="text-md text-gray-600 mb-4">
												Team Letter:{" "}
												{selectedHomeLetter}
											</div>
											<div>
												<Dialog
													open={homePenaltyDialogOpen}
													onOpenChange={(open) => {
														setHomePenaltyDialogOpen(
															open
														);
														if (!open) {
															setPenaltyEditMode(
																false
															);
															setCurrentEditingPenalty(
																null
															);
														}
													}}
												>
													<DialogTrigger asChild>
														<Button
															variant="outline"
															className="text-sm px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
															onClick={() =>
																handlePenaltyClick(
																	selectedHomeTeamId,
																	homeTeamInformation?.teamName,
																	true
																)
															}
														>
															<span>
																Penalties
															</span>
														</Button>
													</DialogTrigger>
													<DialogContent className="w-fit bg-white">
														<DialogHeader>
															<DialogTitle className="flex justify-center">
																{penaltyEditMode
																	? "Edit"
																	: "Add"}{" "}
																Penalty for
																Team:{" "}
																{
																	selectedPenaltyTeamName
																}
															</DialogTitle>
														</DialogHeader>
														<PenaltyAddForm
															setOpen={
																setHomePenaltyDialogOpen
															}
															selectedTeamId={
																selectedPenaltyTeamId
															}
															handlePenaltySubmit={
																handlePenaltySubmit
															}
															isEditMode={
																penaltyEditMode
															}
															initialPenalty={
																currentEditingPenalty
															}
															updatePenalty={
																updatePenalty
															}
														/>
													</DialogContent>
												</Dialog>
												{/* Penalties Accordion for Home Team - Only render if penalties exist */}
												{formattedScoreData?.[
													selectedDivision
												]?.[selectedSubdivision]?.[
													`${selectedHomeLetter} - ${selectedAwayLetter}`
												]?.teamInformation?.[
													selectedHomeTeamId
												]?.penalties &&
													Object.keys(
														formattedScoreData[
															selectedDivision
														][selectedSubdivision][
															`${selectedHomeLetter} - ${selectedAwayLetter}`
														].teamInformation[
															selectedHomeTeamId
														].penalties
													).length > 0 && (
														<Accordion
															type="single"
															collapsible
															className="w-full mt-2"
														>
															<AccordionItem value="penalties">
																<AccordionTrigger className="text-sm font-medium text-red-600">
																	View Team
																	Penalties
																</AccordionTrigger>
																<AccordionContent>
																	<div className="space-y-2 p-2 border rounded-md">
																		{Object.entries(
																			formattedScoreData[
																				selectedDivision
																			][
																				selectedSubdivision
																			][
																				`${selectedHomeLetter} - ${selectedAwayLetter}`
																			]
																				.teamInformation[
																				selectedHomeTeamId
																			]
																				.penalties
																		).map(
																			([
																				id,
																				penalty,
																			]) => (
																				<div
																					key={
																						id
																					}
																					className="flex justify-between items-start border-b pb-2 group relative"
																				>
																					<div>
																						<span className="font-semibold">
																							Code:{" "}
																							{
																								penalty.penaltyCode
																							}
																						</span>
																						<p className="text-sm text-gray-600">
																							{
																								penalty.notes
																							}
																						</p>
																					</div>
																					<div className="flex items-center">
																						<span className="text-red-600 font-bold">
																							{
																								penalty.points
																							}{" "}
																							pts
																						</span>
																						<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																							<Pencil
																								className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
																								onClick={() =>
																									handlePenaltyEditing(
																										selectedHomeTeamId,
																										id
																									)
																								}
																							/>
																							<X
																								className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
																								onClick={() =>
																									handlePenaltyRemoval(
																										selectedHomeTeamId,
																										id
																									)
																								}
																							/>
																						</div>
																					</div>
																				</div>
																			)
																		)}
																	</div>
																</AccordionContent>
															</AccordionItem>
														</Accordion>
													)}
											</div>
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>
																Player Name
															</TableHead>
															<TableHead />
															{Array.from({
																length: 11,
															}).map((_, i) => (
																<TableHead
																	key={i}
																	className="text-center"
																>
																	Game {i + 1}
																</TableHead>
															))}
														</TableRow>
													</TableHeader>
													<TableBody>
														{homeTeamPlayerInformation?.map(
															(player) => (
																<TableRow
																	key={
																		player.ledaId
																	}
																>
																	<TableCell className="w-fit flex items-center gap-2">
																		<span>
																			{
																				player.fullName
																			}
																		</span>
																	</TableCell>
																	<TableCell>
																		<Button
																			variant="outline"
																			className="text-xs px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
																			onClick={() =>
																				handleMentionClick(
																					String(
																						player.ledaId
																					),
																					selectedHomeTeamId
																				)
																			}
																		>
																			<span>
																				Mentions
																			</span>
																		</Button>
																	</TableCell>
																	{Array.from(
																		{
																			length: 11,
																		}
																	).map(
																		(
																			_,
																			i
																		) => {
																			const gameKey = `Game ${
																				i +
																				1
																			}`;
																			return (
																				<TableCell
																					key={
																						i
																					}
																					className="text-center cursor-pointer"
																					onClick={() =>
																						handleGameToggle(
																							"home",
																							String(
																								player.ledaId
																							),
																							i
																						)
																					}
																				>
																					<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																						{homeTeamGameData[
																							player
																								.ledaId
																						]?.[
																							gameKey
																						] && (
																							<X className="h-5 w-5" />
																						)}
																					</div>
																				</TableCell>
																			);
																		}
																	)}
																</TableRow>
															)
														)}
													</TableBody>
												</Table>
											</div>
										</>
									)}
								</FolderTab>
								<FolderTab title="Away">
									{isLoading || !awayTeamPlayerInformation ? (
										<FolderTabSkeleton />
									) : (
										<>
											<div className="text-lg font-bold text-gray-800">
												Team Name:{" "}
												{awayTeamInformation?.teamName}
											</div>
											<div className="text-lg font-semibold text-gray-800">
												Team ID: {selectedAwayTeamId}
											</div>
											<div className="text-md text-gray-600 mb-4">
												Team Letter:{" "}
												{selectedAwayLetter}
											</div>

											<Dialog
												open={awayPenaltyDialogOpen}
												onOpenChange={(open) => {
													setAwayPenaltyDialogOpen(
														open
													);
													if (!open) {
														setPenaltyEditMode(
															false
														);
														setCurrentEditingPenalty(
															null
														);
													}
												}}
											>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														className="text-sm px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
														onClick={() =>
															handlePenaltyClick(
																selectedAwayTeamId,
																awayTeamInformation?.teamName,
																false
															)
														}
													>
														<span>Penalties</span>
													</Button>
												</DialogTrigger>
												<DialogContent className="w-fit bg-white">
													<DialogHeader>
														<DialogTitle>
															{penaltyEditMode
																? "Edit"
																: "Add"}{" "}
															Penalty -{" "}
															{
																selectedPenaltyTeamName
															}
														</DialogTitle>
													</DialogHeader>
													<PenaltyAddForm
														setOpen={
															setAwayPenaltyDialogOpen
														}
														selectedTeamId={
															selectedPenaltyTeamId
														}
														handlePenaltySubmit={
															handlePenaltySubmit
														}
														isEditMode={
															penaltyEditMode
														}
														initialPenalty={
															currentEditingPenalty
														}
														updatePenalty={
															updatePenalty
														}
													/>
												</DialogContent>
											</Dialog>

											{/* Penalties Accordion for Away Team - Only render if penalties exist */}
											{formattedScoreData?.[
												selectedDivision
											]?.[selectedSubdivision]?.[
												`${selectedHomeLetter} - ${selectedAwayLetter}`
											]?.teamInformation?.[
												selectedAwayTeamId
											]?.penalties &&
												Object.keys(
													formattedScoreData[
														selectedDivision
													][selectedSubdivision][
														`${selectedHomeLetter} - ${selectedAwayLetter}`
													].teamInformation[
														selectedAwayTeamId
													].penalties
												).length > 0 && (
													<Accordion
														type="single"
														collapsible
														className="w-full mt-2"
													>
														<AccordionItem value="penalties">
															<AccordionTrigger className="text-sm font-medium text-red-600">
																View Team
																Penalties
															</AccordionTrigger>
															<AccordionContent>
																<div className="space-y-2 p-2 border rounded-md">
																	{Object.entries(
																		formattedScoreData[
																			selectedDivision
																		][
																			selectedSubdivision
																		][
																			`${selectedHomeLetter} - ${selectedAwayLetter}`
																		]
																			.teamInformation[
																			selectedAwayTeamId
																		]
																			.penalties
																	).map(
																		([
																			id,
																			penalty,
																		]) => (
																			<div
																				key={
																					id
																				}
																				className="flex justify-between items-start border-b pb-2 group relative"
																			>
																				<div>
																					<span className="font-semibold">
																						Code:{" "}
																						{
																							penalty.penaltyCode
																						}
																					</span>
																					<p className="text-sm text-gray-600">
																						{
																							penalty.notes
																						}
																					</p>
																				</div>
																				<div className="flex items-center">
																					<span className="text-red-600 font-bold">
																						{
																							penalty.points
																						}{" "}
																						pts
																					</span>
																					<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																						<Pencil
																							className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
																							onClick={() =>
																								handlePenaltyEditing(
																									selectedAwayTeamId,
																									id
																								)
																							}
																						/>
																						<X
																							className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
																							onClick={() =>
																								handlePenaltyRemoval(
																									selectedAwayTeamId,
																									id
																								)
																							}
																						/>
																					</div>
																				</div>
																			</div>
																		)
																	)}
																</div>
															</AccordionContent>
														</AccordionItem>
													</Accordion>
												)}
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>
																Player Name
															</TableHead>
															<TableHead />
															{Array.from({
																length: 11,
															}).map((_, i) => (
																<TableHead
																	key={i}
																	className="text-center"
																>
																	Game {i + 1}
																</TableHead>
															))}
														</TableRow>
													</TableHeader>
													<TableBody>
														{awayTeamPlayerInformation?.map(
															(player) => (
																<TableRow
																	key={
																		player.ledaId
																	}
																>
																	{/* TODO Implement a mentions button next to the name */}
																	<TableCell className="w-fit flex items-center gap-2">
																		<span>
																			{
																				player.fullName
																			}
																		</span>
																	</TableCell>
																	<TableCell>
																		<Button
																			variant="outline"
																			className="text-xs px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
																			onClick={() =>
																				handleMentionClick(
																					String(
																						player.ledaId
																					),
																					selectedAwayTeamId
																				)
																			}
																		>
																			<span>
																				Mentions
																			</span>
																		</Button>
																	</TableCell>
																	{Array.from(
																		{
																			length: 11,
																		}
																	).map(
																		(
																			_,
																			i
																		) => {
																			const gameKey = `Game ${
																				i +
																				1
																			}`;
																			return (
																				<TableCell
																					key={
																						i
																					}
																					className="text-center cursor-pointer"
																					onClick={() =>
																						handleGameToggle(
																							"away",
																							String(
																								player.ledaId
																							),
																							i
																						)
																					}
																				>
																					<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																						{awayTeamGameData[
																							player
																								.ledaId
																						]?.[
																							gameKey
																						] && (
																							<X className="h-5 w-5" />
																						)}
																					</div>
																				</TableCell>
																			);
																		}
																	)}
																</TableRow>
															)
														)}
													</TableBody>
												</Table>
											</div>
										</>
									)}
								</FolderTab>

								{/* Add the Game Points Table */}
								<FolderTab title="Game Points">
									{isLoading ? (
										<FolderTabSkeleton />
									) : (
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead></TableHead>
														{Array.from({
															length: 11,
														}).map((_, i) => (
															<TableHead
																key={i}
																className="text-center"
															>
																<div className="flex flex-col items-center gap-1">
																	<span>
																		Game{" "}
																		{i + 1}
																	</span>
																	<div className="flex items-center space-x-2">
																		<Checkbox
																			id={`home-win-${i}`}
																			checked={
																				homeWins[
																					i
																				]
																			}
																			onCheckedChange={() =>
																				handleHomeWinToggle(
																					i
																				)
																			}
																		/>
																		<Label
																			htmlFor={`home-win-${i}`}
																			className="text-xs"
																		>
																			Home
																			Win
																		</Label>
																	</div>
																</div>
															</TableHead>
														))}
													</TableRow>
												</TableHeader>
												<TableBody>
													<TableRow>
														<TableCell className="font-medium">
															Home Points
														</TableCell>
														{Array.from({
															length: 11,
														}).map((_, i) => (
															<TableCell
																key={i}
																className="text-center"
															>
																<input
																	type="text"
																	inputMode="numeric"
																	pattern="[0-9]*"
																	value={
																		homePoints[
																			i
																		]
																	}
																	onChange={(
																		e
																	) =>
																		handleHomePointsChange(
																			i,
																			e
																				.target
																				.value
																		)
																	}
																	className="w-12 text-center border border-gray-300 rounded p-1"
																	placeholder="0"
																/>
															</TableCell>
														))}
													</TableRow>
													<TableRow>
														<TableCell className="font-medium">
															Away Points
														</TableCell>
														{Array.from({
															length: 11,
														}).map((_, i) => (
															<TableCell
																key={i}
																className="text-center"
															>
																<input
																	type="text"
																	inputMode="numeric"
																	pattern="[0-9]*"
																	value={
																		awayPoints[
																			i
																		]
																	}
																	onChange={(
																		e
																	) =>
																		handleAwayPointsChange(
																			i,
																			e
																				.target
																				.value
																		)
																	}
																	className="w-12 text-center border border-gray-300 rounded p-1"
																	placeholder="0"
																/>
															</TableCell>
														))}
													</TableRow>
													<TableRow className="bg-gray-50">
														<TableCell className="font-bold">
															Total
														</TableCell>
														<TableCell
															colSpan={5}
															className="text-center font-bold"
														>
															Home:{" "}
															{
																calculatePoints()
																	.rawHomePoints
															}
															{calculatePoints()
																.homePenaltyPoints >
																0 && (
																<span className="text-red-600 ml-2">
																	(-
																	{
																		calculatePoints()
																			.homePenaltyPoints
																	}{" "}
																	penalties)
																</span>
															)}
															<div className="text-sm font-normal mt-1">
																Final:{" "}
																{
																	calculatePoints()
																		.finalHomePoints
																}
															</div>
														</TableCell>
														<TableCell
															colSpan={6}
															className="text-center font-bold"
														>
															Away:{" "}
															{
																calculatePoints()
																	.rawAwayPoints
															}
															{calculatePoints()
																.awayPenaltyPoints >
																0 && (
																<span className="text-red-600 ml-2">
																	(-
																	{
																		calculatePoints()
																			.awayPenaltyPoints
																	}{" "}
																	penalties)
																</span>
															)}
															<div className="text-sm font-normal mt-1">
																Final:{" "}
																{
																	calculatePoints()
																		.finalAwayPoints
																}
															</div>
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</div>
									)}
								</FolderTab>

								{/* Add Save and Reset Buttons */}
								<div className="flex justify-center mt-4">
									<Button
										onClick={calculatePlayerPoints}
										className={`${
											isDataChanged
												? "bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
												: "bg-blue-600 hover:bg-blue-700 text-white"
										}`}
										disabled={isSaving || !isDataChanged} // Disable button if no data has changed
									>
										{isSaving
											? "Saving..."
											: isDataChanged
											? "Save Scoresheet (Changes Pending)"
											: "Save Scoresheet"}
									</Button>
									<Button
										onClick={resetScoresheet}
										className="bg-red-600 hover:bg-red-700 text-white ml-4"
										disabled={isSaving} // Disable button while saving
									>
										Reset Scoresheet
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Add Mention Dialog */}
			<Dialog
				open={mentionDialogOpen}
				onOpenChange={(open) => {
					setMentionDialogOpen(open);
					if (!open) {
						setMentionEditMode(false);
						setCurrentEditingMention(null);
					}
				}}
			>
				<DialogContent className="sm:max-w-[500px] bg-white overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{mentionEditMode ? "Edit" : "Add"} Mention for
							Player: {selectedPlayerForMention?.name}
						</DialogTitle>
						<DialogDescription>
							On Team: {selectedPlayerForMention?.teamName}
						</DialogDescription>
					</DialogHeader>
					<MentionForm
						handleMentionSubmit={handleMentionSubmit}
						isEditMode={mentionEditMode}
						initialMention={currentEditingMention}
						updateMention={(
							mentionId,
							mentionCode,
							desc,
							points,
							notes,
							count
						) =>
							updateMention(
								mentionId,
								mentionCode,
								desc,
								points,
								count || 0,
								notes
							)
						}
					/>

					{/* Render existing mentions */}
					{selectedPlayerForMention && formattedScoreData && (
						<>
							<div className="space-y-2">
								<h3 className="font-semibold">
									Existing Mentions
								</h3>
								{(() => {
									// Debugging: Log the formattedScoreData structure
									console.log(
										"Formatted Score Data:",
										formattedScoreData
									);

									const mentions =
										formattedScoreData?.[
											selectedDivision
										]?.[selectedSubdivision]?.[
											`${selectedHomeLetter} - ${selectedAwayLetter}`
										]?.teamInformation?.[
											selectedPlayerForMention.teamId
										]?.teamMembers?.[
											selectedPlayerForMention.id
										]?.mentions;

									// Debugging: Log the mentions object
									console.log(
										"Mentions for Player:",
										mentions
									);

									if (
										mentions &&
										Object.keys(mentions).length > 0
									) {
										return (
											<div className="space-y-2 max-h-60 overflow-y-auto">
												{Object.entries(mentions).map(
													([id, mention]) => (
														<div
															key={id}
															className="p-3 border rounded-md bg-gray-50 shadow-sm group relative"
														>
															<div className="flex justify-between items-start">
																<span className="font-semibold text-blue-600">
																	{
																		mention.mentionCode
																	}
																</span>
																<div className="flex items-center">
																	<span className="text-green-600 font-bold">
																		{
																			mention.points
																		}{" "}
																		pts
																	</span>
																	<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																		<Pencil
																			className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
																			onClick={() =>
																				handleMentionEditing(
																					selectedPlayerForMention.id,
																					selectedPlayerForMention.teamId,
																					id
																				)
																			}
																		/>
																		<X
																			className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
																			onClick={() =>
																				handleMentionDelete(
																					selectedPlayerForMention.id,
																					selectedPlayerForMention.teamId,
																					id
																				)
																			}
																		/>
																	</div>
																</div>
															</div>
															<p className="text-sm mt-1">
																{mention.desc}
															</p>
															{mention.notes && (
																<p className="text-sm text-gray-600 mt-1 italic">
																	Notes:{" "}
																	{
																		mention.notes
																	}
																</p>
															)}
														</div>
													)
												)}
											</div>
										);
									} else {
										return (
											<p className="text-gray-500 text-sm italic">
												No mentions have been added yet
											</p>
										);
									}
								})()}
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
