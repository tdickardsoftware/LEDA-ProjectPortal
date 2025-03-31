"use client";
import { useState } from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Function to convert source data to DivisionData format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertScheduleData = (sourceData: Record<string, any>, dateToDisplay: string): DivisionData => {
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
				const team = sourceData[divisionName][subdivisionName][teamLetter];

				// Check each match for this team
				for (const dateKey in team.matchesData) {
					// Skip if it doesn't match the dateToDisplay parameter
					if (dateKey !== dateToDisplay) continue;

					const match = team.matchesData[dateKey];

					// Only create a game entry if this team is the home team (to avoid duplicates)
					if (match.home) {
						result[divisionName][subdivisionName][gameCounter.toString()] = {
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
	
	// Add new state for tracking game wins
    const [homeWins, setHomeWins] = useState<boolean[]>(Array(11).fill(false));
	
	// Add new state for tracking points
    const [homePoints, setHomePoints] = useState<string[]>(Array(11).fill(''));
    const [awayPoints, setAwayPoints] = useState<string[]>(Array(11).fill(''));

	
	// Add new state variables for API operations
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isDataChanged, setIsDataChanged] = useState<boolean>(false);

	// Replace the single penalty dialog state with two separate states
	const [homePenaltyDialogOpen, setHomePenaltyDialogOpen] = useState<boolean>(false);
	const [awayPenaltyDialogOpen, setAwayPenaltyDialogOpen] = useState<boolean>(false);
	const [selectedPenaltyTeamId, setSelectedPenaltyTeamId] = useState<string>("");
	const [selectedPenaltyTeamName, setSelectedPenaltyTeamName] = useState<string>("");

	// Add state to track editing mode and current penalty being edited
	const [penaltyEditMode, setPenaltyEditMode] = useState<boolean>(false);
	const [currentEditingPenalty, setCurrentEditingPenalty] = useState<{
		id: string,
		code: string,
		points: number,
		notes: string
	} | null>(null);

	// Add state to track next penalty counters for home and away teams
    const [homePenaltyCounter, setHomePenaltyCounter] = useState<number>(0);
    const [awayPenaltyCounter, setAwayPenaltyCounter] = useState<number>(0);

	const handleDataChange = () => {
		setIsDataChanged(true);
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
        setHomeWins(Array(11).fill(false));
		
		 // Reset points when selecting a new matchup
        setHomePoints(Array(11).fill(''));
        setAwayPoints(Array(11).fill(''));
		
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
		
					setHomeWins(homeWinsArray);
					setHomePoints(homePointsArray);
					setAwayPoints(awayPointsArray);
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
        setHomeWins(prev => {
            const newWins = [...prev];
            newWins[gameIndex] = !newWins[gameIndex];
            return newWins;
        });
		handleDataChange();
    };

    // Update calculatePoints to include penalties
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
            if (formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.teamInformation?.[selectedHomeTeamId]?.penalties) {
                const homePenalties = formattedScoreData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[selectedHomeTeamId].penalties;
                // Sum all penalty points
                homePenaltyPoints = Object.values(homePenalties).reduce((sum, penalty) => sum + penalty.points, 0);
            }
            
            // Same for away team
            if (formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.teamInformation?.[selectedAwayTeamId]?.penalties) {
                const awayPenalties = formattedScoreData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[selectedAwayTeamId].penalties;
                // Sum all penalty points
                awayPenaltyPoints = Object.values(awayPenalties).reduce((sum, penalty) => sum + penalty.points, 0);
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
            finalAwayPoints 
        };
    };

    // Add handlers for updating points
    const handleHomePointsChange = (gameIndex: number, value: string) => {
        setHomePoints(prev => {
            const newPoints = [...prev];
            newPoints[gameIndex] = value;
            return newPoints;
        });
		handleDataChange();
    };

    const handleAwayPointsChange = (gameIndex: number, value: string) => {
        setAwayPoints(prev => {
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
        homeTeamPlayerInformation.forEach(player => {
          const playerGameData = homeTeamGameData[player.ledaId] || {};
          let totalPoints = 0;
          const pointsByGame: Record<string, number> = {};
          
          // Calculate points for each game
          for (let i = 0; i < 11; i++) {
            const gameKey = `Game ${i+1}`;
            // If player participated in the game, add the points
            if (playerGameData[gameKey]) {
              const gamePoints = parseInt(homePoints[i]) || 0;
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
              const gamePoints = parseInt(awayPoints[i]) || 0;
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
          homeWin: homeWins[i-1],
          homePoints: homePoints[i-1] || "0",
          awayPoints: awayPoints[i-1] || "0"
        };
      }
      
      // Use the same calculation method as displayed in the UI
      const teamPointsCalculation = calculatePoints();
      
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
                [selectedHomeTeamId]: {
                  teamLetter: selectedHomeLetter,
                  teamName: homeTeamInformation?.teamName || "",
                  home: true,
                  teamMembers: homeTeamMembers,
                  penalties: formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.teamInformation?.[selectedHomeTeamId]?.penalties || {}
                },
                [selectedAwayTeamId]: {
                  teamLetter: selectedAwayLetter,
                  teamName: awayTeamInformation?.teamName || "",
                  home: false,
                  teamMembers: awayTeamMembers,
                  penalties: formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.teamInformation?.[selectedAwayTeamId]?.penalties || {}
                }
              },
              gameInformation: gameInformation,
              teamPoints: {
                homePoints: String(teamPointsCalculation.finalHomePoints),
                awayPoints: String(teamPointsCalculation.finalAwayPoints),
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
	
	// Update the saveScoresheet function to properly handle penalty removals
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
                    // For the current matchup, use our new data completely (including penalty removals)
                    // but merge with other matchups that might exist
                    const existingScoreData = existingData.scoresheetData as FormattedScoreData;
                    
                    // Start with a clean copy of existing data
                    completeData = JSON.parse(JSON.stringify(existingScoreData));
                    
                    // Make sure our current division and subdivision exists
                    if (!completeData[selectedDivision]) {
                        completeData[selectedDivision] = {};
                    }
                    if (!completeData[selectedDivision][selectedSubdivision]) {
                        completeData[selectedDivision][selectedSubdivision] = {};
                    }
                    
                    // Replace the entire matchup data with our new version
                    // This preserves penalty removals
                    const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
                    if (data[selectedDivision]?.[selectedSubdivision]?.[matchupKey]) {
                        completeData[selectedDivision][selectedSubdivision][matchupKey] = 
                            data[selectedDivision][selectedSubdivision][matchupKey];
                    }
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

            // Save team points for each team with penalty adjustments
            const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
            const matchupData = data[selectedDivision]?.[selectedSubdivision]?.[matchupKey];

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
            setIsDataChanged(false); // Reset data change flag after successful save
            
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
			setHomeWins(Array(11).fill(false));

			// Reset points
			setHomePoints(Array(11).fill(''));
			setAwayPoints(Array(11).fill(''));

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
			setIsDataChanged(true);
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

	// Update the handler to specify which dialog to open
	const handlePenaltyClick = (teamId: string, teamName: string | undefined, isHome: boolean) => {
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

	// Update penalty submission to use counter-based IDs
    const handlePenaltySubmit = (teamId: string, penaltyCode: string, points: number, notes?: string) => {
        if (!formattedScoreData) return;
        
        const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
        
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
                teamPoints: { homePoints: "0", awayPoints: "0" }
            };
        }
        
        // Find the right team (home or away) to add the penalty to
        const teamKey = teamId === selectedHomeTeamId ? selectedHomeTeamId : selectedAwayTeamId;
        const isHomeTeam = teamId === selectedHomeTeamId;
        
        if (!updatedData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[teamKey]) {
            updatedData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[teamKey] = {
                teamLetter: teamId === selectedHomeTeamId ? selectedHomeLetter : selectedAwayLetter,
                teamName: teamId === selectedHomeTeamId ? homeTeamInformation?.teamName || "" : awayTeamInformation?.teamName || "",
                home: teamId === selectedHomeTeamId,
                teamMembers: {},
                penalties: {}
            };
        }
        
        // Ensure penalties object exists
        if (!updatedData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[teamKey].penalties) {
            updatedData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[teamKey].penalties = {};
        }
        
        // Get current counter and increment for next use
        const nextCounter = isHomeTeam ? homePenaltyCounter + 1 : awayPenaltyCounter + 1;
        
        // Add the new penalty using the counter as the key
        updatedData[selectedDivision][selectedSubdivision][matchupKey].teamInformation[teamKey].penalties[nextCounter.toString()] = {
            penaltyCode,
            points,
            notes: notes || ""
        };
        
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

	// Update penalty editing to work with the new structure
    const handlePenaltyEditing = (teamId: string, penaltyId: string) => {
        if (!formattedScoreData) return;
        
        const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
        const teamKey = teamId === selectedHomeTeamId ? selectedHomeTeamId : selectedAwayTeamId;
        
        // Check if the penalty exists
        if (
            formattedScoreData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.
            teamInformation?.[teamKey]?.penalties?.[penaltyId]
        ) {
            // Get the penalty data
            const penalty = formattedScoreData[selectedDivision][selectedSubdivision][matchupKey]
                .teamInformation[teamKey].penalties[penaltyId];
            
            // Set up the editing state
            setPenaltyEditMode(true);
            setCurrentEditingPenalty({
                id: penaltyId,
                code: penalty.penaltyCode,
                points: penalty.points,
                notes: penalty.notes || ""
            });
            
            // Set the selected team information for penalties
            setSelectedPenaltyTeamId(teamId);
            setSelectedPenaltyTeamName(teamId === selectedHomeTeamId ? 
                homeTeamInformation?.teamName || "" : 
                awayTeamInformation?.teamName || "");
            
            // Open the appropriate dialog
            if (teamId === selectedHomeTeamId) {
                setHomePenaltyDialogOpen(true);
            } else {
                setAwayPenaltyDialogOpen(true);
            }
        }
    };

	// Update penalty function to handle the new structure
    const updatePenalty = (teamId: string, penaltyId: string, newCode: string, points: number, notes?: string) => {
        if (!formattedScoreData) return;
        
        const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;
        
        // Create a copy of the current formatted score data
        const updatedData = { ...formattedScoreData };
        
        // Find the right team (home or away) to update the penalty
        const teamKey = teamId === selectedHomeTeamId ? selectedHomeTeamId : selectedAwayTeamId;
        
        // Check if the penalty exists before attempting to update
        if (
            updatedData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.
            teamInformation?.[teamKey]?.penalties?.[penaltyId]
        ) {
            // Update the existing penalty with the new values
            updatedData[selectedDivision][selectedSubdivision][matchupKey]
                .teamInformation[teamKey].penalties[penaltyId] = {
                    penaltyCode: newCode,
                    points,
                    notes: notes || ""
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

	// Update penalty removal function for the new structure
    const handlePenaltyRemoval = (teamId: string, penaltyId: string) => {
        if (!formattedScoreData) return;

        // Add confirmation dialog
        if (!window.confirm(`Are you sure you want to delete this penalty? This action cannot be undone.`)) {
            return; // Exit the function if user cancels
        }

        const matchupKey = `${selectedHomeLetter} - ${selectedAwayLetter}`;

        // Create a copy of the current formatted score data
        const updatedData = { ...formattedScoreData };

        // Find the right team (home or away) to remove the penalty from
        const teamKey = teamId === selectedHomeTeamId ? selectedHomeTeamId : selectedAwayTeamId;

        // Check if the penalty exists before attempting to remove
        if (
            updatedData[selectedDivision]?.[selectedSubdivision]?.[matchupKey]?.
            teamInformation?.[teamKey]?.penalties?.[penaltyId]
        ) {
            // Remove the penalty
            delete updatedData[selectedDivision][selectedSubdivision][matchupKey]
                .teamInformation[teamKey].penalties[penaltyId];

            // Update state
            setFormattedScoreData(updatedData);

            // Mark data as changed
            handleDataChange();
        }
    };

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
								<div className="flex flex-col gap-4 w-full">
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
													Team Name: {homeTeamInformation?.teamName}
												</div>
												<div className="text-lg font-semibold text-gray-800">
													Team ID: {selectedHomeTeamId}
												</div>
												<div className="text-md text-gray-600 mb-4">
													Team Letter: {selectedHomeLetter}
												</div>
												<div>
													<Dialog open={homePenaltyDialogOpen} onOpenChange={(open) => {
														setHomePenaltyDialogOpen(open);
														if (!open) {
															setPenaltyEditMode(false);
															setCurrentEditingPenalty(null);
														}
													}}>
														<DialogTrigger asChild>
															<Button variant="outline" className="text-sm px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100" 
																onClick={() => handlePenaltyClick(selectedHomeTeamId, homeTeamInformation?.teamName, true)}>
																<span>Penalties</span>
															</Button>
														</DialogTrigger>
														<DialogContent className="w-fit bg-white">
															<DialogHeader>
																<DialogTitle className="flex justify-center">
																	{penaltyEditMode ? "Edit" : "Add"} Penalty for Team: {selectedPenaltyTeamName}
																</DialogTitle>
															</DialogHeader>
															<PenaltyAddForm 
																setOpen={setHomePenaltyDialogOpen}
																selectedTeamId={selectedPenaltyTeamId} 
																handlePenaltySubmit={handlePenaltySubmit}
																isEditMode={penaltyEditMode}
																initialPenalty={currentEditingPenalty}
																updatePenalty={updatePenalty}
															/>
														</DialogContent>
													</Dialog>
													{/* Penalties Accordion for Home Team - Only render if penalties exist */}
													{formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[`${selectedHomeLetter} - ${selectedAwayLetter}`]?.teamInformation?.[selectedHomeTeamId]?.penalties && 
														Object.keys(formattedScoreData[selectedDivision][selectedSubdivision][`${selectedHomeLetter} - ${selectedAwayLetter}`].teamInformation[selectedHomeTeamId].penalties).length > 0 && (
														<Accordion type="single" collapsible className="w-full mt-2">
															<AccordionItem value="penalties">
																<AccordionTrigger className="text-sm font-medium text-red-600">
																	View Team Penalties
																</AccordionTrigger>
																<AccordionContent>
																	<div className="space-y-2 p-2 border rounded-md">
																		{Object.entries(formattedScoreData[selectedDivision][selectedSubdivision][`${selectedHomeLetter} - ${selectedAwayLetter}`].teamInformation[selectedHomeTeamId].penalties).map(([id, penalty]) => (
																			<div key={id} className="flex justify-between items-start border-b pb-2 group relative">
																				<div>
																					<span className="font-semibold">Code: {penalty.penaltyCode}</span>
																					<p className="text-sm text-gray-600">{penalty.notes}</p>
																				</div>
																				<div className="flex items-center">
																					<span className="text-red-600 font-bold">{penalty.points} pts</span>
																					<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																						<Pencil 
																							className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700" 
																							onClick={() => handlePenaltyEditing(selectedHomeTeamId, id)}
																						/>
																						<X 
																							className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700" 
																							onClick={() => handlePenaltyRemoval(selectedHomeTeamId, id)}
																						/>
																					</div>
																				</div>
																			</div>
																		))}
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
																<TableHead>Player Name</TableHead>
																<TableHead />
																{Array.from({ length: 11 }).map((_, i) => (
																	<TableHead key={i} className="text-center">Game {i+1}</TableHead>
																))}
															</TableRow>
														</TableHeader>
														<TableBody>
															{homeTeamPlayerInformation?.map((player) => (
																<TableRow key={player.ledaId}>
																	<TableCell className="w-fit flex items-center gap-2">
																		<span>{player.fullName}</span>
																	</TableCell>
																	<TableCell>
																		<Button variant="outline" className="text-xs px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100" onClick={() => {}}>
																			<span>Mentions</span>
																		</Button>
																	</TableCell>
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
													Team Name: {awayTeamInformation?.teamName}
												</div>
												<div className="text-lg font-semibold text-gray-800">
													Team ID: {selectedAwayTeamId}
												</div>
												<div className="text-md text-gray-600 mb-4">
													Team Letter: {selectedAwayLetter}
												</div>

													<Dialog open={awayPenaltyDialogOpen} onOpenChange={(open) => {
														setAwayPenaltyDialogOpen(open);
														if (!open) {
															setPenaltyEditMode(false);
															setCurrentEditingPenalty(null);
														}
													}}>
														<DialogTrigger asChild >
															<Button variant="outline" className="text-sm px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100" 
																onClick={() => handlePenaltyClick(selectedAwayTeamId, awayTeamInformation?.teamName, false)}>
																<span>Penalties</span>
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>
																	{penaltyEditMode ? "Edit" : "Add"} Penalty - {selectedPenaltyTeamName}
																</DialogTitle>
															</DialogHeader>
															<PenaltyAddForm 
																setOpen={setAwayPenaltyDialogOpen}
																selectedTeamId={selectedPenaltyTeamId}
																handlePenaltySubmit={handlePenaltySubmit}
																isEditMode={penaltyEditMode}
																initialPenalty={currentEditingPenalty}
																updatePenalty={updatePenalty}
															/>
														</DialogContent>
													</Dialog>
													
													{/* Penalties Accordion for Away Team - Only render if penalties exist */}
													{formattedScoreData?.[selectedDivision]?.[selectedSubdivision]?.[`${selectedHomeLetter} - ${selectedAwayLetter}`]?.teamInformation?.[selectedAwayTeamId]?.penalties && 
														Object.keys(formattedScoreData[selectedDivision][selectedSubdivision][`${selectedHomeLetter} - ${selectedAwayLetter}`].teamInformation[selectedAwayTeamId].penalties).length > 0 && (
														<Accordion type="single" collapsible className="w-full mt-2">
															<AccordionItem value="penalties">
																<AccordionTrigger className="text-sm font-medium text-red-600">
																	View Team Penalties
																</AccordionTrigger>
																<AccordionContent>
																	<div className="space-y-2 p-2 border rounded-md">
																		{Object.entries(formattedScoreData[selectedDivision][selectedSubdivision][`${selectedHomeLetter} - ${selectedAwayLetter}`].teamInformation[selectedAwayTeamId].penalties).map(([id, penalty]) => (
																			<div key={id} className="flex justify-between items-start border-b pb-2 group relative">
																				<div>
																					<span className="font-semibold">Code: {penalty.penaltyCode}</span>
																					<p className="text-sm text-gray-600">{penalty.notes}</p>
																				</div>
																				<div className="flex items-center">
																					<span className="text-red-600 font-bold">{penalty.points} pts</span>
																					<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																						<Pencil 
																							className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700" 
																							onClick={() => handlePenaltyEditing(selectedAwayTeamId, id)}
																						/>
																						<X 
																							className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700" 
																							onClick={() => handlePenaltyRemoval(selectedAwayTeamId, id)}
																						/>
																					</div>
																				</div>
																			</div>
																		))}
																	</div>
																</AccordionContent>
															</AccordionItem>
														</Accordion>
													)}
												<div className="overflow-x-auto">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Player Name</TableHead>
																<TableHead />
																{Array.from({ length: 11 }).map((_, i) => (
																	<TableHead key={i} className="text-center">Game {i + 1}</TableHead>
																))}
															</TableRow>
														</TableHeader>
														<TableBody>
															{awayTeamPlayerInformation?.map((player) => (
																<TableRow key={player.ledaId}>
																	{/* TODO Implement a mentions button next to the name */}
																	<TableCell className="w-fit flex items-center gap-2">
																		<span>{player.fullName}</span>
																	</TableCell>
																	<TableCell>
																		<Button variant="outline" className="text-xs px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100" onClick={() => {}}>
																			<span>Mentions</span>
																		</Button>
																	</TableCell>
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
                                                                            checked={homeWins[i]}
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
                                                                    value={homePoints[i]}
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
                                                                    value={awayPoints[i]}
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
                                                            Home: {calculatePoints().rawHomePoints}
                                                            {calculatePoints().homePenaltyPoints > 0 && (
                                                                <span className="text-red-600 ml-2">
                                                                    (-{calculatePoints().homePenaltyPoints} penalties)
                                                                </span>
                                                            )}
                                                            <div className="text-sm font-normal mt-1">
                                                                Final: {calculatePoints().finalHomePoints}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell 
                                                            colSpan={6} 
                                                            className="text-center font-bold"
                                                        >
                                                            Away: {calculatePoints().rawAwayPoints}
                                                            {calculatePoints().awayPenaltyPoints > 0 && (
                                                                <span className="text-red-600 ml-2">
                                                                    (-{calculatePoints().awayPenaltyPoints} penalties)
                                                                </span>
                                                            )}
                                                            <div className="text-sm font-normal mt-1">
                                                                Final: {calculatePoints().finalAwayPoints}
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isSaving || !isDataChanged} // Disable button if no data has changed
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
