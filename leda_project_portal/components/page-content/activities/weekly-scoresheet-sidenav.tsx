"use client";

/**
 * Weekly Scoresheet Side Navigation Component
 *
 * This component renders a hierarchical navigation sidebar for weekly scoresheets:
 * - Displays divisions, subdivisions, and matchups in a collapsible tree structure
 * - Shows completion status for each matchup (yellow alert or green checkmark)
 * - Handles matchup selection and tracks the currently selected matchup
 *
 * The component receives scoresheet data and handles the user's navigation through
 * the available matchups, communicating selections back to the parent component.
 */
import { useState } from "react";
import {
	ChevronRight,
	ChevronDown,
	CheckCircle,
	AlertTriangle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DivisionData,
	FormattedScoreData,
} from "@/lib/weekly-scoresheet-definitions";
import { isMatchupValid } from "@/utils/matchupValidation";

interface SideNavProps {
	data: DivisionData; // Hierarchical data of divisions and matchups
	formattedScoreData: FormattedScoreData | null; // Existing scoresheet data
	handleMatchupSelection: (
		// Callback for matchup selection
		homeLetter: string,
		awayLetter: string,
		divisionName: string,
		subdivisionName: string
	) => void;
}

const SideNav = ({
	data,
	formattedScoreData,
	handleMatchupSelection,
}: SideNavProps) => {
	// State to track expanded divisions and subdivisions
	const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>(
		{}
	);
	const [openSubdivisions, setOpenSubdivisions] = useState<
		Record<string, boolean>
	>({});
	const [selectedMatchup, setSelectedMatchup] = useState<{
		home: string;
		away: string;
	} | null>(null);

	/**
	 * Toggles expansion state of a division
	 */
	const toggleDivision = (division: string) => {
		setOpenDivisions((prev) => ({
			...prev,
			[division]: !prev[division],
		}));
	};

	/**
	 * Toggles expansion state of a subdivision
	 */
	const toggleSubdivision = (division: string, subdivision: string) => {
		const key = `${division}-${subdivision}`;
		setOpenSubdivisions((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	/**
	 * Determines if a matchup has no data entered
	 * Checks game participation, win records, and points
	 */
	const isMatchupBlank = (
		divisionName: string,
		subdivisionName: string,
		matchupKey: string
	): boolean => {
		// Use the shared utility function
		return formattedScoreData 
			? !isMatchupValid(formattedScoreData, divisionName, subdivisionName, matchupKey)
			: true;
	};

	// Show a placeholder when no data is available
	if (!data || Object.keys(data).length === 0) {
		return (
			<div className="w-64 border-r h-full flex items-center justify-center p-4">
				<p className="text-gray-500 text-center">
					Select a week to display weekly scoresheets...
				</p>
			</div>
		);
	}

	return (
		// Render the hierarchical navigation structure
		<div className="w-64">
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
															selectedMatchup?.home ===
																game.homeTeamLetter &&
															selectedMatchup?.away ===
																game.awayTeamLetter;

														const matchupKey = `${game.homeTeamLetter} - ${game.awayTeamLetter}`;
														const showYellowFlag =
															isMatchupBlank(
																divisionName,
																subdivisionName,
																matchupKey
															);

														return (
															<Button
																key={`${subdivKey}-${gameNumber}`}
																variant="ghost"
																className={`w-full justify-start text-sm p-1 h-auto ${
																	isSelected
																		? "bg-gray-200"
																		: ""
																} hover:bg-gray-400`}
																onClick={() => {
																	setSelectedMatchup(
																		{
																			home: game.homeTeamLetter,
																			away: game.awayTeamLetter,
																		}
																	);
																	handleMatchupSelection(
																		game.homeTeamLetter,
																		game.awayTeamLetter,
																		divisionName,
																		subdivisionName
																	);
																}}
															>
																<div className="flex items-center gap-2">
																	<span>
																		{
																			game.homeTeamLetter
																		}{" "}
																		-{" "}
																		{
																			game.awayTeamLetter
																		}
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

export default SideNav;
