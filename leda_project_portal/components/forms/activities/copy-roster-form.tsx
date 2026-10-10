/**
 * RosterCopyForm Component
 *
 * Allows copying a league roster from one season to another.
 * Requires both a source and target season code selection.
 * Prompts for user confirmation before overwriting existing season data.
 * "Copy Roster & Generate Schedule" copies the roster and then opens the
 * schedule generation dialog for the target season. Dismissing that dialog
 * keeps the copied roster but skips schedule generation (after a confirmation).
 * On completion, reloads the page to reflect the updated roster.
 */
"use client";

// Import necessary libraries and components
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEffect, useState } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector-form";
import { rosterRoute, scheduleRoute, seasonRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import GenerateScheduleDialog from "@/components/generate-schedule-dialog";
import type { DivisionsData, ScheduleData } from "@/lib/schedule";

// Define the schema for form validation using zod
const divisionFormSchema = z.object({
	targetSeasonCode: z
		.string()
		.min(1, { message: "Target Seaon is Required" }),
	sourceSeasonCode: z
		.string()
		.min(1, { message: "Source Season is Required" }),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * RosterCopyForm renders the season roster copy form.
 *
 * @param setOpen - Function to close the containing dialog
 */
export default function RosterCopyForm({
	setOpen,
}: {
	setOpen: (value: boolean) => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			targetSeasonCode: "",
			sourceSeasonCode: "",
		},
	});

	// Set once the roster is copied and the schedule dialog should open for the target season
	const [generation, setGeneration] = useState<{
		seasonCode: string;
		divisionsData: DivisionsData;
		gameDates: Record<string, string>;
	} | null>(null);

	// Reset form when component mounts to ensure clean state when dialog reopens
	useEffect(() => {
		form.reset({
			targetSeasonCode: "",
			sourceSeasonCode: "",
		});
	}, [form]);

	const copyRosterMutation = useMutation({
		mutationFn: async ({
			values,
			generate,
		}: {
			values: z.infer<typeof divisionFormSchema>;
			generate: boolean;
		}) => {
			const response = await fetchWithSession(rosterRoute + "/rosterUpserter", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				throw new Error("Failed to copy roster");
			}
			if (!generate) return;

			const target = encodeURIComponent(values.targetSeasonCode);
			const [seasonRes, rosterRes] = await Promise.all([
				fetchWithSession(`${seasonRoute}?seasonCode=${target}`),
				fetchWithSession(`${rosterRoute}?seasonCode=${target}`),
			]);
			if (!seasonRes.ok || !rosterRes.ok) throw new Error("Failed to load target season");
			const { dates } = (await seasonRes.json()) as { dates?: Record<string, string> };
			const { teamInformation } = (await rosterRes.json()) as { teamInformation: DivisionsData };
			if (!dates || Object.keys(dates).length === 0) {
				throw new Error("The target season has no game dates configured");
			}

			setGeneration({ seasonCode: values.targetSeasonCode, divisionsData: teamInformation, gameDates: dates });
		},
		onSuccess: (_, { generate }) => {
			if (generate) return;
			setOpen(false);
			window.location.reload();
		},
		onError: (error) => {
			console.error("Error copying roster:", error);
			alert(`Failed to copy roster: ${error.message}`);
		},
	});

	// Define the onSubmit function to handle form submission
	function onSubmit(values: z.infer<typeof divisionFormSchema>, generate: boolean) {
		const confirmed = window.confirm(
			generate
				? `This will overwrite any existing roster on season ${values.targetSeasonCode} and then open the schedule generator. Generating a schedule permanently deletes ALL existing data for that season (schedule, scoresheets, points, mentions, penalties and payouts). Do you want to proceed?`
				: "This will overwrite any existing data on the selected season. Do you want to proceed?"
		);
		if (!confirmed) return;
		copyRosterMutation.mutate({ values, generate });
	}

	async function saveGeneratedSchedule(scheduleData: ScheduleData) {
		const res = await fetchWithSession(scheduleRoute, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ seasonCode: generation?.seasonCode, scheduleData }),
		});
		if (!res.ok) throw new Error("Failed to save generated schedule");
	}

	// Render the form
	return (
		<>
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((values) => onSubmit(values, false))}
				className="space-y-4 mx-auto"
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						<SeasonCodeSelector
							name="sourceSeasonCode"
							label="Source Season Code *"
							control={form.control}
							exclusive={true}
						/>
						<SeasonCodeSelector
							name="targetSeasonCode"
							label="Target Season Code *"
							control={form.control}
							excludeCode={form.getValues("sourceSeasonCode")}
						/>
					</div>
				</div>
				<div className="flex justify-center gap-4">
					<Button variant={"outline"} className="hover:bg-muted border-border text-foreground" disabled={copyRosterMutation.isPending}>Copy Roster</Button>
					<Button
						type="button"
						variant={"outline"}
						className="hover:bg-muted border-border text-foreground"
						disabled={copyRosterMutation.isPending}
						onClick={form.handleSubmit((values) => onSubmit(values, true))}
					>
						Copy Roster &amp; Generate Schedule
					</Button>
				</div>
			</form>
		</Form>
		{generation && (
			<GenerateScheduleDialog
				open
				onOpenChange={(value) => {
					if (value) return;
					setOpen(false);
					window.location.reload();
				}}
				closeWarning="The roster has been copied, but leaving this page without generating will leave the schedule ungenerated. The roster will remain copied. Close anyway?"
				divisionsData={generation.divisionsData}
				gameDates={generation.gameDates}
				seasonCode={generation.seasonCode}
				onGenerate={saveGeneratedSchedule}
			/>
		)}
		</>
	);
}
