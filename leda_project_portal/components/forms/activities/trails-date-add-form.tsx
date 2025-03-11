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

const TrailsDateDataFormSchema = z.object({
	singlesPlace: z.number().positive(),
	doublesPlace: z.number().positive(),
	notes: z.string().optional(),
	trailsPoints: z.number().positive(),
	ledaId: z.number().positive(),
	trailsDate: z.string().optional(),
	fullName: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

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
			singlesPlace: editData?.singlesPlace || undefined,
			doublesPlace: editData?.doublesPlace || undefined,
			trailsPoints: editData?.trailsPoints || undefined,
			notes: editData?.notes || "",
			ledaId: editData?.ledaId || undefined,
			fullName: editData?.fullName || "",
		},
	});

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
				<div className="flex items-center justify-between">
					<Button
						type="button"
						variant={"outline"}
						onClick={() => goBack(false)}
					>
						Cancel
					</Button>
					{index !== undefined ? (
						<Button type="submit" variant={"outline"}>
							Update Player
						</Button>
					) : (
						<Button type="submit" variant={"outline"}>
							Add Player
						</Button>
					)}
				</div>
			</form>
		</Form>
	);
}
