"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

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
const convertToSampleDataFormat = (sourceData: SourceData): DiamondData => {
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

// Sample data structure
const sampleData: DiamondData = convertToSampleDataFormat({
	Diamond: {
		"Subdivision 1": {
			A: {
				teamName: "Test",
				teamId: "1",
				matchesData: {
					Date1: {
						matchDate: "1/3/2024",
						matchTime: "22:09",
						home: true,
						opposingTeamId: "2",
						opposingTeamLetter: "B",
					},
				},
			},
			B: {
				teamName: "The Best Team",
				teamId: "2",
				matchesData: {
					Date1: {
						matchDate: "1/3/2024",
						matchTime: "22:09",
						home: false,
						opposingTeamId: "1",
						opposingTeamLetter: "A",
					},
				},
			},
		},
	},
});

const SideNav = ({ data }: { data: DiamondData }) => {
	const [openDiamonds, setOpenDiamonds] = useState<Record<string, boolean>>(
		{}
	);
	const [openSubdivisions, setOpenSubdivisions] = useState<
		Record<string, boolean>
	>({});

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

	return (
		<div className="w-64 border-r">
			<ScrollArea className="h-[calc(100vh-64px)]">
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
														return (
															<Button
																key={`${subdivKey}-${gameNumber}`}
																variant="ghost"
																className="w-full justify-start text-sm p-1 h-auto"
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


    const handleSeasonCodeSelect = (value: string) => {
        setSeasonCode(value);
    }
	return (
		<>
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
            </div>
            <div className="mt-4">
                <Separator orientation="horizontal" className="bg-gray-400 w-100"/>
            </div>
			<div className="flex">
				<SideNav data={sampleData} />

				<div className="flex-1 p-4">
					<div className="w-full border border-gray-300 rounded-lg p-4">
						{/* Content goes here */}
					</div>
				</div>
			</div>
		</>
	);
}
