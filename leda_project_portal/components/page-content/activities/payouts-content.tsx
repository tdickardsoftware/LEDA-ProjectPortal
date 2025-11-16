"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import React, { useState, useCallback, useEffect } from "react";
import {
	rosterRoute,
	scoresheetCountRoute,
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

// TanStack Query imports
import {
	useQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

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
	const queryClient = useQueryClient();
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [currentSeason, setCurrentSeason] = useState(true);
	const [divisionsData, setDivisionsData] = useState<RosterData>({});
	const [payoutsData, setPayoutsData] = useState<PayoutsData>({});
	const [loading, setLoading] = useState(false);
	const [expectedScoresheetCount, setExpectedScoresheetCount] =
		useState<number>(0);
	const [completedScoresheetCount, setCompletedScoresheetCount] =
		useState<number>(0);
	const [totalWeeks, setTotalWeeks] = useState<number>(0);

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

	// --- TanStack Query: Fetch payouts data ---
	const {
		data: payoutsQueryData,
		isLoading: payoutsLoading,
	} = useQuery({
		queryKey: ["payouts", seasonCode],
		queryFn: async () => {
			if (!seasonCode) return null;
			const res = await fetch(`${payoutRoute}?seasonCode=${seasonCode}`);
			if (!res.ok) throw new Error("Failed to fetch payouts data");
			const data = await res.json();
			return data && data.length > 0 ? data[0].payoutsData : null;
		},
		enabled: !!seasonCode,
	});

	// --- TanStack Query: Fetch roster data ---
	const {
		data: rosterQueryData,
		isLoading: rosterLoading,
	} = useQuery({
		queryKey: ["roster", seasonCode],
		queryFn: async () => {
			if (!seasonCode) return null;
			const res = await fetch(`${rosterRoute}?seasonCode=${seasonCode}`);
			if (!res.ok) throw new Error("Failed to fetch roster data");
			const data = await res.json();
			return data ? JSON.parse(JSON.stringify(data.teamInformation)) : {};
		},
		enabled: !!seasonCode,
	});

	// --- TanStack Query: Fetch scoresheet count (expected and completed) ---
	const {
		data: scoresheetCountData,
		isLoading: scoresheetCountLoading,
	} = useQuery({
		queryKey: ["scoresheetCount", seasonCode],
		queryFn: async () => {
			if (!seasonCode) return null;
			const res = await fetch(
				`${scoresheetCountRoute}?seasonCode=${seasonCode}`
			);
			if (!res.ok) throw new Error("Failed to fetch scoresheet count");
			const data = await res.json();
			return data;
		},
		enabled: !!seasonCode,
	});

	// --- Effect: When seasonCode changes, update local state from queries ---
	useEffect(() => {
		if (!seasonCode) return;
		setLoading(
			payoutsLoading ||
			rosterLoading ||
			scoresheetCountLoading
		);

		if (rosterQueryData) {
			setDivisionsData(rosterQueryData);
		}
		if (payoutsQueryData) {
			setPayoutsData(payoutsQueryData);
			setOriginalPayoutsData(deepCopy(payoutsQueryData));
			toast.success("Payouts data loaded successfully");
		} else if (rosterQueryData) {
			// If no payouts data, but roster exists, create new payoutsData structure
			toast.info("Creating new payouts data from roster");
			// This will be handled by the effect below (when divisionsData changes)
		}
		if (scoresheetCountData) {
			setExpectedScoresheetCount(scoresheetCountData.expectedScoresheets || 0);
			setCompletedScoresheetCount(scoresheetCountData.completedScoresheets || 0);
			setTotalWeeks(scoresheetCountData.totalWeeks || 0);
		}
		// eslint-disable-next-line
	}, [
		seasonCode,
		payoutsQueryData,
		rosterQueryData,
		scoresheetCountData,
		payoutsLoading,
		rosterLoading,
		scoresheetCountLoading,
	]);

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

	// Handle season code selection
	const handleSeasonCodeSelect = useCallback(
		async (value: string) => {
			if (value === seasonCode) return;
			setSeasonCode(value);
			// TanStack Query will refetch automatically due to queryKey dependency
		},
		[seasonCode]
	);

	// --- TanStack Mutation: Save payouts data ---
	const savePayoutsMutation = useMutation({
		mutationFn: async (payload: { seasonCode: string | null; payoutsData: PayoutsData }) => {
			const response = await fetchWithSession(payoutRoute, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message || "Failed to save payouts data");
			return result;
		},
		onSuccess: () => {
			toast.success("Payouts data saved successfully");
			queryClient.invalidateQueries({ queryKey: ["payouts", seasonCode] });
		},
		onError: (error: unknown) => {
			const errorMessage =
				error instanceof Error
					? error.message
					: typeof error === "string"
					? error
					: "Unknown error";
			toast.error(`Failed to save payouts data: ${errorMessage}`);
		},
	});

	const handleSavePayoutsData = async () => {
		savePayoutsMutation.mutate({ seasonCode, payoutsData });
		setOriginalPayoutsData(deepCopy(payoutsData));
	};

	// --- TanStack Query: Calculate payouts (team points) ---
	const calculatePayoutsMutation = useMutation({
		mutationFn: async (params: {
			seasonCode: string | null;
			totalWeeks: number;
			teamIdsByDivisionSubdivision: { [key: string]: { division: string; subdivision: string; teamIds: string[] } };
			payoutsData: PayoutsData;
		}) => {
			const { seasonCode, totalWeeks, teamIdsByDivisionSubdivision, payoutsData } = params;
			const newPayoutsData = { ...payoutsData };
			for (const key of Object.keys(teamIdsByDivisionSubdivision)) {
				const { division, subdivision, teamIds } = teamIdsByDivisionSubdivision[key];
				const response = await fetchWithSession(
					`${weeklyScoresheetsRoute}/teamPoints?seasonCode=${seasonCode}&totalWeeks=${totalWeeks}&teamLedaIds=${teamIds}`,
					{ method: "GET", headers: { "Content-Type": "application/json" } }
				);
				if (!response.ok) throw new Error("Failed to fetch team points data");
				const data = await response.json();
				if (data && Array.isArray(data)) {
					data.forEach(
						(teamData: {
							teamLedaId: string;
							place: string;
							amount: string;
						}) => {
							// Only update if this team is in the current subdivision's team list
							if (teamIds.includes(teamData.teamLedaId)) {
								if (
									newPayoutsData[division]?.[subdivision]?.[teamData.teamLedaId]
								) {
									newPayoutsData[division][subdivision][teamData.teamLedaId].place =
										parseInt(teamData.place, 10) || null;
									newPayoutsData[division][subdivision][teamData.teamLedaId].amount =
										parseFloat(teamData.amount) || 0;
								}
							}
						}
					);
				}
			}
			return newPayoutsData;
		},
		onSuccess: (data) => {
			setPayoutsData(data);
			toast.success("Payouts calculated successfully");
		},
		onError: () => {
			toast.error("Failed to retrieve team standings");
		},
	});

	const handleCalculatePayoutsClick = async () => {
		const teamIdsByDivisionSubdivision: { [key: string]: { division: string; subdivision: string; teamIds: string[] } } = {};
		Object.keys(divisionsData).forEach((division) => {
			Object.keys(divisionsData[division]?.subdivisions || {}).forEach(
				(subdivision) => {
					const key = `${division}|${subdivision}`;
					const teamIds = Object.keys(
						divisionsData[division]?.subdivisions[subdivision] || {}
					).map(
						(team) =>
							divisionsData[division]?.subdivisions[subdivision][
								team
							]?.teamId
					);
					teamIdsByDivisionSubdivision[key] = {
						division,
						subdivision,
						teamIds
					};
					console.log(`Division: ${division}, Subdivision: ${subdivision}, Teams:`, teamIds);
				}
			);
		});
		
		// Clean up payoutsData: remove teams that don't belong to their subdivisions
		const cleanedPayoutsData = { ...payoutsData };
		Object.keys(cleanedPayoutsData).forEach((division) => {
			Object.keys(cleanedPayoutsData[division]).forEach((subdivision) => {
				const key = `${division}|${subdivision}`;
				const validTeamIds = teamIdsByDivisionSubdivision[key]?.teamIds || [];
				
				// Remove teams that aren't in the current subdivision's roster
				Object.keys(cleanedPayoutsData[division][subdivision]).forEach((teamId) => {
					if (!validTeamIds.includes(teamId)) {
						console.warn(`Removing team ${teamId} from ${division} - ${subdivision} (not in roster)`);
						delete cleanedPayoutsData[division][subdivision][teamId];
					}
				});
			});
		});
		
		calculatePayoutsMutation.mutate({
			seasonCode,
			totalWeeks,
			teamIdsByDivisionSubdivision,
			payoutsData: cleanedPayoutsData,
		});
	};

	// Utility function to create a deep copy of an object
	const deepCopy = (obj: PayoutsData): PayoutsData => {
		return JSON.parse(JSON.stringify(obj));
	};

	// Handle adjustment
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

	// Utility function to check if payoutsData has changed compared to originalPayoutsData
	const hasPayoutsDataChanged = (): boolean => {
		return JSON.stringify(payoutsData) !== JSON.stringify(originalPayoutsData);
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
								{!payoutsQueryData && (
									<FolderTabMed
										title="Payouts"
										className="w-fit self-start"
									>
										<div className="flex flex-col gap-2">
											{expectedScoresheetCount > 0 && (
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
																		expectedScoresheetCount
																	}
																>
																	{completedScoresheetCount ===
																	expectedScoresheetCount ? (
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
																							expectedScoresheetCount) *
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
																				{expectedScoresheetCount > 0
																					? `${Math.round(
																							(completedScoresheetCount /
																								expectedScoresheetCount) *
																								100
																					  )}%`
																					: "0%"}{" "}
																				Complete
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
																expectedScoresheetCount
																	? "Scoresheets are not yet complete"
																	: "All scoresheets are complete, calculate placements"}
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											)}
										</div>
									</FolderTabMed>
								)}
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
																	const payoutTeam =
																		teamId &&
																		payoutsData[
																			division
																		] &&
																		payoutsData[
																			division
																		][subdivision] &&
																		payoutsData[
																			division
																		][subdivision][
																			teamId
																		]
																			? payoutsData[
																					division
																			  ][subdivision][
																					teamId
																			  ]
																			: undefined;
																	const place =
																		payoutTeam && typeof payoutTeam.place === "number"
																			? payoutTeam.place
																			: Number.MAX_SAFE_INTEGER;
																	return {
																		team,
																		teamInfo,
																		teamId,
																		payoutTeam,
																		place,
																	};
																})
																.sort(
																	(a, b) =>
																		a.place -
																		b.place
																) // Sort by place (ascending)
																.map(
																	(
																		{ team, teamInfo, teamId, payoutTeam },
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
																							{payoutTeam && payoutTeam.place !== null ? (
																								<span>
																									<span className="font-semibold">
																										{payoutTeam.place}
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
																										{payoutTeam.amount.toFixed(
																											2
																										)}
																									</span>
																									{payoutTeam.adjustmentAmount !== 0 && (
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
																													payoutTeam.amount +
																													payoutTeam.adjustmentAmount
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
																					{payoutTeam && payoutTeam.adjustments &&
																						Object.keys(
																							payoutTeam.adjustments ||
																							{}
																						).length >
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
																										payoutTeam.adjustments || {}
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
																										payoutTeam.adjustments || {}
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
