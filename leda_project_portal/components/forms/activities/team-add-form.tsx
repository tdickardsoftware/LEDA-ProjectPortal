/**
 * TeamAddForm Component (Activities)
 *
 * Form for adding a team to a specific division and subdivision within the
 * current season's schedule. Requires a team LEDA ID, home place, and team name.
 * Prevents selecting teams that are already in the division.
 */
"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import TeamSelector from "@/components/ui/team-selector";
import PlaceSelector from "@/components/ui/place-selector";

const ALL_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	teamLedaId: z.string().min(1, { message: "Team is Required" }),
	placeId: z.string().min(1, { message: "Place is Required" }),
	teamName: z.string().min(1, { message: "Team Name is Required" }),
	autoAssign: z.boolean(),
	teamLetter: z.string().optional(),
}).refine(data => data.autoAssign || (data.teamLetter && data.teamLetter.length > 0), {
	message: "Please select a team letter",
	path: ["teamLetter"],
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * TeamAddForm renders the team selection form for a division/subdivision.
 *
 * @param selectedTeams - Team LEDA IDs already in the division (excluded from selector)
 * @param handleSelectTeam - Callback invoked with the chosen team's details
 * @param setOpen - Function to close the containing dialog
 * @param division - Division name that the team is being added to
 * @param subdivision - Subdivision name that the team is being added to
 */
export default function TeamAddForm({
	selectedTeams,
	handleSelectTeam,
	setOpen,
	division,
	subdivision,
	takenLetters,
}: {
	selectedTeams: string[];
	handleSelectTeam: (
		teamLedaId: string,
		placeId: string,
		teamName: string,
		division: string,
		subdivision: string,
		teamLetter?: string,
	) => void;
	setOpen: (value: boolean) => void;
	division: string;
	subdivision: string;
	takenLetters: string[];
}) {
	const availableLetters = ALL_LETTERS.filter(l => !takenLetters.includes(l));
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			teamLedaId: "",
			placeId: "",
			teamName: "",
			autoAssign: true,
			teamLetter: "",
		},
	});

	const autoAssign = form.watch("autoAssign");

	// Reset form when component mounts to ensure clean state when dialog reopens
	useEffect(() => {
		form.reset({
			teamLedaId: "",
			placeId: "",
			teamName: "",
			autoAssign: true,
			teamLetter: "",
		});
	}, [form]);

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		handleSelectTeam(
			values.teamLedaId,
			values.placeId,
			values.teamName,
			division,
			subdivision,
			values.autoAssign ? undefined : values.teamLetter,
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
						<TeamSelector
							name="teamLedaId"
							label="Team *"
							control={form.control}
							selectedTeams={selectedTeams}
						/>
						<PlaceSelector
							name="placeId"
							label="Home Place *"
							control={form.control}
						/>
						<FormField
							control={form.control}
							name="autoAssign"
							render={({ field }) => (
								<FormItem className="flex items-center gap-2 space-y-0 mt-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											className="h-5 w-5"
										/>
									</FormControl>
									<FormLabel className="!mt-0 cursor-pointer">
										Auto assign team letter
									</FormLabel>
								</FormItem>
							)}
						/>
						{!autoAssign && (
							<FormField
								control={form.control}
								name="teamLetter"
								render={({ field }) => (
									<FormItem className="mt-3">
										<FormLabel>Team Letter *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a letter" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="bg-background">
												{availableLetters.map(letter => (
													<SelectItem key={letter} value={letter}>
														{letter}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</div>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Add Team</Button>
				</div>
			</form>
		</Form>
	);
}
