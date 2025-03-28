"use client";
import { useState, useMemo, useCallback } from "react";
import { ChevronRight, ChevronDown, X, CheckCircle, AlertTriangle } from "lucide-react";
import debounce from "lodash.debounce";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import WeekSelector from "@/components/ui/week-selector";
import { scheduleRoute, teamRoute, playerRoute, weeklyScoresheetsRoute } from "@/lib/apiRoutes";
import FolderTab from "@/components/ui/folder-tab";
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

// Types for our data structure
interface Game {
	homeTeamLetter: string;
	homeTeamId: string;
	awayTeamLetter: string;
	awayTeamId: string;
}

interface Subdivision {
	[gameNumber: string]: Game;
}

interface Division {
	[subdivisionName: string]: Subdivision;
}

interface DivisionData {
	[divisionName: string]: Division;
}

// Interface for the source data structure
interface TeamMatchData {
	matchDate: string;
	matchTime: string;
	home: boolean;
	opposingTeamId: string;
	opposingTeamLetter: string;
}

interface Team {
	teamName: string;
	teamId: string;
	matchesData: {
		[dateKey: string]: TeamMatchData;
	};
}

interface SourceData {
	[diamondName: string]: {
		[subdivisionName: string]: {
			[teamLetter: string]: Team;
		};
	};
}

