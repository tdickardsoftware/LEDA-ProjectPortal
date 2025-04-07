"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import React, { useState, useCallback, useEffect } from "react";
import {
	rosterRoute,
	seasonRoute,
	weeklyScoresheetsRoute,
	payoutRoute,
} from "@/lib/apiRoutes";
import { Spinner } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FolderTabMed } from "@/components/ui/folder-tab";
import AdjustmentForm from "@/components/forms/activities/adjustment-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import ManageGlobalAdjustments from "@/components/forms/activities/manage-global-adjustments";
import { Pencil, X } from "lucide-react";

// Define types for roster data structure
type TeamInfo = {
	teamId: string;
	placeId: string;
	teamName: string;
};

type SubdivisionData = {
	[key: string]: TeamInfo;
};

type DivisionData = {
	subdivisions: {
		[key: string]: SubdivisionData;
	};
};

type RosterData = {
	[key: string]: DivisionData;
};

// Define types for payouts data structure
type AdjustmentItem = {
	global: boolean;
	adjustmentAmount: number;
	credit: boolean;
	notes: string;
};

type PayoutTeamData = {
	place: number | null;
	amount: number;
	adjustmentAmount: number;
	adjustments: { [adjustmentId: string]: AdjustmentItem } | undefined;
};

type PayoutSubdivisionData = {
	[teamId: string]: PayoutTeamData;
};

type PayoutDivisionData = {
	[subdivision: string]: PayoutSubdivisionData;
};

type PayoutsData = {
	[division: string]: PayoutDivisionData;
};

