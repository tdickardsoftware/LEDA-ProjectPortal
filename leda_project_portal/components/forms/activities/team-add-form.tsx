"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import React from "react";
import TeamSelector from "@/components/ui/team-selector";
import PlaceSelector from "@/components/ui/place-selector";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	teamLedaId: z.string().min(1, { message: "Team is Required" }),
    placeId: z.string().min(1, { message: "Place is Required" }),
    teamName: z.string().min(1, { message: "Team Name is Required" }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

// Define the DivisionAddForm component
export default function TeamAddForm({
    selectedTeams,
    handleSelectTeam,
    setOpen,
    division,
    subdivision
}: {
    selectedTeams: string[];
    handleSelectTeam: (teamLedaId: string, placeId: string, teamName: string, division: string, subdivision: string) => void;
    setOpen: (value: boolean) => void;
    division: string;
    subdivision: string;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			teamLedaId: "",
            placeId: "",
            teamName: "",
		},
	});


	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		handleSelectTeam(values.teamLedaId, values.placeId, values.teamName, division, subdivision);
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
						<TeamSelector name="teamLedaId" label="Team *" control={form.control} selectedTeams={selectedTeams} />
                        <PlaceSelector name="placeId" label="Home Place *" control={form.control}  />
                    </div>
				</div>
				<div className="flex justify-center">
					<Button type="submit">Add Team</Button>
				</div>
			</form>
		</Form>
	);
}
