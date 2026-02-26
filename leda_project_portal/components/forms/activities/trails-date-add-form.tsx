/**
 * TrailsDateAddForm Component
 *
 * Form for adding or editing a player's Trails tournament entry for a specific date.
 * Collects trails points, singles place, doubles place, and optional notes.
 * Operates in both "add" mode (requires player selection) and "edit" mode
 * (player is pre-determined by `editData`). Uses `z.preprocess` to coerce empty
 * numeric inputs to 0 rather than undefined.
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
import { Input } from "@/components/ui/input";
import { TrailsDateData } from "@/lib/definitions";
import PlayerSelect from "@/components/ui/single-player-select";

// Validation schema — uses z.preprocess to coerce empty inputs to 0
const TrailsDateDataFormSchema = z.object({
	singlesPlace: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Singles place must be 0 or greater." })
	),
	doublesPlace: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Doubles place must be 0 or greater." })
	),
	notes: z.string().optional(),
	trailsPoints: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Trails points must be 0 or greater." })
	),
	ledaId: z.number().positive(),
	trailsDate: z.string().optional(),
	fullName: z.string().optional(),
});

// Shared style for the form card container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * TrailsDateAddForm renders the Trails entry add/edit form.
 *
 * @param goBack - Callback to return to the parent view without submitting
 * @param handleFormSubmit - Callback invoked with the validated Trails entry
 * @param trailsDate - The trails event date string to associate with the entry
 * @param trailsDateData - Existing entries for the date (used to exclude already-added players)
 * @param editData - Optional existing entry data for edit mode
 * @param index - Optional row index used when updating an existing entry in-place
 */
export default function TrailsDateAddForm({
	goBack,
	handleFormSubmit,
	trailsDate,
	trailsDateData,
	editData,
	index,
}: {
	goBack: (values: boolean) => void;
	handleFormSubmit: (values: TrailsDateData, index?: number) => void;
	trailsDate: string | null;
	trailsDateData: TrailsDateData[];
	editData?: TrailsDateData;
	index?: number;
}) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof TrailsDateDataFormSchema>>({
		resolver: zodResolver(TrailsDateDataFormSchema),
		defaultValues: {
			singlesPlace: editData?.singlesPlace !== undefined ? editData.singlesPlace : ("" as any),
			doublesPlace: editData?.doublesPlace !== undefined ? editData.doublesPlace : ("" as any),
			trailsPoints: editData?.trailsPoints !== undefined ? editData.trailsPoints : ("" as any),
			notes: editData?.notes || "",
			ledaId: editData?.ledaId || undefined,
			fullName: editData?.fullName || "",
		},
	});

	// Reset form when component mounts or editData changes to ensure clean state
	React.useEffect(() => {
		form.reset({
			singlesPlace: editData?.singlesPlace !== undefined ? editData.singlesPlace : ("" as any),
			doublesPlace: editData?.doublesPlace !== undefined ? editData.doublesPlace : ("" as any),
			trailsPoints: editData?.trailsPoints !== undefined ? editData.trailsPoints : ("" as any),
			notes: editData?.notes || "",
			ledaId: editData?.ledaId || undefined,
			fullName: editData?.fullName || "",
		});
	}, [form, editData]);

	async function onSubmit(values: z.infer<typeof TrailsDateDataFormSchema>) {
		try {
			// Convert ledaId to a number
			values.ledaId = Number(values.ledaId);
			values.trailsDate = trailsDate as string;
			if (index !== undefined) {
				handleFormSubmit(values as TrailsDateData, index);
			} else {
				handleFormSubmit(values as TrailsDateData);
			}
			toast.success("Form values submitted successfully!");

			// Reset form and state
			form.reset();
		} catch (error) {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
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
					{/* Place Type Information Section */}
					<div className={formContainerStyle}>
						{!editData && (
							<PlayerSelect
								control={form.control}
								name="ledaId"
								label="Player *"
								trailsDateData={trailsDateData}
							/>
						)}
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
				<div className="flex items-center justify-between">
					<Button
						type="button"
						variant={"outline"}
						onClick={() => goBack(false)}
						className="hover:bg-muted border-border text-foreground"
					>
						Cancel
					</Button>
					{index !== undefined ? (
						<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">
							Update Player
						</Button>
					) : (
						<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">
							Add Player
						</Button>
					)}
				</div>
			</form>
		</Form>
	);
}
