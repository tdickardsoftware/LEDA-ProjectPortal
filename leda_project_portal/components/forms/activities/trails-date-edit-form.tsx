/**
 * TrailsDateEditForm Component
 *
 * Inline edit form for updating an existing Trails tournament entry.
 * Pre-populates all numeric fields from `rowData`. Submits a PUT request
 * via React Query mutation and calls `handleRefresh` with the row index on
 * success to refresh only the affected table row.
 */
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
import { Textarea } from "@/components/ui/textarea";
import { trailsRoute } from "@/lib/apiRoutes";
import { TrailsDateData } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Validation schema — all numeric fields are optional on edit; empty strings coerce to 0
const TrailsDateDataFormSchema = z.object({
	singlesPlace: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Singles place must be 0 or greater." })
	).optional(),
	doublesPlace: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Doubles place must be 0 or greater." })
	).optional(),
	notes: z.string().optional(),
	trailsPoints: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Trails points must be 0 or greater." })
	).optional(),
	ledaId: z.number().positive().optional(),
	trailsDate: z.string().optional(),
});

// Shared style for the form card container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * TrailsDateEditForm renders the inline Trails entry edit form.
 *
 * @param rowData - Existing Trails entry data to pre-populate the form
 * @param handleRefresh - Callback invoked with the row index to refresh on success
 * @param index - Row identifier passed back to `handleRefresh` after a successful save
 */
export default function TrailsDateEditForm({
	rowData,
	handleRefresh,
	index,
}: {
	rowData: TrailsDateData;
	handleRefresh: (index: string) => void;
	index: string;
}) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof TrailsDateDataFormSchema>>({
		resolver: zodResolver(TrailsDateDataFormSchema),
		defaultValues: {
			singlesPlace: rowData.singlesPlace !== undefined ? rowData.singlesPlace : ("" as any),
			doublesPlace: rowData.doublesPlace !== undefined ? rowData.doublesPlace : ("" as any),
			trailsPoints: rowData.trailsPoints !== undefined ? rowData.trailsPoints : ("" as any),
			notes: rowData.notes || "",
		},
	});

	// Reset form when component mounts or rowData changes to ensure clean state
	React.useEffect(() => {
		form.reset({
			singlesPlace: rowData.singlesPlace !== undefined ? rowData.singlesPlace : ("" as any),
			doublesPlace: rowData.doublesPlace !== undefined ? rowData.doublesPlace : ("" as any),
			trailsPoints: rowData.trailsPoints !== undefined ? rowData.trailsPoints : ("" as any),
			notes: rowData.notes || "",
		});
	}, [form, rowData]);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof TrailsDateDataFormSchema>) => {
			const response = await fetchWithSession(trailsRoute, {
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
			return await response.json();
		},
		onSuccess: (results) => {
			toast.success("Successfully updated the form!");
			form.reset();
			handleRefresh(index);
			console.log("Form updated successfully!", results);
		},
		onError: (error) => {
			console.error("Form update error", error);
			toast.error(
				`Failed to update the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		},
	});

	if (!rowData) {
		return <div>No place type data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof TrailsDateDataFormSchema>) {
		values.ledaId = rowData.ledaId;
		values.trailsDate = rowData.trailsDate;
		mutation.mutate(values);
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
					{/* Place Type Information Section */}
					<div className={formContainerStyle}>
						<FormField
							control={form.control}
							name="trailsPoints"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Trails Points *</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											value={field.value ?? ""}
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
							name="singlesPlace"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Singles Place *</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											value={field.value ?? ""}
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
							name="doublesPlace"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Doubles Place *</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											value={field.value ?? ""}
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
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Any Notes Here..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
				<div className="flex items-center justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">
						Update
					</Button>
				</div>
			</form>
		</Form>
	);
}
