"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React from "react";
import { Input } from "@/components/ui/input";
import TeamSelector from "@/components/team-selector-scheduling";
import CheckboxDefault from "@/components/ui/checkbox-default";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	matchTime: z.string().min(1, { message: "Match Time is required." }),
    home: z.boolean(),
    opposingTeamId: z.string().min(1, { message: "Opposing Team is required." }),
    teamId: z.string().min(1, { message: "Team ID is required." }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

// Define the DivisionAddForm component
export default function SchedulingAddMatchupForm({
    teamEntries,
    handleAddMatchup,
    teamId,
    gameTitle,
    date,
    setOpen,
    selectedTeam,
    selectedTeamLetter
}: {
    teamEntries: [string, { teamId: string; placeId: string; teamName: string }][]
    handleAddMatchup: (selectedTeamletter: string, teamId: string, gameTitle: string, date: string, matchTime: string, home: boolean, opposingTeamId: string, opposingTeamLetter: string) => void;
    setOpen: (value: boolean) => void;
    teamId: string;
    gameTitle: string;
    date: string;
    selectedTeam: string;
    selectedTeamLetter: string;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			matchTime: "",
            home: true,
            opposingTeamId: "",
            teamId: selectedTeam,
		},
	});


	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const opposingTeamKey = teamEntries.find(([key, value]) => value.teamId === values.opposingTeamId)?.[0] || "";
        handleAddMatchup(selectedTeamLetter, teamId, gameTitle, date, values.matchTime, values.home, values.opposingTeamId, opposingTeamKey);
        setOpen(false)
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
                                                console.log(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <TeamSelector control={form.control} name="teamId" label="Selected Team" selectedTeams={[]} teamEntries={teamEntries} disabled={true} defaultId={selectedTeam}/>
                            <CheckboxDefault control={form.control} name="home" label="Home Team?" className="h-5 w-5" />
                        </div>
                        <TeamSelector control={form.control} name="opposingTeamId" label="Opposing Team *" selectedTeams={[selectedTeam]} teamEntries={teamEntries} />
                    </div>
				</div>
				<div className="flex justify-center">
					<Button type="submit">Add Matchup</Button>
				</div>
			</form>
		</Form>
	);
}
