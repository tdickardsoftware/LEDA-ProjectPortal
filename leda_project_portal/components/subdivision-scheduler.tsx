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
import { useState, useEffect } from "react";
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
import { placeRoute } from "@/lib/apiRoutes";

interface SubdivisionSchedulerProps {
	teams: Record<
		string,
		{ teamId: string; placeId: string; teamName: string }
	>;
	gameDates: Record<string, string>;
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
						}
					>;
				}
			>
		>
	>;
	setEnabledSaveButton: (value: boolean) => void;
	handleSaveData: (updatedMatchData: Record<
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
	>) => void;
}

export function SubdivisionScheduler({
	teams,
	gameDates,
	matchData,
	setEnabledSaveButton,
	handleSaveData,
}: SubdivisionSchedulerProps) {

	const [MatchData, setMatchData] = useState(matchData);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [initialMatchData, setInitialMatchData] = useState(matchData);
	
	// Monitor for changes in match data
	useEffect(() => {
		const hasChanged = JSON.stringify(MatchData) !== JSON.stringify(initialMatchData);
		setEnabledSaveButton(hasChanged);
	}, [MatchData, initialMatchData, setEnabledSaveButton]);
	
	// Convert teams object to array for mapping
	const teamEntries = Object.entries(teams);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [open, setOpen] = useState(false);

	// Convert gameDates object to array for mapping
	const gameDateEntries = Object.entries(gameDates);
	
	// Convert 24hr time format to 12hr time format
	const convertTo12HourFormat = (time24: string) => {
		if (!time24) return "";
		
		const [hours, minutes] = time24.split(':').map(Number);
		if (isNaN(hours) || isNaN(minutes)) return time24;
		
		const period = hours >= 12 ? 'PM' : 'AM';
		const hours12 = hours % 12 || 12; // Convert 0 to 12
		
		return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`; 
	};
	
	// Find matchup data for a team on a specific game date
	const getTeamMatchup = (teamLetter: string, gameTitle: string) => {
		for (const division in MatchData) {
			for (const subdivision in MatchData[division]) {
				const team = MatchData[division][subdivision][teamLetter];
				if (team && team.matchesData && team.matchesData[gameTitle]) {
					return team.matchesData[gameTitle];
				}
			}
		}
		return null;
	};
	
	// Get team name by team ID
	const getTeamNameById = (teamId: string) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const [letter, team] of teamEntries) {
			if (team.teamId === teamId) {
				return team.teamName;
			}
		}
		return "Unknown Team";
	};
	

	const handleAddMatchup = (
		selectedTeamLetter: string, teamId: string, gameTitle: string, date: string, matchTime?: string, home?: boolean, opposingTeamId?: string, opposingTeamLetter?: string
	) => {
		if (!opposingTeamId || !opposingTeamLetter) {
			console.error("Missing opposing team information");
			return;
		}
	
		// Clone the current state instead of the original prop
		const updatedMatchData = JSON.parse(JSON.stringify(MatchData));
		
		// Find both teams in the matchData structure
		for (const division in updatedMatchData) {
			for (const subdivision in updatedMatchData[division]) {
				const selectedTeam = updatedMatchData[division][subdivision][selectedTeamLetter];
				const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];
				
				// Skip if either team is not found in this subdivision
				if (!selectedTeam || !opposingTeam) continue;
				
				// Initialize matchesData if it doesn't exist
				if (!selectedTeam.matchesData) selectedTeam.matchesData = {};
				if (!opposingTeam.matchesData) opposingTeam.matchesData = {};
				
				// Update the selected team's matchup for this specific game title
				// while preserving other game matchups
				selectedTeam.matchesData = {
					...selectedTeam.matchesData,
					[gameTitle]: {
						matchDate: date,
						matchTime: matchTime || "",
						home: !!home,
						opposingTeamId: opposingTeamId,
						opposingTeamLetter: opposingTeamLetter
					}
				};
				
				// Update the opposing team's matchup for this specific game title
				// while preserving other game matchups
				opposingTeam.matchesData = {
					...opposingTeam.matchesData,
					[gameTitle]: {
						matchDate: date,
						matchTime: matchTime || "",
						home: !home,
						opposingTeamId: teamId,
						opposingTeamLetter: selectedTeamLetter
					}
				};
				
				// Update the state with the new data that includes all previous matchups
				setMatchData(updatedMatchData);
				handleSaveData(updatedMatchData);
				setEnabledSaveButton(true); // Enable save button when data changes
				
				console.log("Updated match data:", updatedMatchData);
				return;
			}
		}
		
		console.log("Teams not found in the same subdivision");
		console.log(selectedTeamLetter, teamId, gameTitle, date, matchTime, home, opposingTeamId, opposingTeamLetter);
		console.log(matchData);
	};

	// Add state for delete confirmation dialog
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingMatchup, setDeletingMatchup] = useState<{ teamLetter: string, gameTitle: string } | null>(null);
	
	// Find and delete matchup for both teams involved
	const handleDeleteMatchup = (teamLetter: string, gameTitle: string) => {
		// Open confirmation dialog and set the matchup to be deleted
		setDeletingMatchup({ teamLetter, gameTitle });
		setDeleteDialogOpen(true);
	};
	
	// Perform actual deletion after confirmation
	const confirmDeleteMatchup = () => {
		if (!deletingMatchup) return;
		
		const { teamLetter, gameTitle } = deletingMatchup;
		
		// Clone current state to avoid direct mutation
		const updatedMatchData = JSON.parse(JSON.stringify(MatchData));
		
		// Find the team and its matchup
		for (const division in updatedMatchData) {
			for (const subdivision in updatedMatchData[division]) {
				const team = updatedMatchData[division][subdivision][teamLetter];
				
				if (team && team.matchesData && team.matchesData[gameTitle]) {
					// Get the opposing team's information before deletion
					const opposingTeamLetter = team.matchesData[gameTitle].opposingTeamLetter;
					
					// Delete matchup from current team
					delete team.matchesData[gameTitle];
					
					// Also delete the matchup from the opposing team
					const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];
					if (opposingTeam && opposingTeam.matchesData && opposingTeam.matchesData[gameTitle]) {
						delete opposingTeam.matchesData[gameTitle];
					}
					
					// Update state and save
					setMatchData(updatedMatchData);
					handleSaveData(updatedMatchData);
					setEnabledSaveButton(true);
					
					console.log("Deleted matchup for", teamLetter, "and", opposingTeamLetter, "on", gameTitle);
					break;
				}
			}
		}
		
		// Reset deletion state
		setDeleteDialogOpen(false);
		setDeletingMatchup(null);
	};

	// Add state for edit dialog
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingMatchup, setEditingMatchup] = useState<{ 
		teamLetter: string, 
		gameTitle: string, 
		matchData: {
			matchDate: string;
			matchTime: string;
			home: boolean;
			opposingTeamId: string;
			opposingTeamLetter: string;
		} 
	} | null>(null);
	
	// Handle opening the edit dialog
	const handleEditMatchupClick = (teamLetter: string, gameTitle: string, matchup: {
		matchDate: string;
		matchTime: string;
		home: boolean;
		opposingTeamId: string;
		opposingTeamLetter: string;
	}) => {
		setEditingMatchup({
			teamLetter,
			gameTitle,
			matchData: { ...matchup }
		});
		setEditDialogOpen(true);
	};
	
	// Handle the actual editing of the matchup
	const handleEditMatchup = (
		selectedTeamLetter: string, 
		teamId: string, 
		gameTitle: string, 
		date: string, 
		matchTime: string, 
		home: boolean, 
		opposingTeamId: string, 
		opposingTeamLetter: string
	) => {
		// Clone the current state to avoid direct mutation
		const updatedMatchData = JSON.parse(JSON.stringify(MatchData));
		
		// Find both teams in the matchData structure
		for (const division in updatedMatchData) {
			for (const subdivision in updatedMatchData[division]) {
				const selectedTeam = updatedMatchData[division][subdivision][selectedTeamLetter];
				const opposingTeam = updatedMatchData[division][subdivision][opposingTeamLetter];
				
				// Skip if either team is not found in this subdivision
				if (!selectedTeam || !opposingTeam) continue;
				
				// Initialize matchesData if it doesn't exist (should be there but just in case)
				if (!selectedTeam.matchesData) selectedTeam.matchesData = {};
				if (!opposingTeam.matchesData) opposingTeam.matchesData = {};
				
				// Update the selected team's matchup data
				selectedTeam.matchesData[gameTitle] = {
					matchDate: date,
					matchTime: matchTime,
					home: home,
					opposingTeamId: opposingTeamId,
					opposingTeamLetter: opposingTeamLetter
				};
				
				// Update the opposing team's matchup data with the inverse home/away status
				opposingTeam.matchesData[gameTitle] = {
					matchDate: date,
					matchTime: matchTime,
					home: !home,
					opposingTeamId: teamId,
					opposingTeamLetter: selectedTeamLetter
				};
				
				// Update state and call parent handlers
				setMatchData(updatedMatchData);
				handleSaveData(updatedMatchData);
				setEnabledSaveButton(true);
				
				console.log("Edited matchup for", selectedTeamLetter, "and", opposingTeamLetter, "on", gameTitle);
				return;
			}
		}
		
		console.log("Failed to edit matchup - teams not found in the same subdivision");
	};

	// Add state for place names
	const [placeNames, setPlaceNames] = useState<Record<string, string>>({});
	
	// Fetch place names only once when component mounts
	useEffect(() => {
		const fetchPlaceNames = async () => {
			const uniquePlaceIds = Object.values(teams).map(team => team.placeId);
			// Remove duplicates
			const uniqueIds = [...new Set(uniquePlaceIds)];
			
			const placeData: Record<string, string> = {};
			
			// Fetch each place name
			for (const placeId of uniqueIds) {
				try {
					const response = await fetch(`${placeRoute}?ledaId=${placeId}`);
					const data = await response.json();
					placeData[placeId] = data.name || "Unknown Location";
				} catch (error) {
					console.error("Error fetching place:", error);
					placeData[placeId] = "Error loading location";
				}
			}
			
			setPlaceNames(placeData);
		};
		
		fetchPlaceNames();
	}, [teams]); // Only re-run if teams change
	
	// Get place name from cache
	const getPlaceNameById = (placeId: string) => {
		return placeNames[placeId] || "Loading...";
	};

	return (
		<div className="rounded-md border shadow-sm">
			{/* Add Alert Dialog for deletion confirmation */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent className="bg-white">
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this matchup? This action will remove the scheduled match for both teams involved.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDeletingMatchup(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteMatchup} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			
			{/* Add Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="bg-white">
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
							date={gameDateEntries.filter(([title]) => title === editingMatchup.gameTitle)[0][1]}
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
							<TableHead className="font-semibold border-r border-gray-300 text-left py-4 px-6">
								Team Name
							</TableHead>
							{gameDateEntries.map(([gameTitle, date], index) => (
								<TableHead
									key={gameTitle}
									className={`whitespace-nowrap text-center py-4 px-6 ${
										index < gameDateEntries.length - 1
											? "border-r border-gray-300"
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
										? "bg-white"
										: "bg-muted/20"
								}
							>
								<TableCell className="font-medium w-fit border-r border-gray-200">{`${key} - ${teamData.teamName}`}</TableCell>
								{gameDateEntries.map(([gameTitle], index) => {
									const matchup = getTeamMatchup(key, gameTitle);
									return (
										<TableCell
											key={`${key}-${gameTitle}`}
											className={`whitespace-nowrap py-4 px-6 ${
												index < gameDateEntries.length - 1
													? "border-r border-gray-300"
													: ""
											}`}
										>
											<div className="flex items-center justify-center">
												{matchup ? (
													<div className="text-sm relative group">
														<div className="transition-all duration-200 group-hover:blur-sm">
															{matchup.home ? (
																<span className="font-medium text-center">
																	<div className="border border-gray-300 p-2 rounded-md">
																		<div>
																			{'VS'} 
																		</div>
																		<div>
																			{getTeamNameById(matchup.opposingTeamId)}
																		</div>
																		<div>
																			{convertTo12HourFormat(matchup.matchTime)}
																		</div>
																		<div>
																			{'@ '+ getPlaceNameById(teamData.placeId)}
																		</div>
																	</div>
																</span>
															) : (
																<span className="font-medium text-center">
																	<div className="border border-gray-300 p-2 rounded-md">
																		<div>
																			{'@'}
																		</div>
																		<div>
																			{getTeamNameById(matchup.opposingTeamId)}
																		</div>
																		<div>
																			{convertTo12HourFormat(matchup.matchTime)}
																		</div> 
																		<div>
																			{'@ '+ getPlaceNameById(teamData.placeId)}
																		</div>
																	</div>
																</span>
															)}
														</div>
														<div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-4">
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
																title="Edit matchup"
																onClick={() => handleEditMatchupClick(key, gameTitle, matchup)}
															>
																<Pencil className="h-4 w-4 text-blue-600" />
															</Button>
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
																title="Remove matchup"
																onClick={() => handleDeleteMatchup(key, gameTitle)}
															>
																<X className="h-4 w-4 text-red-600" />
															</Button>
														</div>
													</div>
												) : (
													<Dialog>
														<DialogTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="border border-dashed border-gray-300 rounded-md h-9 w-9 p-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
																title={`Add matchup for ${teamData.teamName}`}
															>
																<Plus className="h-4 w-4" />
															</Button>
														</DialogTrigger>
														<DialogContent className="bg-white">
															<DialogHeader>
																<DialogTitle>
																	Add Matchup
																</DialogTitle>
															</DialogHeader>
															<SchedulingAddMatchupForm 
																teamEntries={teamEntries} 
																handleAddMatchup={handleAddMatchup} 
																setOpen={setOpen} 
																teamId={teamData.teamId} 
																selectedTeam={teamData.teamId} 
																gameTitle={gameTitle} 
																date={gameDateEntries.filter(
																	([title]) =>
																		title ===
																		gameTitle
																)[0][1]}
																selectedTeamLetter={key}
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
