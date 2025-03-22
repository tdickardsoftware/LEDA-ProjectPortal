"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";

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
import { scheduleRoute, teamRoute, playerRoute } from "@/lib/apiRoutes";
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

const SideNav = ({ data, handleMatchupSelection }: { data: DivisionData, handleMatchupSelection: (homeLetter: string, awayLetter: string, divisionName: string, subdivisionName: string) => void }) => {
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
																{
																	game.homeTeamLetter
																}{" "}
																-{" "}
																{
																	game.awayTeamLetter
																}
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

export default function WeeklyScoresheetsContent() {
    const [seasonCode, setSeasonCode] = useState<string>("");
    const [currentSeason, setCurrentSeason] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [seasonSelected, setSeasonSelected] = useState<boolean>(true);
    const [sidenavData, setSidenavData] = useState<DivisionData>({});
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

    // Add state for calculated player points
    const [calculatedPoints, setCalculatedPoints] = useState<{
      home: PlayerPoints[];
      away: PlayerPoints[];
    } | null>(null);
    
    const [showPointsModal, setShowPointsModal] = useState<boolean>(false);

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
		}
		setIsLoading(false);
	}

    const handleDateToDisplay = async (value: string) => {
        const results = await fetch(scheduleRoute + `?seasonCode=${seasonCode}`)
        const data = await results.json();
		setMatchSelected(false);
        setSidenavData(convertScheduleData(data.scheduleData, value));
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
	};
	
	// Add a handler for toggling home win status for each game
    const handleHomeWinToggle = (gameIndex: number) => {
        setHomeWins(prev => {
            const newWins = [...prev];
            newWins[gameIndex] = !newWins[gameIndex];
            return newWins;
        });
    };

    // Calculate points for home and away teams
    const calculatePoints = () => {
        const totalHomeWins = homeWins.filter(Boolean).length;
        const homePoints = totalHomeWins;
        const awayPoints = 11 - totalHomeWins;
        return { homePoints, awayPoints };
    };
	
	// Add handlers for updating points
    const handleHomePointsChange = (gameIndex: number, value: string) => {
        setHomePoints(prev => {
            const newPoints = [...prev];
            newPoints[gameIndex] = value;
            return newPoints;
        });
    };

    const handleAwayPointsChange = (gameIndex: number, value: string) => {
        setAwayPoints(prev => {
            const newPoints = [...prev];
            newPoints[gameIndex] = value;
            return newPoints;
        });
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
      
      setCalculatedPoints({
        home: homePlayerPoints,
        away: awayPlayerPoints
      });
      
      setShowPointsModal(true);
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
				<SideNav data={sidenavData} handleMatchupSelection={handleMatchupSelection}/>

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
																	<TableHead key={i} className="text-center">Game {i+1}</TableHead>
																))}
															</TableRow>
														</TableHeader>
														<TableBody>
															{awayTeamPlayerInformation?.map((player) => (
																<TableRow key={player.ledaId}>
																	<TableCell>{player.fullName}</TableCell>
																	{Array.from({ length: 11 }).map((_, i) => {
																		const gameKey = `Game ${i+1}`;
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
                                                            Home: {calculatePoints().homePoints}
                                                        </TableCell>
                                                        <TableCell 
                                                            colSpan={6} 
                                                            className="text-center font-bold"
                                                        >
                                                            Away: {calculatePoints().awayPoints}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </FolderTab>
								
								{/* Add Save Button */}
                                <div className="flex justify-end mt-4">
                                    <Button 
                                        onClick={calculatePlayerPoints}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Save Scoresheets
                                    </Button>
                                </div>
                                
                                {/* Display calculated points in a modal or section */}
                                {showPointsModal && calculatedPoints && (
                                    <div className="mt-6 border rounded-md p-4 bg-gray-50">
                                        <div className="flex justify-between mb-4">
                                            <h3 className="text-lg font-bold">Calculated Points</h3>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setShowPointsModal(false)}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Home Team Points */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-2">Home Team</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Player</TableHead>
                                                            <TableHead className="text-right">Total Points</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {calculatedPoints.home.map(player => (
                                                            <TableRow key={player.playerId}>
                                                                <TableCell>{player.playerName}</TableCell>
                                                                <TableCell className="text-right">{player.totalPoints}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            
                                            {/* Away Team Points */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-2">Away Team</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Player</TableHead>
                                                            <TableHead className="text-right">Total Points</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {calculatedPoints.away.map(player => (
                                                            <TableRow key={player.playerId}>
                                                                <TableCell>{player.playerName}</TableCell>
                                                                <TableCell className="text-right">{player.totalPoints}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                )}
								</div>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
