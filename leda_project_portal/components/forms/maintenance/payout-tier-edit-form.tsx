"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import React from "react";
import { payoutTierRoute } from "@/lib/apiRoutes";
import { PayoutTier } from "@/lib/definitions";
import { Input } from "@/components/ui/input";

const payoutTierFormSchema = z.object({
	place: z
		.number()
		.min(0, { message: "Place must be a positive number/is required." }),
	amount: z.number().min(0, { message: "Amount must be a positive number." }),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";

export default function PayoutTierEditForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: PayoutTier;
}) {
	const [formData, setFormData] = useState<PayoutTier>({} as PayoutTier);

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof payoutTierFormSchema>>({
		resolver: zodResolver(payoutTierFormSchema),
		defaultValues: {
			place: formData.place ?? undefined,
			amount: formData.amount ?? undefined,
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(
				payoutTierRoute + `?place=${rowData.place}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch payout tier data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			form.reset({
				...data,
				place: data.place ? Number(data.place) : undefined,
				amount: data.amount ? Number(data.amount) : undefined,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No payout tier data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof payoutTierFormSchema>) {
		try {
			const response = await fetch(payoutTierRoute, {
				method: "PUT",
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
			toast.success("Successfully updated the form!");

			// Reset form and state
			form.reset();

			console.log("Form updated successfully!", results);
			onClose(); // Close the form
			onRefresh(); // Refresh the datatable with the payout tier API route
		} catch (error) {
			console.error("Form update error", error);
			toast.error(
				`Failed to update the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
				ref={formRef}
				// Prevent form from reloading the page
				onSubmitCapture={(e) => e.preventDefault()}
			>
				<div className="flex space-x-4">
					{/* Payout Tier Information Section */}
					<div className={formContainerStyle}>
						<h1>Payout Tier Information for Place #{rowData.place}</h1>
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
					</div>
				</div>
				<div className="flex justify-between">
					<Button type="button" onClick={onClose}>
						Back
					</Button>
					<Button type="submit">Update</Button>
				</div>
			</form>
		</Form>
	);
}