// Function to convert source data to DivisionData format
const convertScheduleData = (sourceData: SourceData, dateToDisplay: string): DivisionData => {
	const result: DivisionData = {};

	// Iterate through all divisions
	for (const divisionName in sourceData) {
		result[divisionName] = {};

		// Iterate through all subdivisions
		for (const subdivisionName in sourceData[divisionName]) {
			result[divisionName][subdivisionName] = {};
			let gameCounter = 1;

			// Iterate through all teams
			for (const teamLetter in sourceData[divisionName][subdivisionName]) {
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

const SideNav = ({ data, formattedScoreData, handleMatchupSelection }: { data: DivisionData, formattedScoreData: FormattedScoreData | null, handleMatchupSelection: (homeLetter: string, awayLetter: string, divisionName: string, subdivisionName: string) => void }) => {
	const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>(
		{}
	);
	const [openSubdivisions, setOpenSubdivisions] = useState<
		Record<string, boolean>
	>({});
	const [selectedMatchup, setSelectedMatchup] = useState<{ home: string; away: string } | null>(null);

	const toggleDivision = (division: string) => {
		setOpenDivisions((prev) => ({
			...prev,
			[division]: !prev[division],
		}));
	};

	const toggleSubdivision = (division: string, subdivision: string) => {
		const key = `${division}-${subdivision}`;
		setOpenSubdivisions((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const isMatchupBlank = (divisionName: string, subdivisionName: string, matchupKey: string): boolean => {
		const matchupData = formattedScoreData?.[divisionName]?.[subdivisionName]?.[matchupKey];
		if (!matchupData) {
			// If no data exists for the matchup, consider it blank
			return true;
		}

		// Check if all player game data is false
		const isHomeGameDataBlank = Object.values(matchupData.teamInformation["1"].teamMembers).every(member =>
			Object.values(member.gameStats).every(game => !game)
		);
		const isAwayGameDataBlank = Object.values(matchupData.teamInformation["2"].teamMembers).every(member =>
			Object.values(member.gameStats).every(game => !game)
		);

		// Check if all home wins are false
		const areHomeWinsBlank = Object.values(matchupData.gameInformation).every(game => !game.homeWin);

		// Check if all points are 0 or empty
		const areHomePointsBlank = Object.values(matchupData.gameInformation).every(game => game.homePoints === '' || game.homePoints === '0');
		const areAwayPointsBlank = Object.values(matchupData.gameInformation).every(game => game.awayPoints === '' || game.awayPoints === '0');

		return isHomeGameDataBlank && isAwayGameDataBlank && areHomeWinsBlank && areHomePointsBlank && areAwayPointsBlank;
	};

	// Check if data is empty or null
	if (!data || Object.keys(data).length === 0) {
		return (
			<div className="w-64 border-r max-h-[75vh] flex items-center justify-center p-4">
				<p className="text-gray-500 text-center">Select a week to display weekly scoresheets...</p>
			</div>
		);
	}

	return (
		<div className="w-64 border-r max-h-[75vh]">
			<ScrollArea className="h-full">
				<div className="p-4 space-y-2">
					{Object.keys(data).map((divisionName) => (
						<Collapsible
							key={divisionName}
							open={openDivisions[divisionName]}
							onOpenChange={() => toggleDivision(divisionName)}
							className="border-b border-gray-100 pb-2"
						>
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									className="w-full justify-between font-medium text-lg p-2 h-auto"
								>
									{divisionName}
									{openDivisions[divisionName] ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="ml-4 mt-1 space-y-1">
								{Object.keys(data[divisionName]).map(
									(subdivisionName) => {
										const subdivKey = `${divisionName}-${subdivisionName}`;
										return (
											<Collapsible
												key={subdivKey}
												open={
													openSubdivisions[subdivKey]
												}
												onOpenChange={() =>
													toggleSubdivision(
														divisionName,
														subdivisionName
													)
												}
												className="pb-1"
											>
												<CollapsibleTrigger asChild>
													<Button
														variant="ghost"
														className="w-full justify-between text-base p-1 h-auto"
													>
														{subdivisionName}
														{openSubdivisions[
															subdivKey
														] ? (
															<ChevronDown className="h-3 w-3" />
														) : (
															<ChevronRight className="h-3 w-3" />
														)}
													</Button>
												</CollapsibleTrigger>
												<CollapsibleContent className="ml-4 mt-1 space-y-1">
													{Object.keys(
														data[divisionName][
															subdivisionName
														]
													).map((gameNumber) => {
														const game =
															data[divisionName][
																subdivisionName
															][gameNumber];
														const isSelected = 
															selectedMatchup?.home === game.homeTeamLetter && 
															selectedMatchup?.away === game.awayTeamLetter;

														// Determine if scoresheet data exists for this matchup
														const matchupKey = `${game.homeTeamLetter} - ${game.awayTeamLetter}`;
														const showYellowFlag = isMatchupBlank(divisionName, subdivisionName, matchupKey);

														return (
															<Button
																key={`${subdivKey}-${gameNumber}`}
																variant="ghost"
																className={`w-full justify-start text-sm p-1 h-auto ${isSelected ? 'bg-gray-200' : ''} hover:bg-gray-400`}
																onClick={() => {
																	setSelectedMatchup({ 
																		home: game.homeTeamLetter, 
																		away: game.awayTeamLetter 
																	});
																	handleMatchupSelection(game.homeTeamLetter, game.awayTeamLetter, divisionName, subdivisionName);
																}}
															>
																<div className="flex items-center gap-2">
																	<span>
																		{game.homeTeamLetter} - {game.awayTeamLetter}
																	</span>
																	{showYellowFlag ? (
																		<AlertTriangle className="h-4 w-4 text-yellow-500" />
																	) : (
																		<CheckCircle className="h-4 w-4 text-green-500" />
																	)}
																</div>
															</Button>
														);
													})}
												</CollapsibleContent>
											</Collapsible>
										);
									}
								)}
							</CollapsibleContent>
						</Collapsible>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};

// Add these new interfaces for game data management
interface PlayerGameData {
  [gameKey: string]: boolean; // e.g., "Game 1": false, "Game 2": true, etc.
}

interface TeamGameData {
  [playerId: string]: PlayerGameData;
}

// Add these new interfaces
interface PlayerPoints {
  playerId: string;
  playerName: string;
  totalPoints: number;
  pointsByGame: Record<string, number>;
}

// Add new interface for the formatted JSON data
interface FormattedScoreData {
  [division: string]: {
    [subdivision: string]: {
      [matchup: string]: {
        teamInformation: {
          [teamId: string]: {
            teamLetter: string;
            teamName: string;
            home: boolean;
            teamMembers: {
              [playerId: string]: {
                name: string;
                gameStats: Record<string, boolean>;
                gamePoints: string;
              };
            };
          };
        };
        gameInformation: {
          [game: string]: {
            homeWin: boolean;
            homePoints: string;
            awayPoints: string;
          };
        };
        teamPoints: {
          homePoints: string;
          awayPoints: string;
        };
      };
    };
  };
}

// Improved deep merge utility function with proper type handling
const deepMerge = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T, 
  source: U
): T & U => {
  const output = { ...target } as T & U;
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
		  (output as Record<string, unknown>)[key] = source[key];
        } else if (isObject(target[key])) {
		  (output as Record<string, unknown>)[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
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

// Type-safe object check with type predicate
const isObject = (item: unknown): item is Record<string, unknown> => {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
};

export default function WeeklyScoresheetsContent() {
    const [seasonCode, setSeasonCode] = useState<string>("");
    const [currentSeason, setCurrentSeason] = useState<boolean>(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [disabled, setDisabled] = useState<boolean>(false);
    const [seasonSelected, setSeasonSelected] = useState<boolean>(true);
    const [sidenavData, setSidenavData] = useState<DivisionData>({});
    const [formattedScoreData, setFormattedScoreData] = useState<FormattedScoreData | null>(null); // Initialize formattedScoreData
	const [matchSelected, setMatchSelected] = useState<boolean>(false);
	const [selectedHomeLetter, setSelectedHomeLetter] = useState<string>("");
	const [selectedAwayLetter, setSelectedAwayLetter] = useState<string>("");
	const [selectedDivision, setSelectedDivision] = useState<string>("");
	const [selectedSubdivision, setSelectedSubdivision] = useState<string>("");
	const [selectedHomeTeamId, setSelectedHomeTeamId] = useState<string>("");
	const [selectedAwayTeamId, setSelectedAwayTeamId] = useState<string>("");
	const [homeTeamInformation, setHomeTeamInformation] = useState<Team>();
	const [awayTeamInformation, setAwayTeamInformation] = useState<Team>();
	const [homeTeamPlayerInformation, setHomeTeamPlayerInformation] = useState<Player[]>();
	const [awayTeamPlayerInformation, setAwayTeamPlayerInformation] = useState<Player[]>();
	
	// Replace old game status state with the new structured format
	const [homeTeamGameData, setHomeTeamGameData] = useState<TeamGameData>({});
	const [awayTeamGameData, setAwayTeamGameData] = useState<TeamGameData>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
	
	// Consolidate related state
	const [gameData, setGameData] = useState({
		homePoints: Array(11).fill(''),
		awayPoints: Array(11).fill(''),
		homeWins: Array(11).fill(false),
		isDataChanged: false,
	});
	
	// Add new state variables for API operations
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);

	const handleDataChange = () => {
		setGameData(prev => ({
			...prev,
			isDataChanged: true,
		}));
	};

    const handleSeasonCodeSelect = (value: string) => {
        setSeasonCode(value);
        setSeasonSelected(false);
    }

	const handleMatchupSelection = async (homeLetter: string, awayLetter: string, divisionName: string, subdivisionName:string) => {
		setMatchSelected(true);
		setIsLoading(true);
		setSelectedDivision(divisionName);
		setSelectedSubdivision(subdivisionName);
		setSelectedHomeLetter(homeLetter);
		setSelectedAwayLetter(awayLetter);
		
		// Reset player information when loading a new matchup
		setHomeTeamPlayerInformation(undefined);
		setAwayTeamPlayerInformation(undefined);
		setHomeTeamGameData({});  // Reset the game data
		setAwayTeamGameData({});  // Reset the game data
		
		 // Reset game wins when selecting a new matchup
        setGameData(prev => ({
			...prev,
			homeWins: Array(11).fill(false),
		}));
		
		 // Reset points when selecting a new matchup
        setGameData(prev => ({
			...prev,
			homePoints: Array(11).fill(''),
			awayPoints: Array(11).fill(''),
		}));
		
		// Find team IDs from sidenavData based on the letters
		if (sidenavData[divisionName] && sidenavData[divisionName][subdivisionName]) {
			// Iterate through all games in this subdivision to find the matching one
			const games = sidenavData[divisionName][subdivisionName];
			for (const gameNumber in games) {
				const game = games[gameNumber];
				if (game.homeTeamLetter === homeLetter && game.awayTeamLetter === awayLetter) {
					setSelectedHomeTeamId(game.homeTeamId);
					// Fetch the home team information
					const resultsHome = await fetch(teamRoute + `?ledaId=${game.homeTeamId}`);
					const dataHome = await resultsHome.json();
					// set the home team information
					setHomeTeamInformation(dataHome);
					
					// Fetch home team player information
					const homePlayers: Player[] = [];
					if (dataHome.memberIdList) {
						for (const playerKey in dataHome.memberIdList) {
							const playerInfo = dataHome.memberIdList[playerKey];
							const playerResponse = await fetch(playerRoute + `?ledaId=${playerInfo.ledaId}`);
							const playerData = await playerResponse.json();
							homePlayers.push(playerData);
						}
					}
					setHomeTeamPlayerInformation(homePlayers);
					
					// Initialize game data for each home player
					const homeGameData: TeamGameData = {};
					homePlayers.forEach(player => {
						const playerGameData: PlayerGameData = {};
						for (let i = 1; i <= 11; i++) {
							playerGameData[`Game ${i}`] = false;
						}
						homeGameData[player.ledaId] = playerGameData;
					});

					console.log(homeGameData);
					setHomeTeamGameData(homeGameData);
					
					// set the away team id
					setSelectedAwayTeamId(game.awayTeamId);
					// fetch away team information
					const resultsAway = await fetch(teamRoute + `?ledaId=${game.awayTeamId}`);
					const dataAway = await resultsAway.json();
					// set the away team information
					setAwayTeamInformation(dataAway);
					
					// Fetch away team player information
					const awayPlayers: Player[] = [];
					if (dataAway.memberIdList) {
						for (const playerKey in dataAway.memberIdList) {
							const playerInfo = dataAway.memberIdList[playerKey];
							const playerResponse = await fetch(playerRoute + `?ledaId=${playerInfo.ledaId}`);
							const playerData = await playerResponse.json();
							awayPlayers.push(playerData);
						}
					}
					setAwayTeamPlayerInformation(awayPlayers);
					
					// Initialize game data for each away player
					const awayGameData: TeamGameData = {};
					awayPlayers.forEach(player => {
						const playerGameData: PlayerGameData = {};
						for (let i = 1; i <= 11; i++) {
							playerGameData[`Game ${i}`] = false;
						}
						awayGameData[player.ledaId] = playerGameData;
					});
					setAwayTeamGameData(awayGameData);
					
					break;
				}
			}
			if (formattedScoreData && formattedScoreData[divisionName] && formattedScoreData[divisionName][subdivisionName]) {
				const matchupKey = `${homeLetter} - ${awayLetter}`;
				const matchupData = formattedScoreData[divisionName][subdivisionName][matchupKey];
		
				if (matchupData) {
					// Set home team data
					setSelectedHomeTeamId(Object.keys(matchupData.teamInformation)[0]);
					setHomeTeamInformation({
						teamName: matchupData.teamInformation["1"].teamName,
						teamId: matchupData.teamInformation["1"].teamLetter,
						matchesData: {}, // Populate if necessary
					});
					setHomeTeamPlayerInformation(
						Object.values(matchupData.teamInformation["1"].teamMembers).map((member, index) => ({
							ledaId: index + 1, // Convert to number
							firstName: member.name.split(" ")[0] || "",
							lastName: member.name.split(" ")[1] || "",
							middleInitial: "",
							addressOne: "",
							addressTwo: "",
							city: "",
							state: "",
							zip: "",
							phoneNumber: "",
							email: "",
							fullName: member.name,
							gender: "Unknown", // Default or fetched value
							dateOfBirth: new Date(), // Default or fetched value
						}))
					);
		
					// Set away team data
					setSelectedAwayTeamId(Object.keys(matchupData.teamInformation)[1]);
					setAwayTeamInformation({
						teamName: matchupData.teamInformation["2"].teamName,
						teamId: matchupData.teamInformation["2"].teamLetter,
						matchesData: {}, // Populate if necessary
					});
					setAwayTeamPlayerInformation(
						Object.values(matchupData.teamInformation["2"].teamMembers).map((member, index) => ({
							ledaId: index + 1, // Convert to number
							firstName: member.name.split(" ")[0] || "",
							lastName: member.name.split(" ")[1] || "",
							middleInitial: "",
							addressOne: "",
							addressTwo: "",
							city: "",
							state: "",
							zip: "",
							phoneNumber: "",
							email: "",
							fullName: member.name,
							gender: "Unknown", // Default or fetched value
							dateOfBirth: new Date(), // Default or fetched value
						}))
					);
		
					// Set game data
					const homeGameData: TeamGameData = {};
					const awayGameData: TeamGameData = {};
					Object.entries(matchupData.teamInformation["1"].teamMembers).forEach(([playerId, member]) => {
						homeGameData[playerId] = member.gameStats;
					});
					Object.entries(matchupData.teamInformation["2"].teamMembers).forEach(([playerId, member]) => {
						awayGameData[playerId] = member.gameStats;
					});
					setHomeTeamGameData(homeGameData);
					setAwayTeamGameData(awayGameData);
		
					// Set game points and wins
					const gameInformation = matchupData.gameInformation;
					const homeWinsArray = Array(11).fill(false);
					const homePointsArray = Array(11).fill("");
					const awayPointsArray = Array(11).fill("");
		
					Object.entries(gameInformation).forEach(([, gameData], index) => {
						homeWinsArray[index] = gameData.homeWin;
						homePointsArray[index] = gameData.homePoints;
						awayPointsArray[index] = gameData.awayPoints;
					});
		
					setGameData(prev => ({
						...prev,
						homeWins: homeWinsArray,
						homePoints: homePointsArray,
						awayPoints: awayPointsArray,
					}));
				}
			}
		}
		setIsLoading(false);
	}

    const handleDateToDisplay = async (value: string) => {
        const results = await fetch(scheduleRoute + `?seasonCode=${seasonCode}`)
        const data = await results.json();
		setMatchSelected(false);
        setSidenavData(convertScheduleData(data.scheduleData, value));
        
        // Extract the week number from "DateX" format
        const weekNumber = value.replace("Date", "");
        setSelectedWeek(weekNumber);
        console.log("Selected week:", weekNumber);

        // Fetch existing scoresheet data for the selected week and season code
        try {
            const scoresheetResponse = await fetch(`${weeklyScoresheetsRoute}?seasonCode=${seasonCode}&weekNumber=${weekNumber}`);
            if (scoresheetResponse.ok) {
                const scoresheetData = await scoresheetResponse.json();
                if (scoresheetData && scoresheetData.scoresheetData) {
                    setFormattedScoreData(scoresheetData.scoresheetData); // Update formattedScoreData
                }
            }
        } catch (error) {
            console.error("Error fetching scoresheet data:", error);
        }
    }

	// Update game toggle handler to work with the new structure
	const handleGameToggle = (teamType: 'home' | 'away', playerId: string, gameIndex: number) => {
		const gameKey = `Game ${gameIndex + 1}`; // Convert index to "Game X" format
		
		if (teamType === 'home') {
			setHomeTeamGameData(prev => {
				const playerData = prev[playerId] || {};
				return {
					...prev,
					[playerId]: {
						...playerData,
						[gameKey]: !playerData[gameKey]
					}
				};
			});
		} else {
			setAwayTeamGameData(prev => {
				const playerData = prev[playerId] || {};
				return {
					...prev,
					[playerId]: {
						...playerData,
						[gameKey]: !playerData[gameKey]
					}
				};
			});
		}
		handleDataChange();
	};
	
	// Add a handler for toggling home win status for each game
    const handleHomeWinToggle = (gameIndex: number) => {
        setGameData(prev => ({
			...prev,
			homeWins: prev.homeWins.map((win, i) => i === gameIndex ? !win : win),
		}));
		handleDataChange();
    };

    // Memoize points calculation
    const calculatePoints = useMemo(() => {
        const totalHomeWins = gameData.homeWins.filter(Boolean).length;
        return { 
            homePoints: totalHomeWins, 
            awayPoints: 11 - totalHomeWins 
        };
    }, [gameData.homeWins]);
	
	// Batch state updates for points
    const handleHomePointsChange = (gameIndex: number, value: string) => {
        setGameData(prev => ({
            ...prev,
            homePoints: prev.homePoints.map((p, i) => i === gameIndex ? value : p),
            isDataChanged: true,
        }));
    };

    const handleAwayPointsChange = (gameIndex: number, value: string) => {
        setGameData(prev => ({
            ...prev,
            awayPoints: prev.awayPoints.map((p, i) => i === gameIndex ? value : p),
            isDataChanged: true,
        }));
    };

    const calculatePlayerPoints = () => {
      // Calculate home team player points
      const homePlayerPoints: PlayerPoints[] = [];
      
      if (homeTeamPlayerInformation) {
        homeTeamPlayerInformation.forEach(player => {
          const playerGameData = homeTeamGameData[player.ledaId] || {};
          let totalPoints = 0;
          const pointsByGame: Record<string, number> = {};
          
          // Calculate points for each game
          for (let i = 0; i < 11; i++) {
            const gameKey = `Game ${i+1}`;
            // If player participated in the game, add the points
            if (playerGameData[gameKey]) {
              const gamePoints = parseInt(gameData.homePoints[i]) || 0;
              totalPoints += gamePoints;
              pointsByGame[gameKey] = gamePoints;
            } else {
              pointsByGame[gameKey] = 0;
            }
          }
          
          homePlayerPoints.push({
            playerId: String(player.ledaId),
            playerName: player.fullName,
            totalPoints,
            pointsByGame
          });
        });
      }
      
      // Calculate away team player points
      const awayPlayerPoints: PlayerPoints[] = [];
      
      if (awayTeamPlayerInformation) {
        awayTeamPlayerInformation.forEach(player => {
          const playerGameData = awayTeamGameData[player.ledaId] || {};
          let totalPoints = 0;
          const pointsByGame: Record<string, number> = {};
          
          // Calculate points for each game
          for (let i = 0; i < 11; i++) {
            const gameKey = `Game ${i+1}`;
            // If player participated in the game, add the points
            if (playerGameData[gameKey]) {
              const gamePoints = parseInt(gameData.awayPoints[i]) || 0;
              totalPoints += gamePoints;
              pointsByGame[gameKey] = gamePoints;
            } else {
              pointsByGame[gameKey] = 0;
            }
          }
          
          awayPlayerPoints.push({
            playerId: String(player.ledaId),
            playerName: player.fullName,
            totalPoints,
            pointsByGame
          });
        });
      }
      
      // Format data in the requested JSON structure
      const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
      
      // Build gameInformation object
	  const gameInformation: Record<string, { homeWin: boolean; homePoints: string; awayPoints: string }> = {};
      for (let i = 1; i <= 11; i++) {
        gameInformation[`Game ${i}`] = {
          homeWin: gameData.homeWins[i-1],
          homePoints: gameData.homePoints[i-1] || "0",
          awayPoints: gameData.awayPoints[i-1] || "0"
        };
      }
      
      // Use the same calculation method as displayed in the UI
      const teamPointsCalculation = calculatePoints;
      
      // Build home team members
	  const homeTeamMembers: Record<string, { 
		name: string; 
		gameStats: Record<string, boolean>; 
		gamePoints: string; 
	  }> = {};
      homeTeamPlayerInformation?.forEach((player, index) => {
        const playerGameStats: Record<string, boolean> = {};
        for (let i = 1; i <= 11; i++) {
          const gameKey = `Game ${i}`;
          playerGameStats[gameKey] = homeTeamGameData[player.ledaId]?.[gameKey] || false;
        }
        
        homeTeamMembers[String(index + 1)] = {
          name: player.fullName,
          gameStats: playerGameStats,
          gamePoints: String(homePlayerPoints.find(p => p.playerId === String(player.ledaId))?.totalPoints || 0)
        };
      });
      
      // Build away team members
	  const awayTeamMembers: Record<string, { 
		name: string; 
		gameStats: Record<string, boolean>; 
		gamePoints: string; 
	  }> = {};
      awayTeamPlayerInformation?.forEach((player, index) => {
        const playerGameStats: Record<string, boolean> = {};
        for (let i = 1; i <= 11; i++) {
          const gameKey = `Game ${i}`;
          playerGameStats[gameKey] = awayTeamGameData[player.ledaId]?.[gameKey] || false;
        }
        
        awayTeamMembers[String(index + 1)] = {
          name: player.fullName,
          gameStats: playerGameStats,
          gamePoints: String(awayPlayerPoints.find(p => p.playerId === String(player.ledaId))?.totalPoints || 0)
        };
      });
      
      // Create the new formatted data
      const newData: FormattedScoreData = {
        [selectedDivision]: {
          [selectedSubdivision]: {
            [matchupKey]: {
              teamInformation: {
                "1": {
                  teamLetter: selectedHomeLetter,
                  teamName: homeTeamInformation?.teamName || "",
                  home: true,
                  teamMembers: homeTeamMembers
                },
                "2": {
                  teamLetter: selectedAwayLetter,
                  teamName: awayTeamInformation?.teamName || "",
                  home: false,
                  teamMembers: awayTeamMembers
                }
              },
              gameInformation: gameInformation,
              teamPoints: {
                homePoints: String(teamPointsCalculation.homePoints),
                awayPoints: String(teamPointsCalculation.awayPoints)
              }
            }
          }
        }
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
	
	// Add new function to save data to the database
    const saveScoresheet = async (data: FormattedScoreData) => {
        if (!seasonCode || !selectedWeek) {
            return;
        }

        setIsSaving(true);

        try {
            // First, try to fetch existing scoresheet data for this season and week
            const fetchResponse = await fetch(`${weeklyScoresheetsRoute}?seasonCode=${seasonCode}&weekNumber=${selectedWeek}`);
            
            let completeData: FormattedScoreData = data;
            
            // If there's existing data, merge it with our new data
            if (fetchResponse.ok) {
                const existingData = await fetchResponse.json();
                if (existingData && existingData.scoresheetData) {
                    // Merge existing scoresheet data with new data
                    completeData = deepMerge(existingData.scoresheetData, data) as FormattedScoreData;
                }
            }
            
            // Now save the complete merged data
            const saveResponse = await fetch(weeklyScoresheetsRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    seasonCode: seasonCode,
                    weekNumber: selectedWeek,
                    scoresheetData: completeData
                }),
            });
            
            if (!saveResponse.ok) {
                throw new Error(`Server responded with ${saveResponse.status}: ${saveResponse.statusText}`);
            }

            // Save team points for each team
            const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
            const matchupData = data[selectedDivision]?.[selectedSubdivision]?.[matchupKey];

            if (matchupData) {
                const homeTeamPointsPayload = {
                    seasonCode,
                    weekNumber: parseInt(selectedWeek),
                    ledaId: selectedHomeTeamId,
                    totalPoints: parseInt(matchupData.teamPoints.homePoints),
                };

                const awayTeamPointsPayload = {
                    seasonCode,
                    weekNumber: parseInt(selectedWeek),
                    ledaId: selectedAwayTeamId,
                    totalPoints: parseInt(matchupData.teamPoints.awayPoints),
                };

                // Save home team points
                await fetch(`${weeklyScoresheetsRoute}/teamPoints`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(homeTeamPointsPayload),
                });

                // Save away team points
                await fetch(`${weeklyScoresheetsRoute}/teamPoints`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(awayTeamPointsPayload),
                });

                // Save player points for each player in the home team
                const homePlayers = matchupData.teamInformation["1"].teamMembers;
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
                    };

                    await fetch(`${weeklyScoresheetsRoute}/playerPoints`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(playerPointsPayload),
                    });
                }

                // Save player points for each player in the away team
                const awayPlayers = matchupData.teamInformation["2"].teamMembers;
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
                    };

                    await fetch(`${weeklyScoresheetsRoute}/playerPoints`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(playerPointsPayload),
                    });
                }
            }

            const result = await saveResponse.json();
            console.log('Scoresheet saved successfully:', result);
            
            // Update the local state with the complete data to show accurate representation
            setFormattedScoreData(completeData);
            setGameData(prev => ({
				...prev,
				isDataChanged: false,
			}));
            
        } catch (error) {
            console.error('Error saving scoresheet:', error);
        } finally {
            setIsSaving(false);
        }
    };

	const resetScoresheet = () => {
		if (window.confirm("Are you sure you want to reset this scoresheet? This action cannot be undone.")) {
			// Reset home and away team game data
			setHomeTeamGameData({});
			setAwayTeamGameData({});

			// Reset home win checkboxes
			setGameData(prev => ({
				...prev,
				homeWins: Array(11).fill(false),
			}));

			// Reset points
			setGameData(prev => ({
				...prev,
				homePoints: Array(11).fill(''),
				awayPoints: Array(11).fill(''),
			}));

			// Reset formattedScoreData for this matchup
			if (formattedScoreData) {
				const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
				const updatedData = { ...formattedScoreData };

				if (
					updatedData[selectedDivision] &&
					updatedData[selectedDivision][selectedSubdivision] &&
					updatedData[selectedDivision][selectedSubdivision][matchupKey]
				) {
					delete updatedData[selectedDivision][selectedSubdivision][matchupKey];

					// If no matchups remain in the subdivision, remove it
					if (Object.keys(updatedData[selectedDivision][selectedSubdivision]).length === 0) {
						delete updatedData[selectedDivision][selectedSubdivision];
					}

					// If no subdivisions remain in the division, remove it
					if (Object.keys(updatedData[selectedDivision]).length === 0) {
						delete updatedData[selectedDivision];
					}
				}

				setFormattedScoreData(updatedData);
			}

			// Mark data as changed to enable the "Save Scoresheet" button
			setGameData(prev => ({
				...prev,
				isDataChanged: true,
			}));
		}
	};

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
			<div className="flex gap-4">
                <SeasonCodeSelector
                    disabled={currentSeason}
                    handleSelect={handleSeasonCodeSelect}
                    setDisabled={setDisabled}
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
                    <WeekSelector seasonCode={seasonCode} disabled={seasonSelected} handleSelect={handleDateToDisplay} />
                </div>
            </div>
            <div className="mt-4">
                <Separator orientation="horizontal" className="bg-gray-400 w-100"/>
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
								<p className="text-gray-500 text-center">Select a matchup...</p>
							</div>
						) : (
							<div className="flex h-full items-start justify-start gap-2 flex-col">
								<div className="flex flex-col gap-2 w-full">
									<div className="text-2xl font-semibold">
										{selectedDivision}
									</div>
									<div className="text-xl font-semibold">
										{selectedSubdivision}
									</div>
									<div>
										Matchup for {selectedHomeLetter} vs {selectedAwayLetter}
									</div>
									<FolderTab title="Home">
										{isLoading || !homeTeamPlayerInformation ? (
											<FolderTabSkeleton />
										) : (
											<>
												<div className="text-lg font-bold text-gray-800">
													Team ID: {selectedHomeTeamId}
												</div>
												<div className="text-md text-gray-600 mb-4">
													Team Letter: {selectedHomeLetter}
												</div>
												<div className="overflow-x-auto">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Player Name</TableHead>
																{Array.from({ length: 11 }).map((_, i) => (
																	<TableHead key={i} className="text-center">Game {i+1}</TableHead>
																))}
															</TableRow>
														</TableHeader>
														<TableBody>
															{homeTeamPlayerInformation?.map((player) => (
																<TableRow key={player.ledaId}>
																	<TableCell>{player.fullName}</TableCell>
																	{Array.from({ length: 11 }).map((_, i) => {
																		const gameKey = `Game ${i+1}`;
																		return (
																			<TableCell 
																				key={i} 
																				className="text-center cursor-pointer"
																				onClick={() => handleGameToggle('home', String(player.ledaId), i)}
																			>
																				<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																					{homeTeamGameData[player.ledaId]?.[gameKey] && <X className="h-5 w-5" />}
																				</div>
																			</TableCell>
																		);
																	})}
																</TableRow>
															))}
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
													Team ID: {selectedAwayTeamId}
												</div>
												<div className="text-md text-gray-600 mb-4">
													Team Letter: {selectedAwayLetter}
												</div>
												<div className="overflow-x-auto">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Player Name</TableHead>
																{Array.from({ length: 11 }).map((_, i) => (
																	<TableHead key={i} className="text-center">Game {i + 1}</TableHead>
																))}
															</TableRow>
														</TableHeader>
														<TableBody>
															{awayTeamPlayerInformation?.map((player) => (
																<TableRow key={player.ledaId}>
																	<TableCell>{player.fullName}</TableCell>
																	{Array.from({ length: 11 }).map((_, i) => {
																		const gameKey = `Game ${i + 1}`;
																		return (
																			<TableCell
																				key={i}
																				className="text-center cursor-pointer"
																				onClick={() => handleGameToggle('away', String(player.ledaId), i)}
																			>
																				<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																					{awayTeamGameData[player.ledaId]?.[gameKey] && <X className="h-5 w-5" />}
																				</div>
																			</TableCell>
																		);
																	})}
																</TableRow>
															))}
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
                                                        {Array.from({ length: 11 }).map((_, i) => (
                                                            <TableHead key={i} className="text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span>Game {i+1}</span>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`home-win-${i}`}
                                                                            checked={gameData.homeWins[i]}
                                                                            onCheckedChange={() => handleHomeWinToggle(i)}
                                                                        />
                                                                        <Label 
                                                                            htmlFor={`home-win-${i}`}
                                                                            className="text-xs"
                                                                        >
                                                                            Home Win
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="font-medium">Home Points</TableCell>
                                                        {Array.from({ length: 11 }).map((_, i) => (
                                                            <TableCell key={i} className="text-center">
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    value={gameData.homePoints[i]}
                                                                    onChange={(e) => handleHomePointsChange(i, e.target.value)}
                                                                    className="w-12 text-center border border-gray-300 rounded p-1"
                                                                    placeholder="0"
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="font-medium">Away Points</TableCell>
                                                        {Array.from({ length: 11 }).map((_, i) => (
                                                            <TableCell key={i} className="text-center">
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    value={gameData.awayPoints[i]}
                                                                    onChange={(e) => handleAwayPointsChange(i, e.target.value)}
                                                                    className="w-12 text-center border border-gray-300 rounded p-1"
                                                                    placeholder="0"
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                    <TableRow className="bg-gray-50">
                                                        <TableCell className="font-bold">Total</TableCell>
                                                        <TableCell 
                                                            colSpan={5} 
                                                            className="text-center font-bold"
                                                        >
                                                            Home: {calculatePoints.homePoints}
                                                        </TableCell>
                                                        <TableCell 
                                                            colSpan={6} 
                                                            className="text-center font-bold"
                                                        >
                                                            Away: {calculatePoints.awayPoints}
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isSaving || !gameData.isDataChanged} // Disable button if no data has changed
                                    >
                                        {isSaving ? 'Saving...' : 'Save Scoresheet'}
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
		</div>
	);
}
