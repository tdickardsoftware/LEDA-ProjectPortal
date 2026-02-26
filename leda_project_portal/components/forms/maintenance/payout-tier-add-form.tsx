// Import necessary modules and components
"use client";

/**
 * PayoutTierAddForm Component
 *
 * Form for creating a new payout tier that maps a finishing place (1st, 2nd, etc.)
 * to a dollar/point amount. Returns a 422 conflict when the place already has
 * an existing tier, surfacing an inline error next to the place field.
 */
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React from "react";
import { payoutTierRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for the form validation
const paymentTypeFormSchema = z.object({
	place: z
		.number()
		.min(0, { message: "Place must be a positive number/is required." }),
	amount: z.number().min(0, { message: "Amount must be a positive number." }),
});

// Define the style for the form container and input width
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";
const inputWidth = "w-24";

/**
 * PayoutTierAddForm creates a new payout tier record.
 *
 * @param onClose - Callback to close the containing dialog
 * @param onRefresh - Callback to reload the parent data table
 */
// PayoutTierAddForm component definition
export default function PayoutTierAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	// Initialize the form with default values and validation schema
	const form = useForm<z.infer<typeof paymentTypeFormSchema>>({
		resolver: zodResolver(paymentTypeFormSchema),
		defaultValues: {
			place: undefined,
			amount: undefined,
		},
	});

	const [payoutTierExists, setPayoutTierExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof paymentTypeFormSchema>) => {
			const response = await fetchWithSession(payoutTierRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				if (response.status === 422) {
					setPayoutTierExists(true);
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

	// Reset form and error state when component mounts to ensure clean state
	React.useEffect(() => {
		setPayoutTierExists(false);
		form.reset({
			place: undefined,
			amount: undefined,
		});
	}, [form]);

	async function onSubmit(values: z.infer<typeof paymentTypeFormSchema>) {
		setPayoutTierExists(false);
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
						<FormField
							control={form.control}
							name="place"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Place *</FormLabel>
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
									{payoutTierExists && (
										<p className="text-red-500 text-sm mt-1">
											This Place Already Exists
										</p>
									)}
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Points *</FormLabel>
									<FormControl>
										<Input
											placeholder="0.00"
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
					</div>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Add</Button>
				</div>
			</form>
		</Form>
	);
}
