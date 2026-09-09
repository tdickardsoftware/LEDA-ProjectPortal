/**
 * SchedulingAddMatchupForm Component
 *
 * Form for adding a new matchup to the weekly schedule.
 * Supports regular matchups (with match time, home/away flag, and opposing team)
 * and BYE weeks. BYE weeks use placeholder values: opposing team ID "0" and
 * letter "X". Cross-field validation ensures match time and opposing team are
 * provided for non-BYE matchups.
 */
"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import React from "react";
import { Input } from "@/components/ui/input";
import TeamSelector from "@/components/team-selector-scheduling";
import CheckboxDefault from "@/components/ui/checkbox-default";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	matchTime: z.string(),
	home: z.boolean(),
	isByeWeek: z.boolean(),
	opposingTeamId: z.string(),
	teamId: z.string().min(1, { message: "Team ID is required." }),
	isAtBackupLocation: z.boolean(),
}).refine((data) => {
	// If not a BYE week, require matchTime and opposingTeamId
	if (!data.isByeWeek) {
		return data.matchTime.length > 0 && data.opposingTeamId.length > 0;
	}
	return true;
}, {
	message: "Match Time and Opposing Team are required for non-BYE weeks.",
	path: ["opposingTeamId"],
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * SchedulingAddMatchupForm renders the add-matchup form.
 *
 * @param teamEntries - All available teams for the opposing team selector
 * @param handleAddMatchup - Callback invoked with the validated matchup values
 * @param teamId - ID of the team that owns this matchup slot
 * @param gameTitle - Title label for the game week
 * @param date - ISO date string for the match week
 * @param setOpen - Function to close the containing dialog
 * @param selectedTeam - Team ID of the team being scheduled
 * @param selectedTeamLetter - Letter identifier for the selected team
 * @param teamsWithMatchups - Team IDs that already have matchups (excluded from selector)
 * @param backupPlaceId - The subdivision's backup location id, if one is set (enables the checkbox)
 * @param backupPlaceName - Display name for the backup location, used in the checkbox label
 */
export default function SchedulingAddMatchupForm({
	teamEntries,
	handleAddMatchup,
	teamId,
	gameTitle,
	date,
	setOpen,
	selectedTeam,
	selectedTeamLetter,
	teamsWithMatchups,
	backupPlaceId,
	backupPlaceName,
}: {
	teamEntries: [
		string,
		{ teamId: string; placeId: string; teamName: string }
	][];
	handleAddMatchup: (
		selectedTeamletter: string,
		teamId: string,
		gameTitle: string,
		date: string,
		matchTime: string,
		home: boolean,
		opposingTeamId: string,
		opposingTeamLetter: string,
		isByeWeek?: boolean,
		isAtBackupLocation?: boolean
	) => void;
	setOpen: (value: boolean) => void;
	teamId: string;
	gameTitle: string;
	date: string;
	selectedTeam: string;
	selectedTeamLetter: string;
	teamsWithMatchups: string[];
	backupPlaceId?: string | null;
	backupPlaceName?: string;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			matchTime: "19:30",
			home: true,
			isByeWeek: false,
			opposingTeamId: "",
			teamId: selectedTeam,
			isAtBackupLocation: false,
		},
	});

	const isByeWeek = form.watch("isByeWeek");

	// Reset form when component mounts to ensure clean state when dialog reopens
	React.useEffect(() => {
		form.reset({
			matchTime: "19:30",
			home: true,
			isByeWeek: false,
			opposingTeamId: "",
			teamId: selectedTeam,
			isAtBackupLocation: false,
		});
	}, [form, selectedTeam]);

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		if (values.isByeWeek) {
			// For BYE week, use special values
			handleAddMatchup(
				selectedTeamLetter,
				teamId,
				gameTitle,
				date,
				"19:30", // default time for BYE
				values.home,
				"0", // opposing team ID is 0 for BYE
				"X", // opposing team letter is X for BYE week
				true, // isByeWeek flag
				false // not at backup location
			);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const opposingTeamKey =
				teamEntries.find(
					([, value]) => value.teamId === values.opposingTeamId
				)?.[0] || "";
			handleAddMatchup(
				selectedTeamLetter,
				teamId,
				gameTitle,
				date,
				values.matchTime,
				values.home,
				values.opposingTeamId,
				opposingTeamKey,
				false, // not a BYE week
				values.isAtBackupLocation
			);
		}
		setOpen(false);
	}

	// Render the form
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						{!isByeWeek && (
							<FormField
								control={form.control}
								name="matchTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Match Start Time *</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="time"
												onChange={(e) => {
													field.onChange(e.target.value);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<div className="flex gap-4">
							<TeamSelector
								control={form.control}
								name="teamId"
								label="Selected Team"
								selectedTeams={[]}
								teamEntries={teamEntries}
								disabled={true}
								defaultId={selectedTeam}
							/>
						{!isByeWeek && (
							<CheckboxDefault
								control={form.control}
								name="home"
								label="Home Team?"
								className="h-5 w-5"
							/>
						)}
						</div>
						<CheckboxDefault
							control={form.control}
							name="isByeWeek"
							label="BYE Week"
							className="h-5 w-5"
						/>
						{!isByeWeek && (
							<TeamSelector
								control={form.control}
								name="opposingTeamId"
								label="Opposing Team *"
								selectedTeams={[selectedTeam, ...teamsWithMatchups]}
								teamEntries={teamEntries}
							/>
						)}
						{!isByeWeek && backupPlaceId && (
							<CheckboxDefault
								control={form.control}
								name="isAtBackupLocation"
								label={`Playing at Backup Location${backupPlaceName ? ` (${backupPlaceName})` : ""}`}
								className="h-5 w-5"
							/>
						)}
					</div>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Add Matchup</Button>
				</div>
			</form>
		</Form>
	);
}
