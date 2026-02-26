/**
 * DivisionAddForm Component (Activities)
 *
 * Provides a form for selecting and associating a division with the current
 * season schedule. Delegates to a DivisionSelector UI component, filtering
 * out divisions that have already been added.
 */
"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import React, { useEffect } from "react";
import DivisionSelector from "@/components/ui/division-selector";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	divisionName: z.string().min(1, { message: "Division Name is required." }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * DivisionAddForm renders the division selection form for a season schedule.
 *
 * @param selectedDivisions - Divisions already added (excluded from the selector)
 * @param handleSelectDivision - Callback invoked with the chosen division name
 * @param setOpen - Function to close the containing dialog
 */
export default function DivisionAddForm({
	selectedDivisions,
	handleSelectDivision,
	setOpen,
}: {
	selectedDivisions: string[];
	handleSelectDivision: (value: string) => void;
	setOpen: (value: boolean) => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			divisionName: "",
		},
	});

	// Reset form when component mounts to ensure clean state when dialog reopens
	useEffect(() => {
		form.reset({
			divisionName: "",
		});
	}, [form]);

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		handleSelectDivision(values.divisionName);
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
						<DivisionSelector
							name="divisionName"
							label="Division Name"
							control={form.control}
							selectedDivisions={selectedDivisions}
						/>
					</div>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Add Division</Button>
				</div>
			</form>
		</Form>
	);
}
