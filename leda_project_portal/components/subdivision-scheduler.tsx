import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, X } from "lucide-react";
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

interface SubdivisionSchedulerProps {
	division: string;
	subdivision: string;
	teams: Record<string, TeamData>;
	gameDates: Record<string, string>;
	matchData: ScheduleData;
	setEnabledSaveButton: (value: boolean) => void;
	handleSaveData: (updatedMatchData: ScheduleData) => void;
	viewMode?: boolean;
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
}

// Memoized matchup display component
const MatchupDisplay = memo<MatchupDisplayProps>(
	({ matchup, teamData, teams, getPlaceNameById, onEdit, onDelete, viewMode = false }) => {
		const getTeamNameById = useCallback(
			(teamId: string): string => {
				const team = Object.values(teams).find((team) => team.teamId === teamId);
				return team ? team.teamName : "Unknown Team";
			},
			[teams]
		);

		const locationPlaceId = useMemo(() => {
			return matchup.home
				? teamData.placeId
				: teams[matchup.opposingTeamLetter]?.placeId || "";
		}, [matchup.home, teamData.placeId, teams, matchup.opposingTeamLetter]);

		const teamName = useMemo(() => {
			return getTeamNameById(matchup.opposingTeamId);
		}, [getTeamNameById, matchup.opposingTeamId]);

		const formattedTime = useMemo(() => {
			return convertTo12HourFormat(matchup.matchTime);
		}, [matchup.matchTime]);

		const placeName = useMemo(() => {
			return getPlaceNameById(locationPlaceId);
		}, [getPlaceNameById, locationPlaceId]);

		return (
			<div className="text-sm relative group">
				<div className={viewMode ? "" : "transition-all duration-200 group-hover:blur-sm"}>
					<div className="border border-border p-2 rounded-md text-center">
						<div>{matchup.home ? "Home" : "Away"}</div>
						<div>VS</div>
						<div>{teamName}</div>
						<div>{formattedTime}</div>
						<div>{"@ " + placeName}</div>
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
	}) => {
		const [localMatchData, setLocalMatchData] = useState<ScheduleData>(matchData);
		const [initialMatchData] = useState<ScheduleData>(matchData);
		const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
		const [deletingMatchup, setDeletingMatchup] = useState<DeleteMatchupState | null>(
			null
		);
		const [editDialogOpen, setEditDialogOpen] = useState(false);
		const [editingMatchup, setEditingMatchup] = useState<EditMatchupState | null>(null);

		const { getPlaceNameById } = usePlaceNames(teams);

		// Memoized values
		const teamEntries = useMemo(() => Object.entries(teams), [teams]);
		const gameDateEntries = useMemo(() => Object.entries(gameDates), [gameDates]);

		// Monitor for changes in match data
		useEffect(() => {
			if (!viewMode) {
				const hasChanged =
					JSON.stringify(localMatchData) !== JSON.stringify(initialMatchData);
				setEnabledSaveButton(hasChanged);
			}
		}, [localMatchData, initialMatchData, setEnabledSaveButton, viewMode]);

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
				opposingTeamLetter?: string
			) => {
				if (!opposingTeamId || !opposingTeamLetter) {
					console.error("Missing opposing team information");
					return;
				}

				const updatedMatchData = structuredClone(localMatchData);

				if (updatedMatchData[division]?.[subdivision]) {
					const selectedTeam = updatedMatchData[division][subdivision][selectedTeamLetter];
					const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];

					if (!selectedTeam || !opposingTeam) {
						console.error("Teams not found in the same subdivision");
						return;
					}

					// Initialize matchesData if needed
					if (!selectedTeam.matchesData) selectedTeam.matchesData = {};
					if (!opposingTeam.matchesData) opposingTeam.matchesData = {};

					const subdivisionId = `${division}-${subdivision}`;

					// Update both teams' match data
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
				opposingTeamLetter: string
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

				if (
					previousOpposingTeamLetter &&
					previousOpposingTeamLetter !== opposingTeamLetter
				) {
					const previousOpposingTeam = updatedMatchData[division][subdivision][
						previousOpposingTeamLetter
					];
					if (previousOpposingTeam?.matchesData?.[gameTitle]) {
						delete previousOpposingTeam.matchesData[gameTitle];
					}
				}

				// Update both teams' match data
				const selectedTeam = updatedMatchData[division][subdivision][selectedTeamLetter];
				const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];

				if (!selectedTeam || !opposingTeam) {
					console.error("Teams not found in the same subdivision");
					return;
				}

				if (!selectedTeam.matchesData) selectedTeam.matchesData = {};
				if (!opposingTeam.matchesData) opposingTeam.matchesData = {};

				const subdivisionId = `${division}-${subdivision}`;

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
							/>
						)}
					</DialogContent>
				</Dialog>

				<div className="overflow-auto">
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
							{teamEntries.map(([key, teamData], rowIndex) => (
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
