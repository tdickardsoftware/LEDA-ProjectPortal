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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import React from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { InputDefault } from "@/components/ui/form-input-default";
import { teamRoute } from "@/lib/apiRoutes";

export const teamFormSchema = z.object({
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	teamName: z.string().min(1, { message: "Team Name is required." }),
	establishedDate: z.string(),
	memo: z.string().optional(),
	lastTeamFeePayment: z.string(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";
const checkboxWidth = "h-5 w-5";

export default function PlaceAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	const [generateIDStatus, setGenerateIDStatus] = useState(true);
	const [ledaIdExists, setLedaIdExists] = useState(false);

	const form = useForm<z.infer<typeof teamFormSchema>>({
		resolver: zodResolver(teamFormSchema),
		defaultValues: {
			ledaId: undefined,
			teamName: "",
			establishedDate: "",
			memo: "",
			lastTeamFeePayment: "",
		},
	});

	async function onSubmit(values: z.infer<typeof teamFormSchema>) {
		try {
			// If generateIDStatus is true, set ledaId to 0
			const submissionValues = generateIDStatus
				? { ...values, ledaId: 0 }
				: values;

			const response = await fetch(teamRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submissionValues),
			});

			if (!response.ok) {
				if (response.status === 422) {
					setLedaIdExists(true);
				}
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
			}

			const results = await response.json();
			toast.success("Successfully submitted the form!");

			// Reset form and state
			form.reset();
			setGenerateIDStatus(true);

			console.log("Form submitted successfully!", results);
			onClose(); // Close the form
			onRefresh(); // Refresh the datatable with the place API route
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
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						<h1>Place Information</h1>
						<hr className="bg-gray-300"></hr>
						<div className="flex items-start space-x-2">
							<Label
								className="whitespace-nowrap"
								htmlFor="generateID"
							>
								Generate LEDA ID
							</Label>
							<Checkbox
								checked={generateIDStatus}
								onCheckedChange={(checked: boolean) =>
									setGenerateIDStatus(checked)
								}
								className={checkboxWidth}
								id="generateID"
							/>
						</div>
						<FormField
							control={form.control}
							name="ledaId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="LEDA ID #"
											{...field}
											disabled={generateIDStatus}
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
									{ledaIdExists && (
										<p className="text-red-500 text-sm mt-1">This LEDA ID is already in use</p>
									)}
								</FormItem>
							)}
						/>
						<InputDefault
							control={form.control}
							name="teamName"
							label="Team Name *"
						/>
						<InputDefault
							control={form.control}
							name="establishedDate"
							label="Established Date *"
							type="date"
						/>
						<SeasonCodeSelector
							control={form.control}
							name="seasonCode"
							label="Season Code *"
						/>
						<FormField
							control={form.control}
							name="memo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Memo</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Additional Data Here..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
				<div className="flex justify-between">
					<Button type="button">Back</Button>
					<Button type="submit">Next</Button>
				</div>
			</form>
		</Form>
	);
}
