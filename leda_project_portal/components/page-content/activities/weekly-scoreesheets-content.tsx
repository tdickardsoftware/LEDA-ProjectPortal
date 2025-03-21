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

// Sample data structure
const sampleData: DiamondData = {
	Diamond: {
		"Subdivision 1": {
			"1": {
				homeTeamLetter: "A",
				homeTeamId: "1",
				awayTeamLetter: "C",
				awayTeamId: "2",
			},
			"2": {
				homeTeamLetter: "B",
				homeTeamId: "3",
				awayTeamLetter: "D",
				awayTeamId: "4",
			},
		},
		"Subdivision 2": {
			"1": {
				homeTeamLetter: "E",
				homeTeamId: "5",
				awayTeamLetter: "G",
				awayTeamId: "6",
			},
		},
	},
	"Diamond 2": {
		"Subdivision 3": {
			"1": {
				homeTeamLetter: "X",
				homeTeamId: "7",
				awayTeamLetter: "Y",
				awayTeamId: "8",
			},
		},
	},
};

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
	return (
		<div className="flex">
			<SideNav data={sampleData} />

			<div className="flex-1 p-4">
				<div className="w-full border border-gray-300 rounded-lg p-4">
					{/* Content goes here */}
				</div>
			</div>
		</div>
	);
}
