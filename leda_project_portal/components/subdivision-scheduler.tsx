import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, X, Lock } from "lucide-react";
import { fetchWithSession } from "@/lib/getData";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import SchedulingAddMatchupForm from "@/components/forms/activities/schedule-add-matchup-form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SchedulingEditMatchupForm from "@/components/forms/activities/schedule-edit-matchup-form";
import {
	TeamData,
	ScheduleData,
	MatchData,
	DeleteMatchupState,
	EditMatchupState,
} from "@/lib/schedule";
import { usePlaceNames } from "@/hooks/usePlaceNames";
import { Spinner } from "@/components/ui/skeleton";

interface SubdivisionSchedulerProps {
	division: string;
	subdivision: string;
	teams: Record<string, TeamData>;
	gameDates: Record<string, string>;
	matchData: ScheduleData;
	setEnabledSaveButton: (value: boolean) => void;
	handleSaveData: (updatedMatchData: ScheduleData) => void;
	viewMode?: boolean;
	seasonCode?: string | null;
}

// Utility function for time conversion - memoized
const convertTo12HourFormat = (time24: string): string => {
	if (!time24) return "";

	const [hours, minutes] = time24.split(":").map(Number);
	if (isNaN(hours) || isNaN(minutes)) return time24;

	const period = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;

	return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

interface MatchupDisplayProps {
	matchup: MatchData;
	teamData: TeamData;
	teams: Record<string, TeamData>;
	getPlaceNameById: (placeId: string) => string;
	onEdit: () => void;
	onDelete: () => void;
	viewMode?: boolean;
	hasPointsLogged?: boolean;
}

// Memoized matchup display component
const MatchupDisplay = memo<MatchupDisplayProps>(
	({ matchup, teamData, teams, getPlaceNameById, onEdit, onDelete, viewMode = false, hasPointsLogged = false }) => {
		const isByeWeek = matchup.opposingTeamId === "0" || matchup.opposingTeamLetter === "BYE" || matchup.opposingTeamLetter === "X";

		const getTeamNameById = useCallback(
			(teamId: string): string => {
				const team = Object.values(teams).find((team) => team.teamId === teamId);
				return team ? team.teamName : "Unknown Team";
			},
			[teams]
		);

		const locationPlaceId = useMemo(() => {
			if (isByeWeek) return "";
			return matchup.home
				? teamData.placeId
				: teams[matchup.opposingTeamLetter]?.placeId || "";
		}, [matchup.home, teamData.placeId, teams, matchup.opposingTeamLetter, isByeWeek]);

		const teamName = useMemo(() => {
			if (isByeWeek) return "BYE";
			return getTeamNameById(matchup.opposingTeamId);
		}, [getTeamNameById, matchup.opposingTeamId, isByeWeek]);

		const formattedTime = useMemo(() => {
			if (isByeWeek) return "";
			return convertTo12HourFormat(matchup.matchTime);
		}, [matchup.matchTime, isByeWeek]);

		const placeName = useMemo(() => {
			if (isByeWeek) return "";
			return getPlaceNameById(locationPlaceId);
		}, [getPlaceNameById, locationPlaceId, isByeWeek]);

		// Render BYE week display
		if (isByeWeek) {
			return (
				<div className="text-sm relative group">
					<div className={viewMode ? "" : "transition-all duration-200 group-hover:blur-sm"}>
						<div className="border border-border p-2 rounded-md text-center bg-muted/50">
							<div className="font-semibold text-muted-foreground">BYE WEEK</div>
						</div>
					</div>
					{!viewMode && (
						<div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-4">
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 rounded-full bg-background/90 hover:bg-background shadow-sm"
								title="Edit matchup"
								onClick={onEdit}
							>
								<Pencil className="h-4 w-4 text-blue-600" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 rounded-full bg-background/90 hover:bg-background shadow-sm"
								title="Remove matchup"
								onClick={onDelete}
							>
								<X className="h-4 w-4 text-red-600" />
							</Button>
						</div>
					)}
				</div>
			);
		}

		return (
			<div className="text-sm relative group">
				<div className={viewMode ? "" : "transition-all duration-200 group-hover:blur-sm"}>
					<div className={`border p-2 rounded-md text-center ${hasPointsLogged ? 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20' : 'border-border'}`}>
						{hasPointsLogged && (
							<div className="absolute top-1 right-1" title="Points logged - only match time can be edited">
								<Lock className="h-3 w-3 text-amber-600" />
							</div>
						)}
						<div>{matchup.home ? "Home" : "Away"}</div>
						<div>VS</div>
						<div>{teamName}</div>
						<div>{formattedTime}</div>
						<div>{"@ " + placeName}</div>
					</div>
				</div>
				{!viewMode && (
					<div className="absolute inset-0 hidden group-hover:flex flex-col items-center justify-center gap-1 p-1">
						{hasPointsLogged ? (
							<>
								<div className="text-xs text-amber-600 bg-background/95 px-2 py-1 rounded shadow-sm text-center break-words whitespace-normal leading-tight">
									Locked - only time changes allowed
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 rounded-full bg-background/90 hover:bg-background shadow-sm flex-shrink-0"
									title="Edit match time"
									onClick={onEdit}
								>
									<Pencil className="h-4 w-4 text-blue-600" />
								</Button>
							</>
						) : (
							<>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 rounded-full bg-background/90 hover:bg-background shadow-sm"
									title="Edit matchup"
									onClick={onEdit}
								>
									<Pencil className="h-4 w-4 text-blue-600" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 rounded-full bg-background/90 hover:bg-background shadow-sm"
									title="Remove matchup"
									onClick={onDelete}
								>
									<X className="h-4 w-4 text-red-600" />
								</Button>
							</>
						)}
					</div>
				)}
			</div>
		);
	}
);

MatchupDisplay.displayName = "MatchupDisplay";

export const SubdivisionScheduler = memo<SubdivisionSchedulerProps>(
	({
		division,
		subdivision,
		teams,
		gameDates,
		matchData,
		setEnabledSaveButton,
		handleSaveData,
		viewMode = false,
		seasonCode,
	}) => {
		const [localMatchData, setLocalMatchData] = useState<ScheduleData>(matchData);
		const [initialMatchData, setInitialMatchData] = useState<ScheduleData>(matchData);
		const [isLoadingMatchups, setIsLoadingMatchups] = useState(true);
		const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
		const [deletingMatchup, setDeletingMatchup] = useState<DeleteMatchupState | null>(
			null
		);
		const [editDialogOpen, setEditDialogOpen] = useState(false);
		const [editingMatchup, setEditingMatchup] = useState<EditMatchupState | null>(null);
		const [hasPointsLogged, setHasPointsLogged] = useState(false);
		const [isCheckingPoints, setIsCheckingPoints] = useState(false);
		// Map of "teamId-weekNum" -> boolean indicating if points are logged
		const [pointsStatusMap, setPointsStatusMap] = useState<Record<string, boolean>>({});
		const [isLoadingPointsStatus, setIsLoadingPointsStatus] = useState(false);

		const { getPlaceNameById } = usePlaceNames(teams);

		// Memoized values
		const teamEntries = useMemo(() => Object.entries(teams), [teams]);
		const gameDateEntries = useMemo(() => {
			// Convert gameDates to match "weekN" format used in matchesData
			const entries = Object.entries(gameDates).map(([key, date]) => {
				// Extract number from keys like "Date 1", "Date1", "Game 1", etc.
				const match = key.match(/\d+/);
				const weekNum = match ? match[0] : '1';
				const weekKey = `week${weekNum}`;
				return [weekKey, date] as [string, string];
			});
			console.log('Game date entries mapped:', entries);
			return entries;
		}, [gameDates]);

		// Fetch matchup data for this subdivision when component mounts
		useEffect(() => {
			if (!seasonCode) {
				setIsLoadingMatchups(false);
				return;
			}

			let cancelled = false;

			const fetchSubdivisionMatchups = async () => {
				setIsLoadingMatchups(true);
				try {
					const res = await fetch(
						`/api/activities/schedule/subdivision?seasonCode=${encodeURIComponent(seasonCode)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}`,
						{
							method: 'GET',
							headers: { 'Content-Type': 'application/json' },
						}
					);

					if (res.ok && !cancelled) {
						const data = await res.json();
						console.log('Fetched subdivision data:', data);
						if (data.scheduleData) {
							console.log('Setting matchData:', data.scheduleData);
							setLocalMatchData(data.scheduleData);
							setInitialMatchData(data.scheduleData);
						} else {
							console.warn('No scheduleData in response');
						}
					} else if (!cancelled) {
						console.error('Failed to fetch subdivision matchups:', res.status, await res.text());
					}
				} catch (error) {
					console.error('Error fetching subdivision matchups:', error);
				} finally {
					if (!cancelled) {
						setIsLoadingMatchups(false);
					}
				}
			};

			fetchSubdivisionMatchups();

			return () => {
				cancelled = true;
			};
		}, [seasonCode, division, subdivision]);

		// Batch fetch points status for all teams and all weeks in a single call
		useEffect(() => {
			if (!seasonCode || viewMode) return;

			let cancelled = false;

			const fetchBatchPointsStatus = async () => {
				const teamIds = Object.values(teams).map(t => t.teamId);
				if (teamIds.length === 0) return;

				// Extract all week numbers from game titles
				const weekNums = gameDateEntries.map(([gameTitle]) => {
					const weekMatch = gameTitle.match(/\d+/);
					return weekMatch ? weekMatch[0] : "1";
				});

				if (weekNums.length === 0) return;

				setIsLoadingPointsStatus(true);

				try {
					const res = await fetchWithSession('/api/activities/scoresheets/teamPoints/batch', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							seasonCode,
							weekNums,
							division,
							subdivision,
							teamIds,
						}),
					});

					if (res.ok && !cancelled) {
						const statusData = await res.json() as Record<string, boolean>;
						setPointsStatusMap(statusData);
					}
				} catch {
					// Ignore errors, default to no points
				} finally {
					if (!cancelled) {
						setIsLoadingPointsStatus(false);
					}
				}
			};

			fetchBatchPointsStatus();

			return () => {
				cancelled = true;
			};
		}, [seasonCode, division, subdivision, teams, gameDateEntries, viewMode]);

		// Monitor for changes in match data
		useEffect(() => {
			if (!viewMode) {
				const hasChanged =
					JSON.stringify(localMatchData) !== JSON.stringify(initialMatchData);
				setEnabledSaveButton(hasChanged);
			}
		}, [localMatchData, initialMatchData, setEnabledSaveButton, viewMode]);

		// Check for points when edit dialog opens - use cached status map
		useEffect(() => {
			if (!editDialogOpen || !editingMatchup) {
				return;
			}

			setIsCheckingPoints(true);
			
			const weekMatch = editingMatchup.gameTitle.match(/\d+/);
			const weekNum = weekMatch ? weekMatch[0] : "1";
			const teamId = teams[editingMatchup.teamLetter]?.teamId;
			
			if (teamId) {
				const statusKey = `${teamId}-${weekNum}`;
				const cachedStatus = pointsStatusMap[statusKey];
				
				if (cachedStatus !== undefined) {
					// Use cached status
					setHasPointsLogged(cachedStatus);
					setIsCheckingPoints(false);
				} else {
					// Fallback: fetch individually if not in cache
					let cancelled = false;
					
					const checkPoints = async () => {
						if (!seasonCode) {
							setIsCheckingPoints(false);
							return;
						}

						try {
							const res = await fetch(
								`/api/activities/scoresheets/teamPoints?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}&teamLedaId=${encodeURIComponent(teamId)}`
							);
							if (!cancelled) {
								setHasPointsLogged(res.status === 200);
							}
						} catch {
							if (!cancelled) {
								setHasPointsLogged(false);
							}
						} finally {
							if (!cancelled) {
								setIsCheckingPoints(false);
							}
						}
					};

					checkPoints();
					
					return () => {
						cancelled = true;
					};
				}
			} else {
				setHasPointsLogged(false);
				setIsCheckingPoints(false);
			}
		}, [editDialogOpen, editingMatchup, seasonCode, division, subdivision, teams, pointsStatusMap]);

		// Memoized helper functions
		const getTeamMatchup = useCallback(
			(teamLetter: string, gameTitle: string): MatchData | null => {
				return (
					localMatchData[division]?.[subdivision]?.[teamLetter]?.matchesData?.[
						gameTitle
					] || null
				);
			},
			[localMatchData, division, subdivision]
		);

		const getTeamsWithMatchups = useCallback(
			(gameTitle: string): string[] => {
				const teamsWithMatchups: string[] = [];

				if (localMatchData[division]?.[subdivision]) {
					for (const teamLetter in localMatchData[division][subdivision]) {
						const team = localMatchData[division][subdivision][teamLetter];
						if (team?.matchesData?.[gameTitle]) {
							teamsWithMatchups.push(team.teamId);
						}
					}
				}

				return teamsWithMatchups;
			},
			[localMatchData, division, subdivision]
		);

		const handleAddMatchup = useCallback(
			(
				selectedTeamLetter: string,
				teamId: string,
				gameTitle: string,
				date: string,
				matchTime?: string,
				home?: boolean,
				opposingTeamId?: string,
				opposingTeamLetter?: string,
				isByeWeek?: boolean
			) => {
				if (!opposingTeamId || !opposingTeamLetter) {
					console.error("Missing opposing team information");
					return;
				}

				const updatedMatchData = structuredClone(localMatchData);

				if (updatedMatchData[division]?.[subdivision]) {
					const selectedTeam = updatedMatchData[division][subdivision][selectedTeamLetter];

					if (!selectedTeam) {
						console.error("Selected team not found in the subdivision");
						return;
					}

					// Initialize matchesData if needed
					if (!selectedTeam.matchesData) selectedTeam.matchesData = {};

					const subdivisionId = `${division}-${subdivision}`;

					if (isByeWeek) {
						// BYE week: only update the selected team with BYE matchup
						selectedTeam.matchesData[gameTitle] = {
							matchDate: date,
							matchTime: "",
							home: !!home,
							opposingTeamId: "0",
							opposingTeamLetter: "X",
							subdivisionId,
						};
					} else {
						// Regular matchup: update both teams
						const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];

						if (!opposingTeam) {
							console.error("Opposing team not found in the same subdivision");
							return;
						}

						if (!opposingTeam.matchesData) opposingTeam.matchesData = {};

						selectedTeam.matchesData[gameTitle] = {
							matchDate: date,
							matchTime: matchTime || "",
							home: !!home,
							opposingTeamId,
							opposingTeamLetter,
							subdivisionId,
						};

						opposingTeam.matchesData[gameTitle] = {
							matchDate: date,
							matchTime: matchTime || "",
							home: !home,
							opposingTeamId: teamId,
							opposingTeamLetter: selectedTeamLetter,
							subdivisionId,
						};
					}

					setLocalMatchData(updatedMatchData);
					handleSaveData(updatedMatchData);
					setEnabledSaveButton(true);
				}
			},
			[localMatchData, division, subdivision, handleSaveData, setEnabledSaveButton]
		);

		const handleDeleteMatchup = useCallback(
			(teamLetter: string, gameTitle: string) => {
				setDeletingMatchup({ teamLetter, gameTitle });
				setDeleteDialogOpen(true);
			},
			[]
		);

		const confirmDeleteMatchup = useCallback(() => {
			if (!deletingMatchup) return;

			const { teamLetter, gameTitle } = deletingMatchup;
			const updatedMatchData = structuredClone(localMatchData);
			const team = updatedMatchData[division]?.[subdivision]?.[teamLetter];

			if (team?.matchesData?.[gameTitle]) {
				const opposingTeamLetter = team.matchesData[gameTitle].opposingTeamLetter;

				delete team.matchesData[gameTitle];

				const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];
				if (opposingTeam?.matchesData?.[gameTitle]) {
					delete opposingTeam.matchesData[gameTitle];
				}

				setLocalMatchData(updatedMatchData);
				handleSaveData(updatedMatchData);
				setEnabledSaveButton(true);
			}

			setDeleteDialogOpen(false);
			setDeletingMatchup(null);
		}, [
			deletingMatchup,
			localMatchData,
			division,
			subdivision,
			handleSaveData,
			setEnabledSaveButton,
		]);

		const handleEditMatchupClick = useCallback(
			(teamLetter: string, gameTitle: string, matchup: MatchData) => {
				setEditingMatchup({
					teamLetter,
					gameTitle,
					matchData: { ...matchup },
				});
				setEditDialogOpen(true);
			},
			[]
		);

		const handleEditMatchup = useCallback(
			(
				selectedTeamLetter: string,
				teamId: string,
				gameTitle: string,
				date: string,
				matchTime: string,
				home: boolean,
				opposingTeamId: string,
				opposingTeamLetter: string,
				isByeWeek?: boolean
			) => {
				const updatedMatchData = structuredClone(localMatchData);

				// Find and remove previous opposing team matchup if changed
				let previousOpposingTeamLetter: string | null = null;

				if (
					updatedMatchData[division]?.[subdivision]?.[selectedTeamLetter]
						?.matchesData?.[gameTitle]
				) {
					previousOpposingTeamLetter =
						updatedMatchData[division][subdivision][selectedTeamLetter]
							.matchesData[gameTitle].opposingTeamLetter;
				}

				// Clean up previous opposing team matchup if it changed or we're switching to BYE
				if (
					previousOpposingTeamLetter &&
					(previousOpposingTeamLetter !== opposingTeamLetter || isByeWeek) &&
					previousOpposingTeamLetter !== "BYE" &&
					previousOpposingTeamLetter !== "X"
				) {
					const previousOpposingTeam = updatedMatchData[division][subdivision][
						previousOpposingTeamLetter
					];
					if (previousOpposingTeam?.matchesData?.[gameTitle]) {
						delete previousOpposingTeam.matchesData[gameTitle];
					}
				}

				const selectedTeam = updatedMatchData[division][subdivision][selectedTeamLetter];

				if (!selectedTeam) {
					console.error("Selected team not found in the subdivision");
					return;
				}

				if (!selectedTeam.matchesData) selectedTeam.matchesData = {};

				const subdivisionId = `${division}-${subdivision}`;

				if (isByeWeek) {
					// BYE week: only update the selected team with BYE matchup
					// Preserve existing opposingTeamLetter if already a BYE week, otherwise use "X"
					const existingMatchup = selectedTeam.matchesData?.[gameTitle];
					const existingIsBye = existingMatchup?.opposingTeamId === "0";
					const byeTeamLetter = existingIsBye ? existingMatchup.opposingTeamLetter : "X";
					
					selectedTeam.matchesData[gameTitle] = {
						matchDate: date,
						matchTime: "",
						home,
						opposingTeamId: "0",
						opposingTeamLetter: byeTeamLetter,
						subdivisionId,
					};
				} else {
					// Regular matchup: update both teams
					const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];

					if (!opposingTeam) {
						console.error("Opposing team not found in the same subdivision");
						return;
					}

					if (!opposingTeam.matchesData) opposingTeam.matchesData = {};

					selectedTeam.matchesData[gameTitle] = {
						matchDate: date,
						matchTime,
						home,
						opposingTeamId,
						opposingTeamLetter,
						subdivisionId,
					};

					opposingTeam.matchesData[gameTitle] = {
						matchDate: date,
						matchTime,
						home: !home,
						opposingTeamId: teamId,
						opposingTeamLetter: selectedTeamLetter,
						subdivisionId,
					};
				}

				setLocalMatchData(updatedMatchData);
				handleSaveData(updatedMatchData);
				setEnabledSaveButton(true);
			},
			[localMatchData, division, subdivision, handleSaveData, setEnabledSaveButton]
		);

		return (
			<div className="w-full">
				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogContent className="bg-background">
						<AlertDialogHeader>
							<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete this matchup? This
								action will remove the scheduled match for both
								teams involved.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setDeletingMatchup(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDeleteMatchup}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
					<DialogContent className="bg-background">
						<DialogHeader>
							<DialogTitle>Edit Matchup</DialogTitle>
						</DialogHeader>
						{editingMatchup && (
							<SchedulingEditMatchupForm
								teamEntries={teamEntries}
								handleEditMatchup={handleEditMatchup}
								setOpen={setEditDialogOpen}
								teamId={teams[editingMatchup.teamLetter].teamId}
								gameTitle={editingMatchup.gameTitle}
								date={
									gameDateEntries.find(
										([title]) => title === editingMatchup.gameTitle
									)?.[1] || ""
								}
								selectedTeamLetter={editingMatchup.teamLetter}
								initialValues={editingMatchup.matchData}
								hasPointsLogged={hasPointsLogged}
								isCheckingPoints={isCheckingPoints}
								teamsWithMatchups={getTeamsWithMatchups(editingMatchup.gameTitle).filter(
									(id) => id !== editingMatchup.matchData.opposingTeamId
								)}
							/>
						)}
					</DialogContent>
				</Dialog>

				<div className="overflow-auto relative">
					{(isLoadingPointsStatus || isLoadingMatchups) && (
						<div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
							<Spinner />
						</div>
					)}
					<Table className="table-auto">
						<TableHeader>
							<TableRow className="bg-muted/50">
								<TableHead className="font-semibold border-r border-border text-left py-4 px-6">
									Team Name
								</TableHead>
								{gameDateEntries.map(([gameTitle, date], index) => (
									<TableHead
										key={gameTitle}
										className={`whitespace-nowrap text-center py-4 px-6 ${
											index < gameDateEntries.length - 1
												? "border-r border-border"
												: ""
										}`}
									>
										<div className="font-medium text-sm">
											{gameTitle.replace(/(\d+)/, " $1")}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{date}
										</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{teamEntries
								.filter(([, teamData]) => teamData.teamId !== "0")
								.map(([key, teamData], rowIndex) => (
								<TableRow
									key={key}
									className={
										rowIndex % 2 === 0
											? "bg-background"
											: "bg-muted/20"
									}
								>
									<TableCell className="font-medium w-fit border-r border-border text-center">
										<div>{key}</div>
										<div>{teamData.teamName}</div>
									</TableCell>
									{gameDateEntries.map(([gameTitle], index) => {
										const matchup = getTeamMatchup(key, gameTitle);
										const weekMatch = gameTitle.match(/\d+/);
										const weekNum = weekMatch ? weekMatch[0] : "1";
										const statusKey = `${teamData.teamId}-${weekNum}`;
										const matchupHasPoints = pointsStatusMap[statusKey] ?? false;
										return (
											<TableCell
												key={`${key}-${gameTitle}`}
												className={`whitespace-nowrap py-4 px-6 ${
													index < gameDateEntries.length - 1
														? "border-r border-border"
														: ""
												}`}
											>
												<div className="flex items-center justify-center">
													{matchup ? (
														<MatchupDisplay
															matchup={matchup}
															teamData={teamData}
															teams={teams}
															getPlaceNameById={getPlaceNameById}
															onEdit={() =>
																handleEditMatchupClick(key, gameTitle, matchup)
															}
															onDelete={() => handleDeleteMatchup(key, gameTitle)}
															viewMode={viewMode}
															hasPointsLogged={matchupHasPoints}
														/>
													) : viewMode ? (
														<div className="text-sm text-muted-foreground py-2">
															BYE
														</div>
													) : (
														<Dialog>
															<DialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	className="border border-dashed border-border rounded-md h-9 w-9 p-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
																	title={`Add matchup for ${teamData.teamName}`}
																>
																	<Plus className="h-4 w-4" />
																</Button>
															</DialogTrigger>
															<DialogContent className="bg-background">
																<DialogHeader>
																	<DialogTitle>Add Matchup</DialogTitle>
																</DialogHeader>
																<SchedulingAddMatchupForm
																	teamEntries={teamEntries}
																	handleAddMatchup={handleAddMatchup}
																	setOpen={() => {}}
																	teamId={teamData.teamId}
																	selectedTeam={teamData.teamId}
																	gameTitle={gameTitle}
																	date={
																		gameDateEntries.find(
																			([title]) => title === gameTitle
																		)?.[1] || ""
																	}
																	selectedTeamLetter={key}
																	teamsWithMatchups={getTeamsWithMatchups(gameTitle)}
																/>
															</DialogContent>
														</Dialog>
													)}
												</div>
											</TableCell>
										);
									})}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}
);

SubdivisionScheduler.displayName = "SubdivisionScheduler";
