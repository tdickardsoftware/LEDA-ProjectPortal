"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import { divisionRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	divisionName: z.string().min(1, { message: "Division Name is required." }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

// Define the DivisionAddForm component
export default function DivisionAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			divisionName: "",
		},
	});

	const [divisionNameExists, setDivisionNameExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof divisionFormSchema>) => {
			const response = await fetchWithSession(divisionRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				if (response.status === 422) {
					setDivisionNameExists(true);
				}
				let errorMessage = `HTTP error! status: ${response.status}`;
				try {
					const errorData = await response.json();
					// prefer server-provided message if present
					errorMessage =
						(errorData?.message as string | undefined) ||
						(errorData?.error as string | undefined) ||
						errorMessage;
				} catch {
					// ignore JSON parse errors and use default message
				}
				throw new Error(errorMessage);
			}
			return await response.json();
		},
		onSuccess: (results) => {
			toast.success("Successfully submitted the form!");
			form.reset();
			console.log("Form submitted successfully!", results);
			onClose();
			onRefresh();
		},
		onError: (error: unknown) => {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		},
	});

	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		setDivisionNameExists(false);
		mutation.mutate(values);
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
						<InputDefault
							control={form.control}
							name="divisionName"
							label="Division Name *"
						/>
						{divisionNameExists && (
							<p className="text-red-500 text-sm">
								Division name already exists.
							</p>
						)}
					</div>
				</div>
				<div className="flex justify-center">
					<Button type="submit" className="hover:bg-gray-100 border-gray-300 text-gray-700">Add</Button>
				</div>
			</form>
		</Form>
	);
}
