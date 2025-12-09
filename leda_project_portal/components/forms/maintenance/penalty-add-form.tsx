// Import necessary modules and components
"use client";
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
import { Textarea } from "../../ui/textarea";
import { penaltyRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for the form validation
const penaltyFormSchema = z.object({
	penaltyCode: z.string().min(1, { message: "Penalty Code is required." }),
	desc: z.string().optional(),
});

// Define the style for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

// PenaltyAddForm component definition
export default function PenaltyAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	// Initialize the form with default values and validation schema
	const form = useForm<z.infer<typeof penaltyFormSchema>>({
		resolver: zodResolver(penaltyFormSchema),
		defaultValues: {
			penaltyCode: "",
		},
	});

	const [penaltyExists, setPenaltyExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof penaltyFormSchema>) => {
			const response = await fetchWithSession(penaltyRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				if (response.status === 422) {
					setPenaltyExists(true);
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

	async function onSubmit(values: z.infer<typeof penaltyFormSchema>) {
		setPenaltyExists(false);
		mutation.mutate(values);
	}

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
							name="penaltyCode"
							label="Penalty Code *"
						/>
						{penaltyExists && (
							<p className="text-red-500 text-sm">
								Penalty code already exists.
							</p>
						)}
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
