"use client";

/**
 * Weekly Scoresheet Penalty Form Component
 *
 * This component provides a form for adding and editing penalties:
 * - Uses React Hook Form with Zod validation
 * - Supports both creating new penalties and editing existing ones
 * - Allows selection of penalty codes through the PenaltySelector component
 * - Collects points and optional notes for each penalty
 *
 * The form operates in two modes (add/edit) based on props and delegates
 * penalty submission to parent component callbacks.
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
import { useEffect } from "react";
import PenaltySelector from "@/components/ui/penalty-selector";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Validation schema for the penalty form
const divisionFormSchema = z.object({
	penaltyCode: z.string().min(1, { message: "Division Name is required." }),
	points: z.preprocess(
		(val) => (val === "" || val === undefined || val === null ? 0 : val),
		z.number().min(0, { message: "Points must be a positive number." })
	),
	notes: z.string().optional(),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

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
export default function PenaltyAddForm({
	setOpen,
	handlePenaltySubmit,
	selectedTeamId,
	isEditMode = false,
	initialPenalty = null,
	updatePenalty,
}: {
	setOpen: (value: boolean) => void;
	handlePenaltySubmit: (
		teamID: string,
		penaltyCode: string,
		points: number,
		notes?: string
	) => void;
	selectedTeamId: string;
	isEditMode?: boolean;
	initialPenalty?: {
		id: string;
		code: string;
		points: number;
		notes: string;
	} | null;
	updatePenalty?: (
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
			penaltyCode: "",
			points: ("" as any),
			notes: "",
		},
	});

	// Pre-populate form when in edit mode
	useEffect(() => {
		if (isEditMode && initialPenalty) {
			form.reset({
				penaltyCode: initialPenalty.code,
				points: initialPenalty.points,
				notes: initialPenalty.notes,
			});
		} else if (!isEditMode) {
			// Reset to defaults when not in edit mode (ensures clean state on reopen)
			form.reset({
				penaltyCode: "",
				points: ("" as any),
				notes: "",
			});
		}
	}, [form, isEditMode, initialPenalty]);

	/**
	 * Form submission handler
	 * Delegates to either updatePenalty or handlePenaltySubmit based on mode
	 */
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		if (isEditMode && initialPenalty && updatePenalty) {
			// Call updatePenalty with the penalty ID and the new values
			updatePenalty(
				selectedTeamId,
				initialPenalty.id, // Use ID instead of code for identifying the penalty
				values.penaltyCode,
				values.points,
				values.notes
			);
		} else {
			// Call handlePenaltySubmit for adding a new penalty
			handlePenaltySubmit(
				selectedTeamId,
				values.penaltyCode,
				values.points,
				values.notes
			);
		}

		setOpen(false);
	}

	return (
		// Form UI rendering with fields for penalty code, points, and notes
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						<PenaltySelector
							name="penaltyCode"
							label="Penalty *"
							control={form.control}
							// Allow editing the penalty code even in edit mode
							disabled={false}
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
											value={field.value ?? ""}
											onChange={(e) => {
												const v = e.target.value;
												if (/^\d*$/.test(v)) {
													field.onChange(v === "" ? "" : parseInt(v, 10));
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
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">
						{isEditMode ? "Update Penalty" : "Add Penalty"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
