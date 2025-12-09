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
import React from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define the schema for form validation using zod
const adjustmentFormSchema = z.object({
	amount: z.number().min(1, { message: "Amount is required." }),
	type: z.boolean(),
	notes: z.string().optional(),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

// Define the DivisionAddForm component
export default function AdjustmentForm({
	global,
	teamId,
	handleAdjustment,
	setOpen,
	adjustmentData, // Optional parameter for existing adjustment data
}: {
	global: boolean;
	teamId: string;
	handleAdjustment: (
		teamId: string,
		amount: number,
		type: boolean,
		notes: string | undefined,
		global: boolean
	) => void;
	setOpen: (value: boolean) => void;
	adjustmentData?: { amount: number; type: boolean; notes?: string }; // Optional adjustment data
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof adjustmentFormSchema>>({
		resolver: zodResolver(adjustmentFormSchema),
		defaultValues: {
			amount: adjustmentData?.amount || undefined,
			type: adjustmentData?.type ?? true,
			notes: adjustmentData?.notes || "",
		},
	});

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof adjustmentFormSchema>) {
		if (values.notes === "") {
			values.notes = "Adjustment made by user";
		}
		// Format the amount to ensure it always has two decimal places
		const formattedAmount = Number(values.amount.toFixed(2));
		handleAdjustment(
			teamId,
			formattedAmount,
			values.type,
			values.notes,
			global
		);
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
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount *</FormLabel>
									<FormControl>
										<Input
											placeholder="00.00"
											type="number"
											step="0.01"
											value={
												field.value !== undefined
													? field.value
													: ""
											}
											onChange={(e) => {
												const value = e.target.value;
												// Allow empty string for clearing the input
												if (value === "") {
													form.setValue("amount", 0); // Use 0 instead of undefined
												}
												// Only parse if there's a value and it's a valid number format
												else if (
													/^\d*\.?\d*$/.test(value)
												) {
													form.setValue(
														"amount",
														parseFloat(value)
													);
												}
											}}
											onBlur={field.onBlur}
											name={field.name}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type *</FormLabel>
									<FormControl>
										<Select
											onValueChange={(value) =>
												field.onChange(value === "true")
											}
											value={
												field.value ? "true" : "false"
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent className="bg-background">
												<SelectItem value="true">
													Credit
												</SelectItem>
												<SelectItem value="false">
													Debit
												</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Notes"
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
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">
						{global
							? "Save Global Adjustment"
							: "Save Team Adjustment"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
