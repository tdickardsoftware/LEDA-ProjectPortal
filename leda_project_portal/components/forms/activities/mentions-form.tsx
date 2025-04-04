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
import { useEffect } from "react";
import MentionSelector from "@/components/ui/mentions-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Validation schema for the penalty form
const divisionFormSchema = z.object({
	mentionData: z.object({
		mentionCode: z.string(),
		desc: z.string(),
		points: z.string(),
		mentionBasis: z.string(),
	}).refine((data) => Object.keys(data).length > 0, { message: "Mention data is required." }),
	points: z.number().min(0, { message: "Points must be a positive number." }).optional(),
	mentionCode: z.string().optional(),
	mentionDesc: z.string().optional(),
	notes: z.string().optional(),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

/**
 * Penalty Add/Edit Form component
 *
 * @param setOpen - Function to close the dialog
 * @param handlePenaltySubmit - Callback for adding new penalties
 * @param selectedTeamId - ID of the team receiving the penalty
 * @param isEditMode - Whether the form is in edit mode
 * @param initialPenalty - Penalty data for editing (only in edit mode)
 * @param updatePenalty - Callback for updating existing penalties
 */
export default function MentionForm({
	handleMentionSubmit,
	isEditMode = false,
	initialMention = null,
	updateMention,
}: {
	handleMentionSubmit: (
		mentionCode: string,
        desc: string,
        points: number,
		notes?: string
	) => void;
	isEditMode?: boolean;
	initialMention?: {
		id: string;
		code: string;
		points: number;
		notes: string;
	} | null;
	updateMention?: (
		teamId: string,
		penaltyId: string,
		newCode: string,
		points: number,
		notes?: string
	) => void;
}) {
	// Initialize form with React Hook Form and Zod validation
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			mentionData: {
				mentionCode: "",
				desc: "",
				points: "",
				mentionBasis: "",
			},
			points: undefined,
			mentionCode: "",
			mentionDesc: "",
			notes: "",
		},
	});

	/**
	 * Form submission handler
	 * Delegates to either updatePenalty or handlePenaltySubmit based on mode
	 */
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
			handleMentionSubmit(
				values.mentionCode || "",
				values.mentionDesc || "",
				values.points ?? 0,
				values.notes
			);

		// Reset the form instead of closing the dialog
		form.reset({
			mentionData: {
				mentionCode: "",
				desc: "",
				points: "",
				mentionBasis: "",
			},
			points: undefined,
			mentionCode: "",
			mentionDesc: "",
			notes: "",
		});
	}

	const handleMentionChange = (value: { mentionCode: string; desc: string; points: string; mentionBasis: string }) => {
		// Parse points as integer and handle NaN case
		const pointsValue = parseInt(value.points);
		form.setValue("points", isNaN(pointsValue) ? undefined : pointsValue);
		form.setValue("mentionCode", value.mentionCode);
		form.setValue("mentionDesc", value.desc);

		// Force the form to update immediately
		form.trigger("points");
	};

	return (
		// Form UI rendering with fields for penalty code, points, and notes
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto w-fit"
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						<MentionSelector
							name="mentionData"
							label="Mention *"
							control={form.control}
							// Allow editing the penalty code even in edit mode
							disabled={false}
							handleMentionChange={handleMentionChange}
						/>
						<FormField
							control={form.control}
							name="points"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Points</FormLabel>
									<FormControl>
										<Input
											placeholder="Points"
											type="number"
											{...field}
											value={field.value === undefined ? "" : field.value}
											onChange={(e) => {
												const value = e.target.value;
												if (/^\d*$/.test(value)) {
													field.onChange(
														value === ""
															? undefined
															: parseInt(value, 10)
													);
												}
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
					<Button type="submit">
						{isEditMode ? "Update Mention" : "Add Mention"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