export default function PayoutsContent() {
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [currentSeason, setCurrentSeason] = useState(true);
	const [divisionsData, setDivisionsData] = useState<RosterData>({});
	const [payoutsData, setPayoutsData] = useState<PayoutsData>({});
	const [loading, setLoading] = useState(false);
	const [weekCount, setWeekCount] = useState<number>(0);
	const [completedScoresheetCount, setCompletedScoresheetCount] =
		useState<number>(0);

	// State for accordion open/closed status
	const [openDivisions, setOpenDivisions] = useState<string[]>([]);
	const [openSubdivisions, setOpenSubdivisions] = useState<string[]>([]);
	const [openTeams, setOpenTeams] = useState<string[]>([]);

	// Dialog state for local adjustments
	const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
	const [selectedTeamId, setSelectedTeamId] = useState<string>("");
	const [selectedTeamName, setSelectedTeamName] = useState<string>("");

	// Dialog state for global adjustments
	const [globalAdjustmentDialogOpen, setGlobalAdjustmentDialogOpen] =
		useState(false);
	const [
		manageGlobalAdjustmentsDialogOpen,
		setManageGlobalAdjustmentsDialogOpen,
	] = useState(false);

	const [hoveredAdjustmentId, setHoveredAdjustmentId] = useState<
		string | null
	>(null);
	const [highlightedAdjustmentId, setHighlightedAdjustmentId] = useState<
		string | null
	>(null);

	// Add state for team adjustment editing
	const [editTeamAdjustmentDialogOpen, setEditTeamAdjustmentDialogOpen] =
		useState(false);
	const [editingTeamAdjustmentId, setEditingTeamAdjustmentId] = useState<
		string | null
	>(null);
	const [editingTeamAdjustmentData, setEditingTeamAdjustmentData] = useState<{
		teamId: string;
		division: string;
		subdivision: string;
		adjustment: AdjustmentItem;
	} | null>(null);

	// Add state for team adjustment deletion confirmation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [deletingTeamAdjustmentData, setDeletingTeamAdjustmentData] =
		useState<{
			teamId: string;
			division: string;
			subdivision: string;
			adjustmentId: string;
		} | null>(null);

	const [originalPayoutsData, setOriginalPayoutsData] = useState<PayoutsData>(
		{}
	); // Store original data for comparison

	// Create payouts data when divisions data changes
	useEffect(() => {
		if (Object.keys(divisionsData).length > 0) {
			setPayoutsData((prevPayoutsData) => {
				const mergedPayoutsData: PayoutsData = { ...prevPayoutsData };

				Object.keys(divisionsData).forEach((division) => {
					if (!mergedPayoutsData[division]) {
						mergedPayoutsData[division] = {};
					}

					Object.keys(
						divisionsData[division]?.subdivisions || {}
					).forEach((subdivision) => {
						if (!mergedPayoutsData[division][subdivision]) {
							mergedPayoutsData[division][subdivision] = {};
						}

						Object.entries(
							divisionsData[division]?.subdivisions[
								subdivision
							] || {}
						).forEach(([, teamInfo]) => {
							const teamId = teamInfo.teamId;

							if (
								!mergedPayoutsData[division][subdivision][
									teamId
								]
							) {
								mergedPayoutsData[division][subdivision][
									teamId
								] = {
									place: null,
									amount: 0,
									adjustmentAmount: 0,
									adjustments: {},
								};
							}
						});
					});
				});

				console.log("Merged payouts data:", mergedPayoutsData);
				return mergedPayoutsData;
			});
		}
	}, [divisionsData]);

	// Initialize all accordions as open when data changes
	useEffect(() => {
		if (Object.keys(divisionsData).length > 0) {
			// Set all divisions as open
			setOpenDivisions(
				Object.keys(divisionsData).map((div) => `div-${div}`)
			);

			// Collect all subdivision IDs
			const subDivIds: string[] = [];

			Object.keys(divisionsData).forEach((division) => {
				Object.keys(
					divisionsData[division]?.subdivisions || {}
				).forEach((subdivision) => {
					subDivIds.push(`subdiv-${division}-${subdivision}`);

					// Not collecting team IDs as we want them closed by default
				});
			});

			setOpenSubdivisions(subDivIds);
			// Initialize teams as closed - empty array
			setOpenTeams([]);
		}
	}, [divisionsData]);

	// Utility function to create a deep copy of an object
	const deepCopy = (obj: PayoutsData): PayoutsData => {
		return JSON.parse(JSON.stringify(obj));
	};

	// Handle season code selection
	const handleSeasonCodeSelect = useCallback(
		async (value: string) => {
			if (value === seasonCode) return;
			setSeasonCode(value);

			try {
				setLoading(true);

				// Fetch payouts data for the selected seasonCode
				const payoutsResult = await fetch(
					`${payoutRoute}?seasonCode=${value}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				let foundPayoutsData = false;
				if (payoutsResult.status === 200) {
					const payoutsData = await payoutsResult.json();
					if (payoutsData && payoutsData.length > 0) {
						setPayoutsData(payoutsData[0].payoutsData);
						setOriginalPayoutsData(
							deepCopy(payoutsData[0].payoutsData)
						); // Use deep copy here
						foundPayoutsData = true;
						toast.success("Payouts data loaded successfully");
					}
				}

				// Always fetch roster data to ensure UI structure is populated
				const result = await fetch(
					`${rosterRoute}?seasonCode=${value}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (result.status === 200) {
					const data = await result.json();
					if (data) {
						const roster = data;
						const fetchedData = JSON.parse(
							JSON.stringify(roster.teamInfomation)
						);
						setDivisionsData(fetchedData);

						if (!foundPayoutsData) {
							toast.info("Creating new payouts data from roster");
						}
					}
				}

				const weeksResult = await fetch(
					`${seasonRoute}?seasonCode=${value}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (weeksResult.status === 200) {
					const weeksData = await weeksResult.json();
					if (weeksData) {
						setWeekCount(Object.keys(weeksData.dates).length);
					}

					const completedScoresheetCountResult = await fetch(
						`${weeklyScoresheetsRoute}?seasonCode=${value}&countOfFinishedWeeks=${true}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
						}
					);

					if (completedScoresheetCountResult.status === 200) {
						const completedScoresheetData =
							await completedScoresheetCountResult.json();
						if (completedScoresheetData) {
							setCompletedScoresheetCount(
								completedScoresheetData.count
							);
						}
					}
				}
			} catch (error) {
				console.error("Failed to fetch data:", error);
				toast.error("Failed to load data");
			} finally {
				setLoading(false);
			}
		},
		[seasonCode]
	);

	// Utility function to check if payouts data has changed
	const hasPayoutsDataChanged = () => {
		return (
			JSON.stringify(payoutsData) !== JSON.stringify(originalPayoutsData)
		);
	};

	const handleAdjustment = (
		teamId: string,
		amount: number,
		type: boolean,
		notes: string | undefined,
		global: boolean
	) => {
		// Update payouts data with the new adjustment
		const newPayoutsData = { ...payoutsData };

		// Ensure amount is formatted with 2 decimal places
		const formattedAmount = Number(amount.toFixed(2));

		if (global) {
			// Apply to all teams across all divisions and subdivisions
			Object.keys(newPayoutsData).forEach((division) => {
				Object.keys(newPayoutsData[division]).forEach((subdivision) => {
					Object.keys(newPayoutsData[division][subdivision]).forEach(
						(teamId) => {
							// Create adjustments object if it doesn't exist
							if (
								!newPayoutsData[division][subdivision][teamId]
									.adjustments
							) {
								newPayoutsData[division][subdivision][
									teamId
								].adjustments = {};
							}

							// Add the adjustment with a unique ID but ensure it's the same ID across all teams
							const adjustmentId = `global_adj_${Date.now()}`;
							newPayoutsData[division][subdivision][
								teamId
							].adjustments![adjustmentId] = {
								global,
								adjustmentAmount:
									formattedAmount * (type ? 1 : -1), // Positive for credit, negative for debit
								credit: type,
								notes:
									notes || "Global adjustment made by user",
							};

							// Update total adjustment amount
							const newAdjustmentAmount =
								formattedAmount * (type ? 1 : -1);
							newPayoutsData[division][subdivision][
								teamId
							].adjustmentAmount += newAdjustmentAmount;

							// Also ensure the total adjustment amount is formatted
							newPayoutsData[division][subdivision][
								teamId
							].adjustmentAmount = Number(
								newPayoutsData[division][subdivision][
									teamId
								].adjustmentAmount.toFixed(2)
							);
						}
					);
				});
			});

			toast.success(
				`Global ${
					type ? "credit" : "debit"
				} adjustment applied to all teams`
			);
		} else {
			// Find the division and subdivision for this specific team
			Object.keys(newPayoutsData).forEach((division) => {
				Object.keys(newPayoutsData[division]).forEach((subdivision) => {
					if (newPayoutsData[division][subdivision][teamId]) {
						// Create adjustments object if it doesn't exist
						if (
							!newPayoutsData[division][subdivision][teamId]
								.adjustments
						) {
							newPayoutsData[division][subdivision][
								teamId
							].adjustments = {};
						}

						// Add the adjustment with a unique ID
						const adjustmentId = `team_adj_${Date.now()}`;
						newPayoutsData[division][subdivision][
							teamId
						].adjustments![adjustmentId] = {
							global,
							adjustmentAmount: formattedAmount * (type ? 1 : -1), // Positive for credit, negative for debit
							credit: type,
							notes: notes || "Adjustment made by user",
						};

						// Update total adjustment amount
						const newAdjustmentAmount =
							formattedAmount * (type ? 1 : -1);
						newPayoutsData[division][subdivision][
							teamId
						].adjustmentAmount += newAdjustmentAmount;

						// Also ensure the total adjustment amount is formatted
						newPayoutsData[division][subdivision][
							teamId
						].adjustmentAmount = Number(
							newPayoutsData[division][subdivision][
								teamId
							].adjustmentAmount.toFixed(2)
						);
					}
				});
			});

			toast.success(
				`${
					type ? "Credit" : "Debit"
				} adjustment added to team successfully`
			);
		}

		setPayoutsData(newPayoutsData);
	};

	// Handle removing a global adjustment
	const handleRemoveGlobalAdjustment = (adjustmentId: string) => {
		const newPayoutsData = { ...payoutsData };

		// Remove the adjustment from all teams
		Object.keys(newPayoutsData).forEach((division) => {
			Object.keys(newPayoutsData[division]).forEach((subdivision) => {
				Object.keys(newPayoutsData[division][subdivision]).forEach(
					(teamId) => {
						const team =
							newPayoutsData[division][subdivision][teamId];

						if (
							team.adjustments &&
							team.adjustments[adjustmentId]
						) {
							// Get the adjustment amount to subtract from the total
							const adjustmentAmount =
								team.adjustments[adjustmentId].adjustmentAmount;

							// Subtract the adjustment amount from the team's total adjustment
							team.adjustmentAmount -= adjustmentAmount;

							// Remove the adjustment from the team
							delete team.adjustments[adjustmentId];
						}
					}
				);
			});
		});

		setPayoutsData(newPayoutsData);
	};

	// Handle editing a team-specific adjustment
	const handleEditTeamAdjustment = (
		teamId: string,
		division: string,
		subdivision: string,
		adjustmentId: string
	) => {
		const adjustment =
			payoutsData[division]?.[subdivision]?.[teamId]?.adjustments?.[
				adjustmentId
			];

		if (adjustment && !adjustment.global) {
			setEditingTeamAdjustmentId(adjustmentId);
			setEditingTeamAdjustmentData({
				teamId,
				division,
				subdivision,
				adjustment,
			});
			setEditTeamAdjustmentDialogOpen(true);
		}
	};

	// Show confirmation dialog before removing team adjustment
	const confirmRemoveTeamAdjustment = (
		teamId: string,
		division: string,
		subdivision: string,
		adjustmentId: string
	) => {
		if (
			window.confirm(
				"This will remove the adjustment from this team. This action cannot be undone."
			)
		) {
			// Don't set state and then immediately use it - directly execute with the values we already have
			executeRemoveTeamAdjustment(
				teamId,
				division,
				subdivision,
				adjustmentId
			);
		}
	};

	// Execute team adjustment deletion after confirmation
	const executeRemoveTeamAdjustment = (
		teamId?: string,
		division?: string,
		subdivision?: string,
		adjustmentId?: string
	) => {
		// Use either the provided parameters or the state, but not both
		const tid = teamId || deletingTeamAdjustmentData?.teamId;
		const div = division || deletingTeamAdjustmentData?.division;
		const sub = subdivision || deletingTeamAdjustmentData?.subdivision;
		const adjId = adjustmentId || deletingTeamAdjustmentData?.adjustmentId;

		if (!tid || !div || !sub || !adjId) return;

		const newPayoutsData = { ...payoutsData };

		if (newPayoutsData[div]?.[sub]?.[tid]?.adjustments?.[adjId]) {
			// Get the adjustment amount to subtract from the total
			const adjustmentAmount =
				newPayoutsData[div][sub][tid].adjustments![adjId]
					.adjustmentAmount;

			// Subtract the adjustment amount from the team's total adjustment
			newPayoutsData[div][sub][tid].adjustmentAmount -= adjustmentAmount;

			// Remove the adjustment from the team
			delete newPayoutsData[div][sub][tid].adjustments![adjId];

			setPayoutsData(newPayoutsData);
			toast.success("Team adjustment removed successfully");
		}
	};

	const handleLocalAdjustmentClick = (teamId: string, teamName: string) => {
		setSelectedTeamId(teamId);
		setSelectedTeamName(teamName);
		setAdjustmentDialogOpen(true);
	};

	const handleGlobalAdjustmentClick = () => {
		setGlobalAdjustmentDialogOpen(true);
	};

	const handleManageGlobalAdjustmentsClick = () => {
		setManageGlobalAdjustmentsDialogOpen(true);
	};

	const handleManageGlobalAdjustmentClick = (adjustmentId: string) => {
		setHighlightedAdjustmentId(adjustmentId);
		setManageGlobalAdjustmentsDialogOpen(true);
	};

	const handleCalculatePayoutsClick = async () => {
		const teamIdsBySubdivision: { [subdivision: string]: string[] } = {};
		const newPayoutsData = { ...payoutsData };

		Object.keys(divisionsData).forEach((division) => {
			Object.keys(divisionsData[division]?.subdivisions || {}).forEach(
				(subdivision) => {
					teamIdsBySubdivision[subdivision] = Object.keys(
						divisionsData[division]?.subdivisions[subdivision] || {}
					).map(
						(team) =>
							divisionsData[division]?.subdivisions[subdivision][
								team
							]?.teamId
					);
				}
			);
		});

		for (const subdivision of Object.keys(teamIdsBySubdivision)) {
			try {
				const response = await fetch(
					`${weeklyScoresheetsRoute}/teamPoints?seasonCode=${seasonCode}&totalWeeks=${weekCount}&teamLedaIds=${teamIdsBySubdivision[subdivision]}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				if (!response.ok) {
					throw new Error("Failed to fetch team points data");
				}

				const data = await response.json();
				console.log("Team points data:", data);
				if (data && Array.isArray(data)) {
					// Correctly map fetched data to payoutsData
					data.forEach(
						(teamData: {
							teamLedaId: string;
							place: string;
							amount: string;
						}) => {
							Object.keys(divisionsData).forEach((division) => {
								Object.keys(
									divisionsData[division]?.subdivisions || {}
								).forEach((subdivisionKey) => {
									if (
										newPayoutsData[division]?.[
											subdivisionKey
										]?.[teamData.teamLedaId]
									) {
										newPayoutsData[division][
											subdivisionKey
										][teamData.teamLedaId].place =
											parseInt(teamData.place, 10) ||
											null;
										newPayoutsData[division][
											subdivisionKey
										][teamData.teamLedaId].amount =
											parseFloat(teamData.amount) || 0;
									}
								});
							});
						}
					);
				}
			} catch (error) {
				console.error("Error fetching team points:", error);
				toast.error("Failed to retrieve team standings");
			}
		}
		console.log(newPayoutsData);
		setPayoutsData(newPayoutsData);
		toast.success("Payouts calculated successfully");
	};

	const handleSavePayoutsData = async () => {
		try {
			const response = await fetch(payoutRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					seasonCode: seasonCode,
					payoutsData: payoutsData, // Explicitly stringify the payoutsData object
				}),
			});

			const result = await response.json();

			if (response.ok) {
				toast.success("Payouts data saved successfully");
			} else {
				throw new Error(
					result.message || "Failed to save payouts data"
				);
			}
		} catch (error) {
			console.error("Error saving payouts data:", error);
			toast.error(
				`Failed to save payouts data: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
		setOriginalPayoutsData(deepCopy(payoutsData));
	};

	return (
		<div className="flex flex-col max-w-[65vw] overflow-x-auto">
			{" "}
			{/* Added overflow-x-auto for horizontal scrolling */}
			{loading ? (
				<Spinner />
			) : (
				<>
					<div className="flex flex-col mb-4 gap-2">
						<div className="flex flex-wrap justify-between items-start gap-4">
							<div className="flex flex-wrap justify-start items-end gap-4 pt-4">
								{" "}
								{/* Added flex-wrap */}
								<FolderTabMed
									title="Season Code"
									className="w-fit self-end"
								>
									<div className="flex flex-wrap gap-4 items-center">
										{" "}
										{/* Added flex-wrap */}
										<SeasonCodeSelector
											disabled={currentSeason}
											handleSelect={
												handleSeasonCodeSelect
											}
											useCurrentSeason={currentSeason}
											seasonCode={seasonCode || ""}
										/>
										<div className="flex items-center gap-4">
											<Label>Current Season?</Label>
											<Checkbox
												checked={currentSeason}
												onCheckedChange={() =>
													setCurrentSeason(
														!currentSeason
													)
												}
											/>
										</div>
									</div>
								</FolderTabMed>
								<FolderTabMed
									title="Global Adjustments"
									className="w-fit self-end"
								>
									<div className="flex flex-wrap gap-4 items-center">
										{" "}
										{/* Added flex-wrap */}
										<Button
											variant="outline"
											className="hover:bg-gray-100 border-gray-300 text-gray-700"
											onClick={() => {
												handleGlobalAdjustmentClick();
											}}
										>
											Add Global Adjustment
										</Button>
										<Button
											variant="outline"
											className="hover:bg-gray-100 border-gray-300 text-gray-700"
											onClick={() => {
												handleManageGlobalAdjustmentsClick();
											}}
										>
											Manage Global Adjustments
										</Button>
									</div>
								</FolderTabMed>
								<FolderTabMed
									title="Payouts"
									className="w-fit self-start"
								>
									<div className="flex flex-col gap-2">
										{weekCount > 0 && (
											<TooltipProvider>
												<Tooltip delayDuration={300}>
													<TooltipTrigger asChild>
														<div>
															<Button
																variant="outline"
																className="relative w-full h-10 bg-gray-200 border-gray-300 text-gray-700 overflow-hidden"
																onClick={() => {
																	handleCalculatePayoutsClick();
																}}
																disabled={
																	completedScoresheetCount !==
																	weekCount
																}
															>
																{completedScoresheetCount ===
																weekCount ? (
																	<span className="relative z-10 font-semibold">
																		Calculate
																		Payouts
																	</span>
																) : (
																	<>
																		<div
																			className="absolute top-0 left-0 h-full bg-green-500"
																			style={{
																				width: `${
																					(completedScoresheetCount /
																						weekCount) *
																					100
																				}%`,
																				minWidth:
																					completedScoresheetCount >
																					0
																						? "5%"
																						: "0%",
																			}}
																		></div>
																		<span className="relative z-10 font-semibold">
																			{
																				completedScoresheetCount
																			}
																			/
																			{
																				weekCount
																			}{" "}
																			Weeks
																			Completed
																		</span>
																	</>
																)}
															</Button>
														</div>
													</TooltipTrigger>
													<TooltipContent
														side="top"
														className="bg-white text-black px-4 py-3 rounded-lg shadow-lg border-0"
													>
														<p className="text-sm font-medium">
															{completedScoresheetCount !==
															weekCount
																? "Scoresheets are not yet complete"
																: "All scoresheets are complete, calculate placements"}
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</div>
								</FolderTabMed>
							</div>
						</div>
					</div>

					{/* Divisions Accordion */}
					{Object.keys(divisionsData).length > 0 &&
						Object.keys(divisionsData).map((division, index) => (
							<Accordion
								key={index}
								type="multiple"
								value={openDivisions}
								onValueChange={setOpenDivisions}
								className="w-[65vw] mt-4"
							>
								<AccordionItem value={`div-${division}`}>
									<AccordionTrigger>
										{division}
									</AccordionTrigger>
									<AccordionContent>
										{/* Subdivisions Accordion */}
										<Accordion
											type="multiple"
											value={openSubdivisions}
											onValueChange={setOpenSubdivisions}
											className="w-full mt-2 ml-6"
										>
											{Object.keys(
												divisionsData[division]
													?.subdivisions || {}
											).map((subdivision, subIndex) => (
												<AccordionItem
													key={subIndex}
													value={`subdiv-${division}-${subdivision}`}
													className="border-b border-gray-200"
												>
													<AccordionTrigger>
														{subdivision}
													</AccordionTrigger>
													<AccordionContent>
														{/* Teams Accordion */}
														<Accordion
															type="multiple"
															value={openTeams}
															onValueChange={
																setOpenTeams
															}
															className="w-full ml-6"
														>
															{Object.keys(
																divisionsData[
																	division
																]?.subdivisions[
																	subdivision
																] || {}
															)
																.map((team) => {
																	const teamInfo =
																		divisionsData[
																			division
																		]
																			?.subdivisions[
																			subdivision
																		][team];
																	const teamId =
																		teamInfo?.teamId;
																	const place =
																		payoutsData[
																			division
																		]?.[
																			subdivision
																		]?.[
																			teamId
																		]
																			?.place;
																	return {
																		team,
																		teamInfo,
																		teamId,
																		place:
																			place ||
																			Number.MAX_SAFE_INTEGER,
																	}; // Use MAX_SAFE_INTEGER for teams without place
																})
																.sort(
																	(a, b) =>
																		a.place -
																		b.place
																) // Sort by place (ascending)
																.map(
																	(
																		{
																			team,
																			teamInfo,
																			teamId,
																		},
																		teamIndex
																	) => {
																		return (
																			<AccordionItem
																				key={
																					teamIndex
																				}
																				value={`team-${division}-${subdivision}-${team}`}
																				className="border-b border-gray-200 group relative"
																			>
																				<AccordionTrigger className="flex justify-between items-center">
																					<div className="flex items-center gap-6">
																						<span className="text-left">
																							{payoutsData[
																								division
																							]?.[
																								subdivision
																							]?.[
																								teamId
																							]
																								?.place !==
																							null ? (
																								<span>
																									<span className="font-semibold">
																										{
																											payoutsData[
																												division
																											][
																												subdivision
																											][
																												teamId
																											]
																												.place
																										}
																									</span>
																									{
																										" - "
																									}
																									<span>
																										{
																											team
																										}
																									</span>
																									{
																										" - "
																									}
																									<span>
																										{
																											teamInfo?.teamName
																										}
																									</span>
																									{
																										" - "
																									}
																									<span>
																										Base
																										Winnings:
																										$
																										{payoutsData[
																											division
																										][
																											subdivision
																										][
																											teamId
																										].amount.toFixed(
																											2
																										)}
																									</span>
																									{payoutsData[
																										division
																									][
																										subdivision
																									][
																										teamId
																									]
																										.adjustmentAmount !==
																										0 && (
																										<>
																											{
																												" - "
																											}
																											<span>
																												Winnings
																												After
																												Adjustments:
																												$
																												{(
																													payoutsData[
																														division
																													][
																														subdivision
																													][
																														teamId
																													]
																														.amount +
																													payoutsData[
																														division
																													][
																														subdivision
																													][
																														teamId
																													]
																														.adjustmentAmount
																												).toFixed(
																													2
																												)}
																											</span>
																										</>
																									)}
																								</span>
																							) : (
																								<span>
																									{
																										team
																									}{" "}
																									-{" "}
																									{
																										teamInfo?.teamName
																									}
																								</span>
																							)}
																						</span>
																						<div
																							className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 cursor-pointer"
																							onClick={(
																								e
																							) => {
																								e.stopPropagation();
																								handleLocalAdjustmentClick(
																									teamId,
																									teamInfo?.teamName
																								);
																							}}
																						>
																							Add
																							Adjustment
																						</div>
																					</div>
																				</AccordionTrigger>
																				<AccordionContent>
																					{payoutsData[
																						division
																					]?.[
																						subdivision
																					]?.[
																						teamId
																					]
																						?.adjustments &&
																					Object.keys(
																						payoutsData[
																							division
																						][
																							subdivision
																						][
																							teamId
																						]
																							.adjustments ||
																							{}
																					)
																						.length >
																						0 ? (
																						<div className="space-y-4">
																							{/* Global Adjustments */}
																							<div>
																								<h4 className="font-semibold text-gray-700">
																									Global
																									Adjustments
																								</h4>
																								<div className="flex flex-wrap gap-2">
																									{Object.entries(
																										payoutsData[
																											division
																										][
																											subdivision
																										][
																											teamId
																										]
																											.adjustments ||
																											{}
																									)
																										.filter(
																											([
																												,
																												adjustment,
																											]) =>
																												adjustment.global
																										)
																										.map(
																											([
																												adjId,
																												adjustment,
																											]) => (
																												<div
																													key={
																														adjId
																													}
																													className="p-2 border rounded-md w-fit relative group"
																													onMouseEnter={() =>
																														setHoveredAdjustmentId(
																															adjId
																														)
																													}
																													onMouseLeave={() =>
																														setHoveredAdjustmentId(
																															null
																														)
																													}
																												>
																													<div
																														className={`transition-all duration-200 ${
																															hoveredAdjustmentId ===
																															adjId
																																? "blur-sm"
																																: ""
																														}`}
																													>
																														<p className="font-medium">
																															{adjustment.credit
																																? "Credit"
																																: "Debit"}
																															:{" "}
																															{adjustment.credit
																																? ""
																																: "-"}
																															$
																															{Math.abs(
																																adjustment.adjustmentAmount
																															).toFixed(
																																2
																															)}
																														</p>
																														<p className="text-gray-500">
																															{
																																adjustment.notes
																															}
																														</p>
																													</div>
																													{hoveredAdjustmentId ===
																														adjId && (
																														<div className="absolute inset-0 flex items-center justify-center gap-4">
																															<Button
																																variant="ghost"
																																size="sm"
																																className="h-6 w-6 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
																																title="Edit adjustment"
																																onClick={() =>
																																	handleManageGlobalAdjustmentClick(
																																		adjId
																																	)
																																}
																															>
																																<Pencil className="h-4 w-4 text-blue-600" />
																															</Button>
																															<Button
																																variant="ghost"
																																size="sm"
																																className="h-6 w-6 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
																																title="Remove adjustment"
																																onClick={() =>
																																	handleManageGlobalAdjustmentClick(
																																		adjId
																																	)
																																}
																															>
																																<X className="h-4 w-4 text-red-600" />
																															</Button>
																														</div>
																													)}
																												</div>
																											)
																										)}
																								</div>
																							</div>

																							{/* Team-Specific Adjustments */}
																							<div>
																								<h4 className="font-semibold text-gray-700">
																									Team-Specific
																									Adjustments
																								</h4>
																								<div className="flex flex-wrap gap-2">
																									{Object.entries(
																										payoutsData[
																											division
																										][
																											subdivision
																										][
																											teamId
																										]
																											.adjustments ||
																											{}
																									)
																										.filter(
																											([
																												,
																												adjustment,
																											]) =>
																												!adjustment.global
																										)
																										.map(
																											([
																												adjId,
																												adjustment,
																											]) => (
																												<div
																													key={
																														adjId
																													}
																													className="p-2 border rounded-md w-fit relative group"
																													onMouseEnter={() =>
																														setHoveredAdjustmentId(
																															adjId
																														)
																													}
																													onMouseLeave={() =>
																														setHoveredAdjustmentId(
																															null
																														)
																													}
																												>
																													<div
																														className={`transition-all duration-200 ${
																															hoveredAdjustmentId ===
																															adjId
																																? "blur-sm"
																																: ""
																														}`}
																													>
																														<p className="font-medium">
																															{adjustment.credit
																																? "Credit"
																																: "Debit"}
																															:{" "}
																															{adjustment.credit
																																? ""
																																: "-"}
																															$
																															{Math.abs(
																																adjustment.adjustmentAmount
																															).toFixed(
																																2
																															)}
																														</p>
																														<p className="text-gray-500">
																															{
																																adjustment.notes
																															}
																														</p>
																													</div>
																													{hoveredAdjustmentId ===
																														adjId && (
																														<div className="absolute inset-0 flex items-center justify-center gap-4">
																															<Button
																																variant="ghost"
																																size="sm"
																																className="h-6 w-6 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
																																title="Edit adjustment"
																																onClick={() =>
																																	handleEditTeamAdjustment(
																																		teamId,
																																		division,
																																		subdivision,
																																		adjId
																																	)
																																}
																															>
																																<Pencil className="h-4 w-4 text-blue-600" />
																															</Button>
																															<Button
																																variant="ghost"
																																size="sm"
																																className="h-6 w-6 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
																																title="Remove adjustment"
																																onClick={() =>
																																	confirmRemoveTeamAdjustment(
																																		teamId,
																																		division,
																																		subdivision,
																																		adjId
																																	)
																																}
																															>
																																<X className="h-4 w-4 text-red-600" />
																															</Button>
																														</div>
																													)}
																												</div>
																											)
																										)}
																								</div>
																							</div>
																						</div>
																					) : (
																						<p className="text-gray-500 italic">
																							No
																							adjustments
																							found...
																						</p>
																					)}
																				</AccordionContent>
																			</AccordionItem>
																		);
																	}
																)}
														</Accordion>
													</AccordionContent>
												</AccordionItem>
											))}
										</Accordion>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						))}
					<div className="flex justify-center gap-4 mt-6">
						<Button
							variant="outline"
							className="hover:bg-gray-100 border-gray-300 text-gray-700"
							onClick={() => {
								handleSavePayoutsData();
							}}
							disabled={!hasPayoutsDataChanged()} // Disable button if data hasn't changed
						>
							Save Payout Data
						</Button>
						<Button
							variant="outline"
							className="hover:bg-red-600 border-gray-300 text-gray-700"
							onClick={() => {
								// Ask for confirmation before resetting
								if (
									window.confirm(
										"Are you sure you want to reset all payout data? This will remove all place, amount, and adjustment information."
									)
								) {
									// Create new payouts data structure from scratch
									const newPayoutsData: PayoutsData = {};

									Object.keys(divisionsData).forEach(
										(division) => {
											newPayoutsData[division] = {};

											Object.keys(
												divisionsData[division]
													?.subdivisions || {}
											).forEach((subdivision) => {
												newPayoutsData[division][
													subdivision
												] = {};

												// Use Object.entries to get both key and TeamInfo object
												Object.entries(
													divisionsData[division]
														?.subdivisions[
														subdivision
													] || {}
												).forEach(([, teamInfo]) => {
													// Use the teamId property from the TeamInfo object
													const teamId =
														teamInfo.teamId;

													newPayoutsData[division][
														subdivision
													][teamId] = {
														place: null,
														amount: 0,
														adjustmentAmount: 0,
														adjustments: {},
													};
												});
											});
										}
									);

									setPayoutsData(newPayoutsData);
									toast.success("Payouts have been reset");
								}
							}}
						>
							Reset Payouts
						</Button>
					</div>
					{/* Local Adjustment Dialog */}
					<Dialog
						open={adjustmentDialogOpen}
						onOpenChange={setAdjustmentDialogOpen}
					>
						<DialogContent className="sm:max-w-[425px] bg-white">
							<DialogHeader>
								<DialogTitle>
									Add Adjustment for {selectedTeamName}
								</DialogTitle>
							</DialogHeader>
							<AdjustmentForm
								global={false}
								teamId={selectedTeamId}
								handleAdjustment={handleAdjustment}
								setOpen={setAdjustmentDialogOpen}
							/>
						</DialogContent>
					</Dialog>

					{/* Global Adjustment Dialog */}
					<Dialog
						open={globalAdjustmentDialogOpen}
						onOpenChange={setGlobalAdjustmentDialogOpen}
					>
						<DialogContent className="sm:max-w-[425px] bg-white">
							<DialogHeader>
								<DialogTitle>Add Global Adjustment</DialogTitle>
							</DialogHeader>
							<AdjustmentForm
								global={true}
								teamId="global" // Using a placeholder value since it will be applied to all teams
								handleAdjustment={handleAdjustment}
								setOpen={setGlobalAdjustmentDialogOpen}
							/>
						</DialogContent>
					</Dialog>

					{/* Manage Global Adjustments Dialog */}
					<Dialog
						open={manageGlobalAdjustmentsDialogOpen}
						onOpenChange={setManageGlobalAdjustmentsDialogOpen}
					>
						<DialogContent className="sm:max-w-[700px] bg-white">
							<DialogHeader>
								<DialogTitle>
									Manage Global Adjustments
								</DialogTitle>
							</DialogHeader>
							<ManageGlobalAdjustments
								payoutsData={payoutsData}
								onRemoveGlobalAdjustment={
									handleRemoveGlobalAdjustment
								}
								highlightedAdjustmentId={
									highlightedAdjustmentId
								}
							/>
						</DialogContent>
					</Dialog>

					{/* Team Adjustment Edit Dialog */}
					{editingTeamAdjustmentData && (
						<Dialog
							open={editTeamAdjustmentDialogOpen}
							onOpenChange={setEditTeamAdjustmentDialogOpen}
						>
							<DialogContent className="sm:max-w-[425px] bg-white">
								<DialogHeader>
									<DialogTitle>
										Edit Team Adjustment
									</DialogTitle>
								</DialogHeader>
								<AdjustmentForm
									global={false}
									teamId={editingTeamAdjustmentData.teamId}
									adjustmentData={{
										amount: Math.abs(
											editingTeamAdjustmentData.adjustment
												.adjustmentAmount
										),
										type: editingTeamAdjustmentData
											.adjustment.credit,
										notes:
											editingTeamAdjustmentData.adjustment
												.notes || "",
									}}
									handleAdjustment={(
										teamId,
										amount,
										type,
										notes,
										global
									) => {
										// First remove the old adjustment
										if (
											editingTeamAdjustmentId &&
											editingTeamAdjustmentData
										) {
											const { division, subdivision } =
												editingTeamAdjustmentData;
											// Remove the old adjustment
											const newPayoutsData = {
												...payoutsData,
											};
											const team =
												newPayoutsData[division][
													subdivision
												][teamId];

											if (
												team.adjustments &&
												team.adjustments[
													editingTeamAdjustmentId
												]
											) {
												// Subtract the old adjustment amount
												team.adjustmentAmount -=
													team.adjustments[
														editingTeamAdjustmentId
													].adjustmentAmount;

												// Delete the old adjustment
												delete team.adjustments[
													editingTeamAdjustmentId
												];

												// Ensure formatted amount with two decimal places
												const formattedAmount = Number(
													amount.toFixed(2)
												);

												// Add the new adjustment with the same ID
												team.adjustments[
													editingTeamAdjustmentId
												] = {
													global,
													adjustmentAmount:
														formattedAmount *
														(type ? 1 : -1),
													credit: type,
													notes:
														notes ||
														"Edited adjustment",
												};

												// Update the total adjustment amount
												team.adjustmentAmount +=
													formattedAmount *
													(type ? 1 : -1);

												// Ensure total is also formatted
												team.adjustmentAmount = Number(
													team.adjustmentAmount.toFixed(
														2
													)
												);

												setPayoutsData(newPayoutsData);
												toast.success(
													"Team adjustment updated successfully"
												);
											}
										}
										setEditTeamAdjustmentDialogOpen(false);
									}}
									setOpen={setEditTeamAdjustmentDialogOpen}
								/>
							</DialogContent>
						</Dialog>
					)}
				</>
			)}
		</div>
	);
}
