"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import React from "react";
import DivisionSelector from "@/components/ui/division-selector";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	divisionName: z.string().min(1, { message: "Division Name is required." }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

// Define the DivisionAddForm component
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
					<Button type="submit" className="hover:bg-gray-100 border-gray-300 text-gray-700">Add Division</Button>
				</div>
			</form>
		</Form>
	);
}
