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

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	matchTime: z.string().min(1, { message: "Match Time is required." }),
	home: z.boolean(),
	opposingTeamId: z
		.string()
		.min(1, { message: "Opposing Team is required." }),
	teamId: z.string().min(1, { message: "Team ID is required." }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

// Define the SchedulingEditMatchupForm component
export default function SchedulingEditMatchupForm({
	teamEntries,
	handleEditMatchup,
	teamId,
	gameTitle,
	date,
	setOpen,
	selectedTeamLetter,
	initialValues,
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
		opposingTeamLetter: string
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
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			matchTime: initialValues.matchTime || "",
			home: initialValues.home,
			opposingTeamId: initialValues.opposingTeamId || "",
			teamId: teamId,
		},
	});

	// Reset form when initialValues change
	useEffect(() => {
		form.reset({
			matchTime: initialValues.matchTime || "",
			home: initialValues.home,
			opposingTeamId: initialValues.opposingTeamId || "",
			teamId: teamId,
		});
	}, [initialValues, teamId, form]);

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
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
			opposingTeamKey
		);
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
							<CheckboxDefault
								control={form.control}
								name="home"
								label="Home Team?"
								className="h-5 w-5"
							/>
						</div>
						<TeamSelector
							control={form.control}
							name="opposingTeamId"
							label="Opposing Team *"
							selectedTeams={[teamId]}
							teamEntries={teamEntries}
							defaultId={initialValues.opposingTeamId}
						/>
					</div>
				</div>
				<div className="flex justify-center">
					<Button type="submit" className="hover:bg-gray-100 border-gray-300 text-gray-700">Update Matchup</Button>
				</div>
			</form>
		</Form>
	);
}
