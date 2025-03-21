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

interface Diamond {
	[subdivisionName: string]: Subdivision;
}

interface DiamondData {
	[diamondName: string]: Diamond;
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

// Function to convert source data to DiamondData format
const convertScheduleData = (sourceData: SourceData, dateToDisplay: string): DiamondData => {
	const result: DiamondData = {};

	// Iterate through all diamonds
	for (const diamondName in sourceData) {
		result[diamondName] = {};

		// Iterate through all subdivisions
		for (const subdivisionName in sourceData[diamondName]) {
			result[diamondName][subdivisionName] = {};
			let gameCounter = 1;

			// Iterate through all teams
			for (const teamLetter in sourceData[diamondName][subdivisionName]) {
				const team =
					sourceData[diamondName][subdivisionName][teamLetter];

				// Check each match for this team
				for (const dateKey in team.matchesData) {
					// Skip if it doesn't match the dateToDisplay parameter
					if (dateKey !== dateToDisplay) continue;
					
					const match = team.matchesData[dateKey];

					// Only create a game entry if this team is the home team (to avoid duplicates)
					if (match.home) {
						result[diamondName][subdivisionName][
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

const SideNav = ({ data, handleMatchupSelection }: { data: DiamondData, handleMatchupSelection: (homeLetter: string, awayLetter: string, divisionName: string, subdivisionName: string) => void }) => {
	const [openDiamonds, setOpenDiamonds] = useState<Record<string, boolean>>(
		{}
	);
	const [openSubdivisions, setOpenSubdivisions] = useState<
		Record<string, boolean>
	>({});
	const [selectedMatchup, setSelectedMatchup] = useState<{ home: string; away: string } | null>(null);

	const toggleDiamond = (diamond: string) => {
		setOpenDiamonds((prev) => ({
			...prev,
			[diamond]: !prev[diamond],
		}));
	};

	const toggleSubdivision = (diamond: string, subdivision: string) => {
		const key = `${diamond}-${subdivision}`;
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
					{Object.keys(data).map((diamondName) => (
						<Collapsible
							key={diamondName}
							open={openDiamonds[diamondName]}
							onOpenChange={() => toggleDiamond(diamondName)}
							className="border-b border-gray-100 pb-2"
						>
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									className="w-full justify-between font-medium text-lg p-2 h-auto"
								>
									{diamondName}
									{openDiamonds[diamondName] ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="ml-4 mt-1 space-y-1">
								{Object.keys(data[diamondName]).map(
									(subdivisionName) => {
										const subdivKey = `${diamondName}-${subdivisionName}`;
										return (
											<Collapsible
												key={subdivKey}
												open={
													openSubdivisions[subdivKey]
												}
												onOpenChange={() =>
													toggleSubdivision(
														diamondName,
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
														data[diamondName][
															subdivisionName
														]
													).map((gameNumber) => {
														const game =
															data[diamondName][
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
																	handleMatchupSelection(game.homeTeamLetter, game.awayTeamLetter, diamondName, subdivisionName);
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

export default function WeeklyScoresheetsContent() {
    const [seasonCode, setSeasonCode] = useState<string>("");
    const [currentSeason, setCurrentSeason] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [seasonSelected, setSeasonSelected] = useState<boolean>(true);
    const [sidenavData, setSidenavData] = useState<DiamondData>({});
	const [matchSelected, setMatchSelected] = useState<boolean>(false);
	const [selectedHomeLetter, setSelectedHomeLetter] = useState<string>("");
	const [selectedAwayLetter, setSelectedAwayLetter] = useState<string>("");
	const [selectedDivision, setSelectedDivision] = useState<string>("");
	const [selectedSubdivision, setSelectedSubdivision] = useState<string>("");
	const [selectedHomeTeamId, setSelectedHomeTeamId] = useState<string>("");
	const [selectedAwayTeamId, setSelectedAwayTeamId] = useState<string>("");
	const [homeTeamInformation, setHomeTeamInformation] = useState<Team>();
	const [awayTeamInformation, setAwayTeamInformation] = useState<Team>();
	// TODO - Implement a fetch for the player information for the selected teams
	const [homeTeamPlayerInformation, setHomeTeamPlayerInformation] = useState<Player[]>();
	const [awayTeamPlayerInformation, setAwayTeamPlayerInformation] = useState<Player[]>();
	
	// State to track which games are marked with X
	const [homeTeamGameStatus, setHomeTeamGameStatus] = useState<Record<string, boolean[]>>({});
	const [awayTeamGameStatus, setAwayTeamGameStatus] = useState<Record<string, boolean[]>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
		setHomeTeamGameStatus({});
		setAwayTeamGameStatus({});
		
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

	const handleGameToggle = (teamType: 'home' | 'away', playerId: string, gameIndex: number) => {
		if (teamType === 'home') {
			setHomeTeamGameStatus(prev => {
				const playerGames = prev[playerId] || Array(11).fill(false);
				const updatedGames = [...playerGames];
				updatedGames[gameIndex] = !updatedGames[gameIndex];
				return { ...prev, [playerId]: updatedGames };
			});
		} else {
			setAwayTeamGameStatus(prev => {
				const playerGames = prev[playerId] || Array(11).fill(false);
				const updatedGames = [...playerGames];
				updatedGames[gameIndex] = !updatedGames[gameIndex];
				return { ...prev, [playerId]: updatedGames };
			});
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
																	{Array.from({ length: 11 }).map((_, i) => (
																		<TableCell 
																			key={i} 
																			className="text-center cursor-pointer"
																			onClick={() => handleGameToggle('home', String(player.ledaId), i)}
																		>
																			<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																				{homeTeamGameStatus[player.ledaId]?.[i] && <X className="h-5 w-5" />}
																			</div>
																		</TableCell>
																	))}
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
																	{Array.from({ length: 11 }).map((_, i) => (
																		<TableCell 
																			key={i} 
																			className="text-center cursor-pointer"
																			onClick={() => handleGameToggle('away', String(player.ledaId), i)}
																		>
																			<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																				{awayTeamGameStatus[player.ledaId]?.[i] && <X className="h-5 w-5" />}
																			</div>
																		</TableCell>
																	))}
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											</>
										)}
									</FolderTab>
								</div>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
