/**
 * MentionAddForm Component
 *
 * Form for creating a new mention type in the maintenance section.
 * A mention is a named achievement (e.g., "High Score") with an associated
 * point value, a basis code (e.g., per-player or per-team), and an optional
 * description. Returns a 422 conflict error when the mention code already exists.
 */
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
import { fetchWithSession } from "@/lib/getData";

// Define the schema for form validation using zod
const mentionFormSchema = z.object({
	mentionCode: z.string().min(1, { message: "Mention Code is required." }),
	desc: z.string().optional(),
	points: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Points must be a positive number." })
	),
	mentionBasis: z.string().min(1, { message: "Mention Basis is required." }),
});

// Define styles for the form container and input width
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";
const inputWidth = "w-24";

/**
 * MentionAddForm creates a new mention type record.
 *
 * @param onClose - Callback to close the containing dialog
 * @param onRefresh - Callback to reload the parent data table
 */
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
			points: "" as any,
		},
	});

	const [mentionCodeExists, setMentionCodeExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof mentionFormSchema>) => {
			const response = await fetchWithSession(mentionRoute, {
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

	// Reset form and error state when component mounts to ensure clean state
	React.useEffect(() => {
		setMentionCodeExists(false);
		form.reset({
			mentionCode: "",
			desc: "",
			mentionBasis: "",
			points: "" as any,
		});
	}, [form]);

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
														? ""
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
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Add</Button>
				</div>
			</form>
		</Form>
	);
}
