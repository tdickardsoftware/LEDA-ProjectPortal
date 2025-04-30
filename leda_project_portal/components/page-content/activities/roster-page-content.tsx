"use client";

import { useState, useCallback, useEffect } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import DivisionAddForm from "@/components/forms/activities/division-add-form";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import TeamAddForm from "@/components/forms/activities/team-add-form";
import { X } from "lucide-react";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { rosterRoute, scheduleRoute } from "@/lib/apiRoutes";
import CopyRosterForm from "@/components/forms/activities/copy-roster-form";
import { Spinner } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FolderTabMed } from "@/components/ui/folder-tab";

// Define types for better code readability
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

type ScheduleData = Record<
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
>;

export default function RostersContent({ renderSeasonCode }: { renderSeasonCode?: string }) {
	// State variables
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
	const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [divisionsData, setDivisionsData] = useState<RosterData>({});
	const [teamOpen, setTeamOpen] = useState<{ [key: string]: boolean }>({});
	const [open, setOpen] = useState(false);
	const [copyOpen, setCopyOpen] = useState(false);
	const [divisionToDelete, setDivisionToDelete] = useState<string | null>(
		null
	);
	const [subdivisionToDelete, setSubdivisionToDelete] = useState<{
		division: string;
		subdivision: string;
	} | null>(null);
	const [teamToDelete, setTeamToDelete] = useState<{
		division: string;
		subdivision: string;
		team: string;
		teamId: string;
	} | null>(null);
	const [divisionAlertOpen, setDivisionAlertOpen] = useState(false);
	const [subdivisionAlertOpen, setSubdivisionAlertOpen] = useState(false);
	const [teamAlertOpen, setTeamAlertOpen] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [initialData, setInitialData] = useState<RosterData>({});
	const [update, setUpdate] = useState(false);
	const [deleteRosterAlertOpen, setDeleteRosterAlertOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentSeason, setCurrentSeason] = useState(renderSeasonCode ? false : true);
	
	// Use renderSeasonCode if provided
	useEffect(() => {
		if (renderSeasonCode) {
			setSeasonCode(renderSeasonCode);
			handleSeasonCodeSelect(renderSeasonCode);
		}
	}, []);  // eslint-disable-line react-hooks/exhaustive-deps

	// Extract all team IDs from divisions data
	const extractTeamIds = useCallback((data: RosterData): string[] => {
		const teamIds: string[] = [];

		Object.values(data).forEach((division) => {
			Object.values(division.subdivisions).forEach((subdivision) => {
				Object.values(subdivision).forEach((team) => {
					teamIds.push(team.teamId);
				});
			});
		});

		return teamIds;
	}, []);

	// Check if data has changed
	const checkHasChanges = useCallback(() => {
		return JSON.stringify(divisionsData) !== JSON.stringify(initialData);
	}, [divisionsData, initialData]);

	// Update hasChanges when data changes
	useEffect(() => {
		setHasChanges(checkHasChanges());
	}, [divisionsData, initialData, checkHasChanges]);

	// Handle season code selection
	const handleSeasonCodeSelect = useCallback(
		async (value: string) => {
			if (value === seasonCode) return;
			setSeasonCode(value);

			try {
				setLoading(true);
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
						// Update state with the fetched data
						const fetchedData = JSON.parse(
							JSON.stringify(roster.teamInfomation)
						);

						// Extract divisions and team IDs
						const divisions = Object.keys(fetchedData);
						const teamIds = extractTeamIds(fetchedData);

						setSelectedDivisions(divisions);
						setSelectedTeams(teamIds); // Populate selectedTeams to prevent duplicates
						setDivisionsData(fetchedData);
						setInitialData(fetchedData);
						setUpdate(true);
						setHasChanges(false);
					}
				} else {
					setInitialData({});
					setDivisionsData({});
					setSelectedTeams([]);
					setSelectedDivisions([]);
					setUpdate(false);
					setHasChanges(false);
				}
			} catch (error) {
				console.error("Failed to fetch roster data:", error);
				toast.error("Failed to load roster data");
			} finally {
				setLoading(false);
				setDisabled(false);
			}
		},
		[seasonCode, extractTeamIds]
	);

	// Generate Schedule Data
	const generateScheduleData = (
		scheduleData: ScheduleData,
		divisionsData: RosterData
	): ScheduleData => {
		// First, extract all valid team IDs from the current roster
		const validTeamIds: Set<string> = new Set();

		// Create a mapping of teamId to its current letter in each division/subdivision
		const currentTeamLetterMap: Record<
			string,
			Record<string, Record<string, string>>
		> = {};

		// Create a mapping of teamId to its previous match data regardless of letter
		const teamIdToMatchesMap: Record<
			string,
			Record<
				string,
				{
					matchDate: string;
					matchTime: string;
					home: boolean;
					opposingTeamId: string;
					opposingTeamLetter: string;
				}
			>
		> = {};

		// Build the current letter mapping and valid team IDs
		Object.keys(divisionsData).forEach((division) => {
			currentTeamLetterMap[division] = {};

			Object.keys(divisionsData[division].subdivisions).forEach(
				(subdivision) => {
					currentTeamLetterMap[division][subdivision] = {};

					Object.entries(
						divisionsData[division].subdivisions[subdivision]
					).forEach(([letter, team]) => {
						validTeamIds.add(team.teamId);
						currentTeamLetterMap[division][subdivision][
							team.teamId
						] = letter;
					});
				}
			);
		});

		// Extract all previous match data by team ID
		Object.keys(scheduleData).forEach((division) => {
			Object.keys(scheduleData[division] || {}).forEach((subdivision) => {
				Object.entries(
					scheduleData[division][subdivision] || {}
				).forEach(([, teamData]) => {
					// Store the match data indexed by team ID
					teamIdToMatchesMap[teamData.teamId] =
						teamData.matchesData || {};
				});
			});
		});

		// Generate new schedule data with current team letters
		const newMatchData: ScheduleData = {};
		Object.keys(divisionsData).forEach((division) => {
			newMatchData[division] = {};
			Object.keys(divisionsData[division].subdivisions).forEach(
				(subdivision) => {
					newMatchData[division][subdivision] = {};
					Object.keys(
						divisionsData[division].subdivisions[subdivision]
					).forEach((teamLetter) => {
						const teamId =
							divisionsData[division].subdivisions[subdivision][
								teamLetter
							].teamId;
						const oldMatchesData = teamIdToMatchesMap[teamId] || {};

						// Filter matches to only include those with valid opposing team IDs
						// and update the opposing team letter to reflect current lettering
						const validMatchesData: Record<
							string,
							{
								matchDate: string;
								matchTime: string;
								home: boolean;
								opposingTeamId: string;
								opposingTeamLetter: string;
							}
						> = {};

						Object.entries(oldMatchesData).forEach(
							([matchId, matchData]) => {
								const opposingTeamId = (
									matchData as {
										matchDate: string;
										matchTime: string;
										home: boolean;
										opposingTeamId: string;
										opposingTeamLetter: string;
									}
								).opposingTeamId;

								// Skip if opposing team no longer exists
								if (!validTeamIds.has(opposingTeamId)) {
									return;
								}

								// Find the current division and subdivision of the opposing team
								let foundDivision = null;
								let foundSubdivision = null;

								searchDivisions: for (const div of Object.keys(
									currentTeamLetterMap
								)) {
									for (const subdiv of Object.keys(
										currentTeamLetterMap[div]
									)) {
										if (
											currentTeamLetterMap[div][subdiv][
												opposingTeamId
											]
										) {
											foundDivision = div;
											foundSubdivision = subdiv;
											break searchDivisions;
										}
									}
								}

								if (!foundDivision || !foundSubdivision) {
									return; // Opposing team not found in current structure
								}

								// Get the current letter of the opposing team (after potential shifts)
								const currentOpposingLetter =
									currentTeamLetterMap[foundDivision][
										foundSubdivision
									][opposingTeamId];

								// Always update to use the current letter of the opposing team
								validMatchesData[matchId] = {
									...(matchData as {
										matchDate: string;
										matchTime: string;
										home: boolean;
										opposingTeamId: string;
										opposingTeamLetter: string;
									}),
									opposingTeamLetter: currentOpposingLetter, // Use the current letter (after shifts)
								};
							}
						);

						newMatchData[division][subdivision][teamLetter] = {
							teamName:
								divisionsData[division].subdivisions[
									subdivision
								][teamLetter].teamName,
							teamId: divisionsData[division].subdivisions[
								subdivision
							][teamLetter].teamId,
							matchesData: validMatchesData,
						};
					});
				}
			);
		});

		return newMatchData;
	};

	// Handle updating the roster to the database
	const handleUpdateRoster = useCallback(async () => {
		if (!seasonCode) return;

		try {
			setLoading(true);
			const response = await fetch(rosterRoute, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					seasonCode: seasonCode,
					teamInformation: divisionsData,
				}),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			setInitialData(JSON.parse(JSON.stringify(divisionsData)));
			setHasChanges(false);
			toast.success("Roster updated successfully");
		} catch (error) {
			console.error("Failed to update roster:", error);
			toast.error("Failed to update roster");
		} finally {
			setLoading(false);
		}
		/////////////////////////////
		// Schedule Updating Logic
		/////////////////////////////
		const scheduleDataResults = await fetch(
			`${scheduleRoute}?seasonCode=${seasonCode}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		if (scheduleDataResults.status === 200) {
			const scheduleData = (await scheduleDataResults.json())
				.scheduleData;
			if (scheduleData) {
				// Update the schedule data
				const potentialChanges = generateScheduleData(
					scheduleData,
					divisionsData
				);

				await fetch(scheduleRoute, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						seasonCode: seasonCode,
						scheduleData: potentialChanges,
					}),
				});
			}
		}
	}, [divisionsData, seasonCode]);

	// Handle saving the roster to the database
	const handleSaveRoster = useCallback(async () => {
		if (!seasonCode) return;

		try {
			setLoading(true);
			const response = await fetch(rosterRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					seasonCode: seasonCode,
					teamInformation: divisionsData,
				}),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			setInitialData(JSON.parse(JSON.stringify(divisionsData)));
			setUpdate(true);
			setHasChanges(false);
			toast.success("Roster saved successfully");
			window.location.reload();
		} catch (error) {
			console.error("Failed to save roster:", error);
			toast.error("Failed to save roster");
		} finally {
			setLoading(false);
		}
	}, [seasonCode, divisionsData]);

	// Handle division selection
	const handleSelectDivision = useCallback(
		(value: string) => {
			// Prevent duplicates
			if (selectedDivisions.includes(value)) return;

			setSelectedDivisions((prev) => [...prev, value]);
			setDivisionsData((prev) => ({
				...prev,
				[value]: { subdivisions: {} },
			}));
			setHasChanges(true);
		},
		[selectedDivisions]
	);

	// Handle adding a new subdivision
	const handleAddSubdivision = useCallback(
		(division: string) => {
			const newSubdivision = `Subdivision ${
				Object.keys(divisionsData[division]?.subdivisions || {})
					.length + 1
			}`;

			setDivisionsData((prev) => ({
				...prev,
				[division]: {
					...prev[division],
					subdivisions: {
						...prev[division]?.subdivisions,
						[newSubdivision]: {},
					},
				},
			}));
			setHasChanges(true);
		},
		[divisionsData]
	);

	// Handle team selection
	const handleTeamSelect = useCallback(
		(
			teamId: string,
			placeId: string,
			teamName: string,
			division: string,
			subdivision: string
		) => {
			// Prevent duplicates
			if (selectedTeams.includes(teamId)) {
				toast.error("This team has already been added to the roster");
				return;
			}

			setSelectedTeams((prev) => [...prev, teamId]);

			const teamLetter = String.fromCharCode(
				65 +
					Object.keys(
						divisionsData[division]?.subdivisions[subdivision] || {}
					).length
			);

			setDivisionsData((prev) => ({
				...prev,
				[division]: {
					...prev[division],
					subdivisions: {
						...prev[division]?.subdivisions,
						[subdivision]: {
							...prev[division]?.subdivisions[subdivision],
							[teamLetter]: { teamId, placeId, teamName },
						},
					},
				},
			}));
			setHasChanges(true);
		},
		[selectedTeams, divisionsData]
	);

	// Render add team dialog
	const handleAddTeam = useCallback(
		(division: string, subdivision: string) => {
			// Check if subdivision already has 8 teams
			const teamCount = Object.keys(
				divisionsData[division]?.subdivisions[subdivision] || {}
			).length;
			const maxTeamsReached = teamCount >= 8;

			return (
				<Dialog
					open={teamOpen[`${division}-${subdivision}`] || false}
					onOpenChange={(isOpen) =>
						setTeamOpen((prev) => ({
							...prev,
							[`${division}-${subdivision}`]: isOpen,
						}))
					}
				>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							disabled={disabled || maxTeamsReached}
							title={
								maxTeamsReached
									? "Maximum of 8 teams per subdivision"
									: ""
							}
						>
							{maxTeamsReached ? "Max Teams (8)" : "Add Team"}
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-white max-w-full w-fit max-h-full h-fit overflow-auto">
						<DialogHeader>
							<DialogTitle>Add Team</DialogTitle>
						</DialogHeader>
						<TeamAddForm
							selectedTeams={selectedTeams}
							handleSelectTeam={handleTeamSelect}
							setOpen={(isOpen) =>
								setTeamOpen((prev) => ({
									...prev,
									[`${division}-${subdivision}`]: isOpen,
								}))
							}
							division={division}
							subdivision={subdivision}
						/>
					</DialogContent>
				</Dialog>
			);
		},
		[teamOpen, disabled, selectedTeams, handleTeamSelect, divisionsData]
	);

	// Render add division dialog
	const handleAddDivision = useCallback(
		() => (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						disabled={disabled}
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Add Division
					</Button>
				</DialogTrigger>
				<DialogContent className="bg-white max-w-full w-fit max-h-full h-fit overflow-auto">
					<DialogHeader>
						<DialogTitle>Add Division</DialogTitle>
					</DialogHeader>
					<DivisionAddForm
						selectedDivisions={selectedDivisions}
						handleSelectDivision={handleSelectDivision}
						setOpen={setOpen}
					/>
				</DialogContent>
			</Dialog>
		),
		[open, disabled, selectedDivisions, handleSelectDivision]
	);

	// Render Copy Roster Dialog
	const handleCopyRoster = useCallback(
		() => (
			<Dialog open={copyOpen} onOpenChange={setCopyOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Copy Roster
					</Button>
				</DialogTrigger>
				<DialogContent className="bg-white max-w-full w-fit max-h-full h-fit overflow-auto">
					<DialogHeader>
						<DialogTitle>Copy Roster</DialogTitle>
					</DialogHeader>
					<CopyRosterForm setOpen={setCopyOpen} />
				</DialogContent>
			</Dialog>
		),
		[copyOpen]
	);

	// Handle removing a division
	const handleRemoveDivision = useCallback(
		(division: string) => {
			// Get teams to remove
			const teamsToRemove = extractTeamIds({
				[division]: divisionsData[division],
			});

			// Update state
			setDivisionsData((prev) => {
				const newData = { ...prev };
				delete newData[division];
				return newData;
			});

			setSelectedDivisions((prev) =>
				prev.filter((div) => div !== division)
			);

			setSelectedTeams((prev) =>
				prev.filter((teamId) => !teamsToRemove.includes(teamId))
			);

			setHasChanges(true);
		},
		[divisionsData, extractTeamIds]
	);

	// Update subdivision names after removal
	const updateSubdivisionNames = useCallback(
		(division: string) => {
			const updatedSubdivisions = {
				...divisionsData[division]?.subdivisions,
			};
			const newSubdivisions: { [key: string]: SubdivisionData } = {};

			// Rename subdivisions sequentially
			Object.keys(updatedSubdivisions)
				.sort()
				.forEach((_, index) => {
					const oldKey = Object.keys(updatedSubdivisions)[index];
					newSubdivisions[`Subdivision ${index + 1}`] =
						updatedSubdivisions[oldKey];
				});

			setDivisionsData((prev) => ({
				...prev,
				[division]: {
					...prev[division],
					subdivisions: newSubdivisions,
				},
			}));

			setHasChanges(true);
		},
		[divisionsData]
	);

	// Handle removing a subdivision
	const handleRemoveSubdivision = useCallback(
		(division: string, subdivision: string) => {
			// Get teams to remove
			const teamsToRemove = Object.values(
				divisionsData[division]?.subdivisions[subdivision] || {}
			).map((team) => team.teamId);

			// Update divisions
			setDivisionsData((prev) => {
				const newData = { ...prev };
				if (newData[division]?.subdivisions) {
					delete newData[division].subdivisions[subdivision];
				}
				return newData;
			});

			// Update selected teams
			setSelectedTeams((prev) =>
				prev.filter((teamId) => !teamsToRemove.includes(teamId))
			);

			// Rename subdivisions
			updateSubdivisionNames(division);

			// Force hasChanges update immediately after state change
			setTimeout(() => {
				setHasChanges(true);
			}, 0);
		},
		[divisionsData, updateSubdivisionNames]
	);

	// Handle removing a team
	const handleRemoveTeam = useCallback(
		(
			division: string,
			subdivision: string,
			team: string,
			teamId: string
		) => {
			setDivisionsData((prev) => {
				const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to ensure new reference

				// First, remove the team
				if (newData[division]?.subdivisions[subdivision]) {
					delete newData[division].subdivisions[subdivision][team];
				}

				// Then, reorganize the team letters
				const teamData =
					newData[division]?.subdivisions[subdivision] || {};
				const teamEntries = Object.entries(teamData).sort(
					([letterA], [letterB]) => letterA.localeCompare(letterB)
				);

				// Create a new object with updated letters
				const updatedTeams: SubdivisionData = {};
				teamEntries.forEach(([, /* unused */ teamInfo], index) => {
					const newLetter = String.fromCharCode(65 + index); // 'A' + index
					updatedTeams[newLetter] = teamInfo as TeamInfo;
				});

				// Update the subdivision with reorganized teams
				newData[division].subdivisions[subdivision] = updatedTeams;

				return newData;
			});

			setSelectedTeams((prev) => prev.filter((t) => t !== teamId));

			// Force hasChanges update immediately after state change
			setTimeout(() => {
				setHasChanges(true);
			}, 0);
		},
		[]
	);

	// Confirm removal of a division
	const confirmRemoveDivision = useCallback((division: string) => {
		setDivisionToDelete(division);
	}, []);

	// Confirm removal of a subdivision
	const confirmRemoveSubdivision = useCallback(
		(division: string, subdivision: string) => {
			setSubdivisionToDelete({ division, subdivision });
		},
		[]
	);

	// Confirm removal of a team
	const confirmRemoveTeam = useCallback(
		(
			division: string,
			subdivision: string,
			team: string,
			teamId: string
		) => {
			setTeamToDelete({ division, subdivision, team, teamId });
		},
		[]
	);

	// Handle confirmed removal of a division
	const handleConfirmRemoveDivision = useCallback(() => {
		if (divisionToDelete) {
			handleRemoveDivision(divisionToDelete);
			setDivisionToDelete(null);
		}
	}, [divisionToDelete, handleRemoveDivision]);

	// Handle confirmed removal of a subdivision
	const handleConfirmRemoveSubdivision = useCallback(() => {
		if (subdivisionToDelete) {
			handleRemoveSubdivision(
				subdivisionToDelete.division,
				subdivisionToDelete.subdivision
			);
			setSubdivisionToDelete(null);
		}
	}, [subdivisionToDelete, handleRemoveSubdivision]);

	// Handle confirmed removal of a team
	const handleConfirmRemoveTeam = useCallback(() => {
		if (teamToDelete) {
			handleRemoveTeam(
				teamToDelete.division,
				teamToDelete.subdivision,
				teamToDelete.team,
				teamToDelete.teamId
			);
			setTeamToDelete(null);
		}
	}, [teamToDelete, handleRemoveTeam]);

	// Handle deletion of a roster
	const handleDeleteRoster = useCallback(async () => {
		if (!seasonCode) return;

		try {
			setLoading(true);
			const response = await fetch(
				`${rosterRoute}?seasonCode=${seasonCode}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			setInitialData({});
			setDivisionsData({});
			setSelectedTeams([]);
			setSelectedDivisions([]);
			setUpdate(false);
			setHasChanges(false);
			toast.success("Roster deleted successfully");
		} catch (error) {
			console.error("Failed to delete roster:", error);
			toast.error("Failed to delete roster");
		} finally {
			setLoading(false);
		}
	}, [seasonCode]);

	return (
		<div className="flex flex-col max-w-[65vw]">
			{loading ? (
				<Spinner />
			) : (
				<>
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
						<FolderTabMed title="Roster Actions">
							<div className="flex gap-4">
								{handleAddDivision()}
								{update && (
									<Button
										variant="outline"
										className="hover:bg-gray-100 border-gray-300 text-gray-700"
										onClick={() =>
											setDeleteRosterAlertOpen(true)
										}
									>
										Delete Roster
									</Button>
								)}
								{handleCopyRoster()}
							</div>
						</FolderTabMed>
					</div>

					{/* Delete Roster Alert Dialog */}
					<AlertDialog
						open={deleteRosterAlertOpen}
						onOpenChange={setDeleteRosterAlertOpen}
					>
						<AlertDialogTrigger asChild>
							<div></div>
						</AlertDialogTrigger>
						<AlertDialogContent className="bg-white text-black">
							<AlertDialogHeader>
								<AlertDialogTitle>
									Confirm Deletion
								</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this roster?
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<Button
									onClick={() =>
										setDeleteRosterAlertOpen(false)
									}
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										handleDeleteRoster();
										setDeleteRosterAlertOpen(false);
									}}
									variant="destructive"
								>
									Delete
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{/* Divisions Accordion */}
					{Object.keys(divisionsData).length > 0 &&
						Object.keys(divisionsData).map((division, index) => (
							<Accordion
								key={index}
								type="single"
								collapsible
								className="w-full mt-4"
								defaultValue={`divisions-${index}`}
							>
								<AccordionItem value={`divisions`}>
									<div className="flex justify-between items-center">
										<AccordionTrigger>
											{division}
										</AccordionTrigger>
										<AlertDialog
											open={divisionAlertOpen}
											onOpenChange={setDivisionAlertOpen}
										>
											<AlertDialogTrigger asChild>
												<div
													onClick={() => {
														confirmRemoveDivision(
															division
														);
														setDivisionAlertOpen(
															true
														);
													}}
													className="cursor-pointer"
												>
													<X className="text-red-500" />
												</div>
											</AlertDialogTrigger>
											<AlertDialogContent className="bg-white text-black">
												<AlertDialogHeader>
													<AlertDialogTitle>
														Confirm Deletion
													</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to
														delete this division?
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<Button
														onClick={() =>
															setDivisionAlertOpen(
																false
															)
														}
													>
														Cancel
													</Button>
													<Button
														onClick={() => {
															handleConfirmRemoveDivision();
															setDivisionAlertOpen(
																false
															);
														}}
														variant="destructive"
													>
														Delete
													</Button>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
									<AccordionContent>
										<div className="flex justify-end">
											<Button
												onClick={() =>
													handleAddSubdivision(
														division
													)
												}
												variant={"outline"}
											>
												Add Subdivision
											</Button>
										</div>
										<Separator
											orientation="horizontal"
											className="my-2 bg-gray-300"
										/>

										{/* Subdivisions Accordion */}
										{Object.keys(
											divisionsData[division]
												?.subdivisions || {}
										).map((subdivision, subIndex) => (
											<Accordion
												key={subIndex}
												type="single"
												collapsible
												className="w-full mt-2"
												defaultValue={`subdivisions-${subIndex}`}
											>
												<AccordionItem
													value={`subdivisions-${subIndex}`}
													className="border-b border-gray-200"
												>
													<div className="flex justify-between items-center">
														<AccordionTrigger>
															{subdivision}
														</AccordionTrigger>
														<AlertDialog
															open={
																subdivisionAlertOpen
															}
															onOpenChange={
																setSubdivisionAlertOpen
															}
														>
															<AlertDialogTrigger
																asChild
															>
																<div
																	onClick={() => {
																		confirmRemoveSubdivision(
																			division,
																			subdivision
																		);
																		setSubdivisionAlertOpen(
																			true
																		);
																	}}
																	className="cursor-pointer"
																>
																	<X className="text-red-500" />
																</div>
															</AlertDialogTrigger>
															<AlertDialogContent className="bg-white text-black">
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Confirm
																		Deletion
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you
																		sure you
																		want to
																		delete
																		this
																		subdivision?
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<Button
																		onClick={() =>
																			setSubdivisionAlertOpen(
																				false
																			)
																		}
																	>
																		Cancel
																	</Button>
																	<Button
																		onClick={() => {
																			handleConfirmRemoveSubdivision();
																			setSubdivisionAlertOpen(
																				false
																			);
																		}}
																		variant="destructive"
																	>
																		Delete
																	</Button>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
													<AccordionContent>
														<div className="flex justify-end">
															{handleAddTeam(
																division,
																subdivision
															)}
														</div>

														{/* Teams List */}
														<ul>
															{Object.keys(
																divisionsData[
																	division
																]?.subdivisions[
																	subdivision
																] || {}
															).map(
																(
																	team,
																	teamIndex
																) => (
																	<li
																		key={
																			teamIndex
																		}
																	>
																		<div className="flex justify-start items-center">
																			{
																				team
																			}{" "}
																			-{" "}
																			{
																				divisionsData[
																					division
																				]
																					?.subdivisions[
																					subdivision
																				][
																					team
																				]
																					?.teamName
																			}
																			<AlertDialog
																				open={
																					teamAlertOpen
																				}
																				onOpenChange={
																					setTeamAlertOpen
																				}
																			>
																				<AlertDialogTrigger
																					asChild
																				>
																					<div
																						onClick={() => {
																							confirmRemoveTeam(
																								division,
																								subdivision,
																								team,
																								divisionsData[
																									division
																								]
																									?.subdivisions[
																									subdivision
																								][
																									team
																								]
																									?.teamId
																							);
																							setTeamAlertOpen(
																								true
																							);
																						}}
																						className="cursor-pointer"
																					>
																						<X className="text-red-500" />
																					</div>
																				</AlertDialogTrigger>
																				<AlertDialogContent className="bg-white text-black">
																					<AlertDialogHeader>
																						<AlertDialogTitle>
																							Confirm
																							Deletion
																						</AlertDialogTitle>
																						<AlertDialogDescription>
																							Are
																							you
																							sure
																							you
																							want
																							to
																							delete
																							this
																							team?
																						</AlertDialogDescription>
																					</AlertDialogHeader>
																					<AlertDialogFooter>
																						<Button
																							onClick={() =>
																								setTeamAlertOpen(
																									false
																								)
																							}
																						>
																							Cancel
																						</Button>
																						<Button
																							onClick={() => {
																								handleConfirmRemoveTeam();
																								setTeamAlertOpen(
																									false
																								);
																							}}
																							variant="destructive"
																						>
																							Delete
																						</Button>
																					</AlertDialogFooter>
																				</AlertDialogContent>
																			</AlertDialog>
																		</div>
																	</li>
																)
															)}
														</ul>
													</AccordionContent>
												</AccordionItem>
											</Accordion>
										))}
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						))}

					{/* Action Buttons */}
					{!update && (
						<div className="flex justify-center">
							<Button
								className="mt-4"
								variant="outline"
								disabled={!hasChanges || loading}
								onClick={handleSaveRoster}
							>
								Save Roster
							</Button>
						</div>
					)}
					{update && (
						<div className="flex justify-center gap-4">
							<Button
								className="hover:bg-gray-100 border-gray-300 text-gray-700 mt-4"
								variant="outline"
								disabled={!hasChanges || loading}
								onClick={handleUpdateRoster}
							>
								Update Roster
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-300 text-gray-700 mt-4"
								variant="outline"
								disabled={!hasChanges || loading}
								onClick={() => {
									setDivisionsData(
										JSON.parse(JSON.stringify(initialData))
									);
									setHasChanges(false);
								}}
							>
								Reset Changes
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
