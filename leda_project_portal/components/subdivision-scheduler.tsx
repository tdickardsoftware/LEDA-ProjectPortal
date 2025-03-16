import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import SchedulingAddMatchupForm from "./forms/activities/schedule-add-matchup-form";
import { useState, useEffect } from "react";

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

	return (
		<div className="rounded-md border shadow-sm">
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
													<div className="text-sm">
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
																</div>
															</span>
														)}
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
