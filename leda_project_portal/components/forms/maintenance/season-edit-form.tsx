"use client";

// Import necessary libraries and components
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
import { InputDefault } from "@/components/ui/form-input-default";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { seasonRoute } from "@/lib/apiRoutes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for form validation using zod
const seasonFormSchema = z.object({
	seasonCode: z.string().min(1, { message: "Season Code is required." }),
	fiscalYear: z.string().min(1, { message: "Fiscal Year is required." }),
	dates: z.string(),
	isCurrentSeason: z.boolean(),
	desc: z.string().optional(),
});

// Define styles for the form container, checkbox, and input width
const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const checkboxWidth = "h-5 w-5";
const inputWidth = "w-24";

// Define the SeasonEditForm component
export default function SeasonEditForm({
	onClose,
	onRefresh,
	rowData,
	handleRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: {
		seasonCode: string;
		fiscalYear: string;
		dates: JSON;
		isCurrentSeason: boolean;
		desc?: string;
	};
	handleRefresh?: () => void;
}) {
	// Move all hooks to the top-level, before any conditional returns
	const form = useForm<z.infer<typeof seasonFormSchema>>({
		resolver: zodResolver(seasonFormSchema),
		defaultValues: {
			...rowData,
			dates: JSON.stringify(rowData.dates),
		},
	});
	const [dates, setDates] = React.useState<string>(
		JSON.stringify(rowData.dates)
	);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof seasonFormSchema>) => {
			values.dates = dates;
			const response = await fetchWithSession(seasonRoute, {
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

	if (!rowData) {
		return null;
	}

	async function onSubmit(values: z.infer<typeof seasonFormSchema>) {
		mutation.mutate(values);
	}

	// Handle date change for manual date selection
	const handleDateChange = (selectedDate: Date | null, index: number) => {
		if (selectedDate) {
			const updatedDates = JSON.parse(dates || "{}");
			updatedDates[`Date${index + 1}`] =
				selectedDate.toLocaleDateString("en-US");
			setDates(JSON.stringify(updatedDates));
		}
	};

	// Render the form
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
							name="isCurrentSeason"
							render={({ field }) => (
								<FormItem>
									<Label
										className="whitespace-nowrap pr-2"
										htmlFor="isCurrentSeasonCheckbox"
									>
										Current Season?
									</Label>
									<FormControl>
										<Checkbox
											id="isCurrentSeasonCheckbox"
											checked={field.value}
											onCheckedChange={field.onChange}
											className={checkboxWidth}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="flex space-x-4">
							<InputDefault
								control={form.control}
								name="seasonCode"
								label="Season Code *"
								customClass={inputWidth}
							/>
							<InputDefault
								control={form.control}
								name="fiscalYear"
								label="Fiscal Year *"
								customClass={inputWidth}
							/>
						</div>
						<div className="mt-2 max-w-[65vw] overflow-x-auto">
							<Label className="whitespace-nowrap text-gray-500">
								Existing Dates
							</Label>
							<Separator className="my-2" />
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Action Date
										</TableHead>
										<TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Date Selected
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(() => {
										try {
											const datesObject = JSON.parse(
												dates || "{}"
											);
											if (
												datesObject &&
												typeof datesObject === "object"
											) {
												return Object.entries(
													datesObject
												).map(([key, value], index) => (
													<TableRow key={index}>
														<TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{key}
														</TableCell>
														<TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															<DatePicker
																showIcon
																selected={
																	new Date(
																		value as string
																	)
																}
																onChange={(
																	date
																) =>
																	handleDateChange(
																		date,
																		index
																	)
																}
																dateFormat="MM/dd/yyyy"
																className="w-full border border-gray-300 rounded-md p-2"
															/>
														</TableCell>
													</TableRow>
												));
											} else {
												return (
													<TableRow>
														<TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															Invalid dates format
														</TableCell>
													</TableRow>
												);
											}
										} catch {
											return (
												<TableRow>
													<TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														Error parsing dates
													</TableCell>
												</TableRow>
											);
										}
									})()}
								</TableBody>
							</Table>
						</div>
						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
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
				<div className="flex justify-between items-center">
					{!handleRefresh && (
						<Button type="button" onClick={onClose}>
							Back
						</Button>
					)}
					{handleRefresh && (
						<Button type="button" onClick={handleRefresh}>
							Back
						</Button>
					)}
					<Button type="submit">Update</Button>
				</div>
			</form>
		</Form>
	);
}