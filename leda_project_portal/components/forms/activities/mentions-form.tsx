/**
 * MentionForm Component
 *
 * Dual-mode form for adding or editing a mentions entry on a weekly scoresheet.
 * In add mode, resets after submission so multiple mentions can be entered in
 * sequence. In edit mode, pre-populates from `initialMention` and delegates
 * the update to the `updateMention` callback.
 * Validates the nested `mentionData` object and optional override fields for
 * points, count, and notes.
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
import { useEffect } from "react";
import MentionSelector from "@/components/ui/mentions-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Validation schema for the mention form
const divisionFormSchema = z.object({
	mentionData: z
		.object({
			mentionCode: z.string(),
			desc: z.string(),
			points: z.string(),
			mentionBasis: z.string(),
		})
		.refine((data) => Object.keys(data).length > 0, {
			message: "Mention data is required.",
		}),
	points: z
		.number()
		.min(0, { message: "Points must be a positive number." })
		.optional(),
	count: z
		.number()
		.min(0, { message: "Count must be a positive number." })
		.optional(),
	mentionCode: z.string().optional(),
	mentionDesc: z.string().optional(),
	notes: z.string().optional(),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * Mention Add/Edit Form component
 *
 * @param handleMentionSubmit - Callback for adding new mentions
 * @param isEditMode - Whether the form is in edit mode
 * @param initialMention - Mention data for editing (only in edit mode)
 * @param updateMention - Callback for updating existing mentions
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
		count: number,
		notes?: string
	) => void;
	isEditMode?: boolean;
	initialMention?: {
		id: string;
		code: string;
		desc: string;
		points: number;
		notes: string;
		count?: number;
	} | null;
	updateMention?: (
		mentionId: string,
		mentionCode: string,
		desc: string,
		points: number,
		notes?: string,
		count?: number
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
			count: undefined,
			mentionCode: "",
			mentionDesc: "",
			notes: "",
		},
	});

	// Set initial values when in edit mode and when initialMention changes
	useEffect(() => {
		if (isEditMode && initialMention) {
			// Set all fields, including count, when in edit mode
			form.setValue("mentionData", {
				mentionCode: initialMention.code,
				desc: initialMention.desc,
				points: initialMention.points.toString(),
				mentionBasis: "", // We may not have this value when editing
			});
			form.setValue("mentionCode", initialMention.code);
			form.setValue("mentionDesc", initialMention.desc);
			form.setValue("points", initialMention.points);
			form.setValue("count", initialMention.count ?? undefined); // Properly set the count field
			form.setValue("notes", initialMention.notes || "");
		} else if (!isEditMode) {
			// Reset to defaults when not in edit mode (ensures clean state on reopen)
			form.reset({
				mentionData: {
					mentionCode: "",
					desc: "",
					points: "",
					mentionBasis: "",
				},
				points: undefined,
				count: undefined,
				mentionCode: "",
				mentionDesc: "",
				notes: "",
			});
		}
	}, [form, isEditMode, initialMention]);

	/**
	 * Form submission handler
	 * Delegates to either updateMention or handleMentionSubmit based on mode
	 */
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		
		// Ensure count is always set to a valid number
		const countValue = values.count ?? 0;


		if (isEditMode && initialMention && updateMention) {
			updateMention(
				initialMention.id,
				values.mentionCode || "",
				values.mentionDesc || "",
				values.points ?? 0,
				values.notes,
				countValue // Ensure count is passed
			);

			// Reset the form after updating
			form.reset({
				mentionData: {
					mentionCode: "",
					desc: "",
					points: "",
					mentionBasis: "",
				},
				points: undefined,
				count: undefined, // Reset count to undefined
				mentionCode: "",
				mentionDesc: "",
				notes: "",
			});
		} else {
			
			handleMentionSubmit(
				values.mentionCode || "",
				values.mentionDesc || "",
				values.points ?? 0,
				countValue, // Ensure count is passed
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
				count: undefined, // Set to undefined instead of 0
				mentionCode: "",
				mentionDesc: "",
				notes: "",
			});
		}
	}

	const handleMentionChange = (value: {
		mentionCode: string;
		desc: string;
		points: string;
		mentionBasis: string;
	}) => {
		// Parse points as integer; leave blank if 0 or invalid so the user can type their own value
		const pointsValue = parseInt(value.points);
		form.setValue("points", (isNaN(pointsValue) || pointsValue === 0) ? undefined : pointsValue);
		form.setValue("mentionCode", value.mentionCode);
		form.setValue("mentionDesc", value.desc);

		// Force the form to update immediately
		form.trigger("points");
	};

	return (
		// Form UI rendering with fields for mention code, points, and notes
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto w-fit"
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						{/* Use MentionSelector for both add and edit modes */}
						<MentionSelector
							name="mentionData"
							label="Mention *"
							control={form.control}
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
											type="text"
											inputMode="numeric"
											pattern="[0-9]*"
											{...field}
											value={field.value === undefined ? "" : field.value}
											onChange={(e) => {
												const value = e.target.value;
												if (/^\d*$/.test(value)) {
													field.onChange(value === "" ? undefined : parseInt(value, 10));
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
							name="count"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Number of Darts/Count</FormLabel>
									<FormControl>
										<Input
											placeholder="Number of Darts"
											type="text"
											inputMode="numeric"
											pattern="[0-9]*"
											{...field}
											value={field.value === undefined ? "" : field.value}
											onChange={(e) => {
												const value = e.target.value;
												if (/^\d*$/.test(value)) {
													field.onChange(value === "" ? undefined : parseInt(value, 10));
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
					<Button 
						type="submit" 
						className="hover:bg-muted border-border text-foreground"
						onClick={() => {
							
						}}
					>
						{isEditMode ? "Update Mention" : "Add Mention"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
