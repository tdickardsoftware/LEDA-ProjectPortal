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
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import MentionBasisSelector from "@/components/ui/mention-basis-selector";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { mentionRoute } from "@/lib/apiRoutes";

// Define the schema for form validation using zod
const mentionFormSchema = z.object({
	mentionCode: z.string().min(1, { message: "Mention Code is required." }),
	desc: z.string().optional(),
	points: z.number().min(0, { message: "Points must be a positive number." }),
	mentionBasis: z.string().min(1, { message: "Mention Basis is required." }),
});

// Define styles for the form container and input width
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";

// Define the MentionAddForm component
export default function MentionAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof mentionFormSchema>>({
		resolver: zodResolver(mentionFormSchema),
		defaultValues: {
			mentionCode: "",
			desc: "",
			mentionBasis: "",
			points: undefined,
		},
	});

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof mentionFormSchema>) {
		try {
			const response = await fetch(mentionRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
			}

			const results = await response.json();
			toast.success("Successfully submitted the form!");

			// Reset form and state
			form.reset();

			console.log("Form submitted successfully!", results);
			onClose(); // Close the form
			onRefresh(); // Refresh the datatable with the place API route
		} catch (error: any) {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
					error.message || "Please try again."
				}`
			);
		}
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
							name="mentionCode"
							label="Mention Code *"
						/>
						<FormField
							control={form.control}
							name="points"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Points *</FormLabel>
									<FormControl>
										<Input
											placeholder="0"
											{...field}
											className={inputWidth}
											type="number"
											onChange={(e) => {
												field.onChange(
													e.target.value
														? Number(e.target.value)
														: undefined
												);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="mentionBasis"
							render={() => (
								<FormItem>
									<FormLabel>Mention Basis *</FormLabel>
									<MentionBasisSelector />
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Additional Data Here..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
				<div className="flex justify-center">
					<Button type="submit">Add</Button>
				</div>
			</form>
		</Form>
	);
}
