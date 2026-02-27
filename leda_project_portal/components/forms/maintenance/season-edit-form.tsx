/**
 * SeasonEditForm Component
 *
 * Form for editing an existing league season's details and scheduled match
 * dates. Fetches season data from the API using React Query, then renders
 * editable date pickers for each existing date key. Blocked/holiday dates
 * sourced from the calendar are disabled in the date pickers.
 */
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
import { DatePickerCustom } from "@/components/ui/date-picker"
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import { useQuery } from "@tanstack/react-query";
import { useCalendarData } from "@/hooks/useCalendarData";

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
	"p-4 shadow-lg bg-background rounded-lg border border-border";
const checkboxWidth = "h-5 w-5";
const inputWidth = "w-24";

/**
 * SeasonEditForm fetches a season record and provides an edit interface.
 *
 * @param onClose - Callback to close the containing dialog
 * @param onRefresh - Callback to reload the parent data table
 * @param rowData - Row data containing the seasonCode used to fetch full details
 * @param handleRefresh - Optional additional refresh callback
 */
export default function SeasonEditForm({
	onClose,
	onRefresh,
	rowData,
	handleRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData?: {
		seasonCode: string;
	};
	handleRefresh?: () => void;
}) {
	// Fetch season data using the seasonCode
	const { data: seasonData, isLoading, isError } = useQuery({
		queryKey: ['season', rowData?.seasonCode],
		queryFn: async () => {
			const response = await fetchWithSession(
				`${seasonRoute}?seasonCode=${rowData?.seasonCode}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch season data');
			}
			return response.json();
		},
		enabled: !!rowData?.seasonCode,
	});

	// Move all hooks to the top-level, before any conditional returns
	const form = useForm<z.infer<typeof seasonFormSchema>>({
		resolver: zodResolver(seasonFormSchema),
		defaultValues: {
			seasonCode: "",
			fiscalYear: "",
			dates: "",
			isCurrentSeason: false,
			desc: "",
		},
	});
	const [dates, setDates] = React.useState<string>("");

	// Fetch blocked dates from calendar
	const currentYear = new Date().getFullYear();
	const { data: calendarData } = useCalendarData(currentYear);

	// Convert to Date array for DatePickerCustom
	const disabledDates = React.useMemo(() => {
		if (!calendarData) return [];
		return calendarData.map(item => new Date(item.date));
	}, [calendarData]);

	// Update form and dates when seasonData is loaded
	React.useEffect(() => {
		if (seasonData) {
			form.reset({
				seasonCode: seasonData.seasonCode,
				fiscalYear: seasonData.fiscalYear,
				dates: JSON.stringify(seasonData.dates),
				isCurrentSeason: seasonData.isCurrentSeason,
				desc: seasonData.desc || "",
			});
			setDates(JSON.stringify(seasonData.dates));
		}
	}, [seasonData, form]);

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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg">Loading season data...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg text-red-500">Error loading season data</div>
			</div>
		);
	}

	if (!seasonData) {
		return null;
	}

	async function onSubmit(values: z.infer<typeof seasonFormSchema>) {
		mutation.mutate(values);
	}

	// Handle date change for manual date selection
	const handleDateChange = (selectedDate: Date | undefined, dateKey: string) => {
		if (selectedDate) {
			const updatedDates = JSON.parse(dates || "{}");
			updatedDates[dateKey] = selectedDate.toLocaleDateString("en-US");
			setDates(JSON.stringify(updatedDates));
		}
	};

	// Render the form
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6 mx-auto max-w-2xl"
			>
				<div className={formContainerStyle}>
					<h2 className="text-2xl font-semibold mb-6">Edit Season</h2>
					
					{/* Season Code and Fiscal Year Row */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<InputDefault
							control={form.control}
							name="seasonCode"
							label="Season Code *"
						/>
						<InputDefault
							control={form.control}
							name="fiscalYear"
							label="Fiscal Year *"
						/>
					</div>

					{/* Current Season Checkbox */}
					<FormField
						control={form.control}
						name="isCurrentSeason"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center space-x-3 mb-4">
								<FormControl>
									<Checkbox
										id="isCurrentSeasonCheckbox"
										checked={field.value}
										onCheckedChange={field.onChange}
										className={checkboxWidth}
									/>
								</FormControl>
								<Label
									className="whitespace-nowrap !mt-0 cursor-pointer"
									htmlFor="isCurrentSeasonCheckbox"
								>
									Current Season
								</Label>
							</FormItem>
						)}
					/>

					{/* Description */}
					<FormField
						control={form.control}
						name="desc"
						render={({ field }) => (
							<FormItem className="mb-4">
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Additional Data Here..."
										{...field}
										className="min-h-[100px]"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Separator className="my-6" />

					{/* Existing Dates Tiles */}
					<div className="mt-6">
						<Label className="block mb-3 text-sm font-medium text-muted-foreground">
							Existing Dates
						</Label>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2">
							{(() => {
								try {
									const datesObject = JSON.parse(dates || "{}");
									if (datesObject && typeof datesObject === "object") {
										return Object.entries(datesObject).map(([key, value], index) => (
											<div 
												key={index}
												className="group relative p-3 border border-border rounded-lg bg-card hover:border-primary/50 transition-all overflow-hidden"
											>
												<div className="group-hover:blur-sm transition-all">
													<div className="text-xs font-medium text-muted-foreground mb-2">
														{key}
													</div>
													<div className="text-sm font-semibold">
														{value as string}
													</div>
												</div>
												<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
													<DatePickerCustom
														onDateChange={(selectedDate) => {
															handleDateChange(selectedDate, key);
														}}
														initialMonth={new Date(value as string)}
														dateSelected={new Date(value as string)}													disabledDates={disabledDates}													/>
												</div>
											</div>
										));
									} else {
										return (
											<div className="text-sm text-muted-foreground">
												Invalid dates format
											</div>
										);
									}
								} catch {
									return (
										<div className="text-sm text-muted-foreground">
											Error parsing dates
										</div>
									);
								}
							})()}
						</div>
					</div>
				</div>
				<div className="flex justify-between items-center">
					{!handleRefresh && (
						<Button variant="outline" type="button" onClick={onClose} className="hover:bg-muted border-border text-foreground">
							Back
						</Button>
					)}
					{handleRefresh && (
						<Button variant="outline" type="button" onClick={handleRefresh} className="hover:bg-muted border-border text-foreground">
							Back
						</Button>
					)}
						<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground px-8">Update</Button>
				</div>
			</form>
		</Form>
	);
}