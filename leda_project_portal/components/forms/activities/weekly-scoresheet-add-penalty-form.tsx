"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React, { useEffect } from "react";
import PenaltySelector from "@/components/ui/penalty-selector";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	penaltyCode: z.string().min(1, { message: "Division Name is required." }),
	points: z.number().min(0, { message: "Points must be a positive number." }).optional(),
    notes: z.string().optional(),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

// Define the PenaltyAddForm component with updated props
export default function PenaltyAddForm({
    setOpen,
    handlePenaltySubmit,
    selectedTeamId,
    isEditMode = false,
    initialPenalty = null,
    updatePenalty,
}: {
    setOpen: (value: boolean) => void;
    handlePenaltySubmit: (teamID: string, penaltyCode: string, points: number, notes?: string) => void;
    selectedTeamId: string;
    isEditMode?: boolean;
    initialPenalty?: {
        code: string;
        points: number;
        notes: string;
    } | null;
    updatePenalty?: (teamId: string, oldCode: string, newCode: string, points: number, notes?: string) => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			penaltyCode: "",
            points: 0,
            notes: "",
		},
	});

    // Update form values when initialPenalty changes (for edit mode)
    useEffect(() => {
        if (isEditMode && initialPenalty) {
            form.reset({
                penaltyCode: initialPenalty.code,
                points: initialPenalty.points,
                notes: initialPenalty.notes
            });
        }
    }, [form, isEditMode, initialPenalty]);

	// Define the onSubmit function to handle form submission
	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
        if (values.points === undefined) {
            values.points = 0; // Default to 0 if points are not provided
        }

        if (isEditMode && initialPenalty && updatePenalty) {
            // Call updatePenalty with the original code and the new values
            updatePenalty(
                selectedTeamId, 
                initialPenalty.code, 
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

	// Render the form
	return (
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
                            disabled={isEditMode && initialPenalty?.code !== undefined} 
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
                                        <Textarea placeholder="Notes" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
				</div>
                <div className="flex justify-center">
                    <Button type="submit">
                        {isEditMode ? "Update Penalty" : "Add Penalty"}
                    </Button>
                </div>
			</form>
		</Form>
	);
}
