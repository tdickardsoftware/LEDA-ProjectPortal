"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import React from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector-form";
import { rosterRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	targetSeasonCode: z
		.string()
		.min(1, { message: "Target Seaon is Required" }),
	sourceSeasonCode: z
		.string()
		.min(1, { message: "Source Season is Required" }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

// Define the RosterCopyForm component
export default function RosterCopyForm({
	setOpen,
}: {
	setOpen: (value: boolean) => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			targetSeasonCode: "",
			sourceSeasonCode: "",
		},
	});

	const copyRosterMutation = useMutation({
		mutationFn: async (values: z.infer<typeof divisionFormSchema>) => {
			const response = await fetchWithSession(rosterRoute + "/rosterUpserter", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				throw new Error("Failed to copy roster");
			}
			return response;
		},
		onSuccess: () => {
			setOpen(false);
			window.location.reload();
		},
		onError: (error) => {
			console.error("Error copying roster:", error);
			alert("Failed to copy roster.");
		},
	});

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		const confirmed = window.confirm(
			"This will overwrite any existing data on the selected season. Do you want to proceed?"
		);
		if (!confirmed) return;
		copyRosterMutation.mutate(values);
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
						<SeasonCodeSelector
							name="sourceSeasonCode"
							label="Source Season Code *"
							control={form.control}
							exclusive={true}
						/>
						<SeasonCodeSelector
							name="targetSeasonCode"
							label="Target Season Code *"
							control={form.control}
							excludeCode={form.getValues("sourceSeasonCode")}
						/>
					</div>
				</div>
				<div className="flex justify-center">
					<Button variant={"outline"} className="hover:bg-muted border-border text-foreground">Copy Roster</Button>
				</div>
			</form>
		</Form>
	);
}
