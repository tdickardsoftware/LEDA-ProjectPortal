"use client";

/**
 * RosterPageContent
 *
 * Full CRUD interface for the LEDA league roster (divisions, subdivisions,
 * teams, and members). Changes are buffered in local state and persisted
 * with `saveRosterMutation` / `updateRosterMutation` / `deleteRosterMutation`.
 *
 * Saving the roster also cascades a schedule regeneration via
 * `updateScheduleMutation` so match slots stay in sync with team counts.
 *
 * The season is selected via `SeasonCodeSelector`. Drag-and-drop handles
 * re-ordering teams within a subdivision using `@dnd-kit/sortable`.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import SidenavPageLayout from "@/components/sidenav-page-layout";
import DivisionTreeSidenav, { DivisionTreeDivision } from "@/components/division-tree-sidenav";
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

import TeamAddForm from "@/components/forms/activities/team-add-form";
import { X, Pencil, GripVertical, TriangleAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
} from "@/components/ui/form";
import TeamSelector from "@/components/ui/team-selector";
import PlaceSelector from "@/components/ui/place-selector";
import { SaveStatusIndicator, SaveStatus } from "@/components/ui/save-status-indicator";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { rosterRoute, scheduleRoute, seasonRoute } from "@/lib/apiRoutes";
import { generateSchedule, type GeneratorOptions, type GenerationPreview } from "@/lib/scheduleGenerator";
import { type DivisionsData } from "@/lib/schedule";
import CopyRosterForm from "@/components/forms/activities/copy-roster-form";
import { Spinner } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FolderTabMed } from "@/components/ui/folder-tab";
import { 
	useQuery, 
	useMutation, 
	useQueryClient 
} from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import Link from "next/link";

async function safeReadJson<T>(response: Response): Promise<T | null> {
	// Avoid "Unexpected end of JSON input" when backend returns 200 with an empty body.
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text) as T;
	} catch {
		return null;
	}
}

function deepCloneOrEmptyObject<T extends object>(value: unknown): T {
	if (!value || typeof value !== "object") return {} as T;
	try {
		return JSON.parse(JSON.stringify(value)) as T;
	} catch {
		return {} as T;
	}
}

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

// API functions for TanStack Query
const fetchRoster = async (seasonCode: string | null): Promise<{teamInformation: RosterData} | null> => {
	if (!seasonCode) return null;
	
	const result = await fetchWithSession(`${rosterRoute}?seasonCode=${seasonCode}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	
	if (result.status === 200) {
		const json = await safeReadJson<{ teamInformation?: RosterData | null }>(result);
		if (!json) return null;
		return { teamInformation: deepCloneOrEmptyObject<RosterData>(json.teamInformation) };
	}
	
	if (result.status === 404) {
		return null;
	}
	
	throw new Error('Failed to fetch roster data');
};

const updateRoster = async ({seasonCode, data}: {seasonCode: string, data: RosterData}): Promise<void> => {
	const response = await fetchWithSession(rosterRoute, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			seasonCode,
			teamInformation: data,
		}),
	});
	
	if (!response.ok) {
		throw new Error('Failed to update roster');
	}
};

const saveRoster = async ({seasonCode, data}: {seasonCode: string, data: RosterData}): Promise<void> => {
	const response = await fetchWithSession(rosterRoute, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			seasonCode,
			teamInformation: data,
		}),
	});
	
	if (!response.ok) {
		throw new Error('Failed to save roster');
	}
};

const deleteRoster = async (seasonCode: string): Promise<void> => {
	const response = await fetchWithSession(`${rosterRoute}?seasonCode=${seasonCode}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});
	
	if (!response.ok) {
		throw new Error('Failed to delete roster');
	}
};

const fetchSchedule = async (seasonCode: string): Promise<{scheduleData: ScheduleData} | null> => {
	const response = await fetchWithSession(`${scheduleRoute}?seasonCode=${seasonCode}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	
	if (response.status === 200) {
		const json = await safeReadJson<{ scheduleData?: ScheduleData | null }>(response);
		if (!json) return null;
		return { scheduleData: deepCloneOrEmptyObject<ScheduleData>(json.scheduleData) };
	}
	
	return null;
};

const updateSchedule = async ({
	seasonCode, 
	data
}: {
	seasonCode: string, 
	data: ScheduleData
}): Promise<void> => {
	const response = await fetchWithSession(scheduleRoute, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			seasonCode,
			scheduleData: data,
		}),
	});
	
	if (!response.ok) {
		throw new Error('Failed to update schedule');
	}
};

// Schema and component for editing an existing roster team entry
const rosterTeamEditSchema = z.object({
	teamLedaId: z.string().min(1, { message: "Team is Required" }),
	placeId: z.string().min(1, { message: "Place is Required" }),
	teamName: z.string().min(1),
});

function RosterTeamEditForm({
	teamToEdit,
	selectedTeams,
	onSave,
	onClose,
}: {
	teamToEdit: { teamId: string; placeId: string; teamName: string };
	selectedTeams: string[];
	onSave: (teamId: string, placeId: string, teamName: string) => void;
	onClose: () => void;
}) {
	const form = useForm<z.infer<typeof rosterTeamEditSchema>>({
		resolver: zodResolver(rosterTeamEditSchema),
		defaultValues: {
			teamLedaId: teamToEdit.teamId,
			placeId: teamToEdit.placeId,
			teamName: teamToEdit.teamName,
		},
	});

	// Exclude all selected teams except the one currently being edited
	const filteredSelectedTeams = selectedTeams.filter((id) => id !== teamToEdit.teamId);

	function onSubmit(values: z.infer<typeof rosterTeamEditSchema>) {
		onSave(values.teamLedaId, values.placeId, values.teamName);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 min-w-[260px]">
				<TeamSelector
					name="teamLedaId"
					label="Team *"
					control={form.control}
					selectedTeams={filteredSelectedTeams}
				/>
				<PlaceSelector
					name="placeId"
					label="Home Place *"
					control={form.control}
				/>
				<div className="flex justify-end gap-2">
					<Button variant="outline" type="button" onClick={onClose}>
						Cancel
					</Button>
					<Button variant="outline" type="submit">
						Save Changes
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default function RostersContent({
	renderSeasonCode,
	initialDivisionName,
	initialSubdivisionName,
}: {
	renderSeasonCode?: string;
	initialDivisionName?: string;
	initialSubdivisionName?: string;
}) {
	const hasAppliedInitialSelection = useRef(false);
	// State variables
	const [seasonCode, setSeasonCode] = useState<string | null>(renderSeasonCode || null);
	const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
	const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [divisionsData, setDivisionsData] = useState<RosterData>({});
	const [teamOpen, setTeamOpen] = useState<{ [key: string]: boolean }>({});
	const [open, setOpen] = useState(false);
	const [copyOpen, setCopyOpen] = useState(false);
	const [divisionToDelete, setDivisionToDelete] = useState<string | null>(null);
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
	const [teamToEdit, setTeamToEdit] = useState<{
		division: string;
		subdivision: string;
		teamLetter: string;
		teamId: string;
		placeId: string;
		teamName: string;
	} | null>(null);
	const [editTeamOpen, setEditTeamOpen] = useState(false);
	const [draggedTeamLetter, setDraggedTeamLetter] = useState<string | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [initialData, setInitialData] = useState<RosterData>({});
	const [update, setUpdate] = useState(false);
	const [deleteRosterAlertOpen, setDeleteRosterAlertOpen] = useState(false);
	const [selectedSubdivision, setSelectedSubdivision] = useState<{
		divisionName: string;
		subdivisionName: string;
	} | null>(null);
	const [currentSeason, setCurrentSeason] = useState(
		renderSeasonCode ? false : true
	);
	const [isRosterInitialized, setIsRosterInitialized] = useState(false);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
	const [generateScheduleAlertOpen, setGenerateScheduleAlertOpen] = useState(false);
	const [schedulePreview, setSchedulePreview] = useState<GenerationPreview[]>([]);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Setup QueryClient
	const queryClient = useQueryClient();
	
	// TanStack Query hooks
	const { 
		data: rosterData, 
		isLoading: rosterLoading, 
		isFetching: rosterFetching,
	} = useQuery({
		queryKey: ['roster', seasonCode],
		queryFn: () => fetchRoster(seasonCode),
		enabled: !!seasonCode,
	});

	// Fetch season data to get dates for schedule generation and season-started check
	const { data: seasonData } = useQuery({
		queryKey: ['season', seasonCode],
		queryFn: async () => {
			if (!seasonCode) return null;
			const res = await fetchWithSession(`${seasonRoute}?seasonCode=${encodeURIComponent(seasonCode)}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!res.ok) return null;
			return res.json() as Promise<{ dates: Record<string, string>; seasonCode: string; serverTime: string }>;
		},
		enabled: !!seasonCode,
	});

	// Handle rosterData changes and season transitions in a single effect to avoid
	// the two-effect ordering bug: when switching to a season with cached data, both
	// effects previously fired in the same render cycle with the seasonCode effect
	// always winning last and setting isRosterInitialized(false) permanently.
	useEffect(() => {
		if (!seasonCode) {
			setIsRosterInitialized(true);
			return;
		}

		if (rosterData === undefined) {
			// Data not yet available for this season — show spinner until it arrives.
			setIsRosterInitialized(false);
			return;
		}

		const data = rosterData;
		if (data) {
			const fetchedData = deepCloneOrEmptyObject<RosterData>(data.teamInformation);
			const divisions = Object.keys(fetchedData);
			const teamIds = extractTeamIds(fetchedData);

			setSelectedDivisions(divisions);
			setSelectedTeams(teamIds);
			setDivisionsData(fetchedData);
			setInitialData(fetchedData);
			setUpdate(true);
			setHasChanges(false);
			setDisabled(false);
			setIsRosterInitialized(true);
		} else {
			setInitialData({});
			setDivisionsData({});
			setSelectedTeams([]);
			setSelectedDivisions([]);
			setUpdate(false);
			setHasChanges(false);
			setDisabled(false);
			setIsRosterInitialized(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rosterData, seasonCode]);
	
	// Mutations
	const updateRosterMutation = useMutation({
		mutationFn: updateRoster,
		onSuccess: async (_, variables) => {
			// Use variables.data (the snapshot that was actually saved) rather than
			// the closure value of divisionsData which may have newer in-progress edits.
			setInitialData(JSON.parse(JSON.stringify(variables.data)));
			setHasChanges(false);
			setSaveStatus('saved');
			toast.success("Roster updated successfully");
			
			// Update the schedule if there's a successful roster update
			if (seasonCode) {
				try {
					const scheduleData = await fetchSchedule(seasonCode);
					if (scheduleData) {
						const potentialChanges = generateScheduleData(
							scheduleData.scheduleData,
							variables.data
						);
						
						await updateSchedule({
							seasonCode,
							data: potentialChanges
						});
					}
				} catch (error) {
					console.error("Failed to update schedule:", error);
				}
			}
			
			// Do NOT invalidate the query here — that would trigger a refetch which
			// overwrites divisionsData via the rosterData effect, losing any edits the
			// user made while the autosave was in-flight.
		},
		onError: (error) => {
			console.error("Failed to update roster:", error);
			setSaveStatus('error');
			toast.error("Failed to update roster");
		}
	});
	
	const saveRosterMutation = useMutation({
		mutationFn: saveRoster,
		onSuccess: () => {
			setInitialData(JSON.parse(JSON.stringify(divisionsData)));
			setUpdate(true);
			setHasChanges(false);
			toast.success("Roster saved successfully");
			
			// Invalidate queries to refresh data
			queryClient.invalidateQueries({ queryKey: ['roster', seasonCode] });
			window.location.reload();
		},
		onError: (error) => {
			console.error("Failed to save roster:", error);
			toast.error("Failed to save roster");
		}
	});
	
	const deleteRosterMutation = useMutation({
		mutationFn: (code: string) => deleteRoster(code),
		onSuccess: () => {
			setInitialData({});
			setDivisionsData({});
			setSelectedTeams([]);
			setSelectedDivisions([]);
			setUpdate(false);
			setHasChanges(false);
			toast.success("Roster deleted successfully");
			
			// Invalidate queries to refresh data
			queryClient.invalidateQueries({ queryKey: ['roster', seasonCode] });
		},
		onError: (error) => {
			console.error("Failed to delete roster:", error);
			toast.error("Failed to delete roster");
		}
	});

	// Generates a full round-robin schedule from the current roster and saves it,
	// overwriting any existing schedule for the season.
	const generateScheduleMutation = useMutation({
		mutationFn: async () => {
			if (!seasonCode || !seasonData?.dates) throw new Error('No season dates available');

			// Build sorted game date entries expected by the schedule generator
			const gameDateEntries: [string, string][] = Object.entries(seasonData.dates as Record<string, string>)
				.map(([key, date]) => {
					const num = parseInt(key.match(/\d+/)?.[0] ?? "1", 10);
					return { weekKey: `week${num}` as string, date, num };
				})
				.sort((a, b) => a.num - b.num)
				.map(({ weekKey, date }) => [weekKey, date] as [string, string]);

			const options: GeneratorOptions = {
				defaultMatchTime: "19:30",
				skipFilledWeeks: false,
				sequentialPairing: true,
			};

// RosterData is structurally identical to DivisionsData (teamId, placeId, teamName)
					const { data: generatedSchedule } = generateSchedule(
						{ type: "all" },
						divisionsData as unknown as DivisionsData,
				gameDateEntries,
				{},
				options
			);

			const response = await fetchWithSession(scheduleRoute, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					seasonCode,
					scheduleData: generatedSchedule,
				}),
			});

			if (!response.ok) throw new Error('Failed to save generated schedule');
		},
		onSuccess: () => {
			toast.success("Schedule generated and saved successfully");
			setGenerateScheduleAlertOpen(false);
		},
		onError: (error) => {
			console.error("Failed to generate schedule:", error);
			toast.error("Failed to generate schedule");
			setGenerateScheduleAlertOpen(false);
		},
	});
	
	// Use renderSeasonCode if provided
	useEffect(() => {
		if (renderSeasonCode && !seasonCode) {
			setSeasonCode(renderSeasonCode);
		}
	}, [renderSeasonCode, seasonCode]); 

	// Reset selected subdivision when season changes
	useEffect(() => {
		setSelectedSubdivision(null);
	}, [seasonCode]);

	// Clear selected subdivision if it gets deleted
	useEffect(() => {
		if (!selectedSubdivision) return;
		const exists =
			divisionsData[selectedSubdivision.divisionName]?.subdivisions[
				selectedSubdivision.subdivisionName
			];
		if (!exists) setSelectedSubdivision(null);
	}, [divisionsData, selectedSubdivision]);

	// Restore the subdivision that was open before navigating to a team detail
	useEffect(() => {
		if (
			!hasAppliedInitialSelection.current &&
			isRosterInitialized &&
			initialDivisionName &&
			initialSubdivisionName &&
			divisionsData[initialDivisionName]?.subdivisions[initialSubdivisionName]
		) {
			hasAppliedInitialSelection.current = true;
			setSelectedSubdivision({ divisionName: initialDivisionName, subdivisionName: initialSubdivisionName });
		}
	}, [isRosterInitialized, divisionsData, initialDivisionName, initialSubdivisionName]);

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

	// Autosave: only for existing rosters (update === true), 1.5s debounce after each change.
	// New rosters still require the manual "Save Roster" button (which triggers a page reload).
	useEffect(() => {
		if (!isRosterInitialized || !update || !hasChanges) return;
		setSaveStatus('pending');
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			if (!seasonCode) return;
			setSaveStatus('saving');
			updateRosterMutation.mutate({ seasonCode, data: divisionsData });
		}, 1500);
		return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [divisionsData]);

	// Handle season code selection
	const handleSeasonCodeSelect = useCallback(
		(value: string) => {
			if (value === seasonCode) return;
			setSeasonCode(value);
			// The data fetching will be handled by the useQuery hook
		},
		[seasonCode]
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
	const handleUpdateRoster = useCallback(() => {
		if (!seasonCode) return;
		updateRosterMutation.mutate({ 
			seasonCode, 
			data: divisionsData 
		});
	}, [divisionsData, seasonCode, updateRosterMutation]);

	// Handle saving the roster to the database
	const handleSaveRoster = useCallback(() => {
		if (!seasonCode) return;
		saveRosterMutation.mutate({ 
			seasonCode, 
			data: divisionsData 
		});
	}, [seasonCode, divisionsData, saveRosterMutation]);

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
			subdivision: string,
			teamLetter?: string,
		) => {
			// Prevent duplicates
			if (selectedTeams.includes(teamId)) {
				toast.error("This team has already been added to the roster");
				return;
			}

			setSelectedTeams((prev) => [...prev, teamId]);

			const assignedLetter = teamLetter ?? String.fromCharCode(
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
							[assignedLetter]: { teamId, placeId, teamName },
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
			const takenLetters = Object.keys(
				divisionsData[division]?.subdivisions[subdivision] || {}
			);
			const teamCount = takenLetters.length;
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
					<DialogContent className="bg-background max-w-full w-fit max-h-full h-fit overflow-auto">
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
							takenLetters={takenLetters}
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
						className="hover:bg-muted border-border text-foreground"
					>
						Add Division
					</Button>
				</DialogTrigger>
				<DialogContent className="bg-background max-w-full w-fit max-h-full h-fit overflow-auto">
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
						className="hover:bg-muted border-border text-foreground"
					>
						Copy Roster
					</Button>
				</DialogTrigger>
				<DialogContent className="bg-background max-w-full w-fit max-h-full h-fit overflow-auto">
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

	// Handle editing a team's teamId/placeId in place (same letter position)
	const handleEditTeamInRoster = useCallback(
		(newTeamId: string, newPlaceId: string, newTeamName: string) => {
			if (!teamToEdit) return;
			const { division, subdivision, teamLetter, teamId: oldTeamId } = teamToEdit;

			setDivisionsData((prev) => {
				const newData = JSON.parse(JSON.stringify(prev));
				newData[division].subdivisions[subdivision][teamLetter] = {
					teamId: newTeamId,
					placeId: newPlaceId,
					teamName: newTeamName,
				};
				return newData;
			});

			setSelectedTeams((prev) => [
				...prev.filter((id) => id !== oldTeamId),
				newTeamId,
			]);

			setTeamToEdit(null);
			setEditTeamOpen(false);
			setTimeout(() => setHasChanges(true), 0);
		},
		[teamToEdit]
	);

	// Swap two teams' letter positions via drag-and-drop
	const handleTeamLetterSwap = useCallback(
		(targetLetter: string) => {
			if (!draggedTeamLetter || !selectedSubdivision || draggedTeamLetter === targetLetter) {
				setDraggedTeamLetter(null);
				return;
			}
			const { divisionName, subdivisionName } = selectedSubdivision;
			setDivisionsData((prev) => {
				const newData = JSON.parse(JSON.stringify(prev));
				const sub = newData[divisionName].subdivisions[subdivisionName];
				const temp = sub[draggedTeamLetter];
				sub[draggedTeamLetter] = sub[targetLetter];
				sub[targetLetter] = temp;
				return newData;
			});
			setDraggedTeamLetter(null);
			setTimeout(() => setHasChanges(true), 0);
		},
		[draggedTeamLetter, selectedSubdivision]
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
	const handleDeleteRoster = useCallback(() => {
		if (!seasonCode) return;
		deleteRosterMutation.mutate(seasonCode);
	}, [seasonCode, deleteRosterMutation]);

	// Determine if we're in a loading state from any mutation
	const isDataLoading =
		seasonCode ? (rosterLoading || rosterFetching || !isRosterInitialized) : false;
	const isLoading =
		isDataLoading ||
		updateRosterMutation.isPending ||
		saveRosterMutation.isPending ||
		deleteRosterMutation.isPending ||
		generateScheduleMutation.isPending;

	// The generate-schedule button is blocked once the season's first game date has passed.
	// Uses the server-supplied timestamp so a skewed client clock cannot bypass the guard.
	const seasonHasStarted = useMemo(() => {
		if (!seasonData) return false;

		// `dates` may arrive as a parsed JS object or, in some environments, as a raw
		// JSON string. Handle both so the check is never silently skipped.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rawDates = (seasonData as any).dates;
		if (!rawDates) return false;

		let datesMap: Record<string, string>;
		if (typeof rawDates === 'string') {
			try { datesMap = JSON.parse(rawDates); } catch { return false; }
		} else {
			datesMap = rawDates as Record<string, string>;
		}

		// Dates are stored as "M/D/YYYY" strings; new Date() parses that format correctly.
		const timestamps = Object.values(datesMap)
			.filter(Boolean)
			.map(d => new Date(d).getTime())
			.filter(t => !isNaN(t));

		if (timestamps.length === 0) return false;

		const firstGameMs = new Date(Math.min(...timestamps)).setHours(0, 0, 0, 0);

		// Use the server-supplied time (prevents client-clock bypass). Zero out time
		// so we compare calendar days only.
		const nowMs = seasonData.serverTime
			? new Date(seasonData.serverTime).setHours(0, 0, 0, 0)
			: new Date().setHours(0, 0, 0, 0);

		return nowMs >= firstGameMs;
	}, [seasonData]);

	const divisionTreeItems = useMemo<DivisionTreeDivision[]>(() => {
		return Object.keys(divisionsData).map((divisionName) => ({
			name: divisionName,
			actions: (
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
					onClick={() => { confirmRemoveDivision(divisionName); setDivisionAlertOpen(true); }}
				>
					<X className="h-3 w-3" />
				</Button>
			),
			footer: (
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start text-muted-foreground hover:text-foreground"
					disabled={disabled}
					onClick={() => handleAddSubdivision(divisionName)}
				>
					+ Add Subdivision
				</Button>
			),
			subdivisions: Object.keys(
				divisionsData[divisionName]?.subdivisions || {}
			).map((subdivisionName) => ({
				name: subdivisionName,
				actions: (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
						onClick={() => { confirmRemoveSubdivision(divisionName, subdivisionName); setSubdivisionAlertOpen(true); }}
					>
						<X className="h-3 w-3" />
					</Button>
				),
			})),
		}));
	}, [divisionsData, disabled, confirmRemoveDivision, confirmRemoveSubdivision, handleAddSubdivision]);

	return (
		<SidenavPageLayout
			header={
				<div className="flex justify-between flex-wrap gap-4">
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
								<Checkbox checked={currentSeason} onCheckedChange={() => setCurrentSeason(!currentSeason)} />
							</div>
						</div>
					</FolderTabMed>
					<FolderTabMed title="Roster Actions">
						<div className="flex gap-4 flex-wrap items-center">
							{handleAddDivision()}
							{update && (
								<Button variant="outline" className="hover:bg-muted border-border text-foreground" onClick={() => setDeleteRosterAlertOpen(true)}>
									Delete Roster
								</Button>
							)}
							{handleCopyRoster()}
							<SaveStatusIndicator status={saveStatus} />
							{!update && (
								<Button variant="outline" disabled={!hasChanges || isLoading} onClick={handleSaveRoster}>
									Save Roster
								</Button>
							)}
							{update && (
								<>
									<Button variant="outline" className="hover:bg-muted border-border text-foreground" disabled={!hasChanges || isLoading} onClick={() => { if (debounceTimer.current) clearTimeout(debounceTimer.current); handleUpdateRoster(); }}>
										Save Now
									</Button>
									<Button variant="outline" className="hover:bg-muted border-border text-foreground" disabled={!hasChanges || isLoading} onClick={() => { setDivisionsData(JSON.parse(JSON.stringify(initialData))); setHasChanges(false); }}>
										Reset Changes
									</Button>
									<Button
										variant="outline"
										className="hover:bg-muted border-border text-foreground"
										disabled={isLoading || seasonHasStarted || !seasonData?.dates}
										title={
											isLoading ? "Loading…" :
											seasonHasStarted ? "Cannot generate a schedule after the season has started" :
											!seasonData?.dates ? "No game dates are configured for this season" :
											""
										}
										onClick={() => {
											console.log("[Roster] Generate Schedule clicked", { isLoading, seasonHasStarted, hasDates: !!seasonData?.dates });
											if (seasonData?.dates) {
												try {
													const entries: [string, string][] = Object.entries(
														seasonData.dates as Record<string, string>
													)
														.map(([key, date]) => {
															const num = parseInt(key.match(/\d+/)?.[0] ?? "1", 10);
															return { weekKey: `week${num}` as string, date, num };
														})
														.sort((a, b) => a.num - b.num)
														.map(({ weekKey, date }) => [weekKey, date] as [string, string]);
													const { preview: p } = generateSchedule(
														{ type: "all" },
														divisionsData as unknown as DivisionsData,
														entries,
														{},
														{ defaultMatchTime: "19:30", skipFilledWeeks: false, sequentialPairing: true }
													);
													setSchedulePreview(p);
												} catch (err) {
													console.error("[Roster] Failed to compute schedule preview:", err);
													setSchedulePreview([]);
												}
											}
											setGenerateScheduleAlertOpen(true);
										}}
									>
										Complete Roster &amp; Generate Schedule
									</Button>
								</>
							)}
						</div>
					</FolderTabMed>
				</div>
			}
			sidenav={
				<DivisionTreeSidenav
					divisions={divisionTreeItems}
					onSubdivisionSelect={(divisionName, subdivisionName) => setSelectedSubdivision({ divisionName, subdivisionName })}
					selectedSubdivision={selectedSubdivision}
					emptyMessage="Add a division to get started."
				/>
			}
		>
			{/* Controlled alert dialogs */}
			<AlertDialog open={deleteRosterAlertOpen} onOpenChange={setDeleteRosterAlertOpen}>
				<AlertDialogContent className="bg-background text-foreground">
					<AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this roster?</AlertDialogDescription></AlertDialogHeader>
					<AlertDialogFooter>
						<Button onClick={() => setDeleteRosterAlertOpen(false)}>Cancel</Button>
						<Button onClick={() => { handleDeleteRoster(); setDeleteRosterAlertOpen(false); }} variant="destructive">Delete</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={divisionAlertOpen} onOpenChange={setDivisionAlertOpen}>
				<AlertDialogContent className="bg-background text-foreground">
					<AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this division?</AlertDialogDescription></AlertDialogHeader>
					<AlertDialogFooter>
						<Button onClick={() => setDivisionAlertOpen(false)}>Cancel</Button>
						<Button onClick={() => { handleConfirmRemoveDivision(); setDivisionAlertOpen(false); }} variant="destructive">Delete</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={subdivisionAlertOpen} onOpenChange={setSubdivisionAlertOpen}>
				<AlertDialogContent className="bg-background text-foreground">
					<AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this subdivision?</AlertDialogDescription></AlertDialogHeader>
					<AlertDialogFooter>
						<Button onClick={() => setSubdivisionAlertOpen(false)}>Cancel</Button>
						<Button onClick={() => { handleConfirmRemoveSubdivision(); setSubdivisionAlertOpen(false); }} variant="destructive">Delete</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={teamAlertOpen} onOpenChange={setTeamAlertOpen}>
				<AlertDialogContent className="bg-background text-foreground">
					<AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this team?</AlertDialogDescription></AlertDialogHeader>
					<AlertDialogFooter>
						<Button onClick={() => setTeamAlertOpen(false)}>Cancel</Button>
						<Button onClick={() => { handleConfirmRemoveTeam(); setTeamAlertOpen(false); }} variant="destructive">Delete</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={generateScheduleAlertOpen} onOpenChange={setGenerateScheduleAlertOpen}>
				<AlertDialogContent className="bg-background text-foreground sm:max-w-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>Complete Roster &amp; Generate Schedule</AlertDialogTitle>
						<AlertDialogDescription>
							This will generate a complete round-robin schedule for every subdivision using the current roster. All match times will be set to 7:30 PM. Review the preview below before confirming.
						</AlertDialogDescription>
					</AlertDialogHeader>

					{/* Schedule preview table */}
					{schedulePreview.length > 0 && (
						<div className="space-y-2 my-2">
							<p className="text-sm font-medium">Preview</p>
							<div className="rounded-md border border-border overflow-hidden">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
											<th className="text-left px-3 py-2 font-medium">Division</th>
											<th className="text-left px-3 py-2 font-medium">Subdivision</th>
											<th className="text-center px-3 py-2 font-medium">Teams</th>
											<th className="text-center px-3 py-2 font-medium">Rounds / Cycle</th>
											<th className="text-center px-3 py-2 font-medium">Weeks</th>
											<th className="text-center px-3 py-2 font-medium">Status</th>
										</tr>
									</thead>
									<tbody>
										{schedulePreview.map((p, i) => (
											<tr key={i} className="border-t border-border hover:bg-muted/30">
												<td className="px-3 py-2">{p.division}</td>
												<td className="px-3 py-2">{p.subdivision}</td>
												<td className="px-3 py-2 text-center">{p.teamCount}</td>
												<td className="px-3 py-2 text-center">{p.roundsPerCycle}</td>
												<td className="px-3 py-2 text-center">{p.weeksAvailable}</td>
												<td className="px-3 py-2 text-center">
													{p.teamCount < 2 ? (
														<span className="text-xs text-muted-foreground" title="Need at least 2 teams">—</span>
													) : p.warning ? (
														<span title={p.warning} className="inline-flex">
															<TriangleAlert className="h-4 w-4 text-yellow-500 mx-auto" />
														</span>
													) : (
														<CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Per-subdivision warnings */}
							{schedulePreview.some((p) => !!p.warning) && (
								<div className="space-y-1">
									{schedulePreview.filter((p) => p.warning).map((p, i) => (
										<p key={i} className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-1">
											<TriangleAlert className="h-3 w-3 mt-0.5 shrink-0" />
											<span>
												<span className="font-medium">{p.division} › {p.subdivision}:</span>{" "}{p.warning}
											</span>
										</p>
									))}
								</div>
							)}

							<p className="text-xs text-muted-foreground">
								Approximately{" "}
								<span className="font-medium text-foreground">
									{schedulePreview.reduce((sum, p) => sum + p.weeksAvailable * Math.floor(p.teamCount / 2), 0)}
								</span>{" "}matchups will be created.
							</p>
						</div>
					)}

					{/* Overwrite warning */}
					<div className="flex gap-2 rounded-md border border-yellow-500 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
						<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
						<span>Any existing schedule for this season will be completely replaced. This action cannot be undone.</span>
					</div>

					<AlertDialogFooter>
						<Button onClick={() => setGenerateScheduleAlertOpen(false)} disabled={generateScheduleMutation.isPending}>Cancel</Button>
						<Button
							onClick={() => generateScheduleMutation.mutate()}
							variant="destructive"
							disabled={generateScheduleMutation.isPending}
						>
							{generateScheduleMutation.isPending ? "Generating..." : "Generate Schedule"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			{/* Edit Team Dialog */}
			<Dialog open={editTeamOpen} onOpenChange={(open) => { setEditTeamOpen(open); if (!open) setTeamToEdit(null); }}>
				<DialogContent className="bg-background max-w-full w-fit max-h-full h-fit overflow-auto">
					<DialogHeader>
						<DialogTitle>Edit Team</DialogTitle>
					</DialogHeader>
					{teamToEdit && (
						<RosterTeamEditForm
							teamToEdit={teamToEdit}
							selectedTeams={selectedTeams}
							onSave={handleEditTeamInRoster}
							onClose={() => { setEditTeamOpen(false); setTeamToEdit(null); }}
						/>
					)}
				</DialogContent>
			</Dialog>
			{!isDataLoading && selectedSubdivision ? (
				<div>
					<div className="mb-4">
						{handleAddTeam(selectedSubdivision.divisionName, selectedSubdivision.subdivisionName)}
					</div>
					<ul className="space-y-2">
						{Object.keys(
							divisionsData[selectedSubdivision.divisionName]
								?.subdivisions[selectedSubdivision.subdivisionName] || {}
						).map((team, teamIndex) => (
							<li key={teamIndex} className="flex items-center gap-3">
								{/* Static letter label */}
								<span className="font-semibold w-5 text-center shrink-0">{team}</span>
								{/* Draggable team card */}
								<div
									draggable
									onDragStart={() => setDraggedTeamLetter(team)}
									onDragOver={(e) => e.preventDefault()}
									onDrop={() => handleTeamLetterSwap(team)}
									onDragEnd={() => setDraggedTeamLetter(null)}
									className={`flex items-center gap-2 px-2 py-1 rounded border border-border bg-background cursor-grab active:cursor-grabbing transition-opacity ${
										draggedTeamLetter === team ? "opacity-40" : "opacity-100"
									}`}
								>
									<GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
									<Link
										href={`/Portal/Management/Teams/${divisionsData[selectedSubdivision.divisionName]?.subdivisions[selectedSubdivision.subdivisionName][team]?.teamId}?from=roster&divisionName=${encodeURIComponent(selectedSubdivision.divisionName)}&subdivisionName=${encodeURIComponent(selectedSubdivision.subdivisionName)}`}
										className="hover:underline cursor-pointer text-sm"
									>
										{divisionsData[selectedSubdivision.divisionName]?.subdivisions[selectedSubdivision.subdivisionName][team]?.teamName}
									</Link>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
										onClick={() => {
											const entry = divisionsData[selectedSubdivision.divisionName]?.subdivisions[selectedSubdivision.subdivisionName][team];
											setTeamToEdit({
												division: selectedSubdivision.divisionName,
												subdivision: selectedSubdivision.subdivisionName,
												teamLetter: team,
												teamId: entry?.teamId,
												placeId: entry?.placeId,
												teamName: entry?.teamName,
											});
											setEditTeamOpen(true);
										}}
									>
										<Pencil className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => {
											confirmRemoveTeam(
												selectedSubdivision.divisionName,
												selectedSubdivision.subdivisionName,
												team,
												divisionsData[selectedSubdivision.divisionName]?.subdivisions[selectedSubdivision.subdivisionName][team]?.teamId
											);
											setTeamAlertOpen(true);
										}}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</li>
						))}
					</ul>
				</div>
			) : isLoading ? (
				<Spinner />
			) : Object.keys(divisionsData).length === 0 ? (
				<p className="text-muted-foreground">No roster found for this season. Add a division to get started.</p>
			) : (
				<p className="text-muted-foreground">Select a subdivision from the left to manage its teams.</p>
			)}
		</SidenavPageLayout>
	);
}
