/**
 * SchedulingEditMatchupForm Component
 *
 * Form for editing an existing weekly schedule matchup.
 * Mirrors SchedulingAddMatchupForm but pre-populates fields from `initialValues`.
 * Detects BYE weeks by checking if the opposing team ID is "0" or the opposing
 * team letter is "BYE" / "X". Shows a loading indicator while checking whether
 * points have already been logged for the matchup.
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
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import TeamSelector from "@/components/team-selector-scheduling";
import CheckboxDefault from "@/components/ui/checkbox-default";
import { Spinner } from "@/components/ui/skeleton";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	matchTime: z.string(),
	home: z.boolean(),
	isByeWeek: z.boolean(),
	opposingTeamId: z.string(),
	teamId: z.string().min(1, { message: "Team ID is required." }),
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
 * SchedulingEditMatchupForm renders the edit-matchup form.
 *
 * @param teamEntries - All available teams for the opposing team selector
 * @param handleEditMatchup - Callback invoked with the updated matchup values
 * @param teamId - ID of the team that owns this matchup slot
 * @param gameTitle - Title label for the game week
 * @param date - ISO date string for the match week
 * @param setOpen - Function to close the containing dialog
 * @param selectedTeamLetter - Letter identifier for the selected team
 * @param initialValues - Pre-populated values from the existing matchup record
 * @param hasPointsLogged - Whether points have already been entered for this matchup
 * @param isCheckingPoints - Whether the parent is still verifying logged points
 * @param teamsWithMatchups - Team IDs that already have matchups (excluded from selector)
 */
export default function SchedulingEditMatchupForm({
	teamEntries,
	handleEditMatchup,
	teamId,
	gameTitle,
	date,
	setOpen,
	selectedTeamLetter,
	initialValues,
	hasPointsLogged = false,
	isCheckingPoints = false,
	teamsWithMatchups = [],
}: {
	teamEntries: [
		string,
		{ teamId: string; placeId: string; teamName: string }
	][];
	handleEditMatchup: (
		selectedTeamLetter: string,
		teamId: string,
		gameTitle: string,
		date: string,
		matchTime: string,
		home: boolean,
		opposingTeamId: string,
		opposingTeamLetter: string,
		isByeWeek?: boolean
	) => void;
	setOpen: (value: boolean) => void;
	teamId: string;
	gameTitle: string;
	date: string;
	selectedTeamLetter: string;
	initialValues: {
		matchDate: string;
		matchTime: string;
		home: boolean;
		opposingTeamId: string;
		opposingTeamLetter: string;
	};
	hasPointsLogged?: boolean;
	isCheckingPoints?: boolean;
	teamsWithMatchups?: string[];
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			matchTime: initialValues.matchTime || "",
			home: initialValues.home,
			isByeWeek: initialValues.opposingTeamId === "0" || initialValues.opposingTeamLetter === "BYE" || initialValues.opposingTeamLetter === "X",
			opposingTeamId: initialValues.opposingTeamId || "",
			teamId: teamId,
		},
	});

	const isByeWeek = form.watch("isByeWeek");

	// Reset form when initialValues change
	useEffect(() => {
		form.reset({
			matchTime: initialValues.matchTime || "",
			home: initialValues.home,
			isByeWeek: initialValues.opposingTeamId === "0" || initialValues.opposingTeamLetter === "BYE" || initialValues.opposingTeamLetter === "X",
			opposingTeamId: initialValues.opposingTeamId || "",
			teamId: teamId,
		});
	}, [initialValues, teamId, form]);

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		if (values.isByeWeek) {
			// For BYE week, use special values
			handleEditMatchup(
				selectedTeamLetter,
				teamId,
				gameTitle,
				date,
				"", // no match time for BYE
				values.home,
				"0", // opposing team ID is 0 for BYE
				"X", // opposing team letter is X for BYE week
				true // isByeWeek flag
			);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const opposingTeamKey =
				teamEntries.find(
					([, value]) => value.teamId === values.opposingTeamId
				)?.[0] || "";
			handleEditMatchup(
				selectedTeamLetter,
				teamId,
				gameTitle,
				date,
				values.matchTime,
				values.home,
				values.opposingTeamId,
				opposingTeamKey,
				false // not a BYE week
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
								defaultId={teamId}
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
						{isCheckingPoints ? (
							<div className="flex items-center gap-2">
								<Spinner />
								<span className="text-sm text-muted-foreground">Checking points...</span>
							</div>
						) : !hasPointsLogged && (
							<CheckboxDefault
								control={form.control}
								name="isByeWeek"
								label="BYE Week"
								className="h-5 w-5"
							/>
						)}
						{!isByeWeek && (
							<TeamSelector
								control={form.control}
								name="opposingTeamId"
								label="Opposing Team"
								selectedTeams={[teamId, ...teamsWithMatchups]}
								teamEntries={teamEntries}
								defaultId={initialValues.opposingTeamId}
								disabled={hasPointsLogged || isCheckingPoints}
							/>
						)}
					</div>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Update Matchup</Button>
				</div>
			</form>
		</Form>
	);
}
