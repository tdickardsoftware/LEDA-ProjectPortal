"use client";

import { useState, useCallback } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { rosterRoute, scheduleRoute, seasonRoute } from "@/lib/apiRoutes";
import { Spinner } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubdivisionScheduler } from "@/components/subdivision-scheduler";
import { Button } from "@/components/ui/button";
import { FolderTabMed } from "@/components/ui/folder-tab";

export default function ScheduleContent() {
	// State variables
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [divisionsData, setDivisionsData] = useState<{
		[key: string]: {
			subdivisions: {
				[key: string]: {
					[key: string]: {
						teamId: string;
						placeId: string;
						teamName: string;
					};
				};
			};
		};
	}>({});
	const [loading, setLoading] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [disabled, setDisabled] = useState<boolean>(true);
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [gameDates, setGameDates] = useState<Record<string, string>>({});
	const [matchData, setMatchData] = useState<{
		[key: string]: {
			[key: string]: {
				[key: string]: {
					teamName: string;
					teamId: string;
					matchesData: {
						[key: string]: {
							matchDate: string;
							matchTime: string;
							home: boolean;
							opposingTeamId: string;
							opposingTeamLetter: string;
							subdivisionId?: string;
						};
					};
				};
			};
		};
	}>({});
	const [updatedMatchData, setUpdatedMatchData] = useState<{
		[key: string]: {
			[key: string]: {
				[key: string]: {
					teamName: string;
					teamId: string;
					matchesData: {
						[key: string]: {
							matchDate: string;
							matchTime: string;
							home: boolean;
							opposingTeamId: string;
							opposingTeamLetter: string;
						};
					};
				};
			};
		};
	}>({});
	const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);

	const handleSetEnableSaveButton = useCallback((value: boolean) => {
		setEnableSaveButton(value);
	}, []);

	const handleFetchUpdatedData = useCallback(
		(
			updatedMatchData: Record<
				string,
				Record<
					string,
					Record<
						string,
						{
							teamName: string;
							teamId: string;
							matchesData: Record<
								string,
								{
									matchDate: string;
									matchTime: string;
									home: boolean;
									opposingTeamId: string;
									opposingTeamLetter: string;
								}
							>;
						}
					>
				>
			>
		) => {
			setUpdatedMatchData(updatedMatchData);
		},
		[]
	);

	const handleSaveData = useCallback(
		async (
			updatedMatchData: Record<
				string,
				Record<
					string,
					Record<
						string,
						{
							teamName: string;
							teamId: string;
							matchesData: Record<
								string,
								{
									matchDate: string;
									matchTime: string;
									home: boolean;
									opposingTeamId: string;
									opposingTeamLetter: string;
									subdivisionId?: string; // Add subdivision tracking
								}
							>;
						}
					>
				>
			>
		) => {
			// Process the updated match data to ensure subdivision isolation
			const processedMatchData = ensureSubdivisionIsolation(updatedMatchData);
			setMatchData(processedMatchData);
			
			// Save data to the server
			await fetch(`${scheduleRoute}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					seasonCode: seasonCode,
					scheduleData: processedMatchData,
				}),
			});
			setEnableSaveButton(false);
		},
		[seasonCode]
	);

	// Handle season code selection
	const handleSeasonCodeSelect = useCallback(
		async (value: string) => {
			if (value === seasonCode) return;
			setSeasonCode(value);

			setLoading(true);
			const result = await fetch(`${rosterRoute}?seasonCode=${value}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (result.status === 200) {
				const data = await result.json();
				if (data) {
					const roster = data;
					// Update state with the fetched data
					const fetchedData = JSON.parse(
						JSON.stringify(roster.teamInfomation)
					);
					setDivisionsData(fetchedData);
					const gameDatesResult = await fetch(
						`${seasonRoute}?seasonCode=${value}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
					if (gameDatesResult.status === 200) {
						const gameDatesData = await gameDatesResult.json();
						if (gameDatesData) {
							setGameDates(gameDatesData.dates);
						}
					}

					const matchDataResult = await fetch(
						`${scheduleRoute}?seasonCode=${value}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
					if (matchDataResult.status === 200) {
						const matchData = await matchDataResult.json();
						if (matchData) {
							// Add unique subdivision identifiers to ensure proper isolation
							const processedMatchData = ensureSubdivisionIsolation(
								JSON.parse(JSON.stringify(matchData.scheduleData))
							);
							setMatchData(processedMatchData);
						}
					} else {
						// Populate matchData
						const newMatchData: Record<
							string,
							Record<
								string,
								Record<
									string,
									{
										teamName: string;
										teamId: string;
										matchesData: Record<
											string,
											{
												matchDate: string;
												matchTime: string;
												home: boolean;
												opposingTeamId: string;
												opposingTeamLetter: string;
												subdivisionId?: string; // Add subdivision tracking
											}
										>;
									}
								>
							>
						> = {};
						Object.keys(fetchedData).forEach((division) => {
							newMatchData[division] = {};
							Object.keys(
								fetchedData[division].subdivisions
							).forEach((subdivision) => {
								newMatchData[division][subdivision] = {};
								Object.keys(
									fetchedData[division].subdivisions[
										subdivision
									]
								).forEach((teamLetter) => {
									newMatchData[division][subdivision][
										teamLetter
									] = {
										teamName:
											fetchedData[division].subdivisions[
												subdivision
											][teamLetter].teamName,
										teamId: fetchedData[division]
											.subdivisions[subdivision][
											teamLetter
										].teamId,
										matchesData: {},
									};
								});
							});
						});
						setMatchData(newMatchData);
					}
				}
			} else {
				setDivisionsData({});
			}
			setLoading(false);
		},
		[seasonCode]
	);

	// Helper function to ensure subdivision isolation
	const ensureSubdivisionIsolation = (
		matchData: Record<
			string,
			Record<
				string,
				Record<
					string,
					{
						teamName: string;
						teamId: string;
						matchesData: Record<
							string,
							{
								matchDate: string;
								matchTime: string;
								home: boolean;
								opposingTeamId: string;
								opposingTeamLetter: string;
								subdivisionId?: string;
							}
						>;
					}
				>
			>
		>
	) => {
		// Add subdivision identifiers to each match
		Object.keys(matchData).forEach((division) => {
			Object.keys(matchData[division]).forEach((subdivision) => {
				Object.keys(matchData[division][subdivision]).forEach((teamLetter) => {
					const subdivisionId = `${division}-${subdivision}`;
					Object.keys(matchData[division][subdivision][teamLetter].matchesData).forEach(
						(matchId) => {
							matchData[division][subdivision][teamLetter].matchesData[matchId].subdivisionId = 
								subdivisionId;
						}
					);
				});
			});
		});
		return matchData;
	};

	return !loading ? (
		<div className="flex flex-col max-w-[65vw]">
			<div className="flex justify-between">
				<FolderTabMed title="Season Code">
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
				</FolderTabMed>
				<FolderTabMed title="Manage Schedule">
					<div>
						<div className="p-4 flex justify-center">
							<Button
								onClick={() => handleSaveData(updatedMatchData)}
								variant="outline"
								className="hover:bg-gray-100 border-gray-300 text-gray-700"
								disabled={!enableSaveButton}
							>
								Save Changes
							</Button>
						</div>
					</div>
				</FolderTabMed>
			</div>
			{Object.keys(divisionsData).length > 0 && (
				<div className="w-full mt-4">
					{Object.keys(divisionsData).map((division, index) => (
						<Accordion
							key={index}
							type="single"
							collapsible
							className="w-full mb-4"
							defaultValue={`division-${index}`}
						>
							<AccordionItem value={`division-${index}`}>
								<AccordionTrigger className="underline">
									{division}
								</AccordionTrigger>
								<AccordionContent>
									{Object.keys(
										divisionsData[division].subdivisions
									).map((subdivision, subIndex) => (
										<Accordion
											key={subIndex}
											type="single"
											collapsible
											className="w-full mt-2"
											defaultValue={`subdivision-${subIndex}`}
										>
											<AccordionItem
												value={`subdivision-${subIndex}`}
												className="border-b-0"
											>
												<AccordionTrigger className="underline">
													{subdivision}
												</AccordionTrigger>
												<AccordionContent>
													{Object.keys(
														divisionsData[division]
															.subdivisions[
															subdivision
														]
													).length > 0 && (
														<SubdivisionScheduler
															teams={
																divisionsData[
																	division
																].subdivisions[
																	subdivision
																]
															}
															gameDates={
																gameDates
															}
															matchData={
																matchData
															}
															setEnabledSaveButton={
																handleSetEnableSaveButton
															}
															handleSaveData={
																handleFetchUpdatedData
															}
														/>
													)}
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									))}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					))}
				</div>
			)}
		</div>
	) : (
		<Spinner />
	);
}
