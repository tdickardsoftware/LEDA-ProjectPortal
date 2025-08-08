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
import { useMutation } from "@tanstack/react-query";

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

	const [mentionCodeExists, setMentionCodeExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof mentionFormSchema>) => {
			const response = await fetch(mentionRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				if (response.status === 422) {
					setMentionCodeExists(true);
				}
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
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

	async function onSubmit(values: z.infer<typeof mentionFormSchema>) {
		setMentionCodeExists(false);
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
							name="mentionCode"
							label="Mention Code *"
						/>
						{mentionCodeExists && (
							<p className="text-red-500 text-sm">
								Mention code already exists
							</p>
						)}
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
													e.target.value === ""
														? undefined
														: parseFloat(
																e.target.value
														  )
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
